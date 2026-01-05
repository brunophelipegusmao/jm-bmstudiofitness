import { NextResponse } from "next/server";

import { db } from "@/db";
import { studioSettingsTable } from "@/db/schema";

/**
 * API Route para obter configurações de rotas (compatível com Edge Runtime)
 */
export async function GET() {
  try {
    const settings = await db
      .select({
        routeHomeEnabled: studioSettingsTable.routeHomeEnabled,
        routeUserEnabled: studioSettingsTable.routeUserEnabled,
        routeCoachEnabled: studioSettingsTable.routeCoachEnabled,
        routeEmployeeEnabled: studioSettingsTable.routeEmployeeEnabled,
        routeShoppingEnabled: studioSettingsTable.routeShoppingEnabled,
        routeEventsEnabled: studioSettingsTable.routeEventsEnabled,
        routeServicesEnabled: studioSettingsTable.routeServicesEnabled,
        routeContactEnabled: studioSettingsTable.routeContactEnabled,
        routeWaitlistEnabled: studioSettingsTable.routeWaitlistEnabled,
        maintenanceMode: studioSettingsTable.maintenanceMode,
        maintenanceRedirectUrl: studioSettingsTable.maintenanceRedirectUrl,
      })
      .from(studioSettingsTable)
      .limit(1);

    if (!settings || settings.length === 0) {
      return NextResponse.json(
        {
          routeHomeEnabled: true,
          routeUserEnabled: false,
          routeCoachEnabled: false,
          routeEmployeeEnabled: false,
          routeShoppingEnabled: false,
          routeEventsEnabled: true,
          routeServicesEnabled: false,
          routeContactEnabled: true,
          routeWaitlistEnabled: true,
          maintenanceMode: false,
          maintenanceRedirectUrl: "/waitlist",
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        },
      );
    }

    return NextResponse.json(settings[0], {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar configurações de rotas:", error);
    return NextResponse.json(
      {
        routeHomeEnabled: true,
        routeUserEnabled: false,
        routeCoachEnabled: false,
        routeEmployeeEnabled: false,
        routeShoppingEnabled: false,
        routeEventsEnabled: true,
        routeServicesEnabled: false,
        routeContactEnabled: true,
        routeWaitlistEnabled: true,
        maintenanceMode: false,
        maintenanceRedirectUrl: "/waitlist",
      },
      { status: 500 },
    );
  }
}
