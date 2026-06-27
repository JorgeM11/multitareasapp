"use client";

export default function NotesStats({ notes }) {
  const totalNotes = notes.length;
  const tasks = notes.filter((n) => n.isTask);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((n) => n.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const notesCount = totalNotes - totalTasks;

  const taskCompletionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Count by categories
  const categoriesList = ["Compras", "Recordatorios", "Trabajo", "Ideas", "General"];
  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat] = notes.filter((n) => n.category === cat).length;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(categoryCounts), 1);

  const getCategoryStyles = (cat) => {
    switch (cat) {
      case "Compras":
        return { bg: "bg-amber-500", text: "text-amber-400" };
      case "Recordatorios":
        return { bg: "bg-rose-500", text: "text-rose-400" };
      case "Trabajo":
        return { bg: "bg-blue-500", text: "text-blue-400" };
      case "Ideas":
        return { bg: "bg-emerald-500", text: "text-emerald-400" };
      default:
        return { bg: "bg-slate-500", text: "text-slate-400" };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      
      {/* COLUMN 1: Numerical Summaries */}
      <section className="flex flex-col gap-5" aria-labelledby="stats-summary-heading">
        <h3 id="stats-summary-heading" className="sr-only">Resumen de Estadísticas</h3>
        
        {/* Total stats card */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-md">
          <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-4">
            Resumen General
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium">Notas creadas</p>
              <p className="text-3xl font-extrabold tracking-tight text-white mt-1">
                {totalNotes}
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium font-sans">Notas informativas</p>
              <p className="text-3xl font-extrabold tracking-tight text-indigo-400 mt-1">
                {notesCount}
              </p>
            </div>
          </div>
        </div>

        {/* Task completion card */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-md">
          <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-4">
            Progreso de Tareas
          </h4>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-3 text-center">
                <p className="text-2xs text-slate-500 font-medium">Tareas totales</p>
                <p className="text-xl font-bold text-white mt-0.5">{totalTasks}</p>
              </div>
              <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-3 text-center">
                <p className="text-2xs text-emerald-500/80 font-medium">Completadas</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{completedTasks}</p>
              </div>
              <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-3 text-center">
                <p className="text-2xs text-rose-500/80 font-medium">Pendientes</p>
                <p className="text-xl font-bold text-rose-400 mt-0.5">{pendingTasks}</p>
              </div>
            </div>

            {/* Completion progress bar */}
            <div className="mt-2 bg-slate-950/60 border border-slate-850/80 rounded-xl p-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                <span>Porcentaje de finalización</span>
                <span className="text-indigo-400">{taskCompletionRate}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  style={{ width: `${taskCompletionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* COLUMN 2: Category Distribution Chart */}
      <section className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 sm:p-6 backdrop-blur-md" aria-labelledby="stats-distribution-heading">
        <h3 id="stats-distribution-heading" className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-6">
          Distribución por Sección
        </h3>
        
        <div className="flex flex-col gap-5">
          {categoriesList.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const percentage = totalNotes > 0 ? (count / maxCount) * 100 : 0;
            const style = getCategoryStyles(cat);
            return (
              <div key={cat} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{cat}</span>
                  <span className={`font-mono ${style.text}`}>{count} {count === 1 ? "nota" : "notas"}</span>
                </div>
                <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${style.bg}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
