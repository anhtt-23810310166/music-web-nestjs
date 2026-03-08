import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto, UpdatePlaylistDto } from './dto/playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePlaylistDto) {
    return this.prisma.playlist.create({
      data: { ...dto, userId },
    });
  }

  async findUserPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: { select: { songs: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: { song: { include: { singer: true } } },
          orderBy: { position: 'asc' },
        },
        user: { select: { id: true, fullName: true, avatar: true } },
      },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (!playlist.isPublic && playlist.userId !== userId) {
      throw new ForbiddenException('This playlist is private');
    }
    return playlist;
  }

  async update(id: string, userId: string, dto: UpdatePlaylistDto) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException();

    return this.prisma.playlist.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException();

    return this.prisma.playlist.delete({ where: { id } });
  }

  async addSong(playlistId: string, songId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException();

    // Check if song already in playlist
    const existing = await this.prisma.playlistSong.findUnique({
      where: { playlistId_songId: { playlistId, songId } },
    });
    if (existing) {
      throw new BadRequestException('Song already in playlist');
    }

    const maxPos = await this.prisma.playlistSong.aggregate({
      where: { playlistId },
      _max: { position: true },
    });

    return this.prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        position: (maxPos._max.position || 0) + 1,
      },
    });
  }

  async removeSong(playlistId: string, songId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException();

    return this.prisma.playlistSong.delete({
      where: { playlistId_songId: { playlistId, songId } },
    });
  }

  async addSongs(playlistId: string, songIds: string[], userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException();

    // Get existing songs
    const existingSongs = await this.prisma.playlistSong.findMany({
      where: { playlistId },
      select: { songId: true },
    });
    const existingSongIds = new Set(existingSongs.map((s) => s.songId));

    // Filter out duplicates
    const newSongs = songIds.filter((id) => !existingSongIds.has(id));
    if (newSongs.length === 0) {
      return {
        added: 0,
        skipped: songIds.length,
        message: 'All songs already in playlist',
      };
    }

    // Get max position
    const maxPos = await this.prisma.playlistSong.aggregate({
      where: { playlistId },
      _max: { position: true },
    });
    let currentPosition = (maxPos._max.position || 0) + 1;

    // Batch insert
    const createData = newSongs.map((songId) => ({
      playlistId,
      songId,
      position: currentPosition++,
    }));

    await this.prisma.playlistSong.createMany({
      data: createData,
    });

    return {
      added: newSongs.length,
      skipped: songIds.length - newSongs.length,
      message: `Added ${newSongs.length} songs to playlist`,
    };
  }

  async removeSongs(playlistId: string, songIds: string[], userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException();

    await this.prisma.playlistSong.deleteMany({
      where: {
        playlistId,
        songId: { in: songIds },
      },
    });

    return {
      removed: songIds.length,
      message: `Removed ${songIds.length} songs from playlist`,
    };
  }

  async reorderSongs(playlistId: string, songIds: string[], userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException();

    // Verify all songs belong to this playlist
    const existingSongs = await this.prisma.playlistSong.findMany({
      where: { playlistId },
      select: { songId: true },
    });
    const existingSongIds = new Set(existingSongs.map((s) => s.songId));

    for (const songId of songIds) {
      if (!existingSongIds.has(songId)) {
        throw new BadRequestException(`Song ${songId} is not in this playlist`);
      }
    }

    // Update positions in transaction
    const updates = songIds.map((songId, index) =>
      this.prisma.playlistSong.update({
        where: {
          playlistId_songId: { playlistId, songId },
        },
        data: { position: index + 1 },
      }),
    );

    await this.prisma.$transaction(updates);

    return { message: 'Playlist reordered successfully' };
  }

  async clearPlaylist(playlistId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException();

    await this.prisma.playlistSong.deleteMany({
      where: { playlistId },
    });

    return { message: 'Playlist cleared successfully' };
  }
}
