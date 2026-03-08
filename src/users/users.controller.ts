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
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  ChangeEmailDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ─── User Profile Endpoints ────────────────────────────────────
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @HttpCode(HttpStatus.OK)
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  @Post('change-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user email' })
  @HttpCode(HttpStatus.OK)
  changeEmail(@Req() req, @Body() dto: ChangeEmailDto) {
    return this.usersService.changeEmail(req.user.id, dto.newEmail);
  }

  // ─── Password Reset Endpoints ──────────────────────────────────
  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset email' })
  @HttpCode(HttpStatus.OK)
  requestPasswordReset(@Body() body: { email: string }) {
    return this.usersService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.usersService.resetPassword(body.token, body.newPassword);
  }

  // ─── Email Verification ────────────────────────────────────────
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Query('token') token: string) {
    return this.usersService.verifyEmail(token);
  }

  // ─── Admin User Management ─────────────────────────────────────
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAllUsers({
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      search,
      role,
      status,
    });
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update user status' })
  updateUserStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.usersService.updateUserStatus(id, body.status);
  }

  @Patch('admin/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update user role' })
  updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.usersService.updateUserRole(id, body.role);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete user' })
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
