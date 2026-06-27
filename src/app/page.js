import AppCard from "@/components/hub/AppCard";
import Image from "next/image";

const APPS = [
  {
    title: "Conversor",
    description: "Consulta el valor en tiempo real del Dólar y Euro oficial (BCV), y realiza conversiones automáticas al Bolívar (VES).",
    href: "/conversor",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-full w-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
      </svg>
    ),
  },
  {
    title: "Notas",
    description: "Organiza tus recordatorios, tareas, compras e ideas de forma automática a través de un chat con inteligencia artificial.",
    href: "/notas",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-full w-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-3xl" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Main Container */}
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 flex-1 flex flex-col py-8 sm:py-12">
        {/* Header */}
        <header className="border-b border-slate-700/80 sm:border-slate-800/60 pb-6 mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* App Logo Image */}
            <Image
              src="/logo_app1.png"
              alt="Logo Sistema Multitarea"
              width={40}
              height={40}
              className="rounded-xl object-cover shadow-md shadow-indigo-500/10 ring-1 ring-slate-800"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Sistema Multitarea</h1>
              <p className="text-xs text-slate-400">Hub Centralizado</p>
            </div>
          </div>

          {/* PWA Badge / Status Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              PWA Listo
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col">
          <div className="hidden sm:block max-w-2xl mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Tus herramientas en un solo lugar
            </h2>
          </div>

          {/* Grid Layout (4 cols on mobile for app launcher menu, responsive grid on desktop) */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {APPS.map((app) => (
              <AppCard
                key={app.title}
                title={app.title}
                description={app.description}
                href={app.href}
                icon={app.icon}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sistema Multitarea. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors duration-200">Optimizado para WCAG 2.1 AA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
