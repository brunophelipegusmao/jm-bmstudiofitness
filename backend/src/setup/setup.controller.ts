import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { CreateFirstAdminDto } from './dto/create-first-admin.dto';
import { SetupService } from './setup.service';

@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  /**
   * Verificar conexão com o banco de dados (público)
   */
  @Get('database-check')
  @Public()
  async checkDatabase() {
    return this.setupService.checkDatabaseConnection();
  }

  /**
   * Verificar se já existe admin no sistema (público)
   */
  @Get('has-admin')
  @Public()
  async hasAdmin() {
    return this.setupService.hasAdminUser();
  }

  /**
   * Obter informações completas do sistema (público durante setup)
   */
  @Get('info')
  @Public()
  async getDatabaseInfo() {
    return this.setupService.getDatabaseInfo();
  }

  /**
   * Criar primeiro usuário MASTER (público - só funciona se não houver admin)
   */
  @Post('first-admin')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async createFirstAdmin(@Body() createFirstAdminDto: CreateFirstAdminDto) {
    return this.setupService.createFirstAdmin(createFirstAdminDto);
  }
}
