import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTopicDto) {
    const slug = this.generateSlug(dto.title);
    const data: Prisma.TopicCreateInput = {
      title: dto.title,
      slug,
      description: dto.description,
      avatar: dto.avatar,
      status: (dto.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
      position: dto.position ?? 0,
    };
    return this.prisma.topic.create({ data });
  }

  async findAll() {
    return this.prisma.topic.findMany({
      where: { deleted: false, status: 'ACTIVE' },
      orderBy: { position: 'asc' },
      include: { _count: { select: { songs: true } } },
    });
  }

  async findAllAdmin() {
    return this.prisma.topic.findMany({
      where: { deleted: false },
      orderBy: { position: 'asc' },
      include: { _count: { select: { songs: true } } },
    });
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        songs: {
          where: { deleted: false },
          take: 20,
          include: { singer: true },
        },
      },
    });
    if (!topic || topic.deleted) throw new NotFoundException('Topic not found');
    return topic;
  }

  async findBySlug(slug: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      include: {
        songs: { where: { deleted: false }, include: { singer: true } },
      },
    });
    if (!topic || topic.deleted) throw new NotFoundException('Topic not found');
    return topic;
  }

  async update(id: string, dto: UpdateTopicDto) {
    await this.findOne(id);

    const data: Prisma.TopicUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.status !== undefined)
      data.status = dto.status as 'ACTIVE' | 'INACTIVE';
    if (dto.position !== undefined) data.position = dto.position;

    return this.prisma.topic.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.topic.update({ where: { id }, data: { deleted: true } });
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
