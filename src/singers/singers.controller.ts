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
import { SingersService } from './singers.service';
import { CreateSingerDto, UpdateSingerDto } from './dto/singer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('singers')
@Controller('singers')
export class SingersController {
  constructor(private singersService: SingersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create singer' })
  create(@Body() dto: CreateSingerDto) {
    return this.singersService.create(dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes
  @ApiOperation({ summary: 'Get all singers' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.singersService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      search,
    });
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get all singers including inactive' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.singersService.findAllAdmin({
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      search,
    });
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('singer_')
  @CacheTTL(300) // 5 minutes
  @ApiOperation({ summary: 'Get singer by ID with their songs' })
  findOne(@Param('id') id: string) {
    return this.singersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update singer' })
  update(@Param('id') id: string, @Body() dto: UpdateSingerDto) {
    return this.singersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete singer' })
  remove(@Param('id') id: string) {
    return this.singersService.remove(id);
  }
}
