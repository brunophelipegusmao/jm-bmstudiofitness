import { apiClient } from "@/lib/api-client";

export interface StudioSettings {
  studioName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  mondayOpen?: string;
  mondayClose?: string;
  tuesdayOpen?: string;
  tuesdayClose?: string;
  wednesdayOpen?: string;
  wednesdayClose?: string;
  thursdayOpen?: string;
  thursdayClose?: string;
  fridayOpen?: string;
  fridayClose?: string;
  saturdayOpen?: string;
  saturdayClose?: string;
  sundayOpen?: string;
  sundayClose?: string;
  monthlyFeeDefault?: number;
  registrationFee?: number;
  personalTrainingHourlyRate?: number;
  paymentDueDateDefault?: number;
  gracePeriodDays?: number;
  maxCheckInsPerDay?: number;
  allowWeekendCheckIn?: boolean;
  termsAndConditions?: string;
  privacyPolicy?: string;
  cancellationPolicy?: string;
  carouselImage1?: string | null;
  carouselImage2?: string | null;
  carouselImage3?: string | null;
  carouselImage4?: string | null;
  carouselImage5?: string | null;
  carouselImage6?: string | null;
  carouselImage7?: string | null;
  waitlistEnabled?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  openingHours?: string;
  carouselEnabled?: boolean;
  homeHistoryMarkdown?: string | null;
  homeHistoryImage?: string | null;
  foundationDate?: string | null;
  promoBannerEnabled?: boolean;
  promoBannerMediaType?: "image" | "video";
  promoBannerUrl?: string | null;
  promoBannerTitle?: string | null;
  promoBannerDescription?: string | null;
  promoBannerLink?: string | null;
}

const defaultSettings: StudioSettings = {
  studioName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  monthlyFeeDefault: 0,
  registrationFee: 0,
  personalTrainingHourlyRate: 0,
  paymentDueDateDefault: 1,
  gracePeriodDays: 0,
  maxCheckInsPerDay: 0,
  allowWeekendCheckIn: false,
  carouselEnabled: true,
  homeHistoryMarkdown: null,
  homeHistoryImage: null,
  foundationDate: null,
  promoBannerEnabled: false,
  promoBannerMediaType: "image",
  promoBannerUrl: null,
  promoBannerTitle: null,
  promoBannerDescription: null,
  promoBannerLink: null,
};

export async function getStudioSettingsAction(): Promise<{
  success: boolean;
  data: StudioSettings | null;
  error?: string;
}> {
  try {
    const data = await apiClient.get<StudioSettings>("/settings");
    return { success: true, data: { ...defaultSettings, ...data } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar configurações";
    console.warn("[getStudioSettingsAction] fallback to defaults", error);
    return { success: false, data: { ...defaultSettings }, error: message };
  }
}

export async function updateStudioSettingsAction(
  settings: Partial<StudioSettings>,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await apiClient.patch("/settings", settings);
    return { success: true, message: "Configurações atualizadas" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar configurações";
    return { success: false, error: message, message };
  }
}
