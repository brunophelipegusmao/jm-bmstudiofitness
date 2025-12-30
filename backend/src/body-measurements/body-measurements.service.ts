import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tbBodyMeasurements, tbUsers } from '../database/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import {
  CreateBodyMeasurementDto,
  UpdateBodyMeasurementDto,
  QueryMeasurementsDto,
} from './dto/body-measurement.dto';

@Injectable()
export class BodyMeasurementsService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<any>,
  ) {}

  async findAll(query: QueryMeasurementsDto = {}) {
    const conditions: any[] = [];

    if (query.studentId) {
      conditions.push(eq(tbBodyMeasurements.userId, query.studentId));
    }

    if (query.startDate) {
      conditions.push(gte(tbBodyMeasurements.measurementDate, query.startDate));
    }

    if (query.endDate) {
      conditions.push(lte(tbBodyMeasurements.measurementDate, query.endDate));
    }

    const measurements = await this.db
      .select({
        id: tbBodyMeasurements.id,
        userId: tbBodyMeasurements.userId,
        measurementDate: tbBodyMeasurements.measurementDate,
        weight: tbBodyMeasurements.weight,
        height: tbBodyMeasurements.height,
        bodyFatPercentage: tbBodyMeasurements.bodyFatPercentage,
        muscleMass: tbBodyMeasurements.muscleMass,
        chest: tbBodyMeasurements.chest,
        waist: tbBodyMeasurements.waist,
        hips: tbBodyMeasurements.hips,
        leftArm: tbBodyMeasurements.leftArm,
        rightArm: tbBodyMeasurements.rightArm,
        leftThigh: tbBodyMeasurements.leftThigh,
        rightThigh: tbBodyMeasurements.rightThigh,
        leftCalf: tbBodyMeasurements.leftCalf,
        rightCalf: tbBodyMeasurements.rightCalf,
        notes: tbBodyMeasurements.notes,
        createdAt: tbBodyMeasurements.createdAt,
        updatedAt: tbBodyMeasurements.updatedAt,
        user: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbBodyMeasurements)
      .innerJoin(tbUsers, eq(tbBodyMeasurements.userId, tbUsers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tbBodyMeasurements.measurementDate));

    return measurements;
  }

  async findOne(id: string) {
    const [measurement] = await this.db
      .select({
        id: tbBodyMeasurements.id,
        userId: tbBodyMeasurements.userId,
        measurementDate: tbBodyMeasurements.measurementDate,
        weight: tbBodyMeasurements.weight,
        height: tbBodyMeasurements.height,
        bodyFatPercentage: tbBodyMeasurements.bodyFatPercentage,
        muscleMass: tbBodyMeasurements.muscleMass,
        chest: tbBodyMeasurements.chest,
        waist: tbBodyMeasurements.waist,
        hips: tbBodyMeasurements.hips,
        leftArm: tbBodyMeasurements.leftArm,
        rightArm: tbBodyMeasurements.rightArm,
        leftThigh: tbBodyMeasurements.leftThigh,
        rightThigh: tbBodyMeasurements.rightThigh,
        leftCalf: tbBodyMeasurements.leftCalf,
        rightCalf: tbBodyMeasurements.rightCalf,
        notes: tbBodyMeasurements.notes,
        createdAt: tbBodyMeasurements.createdAt,
        updatedAt: tbBodyMeasurements.updatedAt,
        user: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbBodyMeasurements)
      .innerJoin(tbUsers, eq(tbBodyMeasurements.userId, tbUsers.id))
      .where(eq(tbBodyMeasurements.id, id));

    if (!measurement) {
      throw new NotFoundException('Medida corporal não encontrada');
    }

    return measurement;
  }

  async findByStudent(studentId: string) {
    const measurements = await this.db
      .select()
      .from(tbBodyMeasurements)
      .where(eq(tbBodyMeasurements.userId, studentId))
      .orderBy(desc(tbBodyMeasurements.measurementDate));

    return measurements;
  }

  async create(dto: CreateBodyMeasurementDto, measuredBy: string) {
    // Verifica se o usuário (aluno) existe
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, dto.studentId));

    if (!user) {
      throw new NotFoundException('Aluno não encontrado');
    }

    const [measurement] = await this.db
      .insert(tbBodyMeasurements)
      .values({
        userId: dto.studentId,
        measurementDate: dto.measurementDate,
        weight: dto.weight || null,
        height: dto.height || null,
        bodyFatPercentage: dto.bodyFatPercentage || null,
        muscleMass: dto.muscleMass || null,
        chest: dto.chest || null,
        waist: dto.waist || null,
        hips: dto.hips || null,
        leftArm: dto.leftArm || null,
        rightArm: dto.rightArm || null,
        leftThigh: dto.leftThigh || null,
        rightThigh: dto.rightThigh || null,
        leftCalf: dto.leftCalf || null,
        rightCalf: dto.rightCalf || null,
        notes: dto.notes || null,
        measuredBy,
      })
      .returning();

    return measurement;
  }

  async update(id: string, dto: UpdateBodyMeasurementDto) {
    await this.findOne(id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.measurementDate !== undefined)
      updateData.measurementDate = dto.measurementDate;
    if (dto.weight !== undefined) updateData.weight = dto.weight || null;
    if (dto.height !== undefined) updateData.height = dto.height || null;
    if (dto.bodyFatPercentage !== undefined)
      updateData.bodyFatPercentage = dto.bodyFatPercentage || null;
    if (dto.muscleMass !== undefined)
      updateData.muscleMass = dto.muscleMass || null;
    if (dto.chest !== undefined) updateData.chest = dto.chest || null;
    if (dto.waist !== undefined) updateData.waist = dto.waist || null;
    if (dto.hips !== undefined) updateData.hips = dto.hips || null;
    if (dto.leftArm !== undefined) updateData.leftArm = dto.leftArm || null;
    if (dto.rightArm !== undefined) updateData.rightArm = dto.rightArm || null;
    if (dto.leftThigh !== undefined)
      updateData.leftThigh = dto.leftThigh || null;
    if (dto.rightThigh !== undefined)
      updateData.rightThigh = dto.rightThigh || null;
    if (dto.leftCalf !== undefined) updateData.leftCalf = dto.leftCalf || null;
    if (dto.rightCalf !== undefined)
      updateData.rightCalf = dto.rightCalf || null;
    if (dto.notes !== undefined) updateData.notes = dto.notes || null;

    const [updated] = await this.db
      .update(tbBodyMeasurements)
      .set(updateData)
      .where(eq(tbBodyMeasurements.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.db
      .delete(tbBodyMeasurements)
      .where(eq(tbBodyMeasurements.id, id));

    return { message: 'Medida corporal excluída com sucesso' };
  }

  async getProgress(studentId: string) {
    const measurements = await this.db
      .select()
      .from(tbBodyMeasurements)
      .where(eq(tbBodyMeasurements.userId, studentId))
      .orderBy(tbBodyMeasurements.measurementDate);

    if (measurements.length < 2) {
      return {
        hasEnoughData: false,
        message:
          'São necessárias pelo menos 2 medições para calcular progresso',
      };
    }

    const first = measurements[0];
    const last = measurements[measurements.length - 1];

    const calculateDiff = (current: string | null, previous: string | null) => {
      if (!current || !previous) return null;
      const curr = parseFloat(current);
      const prev = parseFloat(previous);
      if (isNaN(curr) || isNaN(prev)) return null;
      return {
        value: (curr - prev).toFixed(2),
        percentage: (((curr - prev) / prev) * 100).toFixed(1),
      };
    };

    return {
      hasEnoughData: true,
      period: {
        start: first.measurementDate,
        end: last.measurementDate,
        measurementCount: measurements.length,
      },
      progress: {
        weight: calculateDiff(last.weight, first.weight),
        bodyFatPercentage: calculateDiff(
          last.bodyFatPercentage,
          first.bodyFatPercentage,
        ),
        muscleMass: calculateDiff(last.muscleMass, first.muscleMass),
        chest: calculateDiff(last.chest, first.chest),
        waist: calculateDiff(last.waist, first.waist),
        hips: calculateDiff(last.hips, first.hips),
        leftArm: calculateDiff(last.leftArm, first.leftArm),
        rightArm: calculateDiff(last.rightArm, first.rightArm),
        leftThigh: calculateDiff(last.leftThigh, first.leftThigh),
        rightThigh: calculateDiff(last.rightThigh, first.rightThigh),
        leftCalf: calculateDiff(last.leftCalf, first.leftCalf),
        rightCalf: calculateDiff(last.rightCalf, first.rightCalf),
      },
    };
  }
}
