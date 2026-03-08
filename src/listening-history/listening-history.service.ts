/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListeningHistoryService {
  constructor(private prisma: PrismaService) {}

  async recordListening(userId: string, songId: string) {
    return await this.prisma.listeningHistory.create({
      data: {
        userId,
        songId,
      },
    });
  }

  async getUserListeningHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.listeningHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { playedAt: 'desc' },
        include: {
          song: {
            include: {
              singer: true,
              topic: true,
            },
          },
        },
      }),
      this.prisma.listeningHistory.count({ where: { userId } }),
    ]);

    return {
      data: history,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentlyPlayed(userId: string, limit = 10) {
    const history = await this.prisma.listeningHistory.findMany({
      where: { userId },
      take: limit,
      orderBy: { playedAt: 'desc' },
      include: {
        song: {
          include: {
            singer: true,
            topic: true,
          },
        },
      },
    });

    return history.map((h: any) => ({
      ...h.song,
      playedAt: h.playedAt,
    }));
  }

  async getSongListeningStats(songId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.prisma.listeningHistory.groupBy({
      by: ['playedAt'],
      where: {
        songId,
        playedAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    const totalPlays = stats.reduce(
      (sum: number, s: any) => sum + s._count,
      0,
    );

    return {
      songId,
      period: `${days} days`,
      totalPlays,
      dailyPlays: stats,
    };
  }

  async getUserListeningStats(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalPlays, uniqueSongs, topSongs] = await Promise.all([
      this.prisma.listeningHistory.count({
        where: {
          userId,
          playedAt: {
            gte: startDate,
          },
        },
      }),
      this.prisma.listeningHistory.groupBy({
        by: ['songId'],
        where: {
          userId,
          playedAt: {
            gte: startDate,
          },
        },
      }),
      this.prisma.listeningHistory.findMany({
        where: {
          userId,
          playedAt: {
            gte: startDate,
          },
        },
        include: {
          song: {
            include: {
              singer: true,
            },
          },
        },
        orderBy: { playedAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      userId,
      period: `${days} days`,
      totalPlays,
      uniqueSongs: uniqueSongs.length,
      topSongs: topSongs.map((t: any) => t.song),
    };
  }
}
