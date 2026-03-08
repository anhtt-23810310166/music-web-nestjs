import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListeningHistoryService } from './listening-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('listening-history')
@Controller('listening-history')
export class ListeningHistoryController {
  constructor(private listeningHistoryService: ListeningHistoryService) {}

  @Post('record/:songId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a song listen' })
  recordListening(@Req() req, @Param('songId') songId: string) {
    return this.listeningHistoryService.recordListening(req.user.id, songId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user listening history' })
  getUserHistory(
    @Req() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.listeningHistoryService.getUserListeningHistory(
      req.user.id,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recently played songs' })
  getRecentlyPlayed(@Req() req, @Query('limit') limit?: number) {
    return this.listeningHistoryService.getRecentlyPlayed(
      req.user.id,
      limit ? +limit : 10,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user listening statistics' })
  getUserStats(@Req() req, @Query('days') days?: number) {
    return this.listeningHistoryService.getUserListeningStats(
      req.user.id,
      days ? +days : 30,
    );
  }

  // Admin endpoint for song stats
  @Get('song/:songId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get song listening statistics' })
  getSongStats(@Param('songId') songId: string, @Query('days') days?: number) {
    return this.listeningHistoryService.getSongListeningStats(
      songId,
      days ? +days : 7,
    );
  }
}
