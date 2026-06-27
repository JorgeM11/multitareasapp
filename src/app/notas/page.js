"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NotesChat from "@/components/notas/NotesChat";
import NotesDashboard from "@/components/notas/NotesDashboard";

const DEFAULT_NOTES = [
  {
    id: "note-1",
    category: "Compras",
    title: "Lista de supermercado",
    content: "",
    isTask: true,
    isCompleted: false,
    listItems: [
      { text: "Manzanas rojas", isCompleted: false },
      { text: "Café molido", isCompleted: false },
      { text: "Leche entera", isCompleted: true }
    ],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: "note-2",
    category: "Recordatorios",
    title: "Reunión de equipo",
    content: "Reunión con el equipo de desarrollo a las 10:00 AM en la sala B",
    isTask: true,
    isCompleted: false,
    listItems: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "note-3",
    category: "Ideas",
    title: "Paleta violeta",
    content: "Utilizar tonos violeta y gradientes de vidrio en la UI principal",
    isTask: false,
    isCompleted: false,
    listItems: null,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const DEFAULT_CHAT = [
  {
    id: "msg-initial",
    sender: "assistant",
    text: "¡Hola! Soy tu asistente de notas inteligente. Escribe lo que quieras guardar, actualizar o eliminar. Si deseas crear una lista, menciónalo (por ejemplo: 'lista de compras: huevos, café y pan') y colocaré checkboxes para cada elemento.",
    timestamp: new Date().toISOString()
  }
];

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [notes, setNotes] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Sync state with localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("sistema-multitarea-notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes(DEFAULT_NOTES);
      localStorage.setItem("sistema-multitarea-notes", JSON.stringify(DEFAULT_NOTES));
    }

    const savedChat = localStorage.getItem("sistema-multitarea-notes-chat");
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    } else {
      setChatHistory(DEFAULT_CHAT);
      localStorage.setItem("sistema-multitarea-notes-chat", JSON.stringify(DEFAULT_CHAT));
    }
  }, []);

  // Helpers to update and persist notes
  const saveNotes = (updatedNotes) => {
    setNotes(updatedNotes);
    localStorage.setItem("sistema-multitarea-notes", JSON.stringify(updatedNotes));
  };

  const saveChat = (updatedChat) => {
    setChatHistory(updatedChat);
    localStorage.setItem("sistema-multitarea-notes-chat", JSON.stringify(updatedChat));
  };

  const handleSendMessage = async (messageText) => {
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: new Date().toISOString()
    };

    const newChatHistory = [...chatHistory, userMessage];
    saveChat(newChatHistory);
    setChatLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText, notes }),
      });

      if (!response.ok) throw new Error("AI processing failed");

      const data = await response.json();

      let updatedNotes = [...notes];

      if (data.action === "create") {
        const newNote = {
          id: `note-${Date.now()}`,
          category: data.noteData.category,
          title: data.noteData.title,
          content: data.noteData.content || "",
          isTask: data.noteData.isTask,
          isCompleted: false,
          listItems: data.noteData.listItems || null,
          createdAt: new Date().toISOString()
        };
        updatedNotes = [newNote, ...updatedNotes];
      } else if (data.action === "update") {
        updatedNotes = updatedNotes.map((n) =>
          n.id === data.noteId
            ? {
                ...n,
                category: data.noteData.category,
                title: data.noteData.title,
                content: data.noteData.content || "",
                isTask: data.noteData.isTask,
                listItems: data.noteData.listItems || null
              }
            : n
        );
      } else if (data.action === "toggleComplete") {
        updatedNotes = updatedNotes.map((n) =>
          n.id === data.noteId ? { ...n, isCompleted: !n.isCompleted } : n
        );
      } else if (data.action === "delete") {
        updatedNotes = updatedNotes.filter((n) => n.id !== data.noteId);
      }

      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        text: data.response,
        timestamp: new Date().toISOString()
      };

      saveNotes(updatedNotes);
      saveChat([...newChatHistory, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        text: "Lo siento, tuve un inconveniente analizando tu nota. La he guardado provisionalmente en la sección General.",
        timestamp: new Date().toISOString()
      };
      
      const newNote = {
        id: `note-${Date.now()}`,
        category: "General",
        title: "Nota rápida",
        content: messageText,
        isTask: false,
        isCompleted: false,
        listItems: null,
        createdAt: new Date().toISOString()
      };

      saveNotes([newNote, ...notes]);
      saveChat([...newChatHistory, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  const handleToggleComplete = (id) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, isCompleted: !n.isCompleted } : n
    );
    saveNotes(updated);
  };

  const handleToggleSubItem = (noteId, subItemIdx) => {
    const updated = notes.map((n) => {
      if (n.id === noteId && n.listItems) {
        const updatedItems = n.listItems.map((item, idx) =>
          idx === subItemIdx ? { ...item, isCompleted: !item.isCompleted } : item
        );
        
        // Auto-complete the whole note if all checklist items are completed
        const allCompleted = updatedItems.every((item) => item.isCompleted);

        return {
          ...n,
          listItems: updatedItems,
          isCompleted: allCompleted
        };
      }
      return n;
    });
    saveNotes(updated);
  };

  const handleCreateNoteManually = (noteData) => {
    const newNote = {
      id: `note-${Date.now()}`,
      ...noteData,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    saveNotes([newNote, ...notes]);
  };

  const handleUpdateNoteManually = (id, noteData) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, ...noteData } : n
    );
    saveNotes(updated);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-3xl" />

      {/* Main Container */}
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 flex-1 flex flex-col py-6 sm:py-8">
        
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
              <h1 className="text-lg sm:text-xl font-bold text-white">Notas con IA</h1>
              <p className="text-xs text-slate-400">Clasificación inteligente automática</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Procesado por Gemini
            </span>
          </div>
        </header>

        {/* Tab Buttons (Reduced to 2 Tabs: Chat and Secciones) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-850/80 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`py-3 text-xs sm:text-sm font-bold rounded-xl cursor-pointer transition-all duration-250 ${
              activeTab === "chat"
                ? "bg-slate-900 border border-slate-800 text-white shadow-inner scale-[1.01]"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Chat de IA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`py-3 text-xs sm:text-sm font-bold rounded-xl cursor-pointer transition-all duration-250 ${
              activeTab === "dashboard"
                ? "bg-slate-900 border border-slate-800 text-white shadow-inner scale-[1.01]"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Secciones y Notas
          </button>
        </div>

        {/* Active Tab Panel Rendering */}
        <main className="flex-1 flex flex-col justify-start">
          {activeTab === "chat" && (
            <NotesChat
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              loading={chatLoading}
            />
          )}

          {activeTab === "dashboard" && (
            <NotesDashboard
              notes={notes}
              onDeleteNote={handleDeleteNote}
              onToggleComplete={handleToggleComplete}
              onToggleSubItem={handleToggleSubItem}
              onCreateNoteManually={handleCreateNoteManually}
              onUpdateNoteManually={handleUpdateNoteManually}
            />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 mt-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sistema Multitarea. Impulsado por Inteligencia Artificial.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors">Optimizado con persistencia local</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
