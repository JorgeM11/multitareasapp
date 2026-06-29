"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CustomSelect from "@/components/ui/CustomSelect";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaUtensils,
  FaBolt,
  FaCar,
  FaGamepad,
  FaBox,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaChartPie,
  FaMagic
} from "react-icons/fa";

// Category definitions with icons and colors
const CATEGORIES_CONFIG = {
  Alimentos: { icon: <FaUtensils className="h-3.5 w-3.5" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/30", strokeClass: "stroke-amber-500", strokeColor: "#f59e0b" },
  Servicios: { icon: <FaBolt className="h-3.5 w-3.5" />, color: "text-sky-400 bg-sky-500/10 border-sky-500/30", strokeClass: "stroke-sky-550", strokeColor: "#38bdf8" },
  Transporte: { icon: <FaCar className="h-3.5 w-3.5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/30", strokeClass: "stroke-indigo-500", strokeColor: "#6366f1" },
  Salarios: { icon: <FaMoneyBillWave className="h-3.5 w-3.5" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", strokeClass: "stroke-emerald-500", strokeColor: "#10b981" },
  Ocio: { icon: <FaGamepad className="h-3.5 w-3.5" />, color: "text-rose-400 bg-rose-500/10 border-rose-500/30", strokeClass: "stroke-rose-500", strokeColor: "#f43f5e" },
  Varios: { icon: <FaBox className="h-3.5 w-3.5" />, color: "text-slate-400 bg-slate-500/10 border-slate-500/30", strokeClass: "stroke-slate-500", strokeColor: "#64748b" }
};

const CATEGORY_OPTIONS = [
  { value: "Alimentos", label: "Alimentos", icon: <FaUtensils className="h-3.5 w-3.5" /> },
  { value: "Servicios", label: "Servicios", icon: <FaBolt className="h-3.5 w-3.5" /> },
  { value: "Transporte", label: "Transporte", icon: <FaCar className="h-3.5 w-3.5" /> },
  { value: "Salarios", label: "Salarios", icon: <FaMoneyBillWave className="h-3.5 w-3.5" /> },
  { value: "Ocio", label: "Ocio", icon: <FaGamepad className="h-3.5 w-3.5" /> },
  { value: "Varios", label: "Varios", icon: <FaBox className="h-3.5 w-3.5" /> }
];

const FILTER_CATEGORY_OPTIONS = [
  { value: "all", label: "Todas las secciones", icon: <FaWallet className="h-3.5 w-3.5" /> },
  ...CATEGORY_OPTIONS
];

const FILTER_TYPE_OPTIONS = [
  { value: "all", label: "Todos los tipos", icon: <FaWallet className="h-3.5 w-3.5" /> },
  { value: "income", label: "Ingresos", icon: <FaArrowUp className="text-emerald-450 h-3.5 w-3.5" /> },
  { value: "expense", label: "Gastos", icon: <FaArrowDown className="text-rose-455 h-3.5 w-3.5" /> }
];

const DEFAULT_TRANSACTIONS = [];

const DEFAULT_BUDGETS = {
  Alimentos: 0,
  Servicios: 0,
  Transporte: 0,
  Ocio: 0,
  Varios: 0
};

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  
  // Transaction Form state
  const [formAmount, setFormAmount] = useState("");
  const [formType, setFormType] = useState("expense"); // expense or income
  const [formCategory, setFormCategory] = useState("Alimentos");
  const [formDate, setFormDate] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Budget Edit state
  const [editingBudgets, setEditingBudgets] = useState(false);
  const [tempBudgets, setTempBudgets] = useState({});

  // History filters state
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // AI Assistant state
  const [chatHistory, setChatHistory] = useState([
    {
      id: "init",
      sender: "assistant",
      text: "¡Hola! Soy tu asistente de finanzas. Escribe tus ingresos y gastos para registrarlos al instante. Por ejemplo: 'gaste 200 en comida hoy' o 'recibi un pago de freelance de 5000'. También puedes pedirme eliminar transacciones escribiendo 'elimina el ultimo almuerzo'."
    }
  ]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [chatHistory, isChatOpen]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem("sistema-multitarea-txs");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions(DEFAULT_TRANSACTIONS);
      localStorage.setItem("sistema-multitarea-txs", JSON.stringify(DEFAULT_TRANSACTIONS));
    }

    const savedBudgets = localStorage.getItem("sistema-multitarea-budgets");
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      setBudgets(DEFAULT_BUDGETS);
      localStorage.setItem("sistema-multitarea-budgets", JSON.stringify(DEFAULT_BUDGETS));
    }

    const savedChat = localStorage.getItem("sistema-multitarea-finanzas-chat");
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    }

    // Default current date for form
    setFormDate(new Date().toISOString().split("T")[0]);
  }, []);

  const saveTransactions = (updatedTxs) => {
    setTransactions(updatedTxs);
    localStorage.setItem("sistema-multitarea-txs", JSON.stringify(updatedTxs));
  };

  const saveBudgets = (updatedBudgets) => {
    setBudgets(updatedBudgets);
    localStorage.setItem("sistema-multitarea-budgets", JSON.stringify(updatedBudgets));
  };

  const saveChat = (updatedChat) => {
    setChatHistory(updatedChat);
    localStorage.setItem("sistema-multitarea-finanzas-chat", JSON.stringify(updatedChat));
  };

  const handleSendAiMessage = async (messageText) => {
    if (!messageText || messageText.trim() === "") return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: messageText
    };

    const newChatHistory = [...chatHistory, userMessage];
    saveChat(newChatHistory);
    setChatMessage("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/finanzas/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText, transactions, chatHistory: newChatHistory }),
      });

      if (!response.ok) throw new Error("AI finance failed");

      const data = await response.json();

      let updatedTxs = [...transactions];

      if (data.action === "create" && data.txData) {
        const newTx = {
          id: `tx-${Date.now()}`,
          amount: parseFloat(data.txData.amount) || 0,
          type: data.txData.type || "expense",
          category: data.txData.category || "Varios",
          date: data.txData.date || new Date().toISOString().split("T")[0],
          description: data.txData.description || "Transacción IA"
        };
        updatedTxs = [newTx, ...updatedTxs];
        saveTransactions(updatedTxs);
      } else if (data.action === "delete" && data.txId) {
        updatedTxs = updatedTxs.filter((t) => t.id !== data.txId);
        saveTransactions(updatedTxs);
      }

      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        text: data.response
      };

      saveChat([...newChatHistory, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        text: "Lo siento, tuve un inconveniente procesando tu comando. Por favor regístralo manualmente."
      };
      saveChat([...newChatHistory, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Form submission handler
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) return;

    const newTx = {
      id: `tx-${Date.now()}`,
      amount: parseFloat(formAmount),
      type: formType,
      category: formCategory,
      date: formDate || new Date().toISOString().split("T")[0],
      description: formDescription.trim() || (formType === "income" ? "Ingreso rápido" : "Gasto rápido")
    };

    const updated = [newTx, ...transactions];
    saveTransactions(updated);

    // Reset fields except date and type for quick entry
    setFormAmount("");
    setFormDescription("");
  };

  const handleDeleteTransaction = (id) => {
    const updated = transactions.filter((t) => t.id !== id);
    saveTransactions(updated);
  };

  // Budget updates
  const startEditingBudgets = () => {
    setTempBudgets({ ...budgets });
    setEditingBudgets(true);
  };

  const handleBudgetChange = (category, value) => {
    setTempBudgets({
      ...tempBudgets,
      [category]: Math.max(0, parseFloat(value) || 0)
    });
  };

  const handleSaveBudgets = () => {
    saveBudgets(tempBudgets);
    setEditingBudgets(false);
  };

  // Calculation helpers
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const getCategorySpending = (category) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Donut chart calculations
  const categoriesList = ["Alimentos", "Servicios", "Transporte", "Ocio", "Varios"];
  const expensesByCategory = categoriesList.map((cat) => {
    const amount = getCategorySpending(cat);
    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
    return {
      category: cat,
      amount,
      percentage,
      config: CATEGORIES_CONFIG[cat]
    };
  }).filter((c) => c.amount > 0);

  const R = 38;
  const C = 2 * Math.PI * R;

  // Filtering list
  const filteredTransactions = transactions.filter((t) => {
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    const matchType = filterType === "all" || t.type === filterType;
    return matchCat && matchType;
  });

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-3xl" />

      {/* Main Container */}
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 flex-1 flex flex-col py-6 sm:py-8">
        
        {/* Header Navigation */}
        <header className="border-b border-slate-700/80 sm:border-slate-800/60 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-850/80 text-slate-400 hover:text-white hover:border-slate-700 active:scale-90 active:bg-slate-800 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Volver al inicio"
            >
              <FaArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Finanzas</h1>
              <p className="text-xs text-slate-400">Control de gastos y presupuestos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Consola Inteligente
            </span>
          </div>
        </header>

        {/* Consolidated Balances Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Net Balance Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/25 p-5 backdrop-blur-md">
            <div className="absolute -right-6 -top-6 -z-10 h-16 w-16 rounded-full bg-indigo-500/10 blur-xl" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance Total</span>
              <FaWallet className="h-4 w-4 text-indigo-400" />
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${netBalance >= 0 ? "text-emerald-450" : "text-rose-455"}`}>
              {netBalance >= 0 ? "+" : ""}{netBalance.toLocaleString("es-VE", { minimumFractionDigits: 2 })} <span className="text-sm font-semibold">VES</span>
            </h2>
          </div>

          {/* Income Card */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900/25 p-5 backdrop-blur-md">
            <div className="absolute -right-6 -top-6 -z-10 h-16 w-16 rounded-full bg-emerald-500/10 blur-xl" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos</span>
              <FaArrowUp className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-400">
              {totalIncome.toLocaleString("es-VE", { minimumFractionDigits: 2 })} <span className="text-sm font-semibold text-emerald-500">VES</span>
            </h2>
          </div>

          {/* Expense Card */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-slate-900/25 p-5 backdrop-blur-md">
            <div className="absolute -right-6 -top-6 -z-10 h-16 w-16 rounded-full bg-rose-500/10 blur-xl" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gastos</span>
              <FaArrowDown className="h-4 w-4 text-rose-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-rose-455">
              {totalExpense.toLocaleString("es-VE", { minimumFractionDigits: 2 })} <span className="text-sm font-semibold text-rose-500">VES</span>
            </h2>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Input Form & Budgets */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            


            {/* Manual Form Card */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/15 p-5 backdrop-blur-md">
              <h3 className="text-base font-bold text-white mb-4">Registrar Transacción</h3>
              
              <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
                {/* Income / Expense toggle selector */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850/80">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("expense");
                      if (formCategory === "Salarios") setFormCategory("Alimentos");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 ${
                      formType === "expense"
                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("income");
                      setFormCategory("Salarios");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 ${
                      formType === "income"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-450 shadow-sm"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    Ingreso
                  </button>
                </div>

                {/* Amount input */}
                <div>
                  <label htmlFor="formAmount" className="block text-xs font-semibold text-slate-400 mb-2">
                    Monto (VES)
                  </label>
                  <input
                    type="number"
                    id="formAmount"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="Monto en Bolívares..."
                    step="0.01"
                    min="0.01"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-white placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* CustomSelect Category */}
                <div>
                  <label htmlFor="formCategory" className="block text-xs font-semibold text-slate-400 mb-2">
                    Categoría
                  </label>
                  <CustomSelect
                    id="formCategory"
                    value={formCategory}
                    onChange={setFormCategory}
                    options={formType === "income" ? [CATEGORY_OPTIONS[3], CATEGORY_OPTIONS[5]] : CATEGORY_OPTIONS.filter(o => o.value !== "Salarios")}
                    label="Seleccionar categoría"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date Input */}
                  <div>
                    <label htmlFor="formDate" className="block text-xs font-semibold text-slate-400 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      id="formDate"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      required
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label htmlFor="formDescription" className="block text-xs font-semibold text-slate-400 mb-2">
                      Detalle / Nota
                    </label>
                    <input
                      type="text"
                      id="formDescription"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Ej. Almuerzo..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-650 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/40 text-xs font-bold text-white shadow-md transition duration-200 cursor-pointer"
                >
                  <FaPlus className="h-3.5 w-3.5" />
                  Agregar Registro
                </button>
              </form>
            </section>

            {/* Distribución de Gastos (Donut Chart) */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/15 p-5 backdrop-blur-md">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <FaChartPie className="text-indigo-400 h-4 w-4" />
                Distribución de Gastos
              </h3>

              {expensesByCategory.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                  {/* SVG Donut Graphic */}
                  <div className="relative h-32 w-32 shrink-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      {/* Inner border/track for style */}
                      <circle
                        cx="50"
                        cy="50"
                        r={R}
                        fill="transparent"
                        stroke="#0f172a"
                        strokeWidth="10"
                      />
                      {/* Render segments */}
                      {(() => {
                        let currentAcc = 0;
                        return expensesByCategory.map((item) => {
                          const strokeDashoffset = C - (item.percentage / 100) * C;
                          const rotationAngle = currentAcc * 3.6;
                          currentAcc += item.percentage;
                          return (
                            <circle
                              key={item.category}
                              cx="50"
                              cy="50"
                              r={R}
                              fill="transparent"
                              stroke={item.config.strokeColor}
                              strokeWidth="9"
                              strokeDasharray={C}
                              strokeDashoffset={strokeDashoffset}
                              transform={`rotate(${rotationAngle} 50 50)`}
                              strokeLinecap="round"
                              className="transition-all duration-300 hover:stroke-[11px] cursor-pointer"
                              title={`${item.category}: ${item.percentage.toFixed(1)}%`}
                            />
                          );
                        });
                      })()}
                    </svg>
                    {/* Centered Total Expense Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
                      <span className="text-xs font-black text-white font-mono leading-none mt-0.5">
                        {totalExpense.toLocaleString("es-VE", { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold font-mono">VES</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 w-full space-y-2">
                    {expensesByCategory.map((item) => (
                      <div key={item.category} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-300">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.config.strokeColor }}
                          />
                          <span className="font-semibold">{item.category}</span>
                        </span>
                        <span className="text-slate-400 font-mono font-medium">
                          {item.amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })} VES ({item.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-950/20 border border-dashed border-slate-850 rounded-xl">
                  <span className="text-2xs text-slate-500 font-bold mb-2">No hay egresos registrados este mes</span>
                  <p className="text-[10px] text-slate-650 max-w-[200px] leading-relaxed">
                    Registra egresos de alimentos, servicios o transporte para visualizar la gráfica de dona.
                  </p>
                </div>
              )}

              {/* Pedir Consejo a IA Button */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setIsChatOpen(true);
                    handleSendAiMessage("Analiza mis gastos de este mes y dame consejos prácticos de ahorro");
                  }}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 hover:text-white text-xs font-bold transition duration-200 cursor-pointer shadow-sm shadow-indigo-500/5"
                >
                  <FaMagic className="h-3.5 w-3.5 animate-pulse" />
                  Pedir Análisis a Asistente IA
                </button>
              </div>
            </section>

            {/* Monthly Budgets Card */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/15 p-5 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white">Presupuestos Mensuales</h3>
                {!editingBudgets ? (
                  <button
                    onClick={startEditingBudgets}
                    type="button"
                    className="text-2xs font-bold text-indigo-400 hover:text-white px-2.5 py-1 rounded-md border border-slate-800 hover:border-indigo-500/50 bg-slate-950 transition duration-200 cursor-pointer"
                  >
                    Configurar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingBudgets(false)}
                      type="button"
                      className="text-2xs font-bold text-slate-500 hover:text-slate-350"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveBudgets}
                      type="button"
                      className="text-2xs font-bold text-emerald-450 hover:text-white"
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              {/* Budgets list */}
              <div className="space-y-4">
                {Object.keys(budgets).map((cat) => {
                  const limit = budgets[cat];
                  const spent = getCategorySpending(cat);
                  const percent = limit > 0 ? (spent / limit) * 100 : 0;
                  const config = CATEGORIES_CONFIG[cat] || CATEGORIES_CONFIG.Varios;

                  return (
                    <div key={cat} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${config.color}`}>
                            {config.icon}
                          </span>
                          <span className="font-semibold">{cat}</span>
                        </span>
                        
                        {/* Budget Limit Input or Text */}
                        {!editingBudgets ? (
                          <span className="text-[11px] text-slate-450 font-mono">
                            <span className={limit > 0 && spent > limit ? "text-rose-455 font-bold animate-pulse" : "text-slate-300"}>
                              {spent.toLocaleString("es-VE")}
                            </span>
                            {limit > 0 ? ` / ${limit.toLocaleString("es-VE")} VES` : " / Sin límite"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempBudgets[cat] ?? 0}
                              onChange={(e) => handleBudgetChange(cat, e.target.value)}
                              className="w-16 rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-center text-2xs text-white font-semibold font-mono"
                              min="0"
                            />
                            <span className="text-2xs text-slate-500 font-mono">VES</span>
                          </div>
                        )}
                      </div>

                      {/* Visual budget indicator bar */}
                      <div className="relative h-2 w-full rounded-full bg-slate-900 border border-slate-850/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent >= 100
                              ? "bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)] animate-pulse"
                              : percent >= 80
                              ? "bg-amber-500"
                              : "bg-indigo-600"
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>

                      {/* Warnings / Alerts */}
                      {percent >= 80 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <FaExclamationTriangle className="h-3 w-3" />
                          <span>
                            {percent >= 100 
                              ? `Límite crítico superado en ${cat} (${percent.toFixed(0)}%)` 
                              : `Cerca del límite mensual en ${cat} (${percent.toFixed(0)}%)`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Transactions History & Filters */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Filter controls row */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/10 border border-slate-850/60 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white">Historial de Transacciones</h3>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Category Filter */}
                <div className="w-full sm:w-44 text-left">
                  <CustomSelect
                    id="filterCategory"
                    value={filterCategory}
                    onChange={setFilterCategory}
                    options={FILTER_CATEGORY_OPTIONS}
                    label="Filtrar por sección"
                  />
                </div>

                {/* Type Filter */}
                <div className="w-full sm:w-40 text-left">
                  <CustomSelect
                    id="filterType"
                    value={filterType}
                    onChange={setFilterType}
                    options={FILTER_TYPE_OPTIONS}
                    label="Filtrar por tipo"
                  />
                </div>
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {filteredTransactions.map((tx) => {
                  const config = CATEGORIES_CONFIG[tx.category] || CATEGORIES_CONFIG.Varios;
                  const isExpense = tx.type === "expense";

                  return (
                    <div
                      key={tx.id}
                      className="group relative flex items-center justify-between rounded-xl border border-slate-900/60 bg-slate-900/15 p-4 transition-all duration-200 hover:border-slate-800 hover:bg-slate-900/30"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Category Icon */}
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${config.color}`}>
                          {config.icon}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{tx.description}</h4>
                          <div className="flex gap-2 items-center text-[10px] text-slate-500 font-mono">
                            <span>{tx.category}</span>
                            <span>•</span>
                            <span>{tx.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action & Amount */}
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold font-mono ${isExpense ? "text-rose-455" : "text-emerald-450"}`}>
                          {isExpense ? "-" : "+"}{tx.amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                        </span>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900 border border-slate-800 hover:text-rose-455 cursor-pointer transition-all duration-200 focus:outline-none bg-slate-950"
                          aria-label={`Eliminar transacción: ${tx.description}`}
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-850 bg-slate-900/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 mb-4">
                  <FaWallet className="h-5 w-5 text-slate-500" />
                </div>
                <h3 className="text-xs font-bold text-slate-350">Sin registros</h3>
                <p className="mt-1 text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  No hay transacciones registradas que coincidan con los filtros seleccionados. Agrega una arriba.
                </p>
              </div>
            )}
          </div>

        </div>
        
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 mt-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Hub Multitarea. Módulo de Finanzas Inteligentes.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors">Sincronización LocalStorage activa</span>
          </div>
        </div>
      </footer>
      {/* FLOATING CHAT PANEL & ACTION BUTTON FOR AI ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Floating Chat Popover Widget */}
        {isChatOpen && (
          <div className="mb-4 w-[340px] sm:w-[380px] rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-900">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Asistente IA Financiero
              </h3>
              <button
                onClick={() => setIsChatOpen(false)}
                type="button"
                className="text-[10px] text-slate-500 hover:text-slate-200 hover:bg-slate-900 border border-slate-850 px-2 py-0.5 rounded cursor-pointer transition"
              >
                Cerrar
              </button>
            </div>

            {/* Message Bubble List */}
            <div className="h-64 overflow-y-auto pr-1 mb-3.5 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent text-xs">
              {chatHistory.map((msg) => {
                const isAssistant = msg.sender === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                        isAssistant
                          ? "bg-slate-900 border border-slate-850/40 text-slate-300"
                          : "bg-indigo-600/90 text-white font-medium shadow-md shadow-indigo-500/10"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-xl px-3 py-2 bg-slate-900 border border-slate-850/40 text-slate-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <span>Procesando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage(chatMessage);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ej. gané 5000 bs de sueldo..."
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-650 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={chatLoading}
                required
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/40 text-white transition duration-200 cursor-pointer disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-900">
              <button
                onClick={() => handleSendAiMessage("Gasté 20 bolívares en almuerzo hoy")}
                type="button"
                disabled={chatLoading}
                className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:border-indigo-500/30 transition cursor-pointer"
              >
                🍔 Gaste 20 hoy
              </button>
              <button
                onClick={() => handleSendAiMessage("Recibí 300 de sueldo ayer")}
                type="button"
                disabled={chatLoading}
                className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:border-indigo-500/30 transition cursor-pointer"
              >
                💵 Sueldo 300 ayer
              </button>
            </div>
          </div>
        )}

        {/* Floating Toggle Button (FAB) */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/40 text-white shadow-2xl transition duration-200 cursor-pointer shadow-indigo-500/30 hover:scale-105 active:scale-95 focus:outline-none"
          aria-label="Abrir Asistente IA Financiero"
        >
          {isChatOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
