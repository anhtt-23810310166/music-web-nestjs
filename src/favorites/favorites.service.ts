import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, songId: string) {
    // Check if song exists
    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song || song.deleted) throw new NotFoundException('Song not found');

    // Check if already favorited
    const existing = await this.prisma.favoriteSong.findUnique({
      where: { userId_songId: { userId, songId } },
    });

    if (existing) {
      // Remove from favorites
      await this.prisma.favoriteSong.delete({ where: { id: existing.id } });
      await this.prisma.song.update({
        where: { id: songId },
        data: { likeCount: { decrement: 1 } },
      });
      return { action: 'removed', songId };
    } else {
      // Add to favorites
      await this.prisma.favoriteSong.create({ data: { userId, songId } });
      await this.prisma.song.update({
        where: { id: songId },
        data: { likeCount: { increment: 1 } },
      });
      return { action: 'added', songId };
    }
  }

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favoriteSong.findMany({
      where: { userId },
      include: { song: { include: { singer: true, topic: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.song);
  }

  async isFavorited(userId: string, songId: string) {
    const fav = await this.prisma.favoriteSong.findUnique({
      where: { userId_songId: { userId, songId } },
    });
    return { isFavorited: !!fav };
  }
}
