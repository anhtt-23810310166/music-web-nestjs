import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSingerDto, UpdateSingerDto } from './dto/singer.dto';

@Injectable()
export class SingersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSingerDto) {
    return this.prisma.singer.create({ data: dto });
  }

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SingerWhereInput = { deleted: false };
    if (query.search) {
      // Multi-field search: fullName
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [singers, total] = await Promise.all([
      this.prisma.singer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
        include: { _count: { select: { songs: true } } },
      }),
      this.prisma.singer.count({ where }),
    ]);

    return {
      data: singers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SingerWhereInput = {
      deleted: false,
    };
    if (query.search) {
      // Multi-field search: fullName
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [singers, total] = await Promise.all([
      this.prisma.singer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.singer.count({ where }),
    ]);

    return {
      data: singers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const singer = await this.prisma.singer.findUnique({
      where: { id },
      include: { songs: { where: { deleted: false }, take: 20 } },
    });
    if (!singer || singer.deleted)
      throw new NotFoundException('Singer not found');
    return singer;
  }

  async update(id: string, dto: UpdateSingerDto) {
    await this.findOne(id);
    return this.prisma.singer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.singer.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
