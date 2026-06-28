"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaCalendarAlt,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaMagic
} from "react-icons/fa";
import CustomSelect from "@/components/ui/CustomSelect";

const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    name: "🚀 Lanzamiento Web",
    description: "Planificación y desarrollo del nuevo portal web del sistema.",
    tasks: [
      {
        id: "task-1-1",
        title: "Diseñar maqueta de UI",
        description: "Crear wireframes de baja fidelidad y prototipos de alta resolución en Figma para el hub principal.",
        status: "todo",
        priority: "alta",
        dueDate: "2026-07-05",
        subtasks: [
          { id: "sub-1-1", text: "Definir paleta de colores oscuros", isCompleted: true },
          { id: "sub-1-2", text: "Diseñar cards con efecto vidrio templado", isCompleted: false },
          { id: "sub-1-3", text: "Crear prototipo interactivo móvil", isCompleted: false }
        ]
      },
      {
        id: "task-1-2",
        title: "Configurar Base de Datos",
        description: "Definir esquema de datos local y sincronización con localStorage.",
        status: "in_progress",
        priority: "media",
        dueDate: "2026-07-10",
        subtasks: [
          { id: "sub-2-1", text: "Modelar objeto Proyecto y Tarea", isCompleted: true },
          { id: "sub-2-2", text: "Escribir hooks de persistencia", isCompleted: false }
        ]
      },
      {
        id: "task-1-3",
        title: "Optimizar SEO Inicial",
        description: "Implementar etiquetas OpenGraph, descripciones meta y titles dinámicos en Next.js.",
        status: "done",
        priority: "baja",
        dueDate: "2026-06-25",
        subtasks: [
          { id: "sub-3-1", text: "Agregar metadata a layout.js", isCompleted: true },
          { id: "sub-3-2", text: "Verificar indexación y sitemaps", isCompleted: true }
        ]
      }
    ]
  },
  {
    id: "proj-2",
    name: "✈️ Viaje de Negocios",
    description: "Organización de itinerario y reuniones corporativas para el mes próximo.",
    tasks: [
      {
        id: "task-2-1",
        title: "Reservar hospedaje",
        description: "Buscar un hotel céntrico con espacio de coworking e internet de alta velocidad.",
        status: "todo",
        priority: "alta",
        dueDate: "2026-07-01",
        subtasks: []
      }
    ]
  }
];

const PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja", icon: <span className="inline-block h-2 w-2 rounded-full bg-sky-500" /> },
  { value: "media", label: "Media", icon: <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> },
  { value: "alta", label: "Alta", icon: <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> }
];

