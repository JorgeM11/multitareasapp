import Link from "next/link";

export default function AppCard({ title, description, icon, href }) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center text-center p-3 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:items-start sm:text-left sm:justify-between sm:overflow-hidden sm:rounded-2xl sm:border sm:border-slate-800/80 sm:bg-slate-900/40 sm:p-6 sm:backdrop-blur-md sm:hover:-translate-y-1 sm:hover:border-indigo-500/50 sm:hover:bg-slate-900/60 sm:hover:shadow-2xl sm:hover:shadow-indigo-500/10"
      aria-label={`${title}: ${description}`}
    >
      {/* Background Glow Effect - Desktop Only */}
      <div className="hidden sm:block absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition-opacity duration-300 group-hover:bg-indigo-500/20" />
      
      <div className="flex flex-col items-center sm:items-start w-full">
        {/* Icon wrapper - App Icon style on mobile, card icon on desktop */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800/60 text-indigo-400 shadow-inner transition-all duration-300 group-hover:bg-indigo-950/30 group-hover:text-indigo-300 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] sm:mb-4 sm:h-12 sm:w-12 sm:rounded-xl sm:bg-slate-800/60 sm:border-slate-700/50">
          <span className="h-8 w-8 sm:h-6 sm:w-6 flex items-center justify-center" aria-hidden="true">
            {icon}
          </span>
        </div>
        
        {/* Title */}
        <h2 className="mt-2.5 text-[11px] font-medium leading-tight tracking-wide text-slate-200 group-hover:text-white transition-colors duration-300 sm:mt-0 sm:text-xl sm:font-semibold sm:tracking-tight sm:text-slate-100">
          {title}
        </h2>
        
        {/* Description - Desktop Only */}
        <p className="hidden sm:block mt-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Open action link element - Desktop Only */}
      <div className="hidden sm:flex mt-6 items-center text-xs font-semibold tracking-wider text-indigo-400 uppercase transition-colors duration-300 group-hover:text-indigo-350">
        <span>Abrir aplicación</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </div>
    </Link>
  );
}

