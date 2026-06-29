"use client";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-3xl animate-pulse" />
      
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          {/* Inner ring */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-900" />
          {/* Spin ring */}
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        
        {/* Loading text */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-bold text-white tracking-wide">Cargando aplicación</p>
          <p className="text-[11px] text-slate-500">Un momento, por favor...</p>
        </div>
      </div>
    </div>
  );
}