const STATUS_OPTIONS = [
  { value: "todo", label: "Por Hacer", icon: <span className="inline-block h-2 w-2 rounded-full bg-slate-500" /> },
  { value: "in_progress", label: "En Progreso", icon: <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" /> },
  { value: "done", label: "Completado", icon: <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> }
];

export default function ProyectosPage() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [activeTab, setActiveTab] = useState("board"); // "board" or "list"
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleTaskExpand = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState("create"); // "create" or "edit"
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("media");
  const [taskStatus, setTaskStatus] = useState("todo");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskSubtasks, setTaskSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Sync state with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sistema-multitarea-proyectos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
        if (parsed.length > 0) {
          setActiveProjectId(parsed[0].id);
        }
      } catch (e) {
        console.error("Error parsing projects from localStorage", e);
        setProjects(DEFAULT_PROJECTS);
        setActiveProjectId(DEFAULT_PROJECTS[0].id);
      }
    } else {
      setProjects(DEFAULT_PROJECTS);
      setActiveProjectId(DEFAULT_PROJECTS[0].id);
      localStorage.setItem("sistema-multitarea-proyectos", JSON.stringify(DEFAULT_PROJECTS));
    }
  }, []);

  const saveProjects = (updatedProjects) => {
    setProjects(updatedProjects);
    localStorage.setItem("sistema-multitarea-proyectos", JSON.stringify(updatedProjects));
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // ----------------------------------------------------
  // PROJECT OPERATIONS
  // ----------------------------------------------------
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      tasks: []
    };

    const updated = [...projects, newProject];
    saveProjects(updated);
    setActiveProjectId(newProject.id);
    setNewProjectName("");
    setNewProjectDesc("");
    setShowProjectModal(false);
  };

  const handleDeleteProject = (projId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proyecto y todas sus tareas?")) return;
    const updated = projects.filter((p) => p.id !== projId);
    saveProjects(updated);
    if (updated.length > 0) {
      setActiveProjectId(updated[0].id);
    } else {
      setActiveProjectId("");
    }
  };

  // ----------------------------------------------------
  // TASK OPERATIONS
  // ----------------------------------------------------
  const openCreateTaskModal = () => {
    setTaskModalMode("create");
    setTaskTitle("");
    setTaskDesc("");
    setTaskPriority("media");
    setTaskStatus("todo");
    setTaskDueDate("");
    setTaskSubtasks([]);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setTaskModalMode("edit");
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || "");
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate || "");
    setTaskSubtasks(task.subtasks || []);
    setShowTaskModal(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeProject) return;

    const updatedProjects = projects.map((proj) => {
      if (proj.id === activeProject.id) {
        let updatedTasks;
        if (taskModalMode === "create") {
          const newTask = {
            id: `task-${Date.now()}`,
            title: taskTitle.trim(),
            description: taskDesc.trim(),
            status: taskStatus,
            priority: taskPriority,
            dueDate: taskDueDate,
            subtasks: taskSubtasks
          };
          updatedTasks = [...proj.tasks, newTask];
        } else {
          updatedTasks = proj.tasks.map((t) =>
            t.id === selectedTask.id
              ? {
                  ...t,
                  title: taskTitle.trim(),
                  description: taskDesc.trim(),
                  status: taskStatus,
                  priority: taskPriority,
                  dueDate: taskDueDate,
                  subtasks: taskSubtasks
                }
              : t
          );
        }
        return { ...proj, tasks: updatedTasks };
      }
      return proj;
    });

    saveProjects(updatedProjects);
    setShowTaskModal(false);
  };

  const handleDeleteTask = (taskId) => {
    if (!confirm("¿Deseas eliminar esta tarea?")) return;
    const updatedProjects = projects.map((proj) => {
      if (proj.id === activeProject.id) {
        return {
          ...proj,
          tasks: proj.tasks.filter((t) => t.id !== taskId)
        };
      }
      return proj;
    });
    saveProjects(updatedProjects);
  };

  const handleMoveTaskStatus = (taskId, newStatus) => {
    const updatedProjects = projects.map((proj) => {
      if (proj.id === activeProject.id) {
        return {
          ...proj,
          tasks: proj.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        };
      }
      return proj;
    });
    saveProjects(updatedProjects);
  };

  // ----------------------------------------------------
  // SUBTASK OPERATIONS
  // ----------------------------------------------------
  const handleToggleSubtask = (taskId, subtaskId) => {
    const updatedProjects = projects.map((proj) => {
      if (proj.id === activeProject.id) {
        return {
          ...proj,
          tasks: proj.tasks.map((t) => {
            if (t.id === taskId) {
              const nextSubtasks = t.subtasks.map((sub) =>
                sub.id === subtaskId ? { ...sub, isCompleted: !sub.isCompleted } : sub
              );
              // Auto mark main task as done if all subtasks are finished, optional feature
              return { ...t, subtasks: nextSubtasks };
            }
            return t;
          })
        };
      }
      return proj;
    });
    saveProjects(updatedProjects);
  };

  const handleAddSubtaskManual = () => {
    if (!newSubtaskText.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      text: newSubtaskText.trim(),
      isCompleted: false
    };
    setTaskSubtasks([...taskSubtasks, newSub]);
    setNewSubtaskText("");
  };

  const handleRemoveSubtask = (subId) => {
    setTaskSubtasks(taskSubtasks.filter((sub) => sub.id !== subId));
  };

  // ----------------------------------------------------
  // AI BREAKDOWN CALL
  // ----------------------------------------------------
  const handleAiBreakdown = async () => {
    if (!taskTitle.trim()) return alert("Ingresa un título para poder desglosar la tarea.");
    setAiLoading(true);

    try {
      const response = await fetch("/api/proyectos/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, description: taskDesc })
      });

      if (!response.ok) throw new Error("AI call failed");
      const data = await response.json();

      if (data.subtasks && data.subtasks.length > 0) {
        const formattedSub = data.subtasks.map((text, idx) => ({
          id: `sub-ai-${Date.now()}-${idx}`,
          text,
          isCompleted: false
        }));
        setTaskSubtasks([...taskSubtasks, ...formattedSub]);
      }
    } catch (e) {
      console.error(e);
      alert("Hubo un error comunicándose con Gemini. Se aplicó un desglose por defecto.");
      const fallback = ["Planificar enfoque", "Configurar estructura", "Codificar detalles", "Verificar funcionamiento"];
      setTaskSubtasks([
        ...taskSubtasks,
        ...fallback.map((text, idx) => ({ id: `sub-fb-${Date.now()}-${idx}`, text, isCompleted: false }))
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // ----------------------------------------------------
  // STATISTICS & CALCULATIONS
  // ----------------------------------------------------
  const getProjectStats = (proj) => {
    if (!proj || !proj.tasks || proj.tasks.length === 0) return { total: 0, done: 0, pct: 0 };
    const total = proj.tasks.length;
    const done = proj.tasks.filter((t) => t.status === "done").length;
    return {
      total,
      done,
      pct: Math.round((done / total) * 100)
    };
  };

  const getTaskSubtaskStats = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const total = task.subtasks.length;
    const completed = task.subtasks.filter((s) => s.isCompleted).length;
    return {
      total,
      completed,
      pct: Math.round((completed / total) * 100)
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "alta":
        return "bg-rose-500/10 text-rose-400 ring-rose-500/20";
      case "media":
        return "bg-amber-500/10 text-amber-400 ring-amber-500/20";
      case "baja":
      default:
        return "bg-sky-500/10 text-sky-400 ring-sky-500/20";
    }
  };

  const stats = activeProject ? getProjectStats(activeProject) : null;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-3xl" />

      {/* Main Container */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 flex-1 flex flex-col py-6 sm:py-8">
        
        {/* Header Navigation */}
        <header className="border-b border-slate-700/80 sm:border-slate-800/60 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-850/80 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Volver al inicio"
            >
              <FaArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Gestor de Proyectos</h1>
              <p className="text-xs text-slate-400">Listas inteligentes con desglose automático de IA</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              IA Desglose Activo
            </span>
          </div>
        </header>

        {/* Dashboard Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
          
          {/* Sidebar - Projects selector */}
          <aside className="lg:col-span-1 flex flex-col gap-4">
            <div className="p-5 rounded-2xl border border-slate-850/80 bg-slate-900/30 backdrop-blur-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Proyectos</h2>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(true)}
                  className="p-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/30 text-white transition-colors cursor-pointer"
                  title="Nuevo proyecto"
                >
                  <FaPlus className="h-3 w-3" />
                </button>
              </div>

              {/* Projects List */}
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {projects.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No hay proyectos.</p>
                ) : (
                  projects.map((proj) => {
                    const active = proj.id === activeProjectId;
                    const pStats = getProjectStats(proj);
                    return (
                      <div
                        key={proj.id}
                        className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                          active
                            ? "bg-slate-900 border-indigo-500/40 text-white shadow-md shadow-indigo-950/20"
                            : "bg-slate-900/10 border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveProjectId(proj.id)}
                          className="flex-1 text-left font-medium text-sm truncate focus:outline-none cursor-pointer pr-2"
                        >
                          <div className="truncate">{proj.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {pStats.done}/{pStats.total} tareas ({pStats.pct}%)
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 rounded text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                          title="Eliminar proyecto"
                        >
                          <FaTrashAlt className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Project Summary Description card */}
            {activeProject && activeProject.description && (
              <div className="p-4 rounded-xl border border-slate-850/60 bg-slate-900/10 text-xs text-slate-400">
                <h3 className="font-semibold text-slate-300 mb-1">Descripción:</h3>
                <p className="leading-relaxed">{activeProject.description}</p>
              </div>
            )}
          </aside>

          {/* Main Board Workspace */}
          <main className="lg:col-span-3 flex flex-col gap-6">
            {activeProject ? (
              <>
                {/* Board header/toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-850/80 bg-slate-900/30 backdrop-blur-md">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {activeProject.name}
                    </h2>
                    
                    {/* Overall Project Progress Bar */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>Progreso del proyecto:</span>
                      <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden ring-1 ring-slate-700/30">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${stats.pct}%` }}
                        />
                      </div>
                      <span className="font-bold text-indigo-400">{stats.pct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Switcher */}
                    <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-850/80">
                      <button
                        type="button"
                        onClick={() => setActiveTab("board")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          activeTab === "board"
                            ? "bg-slate-900 border border-slate-850/50 text-white"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Tablero
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("list")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          activeTab === "list"
                            ? "bg-slate-900 border border-slate-850/50 text-white"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Lista
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={openCreateTaskModal}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 border border-indigo-400/20 transition-all shadow-md shadow-indigo-950/30 active:scale-95 cursor-pointer"
                    >
                      <FaPlus className="h-3 w-3" />
                      Nueva Tarea
                    </button>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* TABLERO KANBAN VIEW */}
                {/* ---------------------------------------------------- */}
                {activeTab === "board" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Columns */}
                    {[
                      { status: "todo", title: "Por Hacer", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
                      { status: "in_progress", title: "En Progreso", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
                      { status: "done", title: "Completado", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
                    ].map((col) => {
                      const columnTasks = activeProject.tasks.filter((t) => t.status === col.status);
                      return (
                        <div
                          key={col.status}
                          className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/15 border border-slate-850/60 min-h-[500px]"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-850/40">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${col.color}`}>
                                {col.title}
                              </span>
                              <span className="text-xs text-slate-500 font-semibold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-full">
                                {columnTasks.length}
                              </span>
                            </div>
                          </div>

                          {/* Task List in Column */}
                          <div className="flex flex-col gap-3 overflow-y-auto">
                            {columnTasks.length === 0 ? (
                              <div className="text-center py-8 text-xs text-slate-600 border border-dashed border-slate-850/40 rounded-xl">
                                Sin tareas
                              </div>
                            ) : (
                              columnTasks.map((task) => {
                                const subStats = getTaskSubtaskStats(task);
                                return (
                                  <div
                                    key={task.id}
                                    className="group relative p-4 rounded-xl bg-slate-900 border border-slate-850/80 hover:border-slate-750 transition-all duration-200 shadow-md flex flex-col gap-3"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </span>

                                      {/* Task Actions */}
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => openEditTaskModal(task)}
                                          className="p-1 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-850 transition-all cursor-pointer"
                                          title="Editar tarea / Subtareas"
                                        >
                                          <FaEdit className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-850 transition-all cursor-pointer"
                                          title="Eliminar tarea"
                                        >
                                          <FaTrashAlt className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Task Content */}
                                    <div>
                                      <h4 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors duration-200">
                                        {task.title}
                                      </h4>
                                      {task.description && (
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                          {task.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* Subtasks Progress Bar inside cards */}
                                    {subStats && (
                                      <div className="mt-1 flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                          <span>Subtareas</span>
                                          <span className="font-semibold text-slate-300">
                                            {subStats.completed}/{subStats.total} ({subStats.pct}%)
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                                          <div
                                            className="bg-indigo-400 h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${subStats.pct}%` }}
                                          />
                                        </div>

                                        {/* Preview list of subtasks */}
                                        <div className="flex flex-col gap-1.5 mt-1">
                                          {task.subtasks
                                            .slice(0, expandedTasks[task.id] ? undefined : 2)
                                            .map((sub) => {
                                              const shouldTruncate = task.subtasks.length > 2 && !expandedTasks[task.id];
                                              return (
                                                <div
                                                  key={sub.id}
                                                  className="flex items-start gap-1.5 text-[10px] text-slate-400 animate-in fade-in duration-150"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={sub.isCompleted}
                                                    onChange={() => handleToggleSubtask(task.id, sub.id)}
                                                    className="mt-0.5 h-3 w-3 rounded border-slate-700 text-indigo-600 bg-slate-950 focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
                                                  />
                                                  <span
                                                    onClick={() => toggleTaskExpand(task.id)}
                                                    className={`text-left cursor-pointer hover:text-white transition-colors duration-150 flex-1 min-w-0 ${shouldTruncate ? "truncate" : "break-words"} ${sub.isCompleted ? "line-through text-slate-600" : "text-slate-300"}`}
                                                    title={shouldTruncate ? "Clic para expandir y leer completo" : "Clic para contraer"}
                                                  >
                                                    {sub.text}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          
                                          {task.subtasks.length > 2 && (
                                            <button
                                              type="button"
                                              onClick={() => toggleTaskExpand(task.id)}
                                              className="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold mt-0.5 text-left transition-colors cursor-pointer"
                                            >
                                              {expandedTasks[task.id] ? "Ver menos" : `+${task.subtasks.length - 2} subtareas más (Ver todas)`}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* AI Suggest Button if no subtasks */}
                                    {(!task.subtasks || task.subtasks.length === 0) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          openEditTaskModal(task);
                                          // Small delay to open and trigger AI breakdown
                                          setTimeout(() => {
                                            const aiBtn = document.getElementById("ai-breakdown-btn");
                                            if (aiBtn) aiBtn.click();
                                          }, 200);
                                        }}
                                        className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-[10px] font-bold text-indigo-400 transition-all cursor-pointer"
                                      >
                                        <FaMagic className="h-3 w-3" />
                                        Desglosar con IA
                                      </button>
                                    )}

                                    {/* Due Date & Column Switchers */}
                                    <div className="flex items-center justify-between border-t border-slate-850/60 pt-2.5 mt-1 text-[10px] text-slate-500">
                                      <span>
                                        {task.dueDate ? `📅 ${task.dueDate}` : "Sin fecha"}
                                      </span>

                                      {/* Mobile quick move selectors */}
                                      <div className="flex items-center gap-1">
                                        {col.status !== "todo" && (
                                          <button
                                            type="button"
                                            onClick={() => handleMoveTaskStatus(task.id, col.status === "done" ? "in_progress" : "todo")}
                                            className="p-1 flex items-center justify-center rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white cursor-pointer"
                                            title="Mover a la izquierda"
                                          >
                                            <FaChevronLeft className="h-2.5 w-2.5" />
                                          </button>
                                        )}
                                        {col.status !== "done" && (
                                          <button
                                            type="button"
                                            onClick={() => handleMoveTaskStatus(task.id, col.status === "todo" ? "in_progress" : "done")}
                                            className="p-1 flex items-center justify-center rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white cursor-pointer"
                                            title="Mover a la derecha"
                                          >
                                            <FaChevronRight className="h-2.5 w-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* LIST VIEW */}
                {/* ---------------------------------------------------- */}
                {activeTab === "list" && (
                  <div className="p-5 rounded-2xl border border-slate-850/80 bg-slate-900/30 backdrop-blur-md flex flex-col gap-3">
                    {activeProject.tasks.length === 0 ? (
                      <p className="text-center py-12 text-sm text-slate-500">
                        No hay tareas creadas en este proyecto. Haz clic en "Nueva Tarea" para comenzar.
                      </p>
                    ) : (
                      <>
                        {/* Desktop View Table */}
                        <div className="hidden md:block overflow-visible">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                <th className="pb-3 pr-4">Tarea</th>
                                <th className="pb-3 px-4">Estado</th>
                                <th className="pb-3 px-4">Prioridad</th>
                                <th className="pb-3 px-4">Subtareas</th>
                                <th className="pb-3 px-4">Vence</th>
                                <th className="pb-3 pl-4 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeProject.tasks.map((task) => {
                                const subStats = getTaskSubtaskStats(task);
                                return (
                                  <tr
                                    key={task.id}
                                    className="border-b border-slate-850/60 hover:bg-slate-900/20 text-slate-350 transition-colors"
                                  >
                                    <td className="py-3.5 pr-4 font-semibold text-slate-200">
                                      {task.title}
                                      {task.description && (
                                        <div className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-1">
                                          {task.description}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-4 w-[200px]">
                                      <CustomSelect
                                        value={task.status}
                                        onChange={(val) => handleMoveTaskStatus(task.id, val)}
                                        options={STATUS_OPTIONS}
                                        label="Estado de la tarea"
                                      />
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-xs text-slate-400">
                                      {subStats ? `${subStats.completed}/${subStats.total} (${subStats.pct}%)` : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 text-xs">
                                      {task.dueDate || "Sin fecha"}
                                    </td>
                                    <td className="py-3.5 pl-4 text-right">
                                      <div className="flex justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => openEditTaskModal(task)}
                                          className="p-1.5 rounded hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                                          title="Editar"
                                        >
                                          <FaEdit className="h-3.5 w-3.5 text-slate-450" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="p-1.5 rounded hover:bg-slate-900 hover:text-rose-450 transition-colors cursor-pointer"
                                          title="Eliminar"
                                        >
                                          <FaTrashAlt className="h-3.5 w-3.5 text-slate-450" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View Stacked List */}
                        <div className="md:hidden flex flex-col gap-4">
                          {activeProject.tasks.map((task) => {
                            const subStats = getTaskSubtaskStats(task);
                            return (
                              <div
                                key={task.id}
                                className="p-4 rounded-xl border border-slate-850/80 bg-slate-950/40 flex flex-col gap-3 shadow-md"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-bold text-sm text-slate-200">{task.title}</h4>
                                    {task.description && (
                                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditTaskModal(task)}
                                      className="p-1.5 rounded hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                                      title="Editar"
                                    >
                                      <FaEdit className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1.5 rounded hover:bg-slate-900 hover:text-rose-400 transition-colors cursor-pointer"
                                      title="Eliminar"
                                    >
                                      <FaTrashAlt className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-900/40 pt-2.5 mt-1">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Prioridad</span>
                                    <div>
                                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Vencimiento</span>
                                    <span className="text-slate-300 font-medium">
                                      {task.dueDate ? `📅 ${task.dueDate}` : "Sin fecha"}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Subtareas</span>
                                    <span className="text-slate-300 font-medium">
                                      {subStats ? `${subStats.completed}/${subStats.total} (${subStats.pct}%)` : "—"}
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Estado</span>
                                    <CustomSelect
                                      value={task.status}
                                      onChange={(val) => handleMoveTaskStatus(task.id, val)}
                                      options={STATUS_OPTIONS}
                                      label="Estado de la tarea"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 p-5 rounded-2xl border border-slate-850/80 bg-slate-900/10 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-16 w-16 text-slate-600 mb-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-white mb-2">No hay ningún proyecto seleccionado</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  Crea un proyecto en el menú lateral o selecciona uno existente para comenzar a organizar tus tareas de manera inteligente.
                </p>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(true)}
                  className="px-4 py-2 font-bold text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  Crear Primer Proyecto
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* DIALOG / MODAL: CREATE PROJECT */}
      {/* ---------------------------------------------------- */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-850/80 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-4">Crear Nuevo Proyecto</h3>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Nombre del Proyecto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 🏠 Reforma Hogar"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Descripción (Opcional)</label>
                <textarea
                  placeholder="Detalles sobre las metas del proyecto..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white cursor-pointer"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DIALOG / MODAL: CREATE / EDIT TASK */}
      {/* ---------------------------------------------------- */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-slate-850/80 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-4">
              {taskModalMode === "create" ? "Crear Nueva Tarea" : "Editar Tarea"}
            </h3>
            
            <form onSubmit={handleSaveTask} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column 1: Info Básica */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Título de la Tarea</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Crear vista de proyectos"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Descripción</label>
                    <textarea
                      placeholder="Detalles sobre lo que se debe hacer..."
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Prioridad</label>
                      <CustomSelect
                        value={taskPriority}
                        onChange={(val) => setTaskPriority(val)}
                        options={PRIORITY_OPTIONS}
                        label="Prioridad de la tarea"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Vencimiento</label>
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Estado</label>
                    <CustomSelect
                      value={taskStatus}
                      onChange={(val) => setTaskStatus(val)}
                      options={STATUS_OPTIONS}
                      label="Estado de la tarea"
                    />
                  </div>
                </div>

                {/* Column 2: Subtareas y Desglose IA */}
                <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-850/60 pt-4 md:pt-0 md:pl-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Subtareas Checklist</label>
                    
                    {/* Gemini Breakdown Button */}
                    <button
                      type="button"
                      id="ai-breakdown-btn"
                      onClick={handleAiBreakdown}
                      disabled={aiLoading}
                      className="px-2.5 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs text-indigo-400 flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {aiLoading ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <FaMagic className="h-3.5 w-3.5" />
                          Desglose IA
                        </>
                      )}
                    </button>
                  </div>

                  {/* Add Subtask manually Form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nueva subtarea manual..."
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubtaskManual();
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubtaskManual}
                      className="px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700/50 cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>

                  {/* Subtask interactive list */}
                  <div className="flex-1 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {taskSubtasks.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-6">
                        No hay subtareas. ¡Utiliza el botón de IA para sugerirlas automáticamente!
                      </p>
                    ) : (
                      taskSubtasks.map((sub, index) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-850/50 text-xs"
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={sub.isCompleted}
                              onChange={() => {
                                const next = taskSubtasks.map((s) =>
                                  s.id === sub.id ? { ...s, isCompleted: !s.isCompleted } : s
                                );
                                setTaskSubtasks(next);
                              }}
                              className="h-4 w-4 rounded border-slate-750 text-indigo-600 bg-slate-950 focus:ring-indigo-500"
                            />
                            <span className={`truncate text-slate-300 ${sub.isCompleted ? "line-through text-slate-650" : ""}`}>
                              {sub.text}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtask(sub.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-850 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white cursor-pointer"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sistema Multitarea. Gestor Inteligente.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors">Optimizado con persistencia local y Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
