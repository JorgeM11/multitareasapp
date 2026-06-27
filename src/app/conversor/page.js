"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CustomSelect from "@/components/ui/CustomSelect";

const CURRENCY_OPTIONS = [
  { value: "VES", label: "VES (Bolívar)", icon: "Bs" },
  { value: "USD", label: "USD (Dólar)", icon: "$" },
  { value: "EUR", label: "EUR (Euro)", icon: "€" },
];

export default function ConversorPage() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdatedLocal, setLastUpdatedLocal] = useState("");

  // Calculator states
  const [amount, setAmount] = useState("100");
  const [sourceCur, setSourceCur] = useState("USD");
  const [targetCur, setTargetCur] = useState("VES");
  const [result, setResult] = useState(0);

  const fetchRates = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/rates");
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      setRates(data);
      localStorage.setItem("sistema-multitarea-rates-ves", JSON.stringify(data));
      
      const updateDate = new Date(data.lastUpdated);
      setLastUpdatedLocal(updateDate.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Fetch rates error:", err);
      setError(true);
      
      // Silent cache recovery to prevent application crash
      const cached = localStorage.getItem("sistema-multitarea-rates-ves");
      if (cached) {
        const parsed = JSON.parse(cached);
        setRates(parsed);
        const updateDate = new Date(parsed.lastUpdated);
        setLastUpdatedLocal(
          updateDate.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Recalculate conversions whenever factors change
  useEffect(() => {
    if (!rates) return;

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setResult(0);
      return;
    }

    // Convert Source Currency to equivalent in VES (Bolívar)
    let amountInVes = 0;
    if (sourceCur === "VES") {
      amountInVes = val;
    } else if (sourceCur === "USD") {
      amountInVes = val * rates.usd;
    } else if (sourceCur === "EUR") {
      amountInVes = val * rates.eur;
    }

    // Convert from VES equivalent to Target Currency
    let finalResult = 0;
    if (targetCur === "VES") {
      finalResult = amountInVes;
    } else if (targetCur === "USD") {
      finalResult = amountInVes / rates.usd;
    } else if (targetCur === "EUR") {
      finalResult = amountInVes / rates.eur;
    }

    setResult(parseFloat(finalResult.toFixed(2)));
  }, [amount, sourceCur, targetCur, rates]);

  const handleSwap = () => {
    const temp = sourceCur;
    setSourceCur(targetCur);
    setTargetCur(temp);
  };

  // Helper to determine the active rate to show in calculator details
  const getAppliedRateDescription = () => {
    if (!rates) return "";
    
    if (sourceCur === targetCur) {
      return "1:1 Equivalencia Directa";
    }

    if (sourceCur === "USD" && targetCur === "VES") {
      return `1 USD = ${rates.usd.toFixed(2)} VES (Tasa Oficial BCV)`;
    }
    if (sourceCur === "VES" && targetCur === "USD") {
      return `1 USD = ${rates.usd.toFixed(2)} VES (Tasa Oficial BCV)`;
    }
    if (sourceCur === "EUR" && targetCur === "VES") {
      return `1 EUR = ${rates.eur.toFixed(2)} VES (Tasa Oficial BCV)`;
    }
    if (sourceCur === "VES" && targetCur === "EUR") {
      return `1 EUR = ${rates.eur.toFixed(2)} VES (Tasa Oficial BCV)`;
    }

    // Cross rates (e.g. USD to EUR)
    if (sourceCur === "USD" && targetCur === "EUR") {
      return `1 USD = ${(rates.usd / rates.eur).toFixed(4)} EUR (Tasa Oficial BCV)`;
    }
    if (sourceCur === "EUR" && targetCur === "USD") {
      return `1 EUR = ${(rates.eur / rates.usd).toFixed(4)} USD (Tasa Oficial BCV)`;
    }

    return "";
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-3xl" />

      {/* Main Container */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col py-6 sm:py-8">
        
        {/* Header Navigation */}
        <header className="border-b border-slate-700/80 sm:border-slate-800/60 pb-5 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-850/80 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Volver al inicio"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Conversor y Monitor</h1>
              <p className="text-xs text-slate-400">Dólar y Euro a VES (Oficial BCV)</p>
            </div>
          </div>

          {/* Refresh Button & Timestamp */}
          <div className="flex items-center gap-2.5">
            {lastUpdatedLocal && (
              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-450 bg-slate-900/40 border border-slate-850 px-2.5 py-1 rounded-lg">
                Actualizado: {lastUpdatedLocal}
              </span>
            )}
            <button
              onClick={fetchRates}
              disabled={loading}
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-550 border border-indigo-500/50 hover:shadow-indigo-500/30 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
              aria-label="Actualizar tasas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className={`h-5 w-5 transition-transform duration-500 ease-in-out group-hover:rotate-180 ${loading ? "animate-spin" : ""}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Layout */}
        {rates ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* COLUMN 1: Currency Converter (5/12 cols) - Rendered first in JSX so it appears on top on mobile */}
            <section className="lg:col-span-5" aria-labelledby="converter-heading">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md shadow-xl shadow-slate-950/50">
                <h2 id="converter-heading" className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-5 w-5 text-indigo-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-3-9.75v3.75m0-3.75a3 3 0 110-6 3 3 0 010 6zm0 9.75V18m0 0a3 3 0 110-6 3 3 0 010 6zm-7.5-6h.008v.008H5.25V12.75zm3 0h.008v.008H8.25V12.75zm3 0h.008v.008h-.008V12.75zm3 0h.008v.008h-.008V12.75zm3 0h.008v.008h-.008V12.75z" />
                  </svg>
                  Calculadora de Conversión
                </h2>

                {/* Form fields */}
                <div className="flex flex-col gap-5">
                  {/* Amount Input */}
                  <div>
                    <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Monto a convertir
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="any"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-lg font-semibold text-white placeholder-slate-600 transition duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Custom styled select dropdowns with Swap Button */}
                  <div className="grid grid-cols-9 items-center gap-2">
                    
                    {/* Source Currency */}
                    <div className="col-span-4">
                      <label htmlFor="sourceCur" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        De
                      </label>
                      <CustomSelect
                        id="sourceCur"
                        value={sourceCur}
                        onChange={setSourceCur}
                        options={CURRENCY_OPTIONS}
                        label="Seleccionar moneda de origen"
                      />
                    </div>

                    {/* Swap Button */}
                    <div className="col-span-1 flex justify-center pt-6">
                      <button
                        onClick={handleSwap}
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-850 text-slate-450 hover:text-indigo-400 hover:border-indigo-500/30 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-label="Intercambiar monedas"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="h-4.5 w-4.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Target Currency */}
                    <div className="col-span-4">
                      <label htmlFor="targetCur" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        A
                      </label>
                      <CustomSelect
                        id="targetCur"
                        value={targetCur}
                        onChange={setTargetCur}
                        options={CURRENCY_OPTIONS}
                        label="Seleccionar moneda de destino"
                      />
                    </div>

                  </div>

                  {/* Results Panel */}
                  <div className="mt-4 p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      Resultado del cálculo
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                      {parseFloat(amount || 0).toLocaleString("es-VE")} <span className="text-sm font-semibold text-slate-450">{sourceCur}</span>
                    </p>
                    <div className="my-1.5 text-indigo-500/50 hover:text-indigo-400/80 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                    </div>
                    <p className="text-4xl font-extrabold tracking-tight text-indigo-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                      {result.toLocaleString("es-VE", { minimumFractionDigits: 2 })} <span className="text-sm font-semibold text-indigo-400">{targetCur}</span>
                    </p>
                    
                    {/* Rate details breakdown */}
                    <p className="mt-4 text-2xs text-slate-500 bg-slate-950/50 border border-slate-900 px-3 py-1 rounded-md font-mono">
                      {getAppliedRateDescription()}
                    </p>
                  </div>

                </div>
              </div>
            </section>
            
            {/* COLUMN 2: Rates Monitor (7/12 cols) - Rendered second in JSX so it appears below calculator on mobile */}
            <section className="lg:col-span-7 flex flex-col gap-6" aria-labelledby="rates-monitor-heading">
              <h2 id="rates-monitor-heading" className="sr-only">Monitor de Tasas de Cambio</h2>
              
              {/* USD Group */}
              <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-md">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-450 mb-4 flex items-center gap-2">
                  <span className="text-emerald-400 text-lg">$</span> Cotización Oficial Dólar (USD)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* USD BCV */}
                  <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-4 flex justify-between items-center hover:border-slate-800 transition-colors">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Dólar BCV (Oficial)</p>
                      <p className="text-2xl font-bold tracking-tight text-white mt-1">
                        {rates.usd.toFixed(2)} <span className="text-xs font-semibold text-slate-500">VES</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2.5 py-0.5 text-2xs font-semibold text-indigo-400 border border-indigo-500/20">
                      Tasa BCV
                    </span>
                  </div>
                </div>
              </div>

              {/* EUR Group */}
              <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-md">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-450 mb-4 flex items-center gap-2">
                  <span className="text-indigo-400 text-lg">€</span> Cotización Oficial Euro (EUR)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* EUR BCV */}
                  <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-4 flex justify-between items-center hover:border-slate-800 transition-colors">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Euro BCV (Oficial)</p>
                      <p className="text-2xl font-bold tracking-tight text-white mt-1">
                        {rates.eur.toFixed(2)} <span className="text-xs font-semibold text-slate-500">VES</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2.5 py-0.5 text-2xs font-semibold text-indigo-400 border border-indigo-500/20">
                      Tasa BCV
                    </span>
                  </div>
                </div>
              </div>

            </section>
            
          </div>
        ) : (
          /* Loading Indicator */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="h-10 w-10 border-4 border-indigo-500/25 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Obteniendo tasas de cambio oficiales...</p>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sistema Multitarea. Cotizaciones oficiales vía DolarApi (BCV).</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors">Tasa oficial de referencia del Banco Central de Venezuela</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
