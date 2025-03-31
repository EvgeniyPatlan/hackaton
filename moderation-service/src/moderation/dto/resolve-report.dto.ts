import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class ResolveReportDto {
  @IsEnum(ReportStatus, { message: 'Invalid report status' })
  status: ReportStatus;

  @IsString()
  @IsNotEmpty()
  resolution: string;
}
