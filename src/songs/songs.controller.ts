import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SongsService } from './songs.service';
import { CreateSongDto, UpdateSongDto } from './dto/song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private songsService: SongsService) {}

  // ─── Admin Endpoints ──────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a new song' })
  create(@Body() dto: CreateSongDto) {
    return this.songsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update a song' })
  update(@Param('id') id: string, @Body() dto: UpdateSongDto) {
    return this.songsService.update(id, dto);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get all songs including inactive' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'topicId', required: false })
  @ApiQuery({ name: 'singerId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('topicId') topicId?: string,
    @Query('singerId') singerId?: string,
    @Query('search') search?: string,
  ) {
    return this.songsService.findAllAdmin({
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      topicId,
      singerId,
      search,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Soft-delete a song' })
  remove(@Param('id') id: string) {
    return this.songsService.remove(id);
  }

  // ─── Public Endpoints ─────────────────────────────────────────
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes
  @ApiOperation({ summary: 'Get all songs (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'topicId', required: false })
  @ApiQuery({ name: 'singerId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('topicId') topicId?: string,
    @Query('singerId') singerId?: string,
    @Query('search') search?: string,
  ) {
    return this.songsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      topicId,
      singerId,
      search,
    });
  }

  @Get('top')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('songs_top')
  @CacheTTL(600) // 10 minutes
  @ApiOperation({ summary: 'Get top trending songs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getTopSongs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.songsService.getTopSongs(page ? +page : 1, limit ? +limit : 10);
  }

  @Get('new')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('songs_new')
  @CacheTTL(300) // 5 minutes
  @ApiOperation({ summary: 'Get latest released songs' })
  @ApiQuery({ name: 'limit', required: false })
  getNewReleases(@Query('limit') limit?: number) {
    return this.songsService.getNewReleases(limit ? +limit : 10);
  }

  @Get('slug/:slug')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes
  @ApiOperation({ summary: 'Get song by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.songsService.findBySlug(slug);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes
  @ApiOperation({ summary: 'Get song by ID' })
  findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }

  @Patch(':id/listen')
  @ApiOperation({ summary: 'Increment listen count' })
  listen(@Param('id') id: string) {
    return this.songsService.incrementListenCount(id);
  }
}
