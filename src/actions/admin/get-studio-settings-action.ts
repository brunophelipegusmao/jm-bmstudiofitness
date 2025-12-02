"use server";

import { db } from "@/db";
import { studioSettingsTable } from "@/db/schema";

export type StudioSettings = typeof studioSettingsTable.$inferSelect;

/**
 * Busca as configurações do estúdio
 * Se não existir, retorna as configurações padrão
 */
export async function getStudioSettingsAction(): Promise<StudioSettings> {
  try {
    const settings = await db.query.studioSettingsTable.findFirst();

    // Se não existir configuração, retorna valores padrão do schema
    if (!settings) {
      return {
        id: crypto.randomUUID(),
        studioName: "JM Fitness Studio",
        email: "contato@jmfitness.com",
        phone: "(21) 98099-5749",
        address: "Rua das Flores, 123",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "20000-000",
        mondayOpen: "06:00",
        mondayClose: "22:00",
        tuesdayOpen: "06:00",
        tuesdayClose: "22:00",
        wednesdayOpen: "06:00",
        wednesdayClose: "22:00",
        thursdayOpen: "06:00",
        thursdayClose: "22:00",
        fridayOpen: "06:00",
        fridayClose: "22:00",
        saturdayOpen: null,
        saturdayClose: null,
        sundayOpen: null,
        sundayClose: null,
        monthlyFeeDefault: 15000,
        registrationFee: 5000,
        personalTrainingHourlyRate: 10000,
        paymentDueDateDefault: 10,
        gracePeriodDays: 5,
        maxCheckInsPerDay: 2,
        allowWeekendCheckIn: false,
        waitlistEnabled: false,
        termsAndConditions: null,
        privacyPolicy: null,
        cancellationPolicy: null,
        carouselImage1: "/gym1.jpg",
        carouselImage2: "/gym2.jpg",
        carouselImage3: "/gym3.jpg",
        carouselImage4: null,
        carouselImage5: null,
        carouselImage6: null,
        carouselImage7: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return settings;
  } catch (error) {
    console.error("Erro ao buscar configurações do estúdio:", error);
    throw new Error("Não foi possível buscar as configurações do estúdio");
  }
}
