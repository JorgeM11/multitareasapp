import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch USD rates from ve.dolarapi.com
    const usdResponse = await fetch("https://ve.dolarapi.com/v1/dolares", {
      next: { revalidate: 120 }, // Cache for 2 minutes
    });
    
    if (!usdResponse.ok) {
      throw new Error("Failed to fetch USD rates");
    }
    
    const usdData = await usdResponse.json();

    // Fetch EUR rates from ve.dolarapi.com
    const eurResponse = await fetch("https://ve.dolarapi.com/v1/euros", {
      next: { revalidate: 120 },
    });
    
    if (!eurResponse.ok) {
      throw new Error("Failed to fetch EUR rates");
    }
    
    const eurData = await eurResponse.json();

    // Parse USD and EUR Official rates (promedio)
    const usdOficial = usdData.find((d) => d.fuente === "oficial")?.promedio;
    const eurOficial = eurData.find((e) => e.fuente === "oficial")?.promedio;

    // Fallbacks if API is down
    const finalUsd = usdOficial || 622.21;
    const finalEur = eurOficial || 708.39;

    const rates = {
      usd: parseFloat(finalUsd.toFixed(2)),
      eur: parseFloat(finalEur.toFixed(2)),
      lastUpdated: new Date().toISOString(),
      isFallback: !usdOficial || !eurOficial,
    };

    return NextResponse.json(rates);
  } catch (error) {
    console.error("Error fetching rates, using fallback:", error);
    
    const fallbackRates = {
      usd: 622.21,
      eur: 708.39,
      lastUpdated: new Date().toISOString(),
      isFallback: true,
    };
    
    return NextResponse.json(fallbackRates);
  }
}
