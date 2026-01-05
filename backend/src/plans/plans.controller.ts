import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../database/schema';
import { CreatePlanDto, QueryPlansDto, UpdatePlanDto } from './dto/plan.dto';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // Endpoint público para página de serviços
  @Public()
  @Get('public')
  async findActive() {
    return this.plansService.findActive();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findAll(@Query() query: QueryPlansDto) {
    return this.plansService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async softDelete(@Param('id') id: string) {
    return this.plansService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/restore')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async restore(@Param('id') id: string) {
    return this.plansService.restore(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/toggle-active')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async toggleActive(@Param('id') id: string) {
    return this.plansService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/toggle-popular')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async togglePopular(@Param('id') id: string) {
    return this.plansService.togglePopular(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('reorder')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async reorder(@Body() body: { planIds: string[] }) {
    return this.plansService.reorder(body.planIds);
  }
}
