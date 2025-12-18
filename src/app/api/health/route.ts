import { NextResponse } from "next/server";

/**
 * Health check endpoint
 * Usado pelo Docker healthcheck e monitoramento
 */
export async function GET() {
  try {
    // Verifica se a aplicação está respondendo
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
