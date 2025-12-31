import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../database/schema';
import {
  ConfirmAttendanceDto,
  CreateEventDto,
  QueryEventsDto,
  UpdateEventDto,
} from './dto/event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Public()
  @Get('public')
  async findPublicEvents(@Query() query: QueryEventsDto) {
    return this.eventsService.findAllEvents({ ...query, publishedOnly: true });
  }

  @Public()
  @Get('calendar')
  async getCalendarData() {
    return this.eventsService.getCalendarData();
  }

  @Public()
  @Get('public/:slug')
  async findPublicEventBySlug(@Param('slug') slug: string) {
    return this.eventsService.findEventBySlug(slug);
  }

  @Public()
  @Post('public/:slug/confirm')
  async confirmAttendance(
    @Param('slug') slug: string,
    @Body() dto: ConfirmAttendanceDto,
  ) {
    return this.eventsService.confirmAttendance(slug, dto);
  }

  @Get(':id/confirmations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async listAttendance(@Param('id') id: string) {
    return this.eventsService.getAttendanceList(id);
  }

  // ==================== EVENT ENDPOINTS ====================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findAllEvents(@Query() query: QueryEventsDto) {
    return this.eventsService.findAllEvents(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findEvent(@Param('id') id: string) {
    return this.eventsService.findEvent(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async createEvent(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: import('../auth/interfaces/auth.interface').JwtPayload,
  ) {
    return this.eventsService.createEvent(dto, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async softDeleteEvent(@Param('id') id: string) {
    return this.eventsService.softDeleteEvent(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async restoreEvent(@Param('id') id: string) {
    return this.eventsService.restoreEvent(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async publishEvent(@Param('id') id: string) {
    return this.eventsService.publishEvent(id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async unpublishEvent(@Param('id') id: string) {
    return this.eventsService.unpublishEvent(id);
  }

  @Get(':id/confirmations/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async attendanceReportPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } =
      await this.eventsService.getAttendanceReportPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=\"${filename}\"`,
    });
    return res.send(buffer);
  }
}
