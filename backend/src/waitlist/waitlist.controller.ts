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
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../database/schema';
import {
  CreateWaitlistDto,
  UpdateWaitlistDto,
  QueryWaitlistDto,
  ConvertWaitlistDto,
} from './dto/waitlist.dto';

@Controller('waitlist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  // Endpoint público para se inscrever na lista de espera
  @Public()
  @Post('signup')
  async publicSignup(@Body() dto: CreateWaitlistDto) {
    return this.waitlistService.create(dto);
  }

  @Public()
  @Get('public')
  async findPublic() {
    return this.waitlistService.findPublic();
  }

  @Public()
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findAll(@Query() query: QueryWaitlistDto) {
    return this.waitlistService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async getStats() {
    return this.waitlistService.getStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findOne(@Param('id') id: string) {
    return this.waitlistService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async create(@Body() dto: CreateWaitlistDto) {
    return this.waitlistService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async update(@Param('id') id: string, @Body() dto: UpdateWaitlistDto) {
    return this.waitlistService.update(id, dto);
  }

  @Delete('all')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async deleteAll() {
    return this.waitlistService.deleteAll();
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async delete(@Param('id') id: string) {
    return this.waitlistService.delete(id);
  }

  @Post(':id/contacted')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async markContacted(@Param('id') id: string) {
    return this.waitlistService.markContacted(id);
  }

  @Public()
  @Post(':id/convert')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async convert(@Param('id') id: string, @Body() dto: ConvertWaitlistDto) {
    return this.waitlistService.convert(id, dto);
  }

  @Post(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async cancel(@Param('id') id: string) {
    return this.waitlistService.cancel(id);
  }
}
