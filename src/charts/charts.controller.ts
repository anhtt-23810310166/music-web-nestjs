import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChartsService } from './charts.service';

@ApiTags('charts')
@Controller('charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('songs')
  @ApiOperation({ summary: 'Get top songs chart' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['daily', 'weekly', 'monthly', 'alltime'],
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getTopSongsChart(
    @Query('period')
    period: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'weekly',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chartsService.getTopSongsChart(
      period,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending songs (biggest growth)' })
  @ApiQuery({ name: 'limit', required: false })
  getTrendingSongs(@Query('limit') limit?: number) {
    return this.chartsService.getTrendingSongs(limit ? +limit : 10);
  }

  @Get('artists')
  @ApiOperation({ summary: 'Get top artists chart' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['weekly', 'monthly', 'alltime'],
  })
  @ApiQuery({ name: 'limit', required: false })
  getTopArtists(
    @Query('period') period: 'weekly' | 'monthly' | 'alltime' = 'monthly',
    @Query('limit') limit?: number,
  ) {
    return this.chartsService.getTopArtistsChart(period, limit ? +limit : 10);
  }

  @Get('topics')
  @ApiOperation({ summary: 'Get top topics/genres chart' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['weekly', 'monthly', 'alltime'],
  })
  @ApiQuery({ name: 'limit', required: false })
  getTopTopics(
    @Query('period') period: 'weekly' | 'monthly' | 'alltime' = 'monthly',
    @Query('limit') limit?: number,
  ) {
    return this.chartsService.getTopTopicsChart(period, limit ? +limit : 10);
  }
}
