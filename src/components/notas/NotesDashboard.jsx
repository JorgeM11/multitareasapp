"use client";

import { useState } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import { FaFolder, FaShoppingCart, FaClock, FaBriefcase, FaLightbulb, FaInbox } from "react-icons/fa";

const CATEGORIES = [
  { id: "all", label: "Todas", color: "border-slate-800 text-slate-300 bg-slate-900/30" },
  { id: "Compras", label: "Compras", color: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  { id: "Recordatorios", label: "Recordatorios", color: "border-rose-500/30 text-rose-400 bg-rose-500/10" },
  { id: "Trabajo", label: "Trabajo", color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  { id: "Ideas", label: "Ideas", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  { id: "General", label: "General", color: "border-slate-700 text-slate-400 bg-slate-800/30" }
];

const getCategoryIcon = (category, className = "h-3.5 w-3.5") => {
  switch (category) {
    case "Compras":
      return <FaShoppingCart className={className} />;
    case "Recordatorios":
      return <FaClock className={className} />;
    case "Trabajo":
      return <FaBriefcase className={className} />;
    case "Ideas":
      return <FaLightbulb className={className} />;
    case "General":
    default:
      return <FaFolder className={className} />;
  }
};

const CATEGORY_SELECT_OPTIONS = [
  { value: "General", label: "General", icon: <FaFolder className="h-3.5 w-3.5" /> },
  { value: "Compras", label: "Compras", icon: <FaShoppingCart className="h-3.5 w-3.5" /> },
  { value: "Recordatorios", label: "Recordatorios", icon: <FaClock className="h-3.5 w-3.5" /> },
  { value: "Trabajo", label: "Trabajo", icon: <FaBriefcase className="h-3.5 w-3.5" /> },
  { value: "Ideas", label: "Ideas", icon: <FaLightbulb className="h-3.5 w-3.5" /> }
];

export default function NotesDashboard({
  notes,
  onDeleteNote,
  onToggleComplete,
  onToggleSubItem,
  onCreateNoteManually,
  onUpdateNoteManually
}) {
  const [activeCategory, setActiveCategory] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // null if creating new
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formIsTask, setFormIsTask] = useState(false);

  const filteredNotes = activeCategory === "all"
    ? notes
    : notes.filter((n) => n.category === activeCategory);

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isTask !== b.isTask) return a.isTask ? -1 : 1;
    if (a.isTask && b.isTask) {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getCategoryColorClasses = (cat) => {
    switch (cat) {
      case "Compras":
        return {
          border: "border-amber-500/20 hover:border-amber-500/50",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          glow: "bg-amber-500/5"
        };
      case "Recordatorios":
        return {
          border: "border-rose-500/20 hover:border-rose-500/50",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          glow: "bg-rose-500/5"
        };
      case "Trabajo":
        return {
          border: "border-blue-500/20 hover:border-blue-500/50",
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          glow: "bg-blue-500/5"
        };
      case "Ideas":
        return {
          border: "border-emerald-500/20 hover:border-emerald-500/50",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          glow: "bg-emerald-500/5"
        };
      default:
        return {
          border: "border-slate-800 hover:border-slate-700",
          badge: "bg-slate-900 text-slate-400 border-slate-800",
          glow: "bg-slate-800/5"
        };
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setFormTitle("");
    setFormContent("");
    setFormCategory("General");
    setFormIsTask(false);
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormIsTask(note.isTask || false);
    
    if (note.listItems && note.listItems.length > 0) {
      const itemsText = note.listItems.map(item => item.text).join("\n");
      setFormContent(itemsText);
    } else {
      setFormContent(note.content);
    }
    
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    let listItems = null;
    let content = "";

    // Split content by newlines to check if it's a checklist
    const lines = formContent.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      listItems = lines.map(line => {
        // Attempt to preserve completion status if updating
        const existingItem = editingNote?.listItems?.find(
          item => item.text.toLowerCase() === line.toLowerCase()
        );
        return {
          text: line,
          isCompleted: existingItem ? existingItem.isCompleted : false
        };
      });
      content = "";
    } else {
      listItems = null;
      content = formContent.trim();
    }

    const noteData = {
      title: formTitle.trim(),
      content,
      category: formCategory,
      isTask: formIsTask || (listItems ? true : false), // listItems are automatically tasks
      listItems
    };

    if (editingNote) {
      onUpdateNoteManually(editingNote.id, noteData);
    } else {
      onCreateNoteManually(noteData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Dashboard Sub-Header: Filter Tabs & Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Category Sub-tabs scrollable row */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]"
                    : "bg-slate-900/60 border-slate-880 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {cat.id !== "all" ? getCategoryIcon(cat.id, "h-3.5 w-3.5") : <FaInbox className="h-3.5 w-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Add Note Button */}
        <button
          onClick={openCreateModal}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/40 text-xs font-bold text-white shadow-md shadow-indigo-500/10 transition duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 self-stretch sm:self-auto text-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Nota
        </button>

      </div>

      {/* Notes Grid */}
      {sortedNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map((note) => {
            const styles = getCategoryColorClasses(note.category);
            const isNoteList = note.listItems && note.listItems.length > 0;
            return (
              <div
                key={note.id}
                onClick={() => openEditModal(note)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-slate-900/25 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${styles.border}`}
              >
                {/* Background Ambient Glow */}
                <div className={`absolute -right-16 -top-16 -z-10 h-32 w-32 rounded-full blur-3xl transition-opacity duration-300 ${styles.glow}`} />

                <div>
                  {/* Note Card Header */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-3xs font-bold uppercase tracking-wider ${styles.badge}`}>
                      {getCategoryIcon(note.category, "h-3 w-3")}
                      <span>{note.category}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(note.createdAt).toLocaleDateString("es-VE", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Title & Checkbox (for tasks) */}
                  <div className="flex items-start gap-2.5">
                    {note.isTask && !isNoteList && (
                      <input
                        type="checkbox"
                        checked={note.isCompleted || false}
                        onChange={(e) => {
                          e.stopPropagation(); // Avoid triggering openEditModal
                          onToggleComplete(note.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4.5 w-4.5 rounded border-slate-850 bg-slate-950 text-indigo-600 transition focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                        aria-label={`Marcar como completada: ${note.title}`}
                      />
                    )}
                    <h3
                      className={`text-base font-bold tracking-tight text-slate-100 transition-all duration-200 ${
                        note.isCompleted
                          ? "line-through text-slate-500 font-medium"
                          : ""
                      }`}
                    >
                      {note.title}
                    </h3>
                  </div>

                  {/* Content body / List Items Checklist */}
                  {isNoteList ? (
                    <div className="mt-3.5 space-y-2">
                      {note.listItems.map((item, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer select-none py-0.5 hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={item.isCompleted || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              onToggleSubItem(note.id, idx);
                            }}
                            className="h-4.5 w-4.5 rounded border-slate-850 bg-slate-950 text-indigo-600 transition focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                          />
                          <span className={item.isCompleted ? "line-through text-slate-550 italic" : ""}>
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p
                      className={`mt-2 text-xs leading-relaxed text-slate-400 break-words ${
                        note.isCompleted ? "text-slate-655" : ""
                      }`}
                    >
                      {note.content}
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 border-t border-slate-900/60 pt-3 flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering card double click
                      openEditModal(note);
                    }}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-2xs font-bold text-indigo-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-950/20 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Abrir
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering openEditModal
                      onDeleteNote(note.id);
                    }}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-900/60 hover:text-rose-455 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    aria-label={`Eliminar nota: ${note.title}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-300">No hay notas</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">
            Esta sección está vacía. Crea una nota a mano con el botón superior o escríbele a la IA en el Chat.
          </p>
        </div>
      )}

      {/* GORGEOUS GLASSMORPHIC MODAL FOR MANUALLY CREATING / UPDATING NOTES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h3 id="modal-title" className="text-lg font-bold text-white mb-4">
              {editingNote ? "Editar Nota" : "Nueva Nota Manual"}
            </h3>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              {/* Note Title */}
              <div>
                <label htmlFor="modalTitle" className="block text-xs font-semibold text-slate-400 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  id="modalTitle"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Título de la nota..."
                  maxLength={50}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Note Content / List items input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="modalContent" className="block text-xs font-semibold text-slate-400">
                    Contenido / Descripción
                  </label>
                  <span className="text-[10px] text-indigo-400/80 italic">
                    Tip: Salta una línea por cada elemento para crear un checklist
                  </span>
                </div>
                <textarea
                  id="modalContent"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Escribe el texto libre, o escribe elementos separados por saltos de línea para crear una lista de tareas..."
                  rows={10}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-650 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Note Category & Task Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modalCategory" className="block text-xs font-semibold text-slate-400 mb-2">
                    Sección
                  </label>
                  <CustomSelect
                    id="modalCategory"
                    value={formCategory}
                    onChange={setFormCategory}
                    options={CATEGORY_SELECT_OPTIONS}
                    label="Seleccionar sección de la nota"
                  />
                </div>

                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-350 select-none">
                    <input
                      type="checkbox"
                      checked={formIsTask}
                      onChange={(e) => setFormIsTask(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-850 bg-slate-950 text-indigo-600 transition focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    ¿Es una tarea?
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold transition duration-200 cursor-pointer focus:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/40 text-xs font-bold text-white transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Guardar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
