import { Body, Controller, Get, Patch } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import {
  UpdateMaintenanceDto,
  UpdateRoutesDto,
  UpdateSettingsDto,
} from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Buscar todas as configurações (ADMIN, MASTER)
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getSettings() {
    return this.settingsService.getSettings();
  }

  /**
   * Atualizar configurações (ADMIN, MASTER)
   */
  @Patch()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }

  /**
   * Buscar configurações públicas (sem autenticação)
   */
  @Get('public')
  @Public()
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  /**
   * Buscar status do modo manutenção (ADMIN, MASTER)
   */
  @Get('maintenance')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getMaintenanceStatus() {
    return this.settingsService.getMaintenanceStatus();
  }

  /**
   * Atualizar modo manutenção (MASTER apenas)
   */
  @Patch('maintenance')
  @Roles(UserRole.MASTER)
  updateMaintenanceMode(@Body() updateMaintenanceDto: UpdateMaintenanceDto) {
    return this.settingsService.updateMaintenanceMode(updateMaintenanceDto);
  }

  /**
   * Buscar status das rotas (ADMIN, MASTER)
   */
  @Get('routes')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getRoutesStatus() {
    return this.settingsService.getRoutesStatus();
  }

  /**
   * Atualizar status das rotas (MASTER apenas)
   */
  @Patch('routes')
  @Roles(UserRole.MASTER)
  updateRoutesStatus(@Body() updateRoutesDto: UpdateRoutesDto) {
    return this.settingsService.updateRoutesStatus(updateRoutesDto);
  }

  /**
   * Buscar imagens do carrossel (público)
   */
  @Get('carousel')
  @Public()
  getCarouselImages() {
    return this.settingsService.getCarouselImages();
  }

  /**
   * Buscar políticas e termos (público)
   */
  @Get('policies')
  @Public()
  getPolicies() {
    return this.settingsService.getPolicies();
  }

  /**
   * Buscar valores padrão (ADMIN, MASTER)
   */
  @Get('defaults')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getDefaultValues() {
    return this.settingsService.getDefaultValues();
  }
}
