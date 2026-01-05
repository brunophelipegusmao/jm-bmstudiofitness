import { desc,eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { bodyMeasurementsTable } from "@/db/schema";

const saveSchema = z.object({
  userId: z.string().uuid(),
  measurementDate: z.string().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  bodyFatPercentage: z.number().optional(),
  bodyFatMethod: z.string().optional(),
  muscleMass: z.number().optional(),
  chest: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  leftArm: z.number().optional(),
  rightArm: z.number().optional(),
  leftThigh: z.number().optional(),
  rightThigh: z.number().optional(),
  leftCalf: z.number().optional(),
  rightCalf: z.number().optional(),
  tricepsSkinfoldMm: z.number().optional(),
  suprailiacSkinfoldMm: z.number().optional(),
  abdominalSkinfoldMm: z.number().optional(),
  chestSkinfoldMm: z.number().optional(),
  thighSkinfoldMm: z.number().optional(),
  axillarySkinfoldMm: z.number().optional(),
  subscapularSkinfoldMm: z.number().optional(),
  notes: z.string().optional(),
  measuredBy: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = saveSchema.parse(json);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData: any = {
      userId: parsed.userId,
      measurementDate: parsed.measurementDate
        ? new Date(parsed.measurementDate)
        : new Date(),
      weight: parsed.weight ?? null,
      height: parsed.height ?? null,
      bodyFatPercentage: parsed.bodyFatPercentage ?? null,
      bodyFatMethod: parsed.bodyFatMethod ?? null,
      muscleMass: parsed.muscleMass ?? null,
      chest: parsed.chest ?? null,
      waist: parsed.waist ?? null,
      hips: parsed.hips ?? null,
      leftArm: parsed.leftArm ?? null,
      rightArm: parsed.rightArm ?? null,
      leftThigh: parsed.leftThigh ?? null,
      rightThigh: parsed.rightThigh ?? null,
      leftCalf: parsed.leftCalf ?? null,
      rightCalf: parsed.rightCalf ?? null,
      tricepsSkinfoldMm: parsed.tricepsSkinfoldMm ?? null,
      suprailiacSkinfoldMm: parsed.suprailiacSkinfoldMm ?? null,
      abdominalSkinfoldMm: parsed.abdominalSkinfoldMm ?? null,
      chestSkinfoldMm: parsed.chestSkinfoldMm ?? null,
      thighSkinfoldMm: parsed.thighSkinfoldMm ?? null,
      axillarySkinfoldMm: parsed.axillarySkinfoldMm ?? null,
      subscapularSkinfoldMm: parsed.subscapularSkinfoldMm ?? null,
      measuredBy: parsed.measuredBy ?? null,
      notes: parsed.notes ?? null,
    };

    await db.insert(bodyMeasurementsTable).values(insertData);

    // revalidate admin students list page cache if needed
    try {
      revalidatePath("/admin/students");
    } catch {
      // ignore when running in environments without ISR
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error saving body measurement:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    const measurements = await db
      .select()
      .from(bodyMeasurementsTable)
      .where(eq(bodyMeasurementsTable.userId, userId))
      .orderBy(desc(bodyMeasurementsTable.createdAt));

    return NextResponse.json({ success: true, measurements });
  } catch (error) {
    console.error("[API] Error fetching body measurements:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
