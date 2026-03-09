import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ChartPeriod {
  period: 'daily' | 'weekly' | 'monthly' | 'alltime';
  days: number;
}

@Injectable()
export class ChartsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get top songs chart with time-based filtering
   * Uses listening history for more accurate trending
   */
  async getTopSongsChart(
    period: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'weekly',
    page = 1,
    limit = 20,
  ) {
    const periods: Record<string, ChartPeriod> = {
      daily: { period: 'daily', days: 1 },
      weekly: { period: 'weekly', days: 7 },
      monthly: { period: 'monthly', days: 30 },
      alltime: { period: 'alltime', days: 0 },
    };

    const selectedPeriod = periods[period];
    const skip = (page - 1) * limit;

    const whereClause: any = { deleted: false, status: 'ACTIVE' };

    // If not alltime, use listening history for trending calculation
    if (selectedPeriod.days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - selectedPeriod.days);

      // Get songs with most plays in the period
      const playCounts = await this.prisma.listeningHistory.groupBy({
        by: ['songId'],
        where: {
          playedAt: {
            gte: startDate,
          },
        },
        _count: true,
        orderBy: {
          _count: {
            songId: 'desc',
          },
        },
        take: skip + limit,
      });

      const songIds = playCounts.map((p) => p.songId as string);

      if (songIds.length === 0) {
        // Fallback to alltime if no recent data
        return this.getAllTimeChart(page, limit);
      }

      const songs = await this.prisma.song.findMany({
        where: {
          id: { in: songIds },
          deleted: false,
          status: 'ACTIVE',
        },
        include: {
          singer: true,
          topic: true,
        },
      });

      // Sort by play count from the period
      const songPlayMap = new Map(playCounts.map((p) => [p.songId as string, p._count as number]));
      songs.sort(
        (a, b) => ((songPlayMap.get(b.id) as number) || 0) - ((songPlayMap.get(a.id) as number) || 0),
      );

      const paginatedSongs = songs.slice(skip, skip + limit);
      const total = songs.length;

      return {
        data: paginatedSongs.map((song) => ({
          ...song,
          playCount: (songPlayMap.get(song.id) as number) || 0,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          period: selectedPeriod.period,
        },
      };
    }

    return this.getAllTimeChart(page, limit);
  }

  private async getAllTimeChart(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [songs, total] = await Promise.all([
      this.prisma.song.findMany({
        where: { deleted: false, status: 'ACTIVE' },
        orderBy: { listenCount: 'desc' },
        skip,
        take: limit,
        include: { singer: true, topic: true },
      }),
      this.prisma.song.count({ where: { deleted: false, status: 'ACTIVE' } }),
    ]);

    return {
      data: songs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        period: 'alltime',
      },
    };
  }

  /**
   * Get trending songs (songs with biggest increase in plays)
   */
  async getTrendingSongs(limit = 10) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get play counts for last 7 days
    const lastWeekPlays = await this.prisma.listeningHistory.groupBy({
      by: ['songId'],
      where: {
        playedAt: {
          gte: lastWeek,
        },
      },
      _count: true,
    });

    // Get play counts for previous 7 days
    const previousWeekPlays = await this.prisma.listeningHistory.groupBy({
      by: ['songId'],
      where: {
        playedAt: {
          gte: twoWeeksAgo,
          lt: lastWeek,
        },
      },
      _count: true,
    });

    const lastWeekMap = new Map<string, number>(
      lastWeekPlays.map((p) => [p.songId as string, p._count as number]),
    );
    const previousWeekMap = new Map<string, number>(
      previousWeekPlays.map((p) => [p.songId as string, p._count as number]),
    );

    // Calculate growth
    const growthData: Array<{
      songId: string;
      growth: number;
      lastWeekCount: number;
    }> = [];

    lastWeekMap.forEach((count, songId) => {
      const previousCount = previousWeekMap.get(songId) || 0;
      const growth =
        previousCount > 0
          ? ((count - previousCount) / previousCount) * 100
          : count * 100;
      growthData.push({ songId, growth, lastWeekCount: count });
    });

    // Sort by growth and take top
    growthData.sort((a, b) => b.growth - a.growth);
    const topGrowthSongIds = growthData.slice(0, limit).map((g) => g.songId);

    if (topGrowthSongIds.length === 0) {
      return {
        data: [],
        meta: { period: 'weekly', calculatedAt: now.toISOString() },
      };
    }

    const songs = await this.prisma.song.findMany({
      where: {
        id: { in: topGrowthSongIds },
        deleted: false,
        status: 'ACTIVE',
      },
      include: {
        singer: true,
        topic: true,
      },
    });

    // Map growth data to songs
    const growthMap = new Map(growthData.map((g) => [g.songId, g]));
    const songsWithGrowth = songs.map((song) => ({
      ...song,
      trendScore: growthMap.get(song.id)?.growth || 0,
      lastWeekPlays: growthMap.get(song.id)?.lastWeekCount || 0,
    }));

    // Sort by trend score
    songsWithGrowth.sort((a, b) => b.trendScore - a.trendScore);

    return {
      data: songsWithGrowth,
      meta: {
        period: 'weekly',
        calculatedAt: now.toISOString(),
        description: 'Songs with highest play growth compared to previous week',
      },
    };
  }

  /**
   * Get top artists by plays
   */
  async getTopArtistsChart(
    period: 'weekly' | 'monthly' | 'alltime' = 'monthly',
    limit = 10,
  ) {
    const days = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 0;
    const startDate =
      days > 0 ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : undefined;

    const whereClause: any = startDate ? { playedAt: { gte: startDate } } : {};

    const artistPlays = await this.prisma.listeningHistory.groupBy({
      by: ['songId'],
      where: whereClause,
      _count: true,
    });

    // Get songs to map to artists
    const songIds = [...new Set(artistPlays.map((p) => p.songId as string))];
    const songs = await this.prisma.song.findMany({
      where: { id: { in: songIds } },
      select: { id: true, singerId: true },
    });

    const songToArtistMap = new Map(songs.map((s) => [s.id, s.singerId]));
    const artistPlayCount = new Map<string, number>();

    artistPlays.forEach((play) => {
      const artistId = songToArtistMap.get(play.songId as string);
      if (artistId) {
        artistPlayCount.set(
          artistId,
          (artistPlayCount.get(artistId) || 0) + (play._count as number),
        );
      }
    });

    // Sort artists by play count
    const sortedArtists = Array.from(artistPlayCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const artistIds = sortedArtists.map((a) => a[0]);
    const artists = await this.prisma.singer.findMany({
      where: { id: { in: artistIds }, deleted: false },
      include: {
        _count: {
          select: { songs: { where: { deleted: false } } },
        },
      },
    });

    const playCountMap = new Map(sortedArtists);
    const artistsWithPlays = artists.map((artist) => ({
      ...artist,
      playCount: playCountMap.get(artist.id) || 0,
    }));

    return {
      data: artistsWithPlays,
      meta: {
        period,
        calculatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Get top topics/genres by plays
   */
  async getTopTopicsChart(
    period: 'weekly' | 'monthly' | 'alltime' = 'monthly',
    limit = 10,
  ) {
    const days = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 0;
    const startDate =
      days > 0 ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : undefined;

    const whereClause: any = startDate ? { playedAt: { gte: startDate } } : {};

    const topicPlays = await this.prisma.listeningHistory.groupBy({
      by: ['songId'],
      where: whereClause,
      _count: true,
    });

    // Get songs to map to topics
    const songIds = [...new Set(topicPlays.map((p) => p.songId as string))];
    const songs = await this.prisma.song.findMany({
      where: { id: { in: songIds }, topicId: { not: null } },
      select: { id: true, topicId: true },
    });

    const songToTopicMap = new Map(songs.map((s) => [s.id, s.topicId as string]));
    const topicPlayCount = new Map<string, number>();

    topicPlays.forEach((play) => {
      const topicId = songToTopicMap.get(play.songId as string);
      if (topicId) {
        topicPlayCount.set(
          topicId,
          (topicPlayCount.get(topicId) || 0) + (play._count as number),
        );
      }
    });

    // Sort topics by play count
    const sortedTopics = Array.from(topicPlayCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const topicIds = sortedTopics.map((t) => t[0]);
    const topics = await this.prisma.topic.findMany({
      where: { id: { in: topicIds }, deleted: false },
      include: {
        _count: {
          select: { songs: { where: { deleted: false } } },
        },
      },
    });

    const playCountMap = new Map(sortedTopics);
    const topicsWithPlays = topics.map((topic) => ({
      ...topic,
      playCount: playCountMap.get(topic.id) || 0,
    }));

    return {
      data: topicsWithPlays,
      meta: {
        period,
        calculatedAt: new Date().toISOString(),
      },
    };
  }
}
