/**
 * Configurações de manutenção e controle de rotas para Edge Runtime
 * Este arquivo busca as configurações diretamente do banco de dados
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL || "";

export interface MaintenanceConfig {
  maintenanceMode: boolean;
  maintenanceRedirectUrl: string;
  routeHomeEnabled: boolean;
  routeUserEnabled: boolean;
  routeCoachEnabled: boolean;
  routeEmployeeEnabled: boolean;
  routeShoppingEnabled: boolean;
  routeBlogEnabled: boolean;
  routeServicesEnabled: boolean;
  routeContactEnabled: boolean;
  routeWaitlistEnabled: boolean;
}

/**
 * Busca as configurações de manutenção do banco de dados
 * Compatível com Edge Runtime usando @neondatabase/serverless
 */
export async function getMaintenanceConfigEdge(): Promise<MaintenanceConfig> {
  const defaultConfig: MaintenanceConfig = {
    maintenanceMode: false,
    maintenanceRedirectUrl: "/waitlist",
    routeHomeEnabled: true,
    routeUserEnabled: true,
    routeCoachEnabled: true,
    routeEmployeeEnabled: true,
    routeShoppingEnabled: true,
    routeBlogEnabled: true,
    routeServicesEnabled: true,
    routeContactEnabled: true,
    routeWaitlistEnabled: true,
  };

  try {
    // Se não tiver DATABASE_URL configurado, retorna modo normal
    if (!DATABASE_URL) {
      console.warn(
        "⚠️ DATABASE_URL não configurada, modo manutenção desabilitado",
      );
      return defaultConfig;
    }

    // Verifica variável de ambiente para override rápido
    const envMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
    const envRedirectUrl = process.env.MAINTENANCE_REDIRECT_URL || "/waitlist";

    if (envMaintenanceMode) {
      console.log("🚧 Modo manutenção ativado via variável de ambiente");
      return {
        maintenanceMode: true,
        maintenanceRedirectUrl: envRedirectUrl,
        routeHomeEnabled: false,
        routeUserEnabled: false,
        routeCoachEnabled: false,
        routeEmployeeEnabled: false,
        routeShoppingEnabled: false,
        routeBlogEnabled: false,
        routeServicesEnabled: false,
        routeContactEnabled: true,
        routeWaitlistEnabled: true,
      };
    }

    // Consulta o banco de dados usando Neon (compatível com Edge Runtime)
    const sql = neon(DATABASE_URL);
    const result = await sql`
      SELECT 
        maintenance_mode,
        maintenance_redirect_url,
        route_home_enabled,
        route_user_enabled,
        route_coach_enabled,
        route_employee_enabled,
        route_shopping_enabled,
        route_blog_enabled,
        route_services_enabled,
        route_contact_enabled,
        route_waitlist_enabled
      FROM tb_studio_settings
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      console.warn("⚠️ Nenhuma configuração encontrada no banco de dados");
      return defaultConfig;
    }

    const settings = result[0];

    return {
      maintenanceMode: settings.maintenance_mode ?? false,
      maintenanceRedirectUrl: settings.maintenance_redirect_url ?? "/waitlist",
      routeHomeEnabled: settings.route_home_enabled ?? true,
      routeUserEnabled: settings.route_user_enabled ?? true,
      routeCoachEnabled: settings.route_coach_enabled ?? true,
      routeEmployeeEnabled: settings.route_employee_enabled ?? true,
      routeShoppingEnabled: settings.route_shopping_enabled ?? true,
      routeBlogEnabled: settings.route_blog_enabled ?? true,
      routeServicesEnabled: settings.route_services_enabled ?? true,
      routeContactEnabled: settings.route_contact_enabled ?? true,
      routeWaitlistEnabled: settings.route_waitlist_enabled ?? true,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar configurações de manutenção:", error);
    // Em caso de erro, retorna modo normal com todas as rotas habilitadas para não bloquear o sistema
    return defaultConfig;
  }
}

/**
 * Cache das configurações de manutenção
 * Evita múltiplas consultas ao banco
 */
let cachedConfig: MaintenanceConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 segundos

export async function getMaintenanceConfigCached(): Promise<MaintenanceConfig> {
  const now = Date.now();

  // Se temos cache válido, retorna
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL) {
    return cachedConfig;
  }

  // Busca novas configurações
  cachedConfig = await getMaintenanceConfigEdge();
  cacheTimestamp = now;

  return cachedConfig;
}
