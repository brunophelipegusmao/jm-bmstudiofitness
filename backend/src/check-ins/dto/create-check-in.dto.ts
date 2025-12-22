import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCheckInDto {
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  checkInDate?: string; // ISO date

  @IsOptional()
  @IsString()
  checkInTime?: string; // HH:mm

  @IsNotEmpty({ message: 'Método de check-in é obrigatório' })
  @IsString()
  method: string; // 'RFID', 'QR Code', 'Manual', 'App'

  @IsOptional()
  @IsString()
  identifier?: string; // ID do cartão RFID ou QR code

  @IsOptional()
  @IsString()
  checkedInBy?: string; // ID de quem fez o check-in (funcionário/coach)
}
