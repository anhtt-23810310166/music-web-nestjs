import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':songId')
  @ApiOperation({ summary: 'Toggle favorite (add/remove)' })
  toggle(@Req() req, @Param('songId') songId: string) {
    return this.favoritesService.toggle(req.user.id, songId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorite songs' })
  getUserFavorites(@Req() req) {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Get('check/:songId')
  @ApiOperation({ summary: 'Check if a song is favorited' })
  isFavorited(@Req() req, @Param('songId') songId: string) {
    return this.favoritesService.isFavorited(req.user.id, songId);
  }
}
