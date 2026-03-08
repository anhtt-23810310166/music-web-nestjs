import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Song } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto, UpdateSongDto } from './dto/song.dto';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSongDto) {
    const slug = this.generateSlug(dto.title);
    const data: Prisma.SongCreateInput = {
      title: dto.title,
      slug,
      audio: dto.audio,
      avatar: dto.avatar,
      description: dto.description,
      lyrics: dto.lyrics,
      duration: dto.duration,
      position: dto.position ?? 0,
      status: (dto.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
    };

    if (dto.singerId) {
      (data as any).singer = { connect: { id: dto.singerId } };
    }
    if (dto.topicId) {
      (data as any).topic = { connect: { id: dto.topicId } };
    }

    return await this.prisma.song.create({
      data,
      include: { singer: true, topic: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    topicId?: string;
    singerId?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SongWhereInput = {
      deleted: false,
      status: 'ACTIVE',
    };
    if (query.topicId) where.topicId = query.topicId;
    if (query.singerId) where.singerId = query.singerId;
    if (query.search) {
      // Multi-field search: title, lyrics, description
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { lyrics: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [songs, total] = await Promise.all([
      this.prisma.song.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { singer: true, topic: true },
      }),
      this.prisma.song.count({ where }),
    ]);

    return {
      data: songs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    topicId?: string;
    singerId?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SongWhereInput = {
      deleted: false,
    };
    if (query.topicId) where.topicId = query.topicId;
    if (query.singerId) where.singerId = query.singerId;
    if (query.search) {
      // Multi-field search: title, lyrics, description
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { lyrics: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [songs, total] = await Promise.all([
      this.prisma.song.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { singer: true, topic: true },
      }),
      this.prisma.song.count({ where }),
    ]);

    return {
      data: songs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const song = await this.prisma.song.findUnique({
      where: { id },
      include: { singer: true, topic: true },
    });
    if (!song || song.deleted) {
      throw new NotFoundException('Song not found');
    }
    return song;
  }

  async findBySlug(slug: string) {
    const song = await this.prisma.song.findUnique({
      where: { slug },
      include: { singer: true, topic: true },
    });
    if (!song || song.deleted) {
      throw new NotFoundException('Song not found');
    }
    return song;
  }

  async update(id: string, dto: UpdateSongDto) {
    await this.findOne(id);

    const data: Prisma.SongUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.audio !== undefined) data.audio = dto.audio;
    if (dto.lyrics !== undefined) data.lyrics = dto.lyrics;
    if (dto.status !== undefined)
      data.status = dto.status as 'ACTIVE' | 'INACTIVE';
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.position !== undefined) data.position = dto.position;

    if (dto.singerId !== undefined) {
      if (dto.singerId === null) {
        (data as any).singer = { disconnect: true };
      } else {
        (data as any).singer = { connect: { id: dto.singerId } };
      }
    }

    if (dto.topicId !== undefined) {
      if (dto.topicId === null) {
        (data as any).topic = { disconnect: true };
      } else {
        (data as any).topic = { connect: { id: dto.topicId } };
      }
    }

    return await this.prisma.song.update({
      where: { id },
      data,
      include: { singer: true, topic: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.song.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async incrementListenCount(id: string) {
    await this.findOne(id);
    return await this.prisma.song.update({
      where: { id },
      data: { listenCount: { increment: 1 } },
    });
  }

  async getTopSongs(page = 1, limit = 10) {
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
      },
    };
  }

  async getNewReleases(limit = 10) {
    return await this.prisma.song.findMany({
      where: { deleted: false, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { singer: true, topic: true },
    });
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36)
    );
  }
}
