import { IsIn, IsOptional, IsString } from 'class-validator';

export class RemindFinancialDto {
  @IsString()
  @IsIn(['email', 'whatsapp'])
  channel: 'email' | 'whatsapp';

  @IsOptional()
  @IsString()
  message?: string;
}
