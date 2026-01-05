import { apiClient } from "@/lib/api-client";

export interface PublicSettings {
  studioName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  mondayOpen?: string | null;
  mondayClose?: string | null;
  tuesdayOpen?: string | null;
  tuesdayClose?: string | null;
  wednesdayOpen?: string | null;
  wednesdayClose?: string | null;
  thursdayOpen?: string | null;
  thursdayClose?: string | null;
  fridayOpen?: string | null;
  fridayClose?: string | null;
  saturdayOpen?: string | null;
  saturdayClose?: string | null;
  sundayOpen?: string | null;
  sundayClose?: string | null;
  maintenanceMode?: boolean;
  waitlistEnabled?: boolean;
  routeContactEnabled?: boolean;
  carouselImage1?: string | null;
  carouselImage2?: string | null;
  carouselImage3?: string | null;
  carouselImage4?: string | null;
  carouselImage5?: string | null;
  carouselImage6?: string | null;
  carouselImage7?: string | null;
  carouselCaption1?: string | null;
  carouselCaption2?: string | null;
  carouselCaption3?: string | null;
  carouselCaption4?: string | null;
  carouselCaption5?: string | null;
  carouselCaption6?: string | null;
  carouselCaption7?: string | null;
  carouselEnabled?: boolean;
  homeHistoryMarkdown?: string | null;
  homeHistoryImage?: string | null;
  foundationDate?: string | null;
  totalUsers?: number;
  promoBannerEnabled?: boolean;
  promoBannerMediaType?: "image" | "video";
  promoBannerUrl?: string | null;
  promoBannerTitle?: string | null;
  promoBannerDescription?: string | null;
  promoBannerLink?: string | null;
}

export async function getPublicSettingsAction(): Promise<{
  success: boolean;
  data?: PublicSettings;
  error?: string;
}> {
  try {
    const data = await apiClient.get<PublicSettings>("/settings/public");
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar configuracoes";
    return { success: false, error: message };
  }
}
