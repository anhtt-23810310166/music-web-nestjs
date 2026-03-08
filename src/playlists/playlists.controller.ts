import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';
import {
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddSongToPlaylistDto,
} from './dto/playlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('playlists')
@Controller('playlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a playlist' })
  create(@Req() req, @Body() dto: CreatePlaylistDto) {
    return this.playlistsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my playlists' })
  findUserPlaylists(@Req() req) {
    return this.playlistsService.findUserPlaylists(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get playlist details with songs' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.playlistsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update playlist' })
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdatePlaylistDto) {
    return this.playlistsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete playlist' })
  remove(@Param('id') id: string, @Req() req) {
    return this.playlistsService.remove(id, req.user.id);
  }

  @Post(':id/songs')
  @ApiOperation({ summary: 'Add a song to playlist' })
  addSong(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: AddSongToPlaylistDto,
  ) {
    return this.playlistsService.addSong(id, dto.songId, req.user.id);
  }

  @Delete(':id/songs/:songId')
  @ApiOperation({ summary: 'Remove a song from playlist' })
  removeSong(
    @Param('id') id: string,
    @Param('songId') songId: string,
    @Req() req,
  ) {
    return this.playlistsService.removeSong(id, songId, req.user.id);
  }

  @Post(':id/songs/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Batch add multiple songs to playlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { songIds: { type: 'array', items: { type: 'string' } } },
    },
  })
  addSongs(
    @Param('id') id: string,
    @Req() req,
    @Body() body: { songIds: string[] },
  ) {
    return this.playlistsService.addSongs(id, body.songIds, req.user.id);
  }

  @Post(':id/songs/remove-batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Batch remove multiple songs from playlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { songIds: { type: 'array', items: { type: 'string' } } },
    },
  })
  removeSongs(
    @Param('id') id: string,
    @Req() req,
    @Body() body: { songIds: string[] },
  ) {
    return this.playlistsService.removeSongs(id, body.songIds, req.user.id);
  }

  @Post(':id/songs/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder songs in playlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { songIds: { type: 'array', items: { type: 'string' } } },
    },
  })
  reorderSongs(
    @Param('id') id: string,
    @Req() req,
    @Body() body: { songIds: string[] },
  ) {
    return this.playlistsService.reorderSongs(id, body.songIds, req.user.id);
  }

  @Post(':id/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all songs from playlist' })
  clearPlaylist(@Param('id') id: string, @Req() req) {
    return this.playlistsService.clearPlaylist(id, req.user.id);
  }
}
