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
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../database/schema';
import { CreatePlanDto, UpdatePlanDto, QueryPlansDto } from './dto/plan.dto';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // Endpoint público para página de serviços
  @Public()
  @Get('public')
  async findActive() {
    return this.plansService.findActive();
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findAll(@Query() query: QueryPlansDto) {
    return this.plansService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async softDelete(@Param('id') id: string) {
    return this.plansService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async restore(@Param('id') id: string) {
    return this.plansService.restore(id);
  }

  @Post(':id/toggle-active')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async toggleActive(@Param('id') id: string) {
    return this.plansService.toggleActive(id);
  }

  @Post(':id/toggle-popular')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async togglePopular(@Param('id') id: string) {
    return this.plansService.togglePopular(id);
  }

  @Post('reorder')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async reorder(@Body() body: { planIds: string[] }) {
    return this.plansService.reorder(body.planIds);
  }
}
