import { IsIn, IsOptional, IsString } from 'class-validator';

export class RemindFinancialDto {
  @IsString()
  @IsIn(['email', 'whatsapp'])
  channel: 'email' | 'whatsapp';

  @IsString()
  @IsIn(['upcoming', 'today', 'blocked'])
  template: 'upcoming' | 'today' | 'blocked';

  @IsOptional()
  @IsString()
  message?: string;
}
