import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { db } from '../database/db';
import { tbStudioSettings } from '../database/schema';
import {
  UpdateMaintenanceDto,
  UpdateRoutesDto,
  UpdateSettingsDto,
} from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  /**
   * Buscar configurações do estúdio
   * Retorna a primeira (e única) configuração ou cria uma padrão
   */
  async getSettings() {
    const settings = await db.select().from(tbStudioSettings).limit(1);

    if (settings.length === 0) {
      // Criar configuração padrão se não existir
      const [newSettings] = await db
        .insert(tbStudioSettings)
        .values({})
        .returning();
      return newSettings;
    }

    return settings[0];
  }

  /**
   * Atualizar configurações do estúdio
   */
  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    const currentSettings = await this.getSettings();

    const [updated] = await db
      .update(tbStudioSettings)
      .set({
        ...updateSettingsDto,
        updatedAt: new Date(),
      })
      .where(eq(tbStudioSettings.id, currentSettings.id))
      .returning();

    return updated;
  }

  /**
   * Buscar status do modo manutenção
   */
  async getMaintenanceStatus() {
    const settings = await this.getSettings();
    return {
      maintenanceMode: settings.maintenanceMode,
      maintenanceRedirectUrl: settings.maintenanceRedirectUrl,
    };
  }

  /**
   * Atualizar modo manutenção
   */
  async updateMaintenanceMode(updateMaintenanceDto: UpdateMaintenanceDto) {
    const currentSettings = await this.getSettings();

    const [updated] = await db
      .update(tbStudioSettings)
      .set({
        maintenanceMode: updateMaintenanceDto.maintenanceMode,
        maintenanceRedirectUrl:
          updateMaintenanceDto.maintenanceRedirectUrl ??
          currentSettings.maintenanceRedirectUrl,
        updatedAt: new Date(),
      })
      .where(eq(tbStudioSettings.id, currentSettings.id))
      .returning();

    return {
      maintenanceMode: updated.maintenanceMode,
      maintenanceRedirectUrl: updated.maintenanceRedirectUrl,
      message: updated.maintenanceMode
        ? 'Modo manutenção ativado'
        : 'Modo manutenção desativado',
    };
  }

  /**
   * Buscar status das rotas
   */
  async getRoutesStatus() {
    const settings = await this.getSettings();
    return {
      routeHomeEnabled: settings.routeHomeEnabled,
      routeUserEnabled: settings.routeUserEnabled,
      routeCoachEnabled: settings.routeCoachEnabled,
      routeEmployeeEnabled: settings.routeEmployeeEnabled,
      routeShoppingEnabled: settings.routeShoppingEnabled,
      routeEventsEnabled: settings.routeEventsEnabled,
      routeServicesEnabled: settings.routeServicesEnabled,
      routeContactEnabled: settings.routeContactEnabled,
      routeWaitlistEnabled: settings.routeWaitlistEnabled,
    };
  }

  /**
   * Atualizar status das rotas
   */
  async updateRoutesStatus(updateRoutesDto: UpdateRoutesDto) {
    const currentSettings = await this.getSettings();

    const [updated] = await db
      .update(tbStudioSettings)
      .set({
        ...updateRoutesDto,
        updatedAt: new Date(),
      })
      .where(eq(tbStudioSettings.id, currentSettings.id))
      .returning();

    return {
      routeHomeEnabled: updated.routeHomeEnabled,
      routeUserEnabled: updated.routeUserEnabled,
      routeCoachEnabled: updated.routeCoachEnabled,
      routeEmployeeEnabled: updated.routeEmployeeEnabled,
      routeShoppingEnabled: updated.routeShoppingEnabled,
      routeEventsEnabled: updated.routeEventsEnabled,
      routeServicesEnabled: updated.routeServicesEnabled,
      routeContactEnabled: updated.routeContactEnabled,
      routeWaitlistEnabled: updated.routeWaitlistEnabled,
      message: 'Status das rotas atualizado com sucesso',
    };
  }

  /**
   * Buscar configurações públicas (sem dados sensíveis)
   * Para uso no frontend sem autenticação
   */
  async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      studioName: settings.studioName,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      zipCode: settings.zipCode,
      // Horários
      mondayOpen: settings.mondayOpen,
      mondayClose: settings.mondayClose,
      tuesdayOpen: settings.tuesdayOpen,
      tuesdayClose: settings.tuesdayClose,
      wednesdayOpen: settings.wednesdayOpen,
      wednesdayClose: settings.wednesdayClose,
      thursdayOpen: settings.thursdayOpen,
      thursdayClose: settings.thursdayClose,
      fridayOpen: settings.fridayOpen,
      fridayClose: settings.fridayClose,
      saturdayOpen: settings.saturdayOpen,
      saturdayClose: settings.saturdayClose,
      sundayOpen: settings.sundayOpen,
      sundayClose: settings.sundayClose,
      // Modo manutenção
      maintenanceMode: settings.maintenanceMode,
      // Waitlist
      waitlistEnabled: settings.waitlistEnabled,
      // Rotas
      routeHomeEnabled: settings.routeHomeEnabled,
      routeUserEnabled: settings.routeUserEnabled,
      routeCoachEnabled: settings.routeCoachEnabled,
      routeEmployeeEnabled: settings.routeEmployeeEnabled,
      routeShoppingEnabled: settings.routeShoppingEnabled,
      routeEventsEnabled: settings.routeEventsEnabled,
      routeServicesEnabled: settings.routeServicesEnabled,
      routeContactEnabled: settings.routeContactEnabled,
      routeWaitlistEnabled: settings.routeWaitlistEnabled,
      // Carrossel
      carouselImage1: settings.carouselImage1,
      carouselImage2: settings.carouselImage2,
      carouselImage3: settings.carouselImage3,
      carouselImage4: settings.carouselImage4,
      carouselImage5: settings.carouselImage5,
      carouselImage6: settings.carouselImage6,
      carouselImage7: settings.carouselImage7,
    };
  }

  /**
   * Buscar imagens do carrossel
   */
  async getCarouselImages() {
    const settings = await this.getSettings();
    const images = [
      settings.carouselImage1,
      settings.carouselImage2,
      settings.carouselImage3,
      settings.carouselImage4,
      settings.carouselImage5,
      settings.carouselImage6,
      settings.carouselImage7,
    ].filter((img) => img !== null && img !== undefined && img !== '');

    return { images };
  }

  /**
   * Buscar políticas e termos
   */
  async getPolicies() {
    const settings = await this.getSettings();
    return {
      termsAndConditions: settings.termsAndConditions,
      privacyPolicy: settings.privacyPolicy,
      cancellationPolicy: settings.cancellationPolicy,
    };
  }

  /**
   * Buscar valores padrão (mensalidade, taxa de matrícula, etc.)
   */
  async getDefaultValues() {
    const settings = await this.getSettings();
    return {
      monthlyFeeDefault: settings.monthlyFeeDefault,
      registrationFee: settings.registrationFee,
      personalTrainingHourlyRate: settings.personalTrainingHourlyRate,
      paymentDueDateDefault: settings.paymentDueDateDefault,
      gracePeriodDays: settings.gracePeriodDays,
      maxCheckInsPerDay: settings.maxCheckInsPerDay,
      allowWeekendCheckIn: settings.allowWeekendCheckIn,
    };
  }
}
