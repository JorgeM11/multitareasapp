import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Eres un asistente de finanzas personales inteligente. Tu trabajo es analizar el mensaje del usuario y la lista de transacciones financieras proporcionada, y determinar qué acción quiere realizar el usuario:
1. "create": Registrar una nueva transacción (ingreso o gasto).
2. "delete": Eliminar una transacción existente de la lista.
3. "advice": Dar consejos financieros, sugerencias de ahorro o análisis de los gastos actuales basándose en el historial de transacciones o en la consulta del usuario.

Si la acción es "create", debes categorizar obligatoriamente la transacción dentro de una de estas secciones:
- "Alimentos" (comida, supermercado, restaurantes, etc.)
- "Servicios" (luz, agua, gas, internet, telefonía, etc.)
- "Transporte" (gasolina, pasajes, taxi, metro, etc.)
- "Salarios" (sueldo, nómina, quincena, freelance, etc.)
- "Ocio" (cine, fiestas, salidas, juegos, suscripciones, etc.)
- "Varios" (cualquier otra cosa que no encaje en las anteriores)

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura, sin bloques de código Markdown (\`\`\`json) ni texto explicativo:
{
  "action": "create" | "delete" | "advice",
  "txId": "id_de_la_transaccion_afectada" (solo si es "delete", de lo contrario null),
  "txData": { // Requerido si la acción es "create", de lo contrario null
    "amount": número (el monto exacto expresado como número decimal),
    "type": "income" | "expense" (ingreso o gasto),
    "category": "Alimentos" | "Servicios" | "Transporte" | "Salarios" | "Ocio" | "Varios",
    "description": "Una descripción corta de la transacción (máximo 4 palabras)",
    "date": "YYYY-MM-DD" (si el usuario menciona una fecha como 'ayer', 'hoy', 'el lunes', calcúlala respecto al día de referencia, de lo contrario usa la fecha de hoy)
  },
  "response": "Un mensaje amigable, explicativo y corto en español del asistente. Si la acción es 'advice', este mensaje debe contener los consejos y el análisis financiero estructurado con viñetas claras."
}
`;

export async function POST(req) {
  try {
    const { message, transactions = [], chatHistory = [] } = await req.json();
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const currentLocalTime = new Date();
    const currentDateStr = currentLocalTime.toISOString().split("T")[0];

    if (apiKey) {
      const contents = [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT + `\n\nFecha local de hoy de referencia: ${currentDateStr}. Hora local actual: ${currentLocalTime.toLocaleTimeString("es-VE")}` }]
        }
      ];

      // Add recent chat context
      const lastChat = chatHistory.slice(-4);
      lastChat.forEach((msg) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });

      // Current prompt details
      contents.push({
        role: "user",
        parts: [
          { text: `Transacciones actuales en JSON: ${JSON.stringify(transactions)}` },
          { text: `Mensaje del usuario: "${message}"` }
        ]
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
          const parsedData = JSON.parse(textResponse.trim());
          return NextResponse.json(parsedData);
        }
      }
      console.warn("Gemini Finance API failed, initiating local fallback parser.");
    }

    // LOCAL FALLBACK PARSER
    const lowerMsg = message.toLowerCase();

    // 0. ADVICE REQUEST
    if (lowerMsg.includes("analiza") || lowerMsg.includes("consejo") || lowerMsg.includes("recomienda") || lowerMsg.includes("ahorr") || lowerMsg.includes("presupuesto")) {
      const totalSpent = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
      const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
      
      if (transactions.length === 0) {
        return NextResponse.json({
          action: "advice",
          txId: null,
          txData: null,
          response: "Aún no tienes registros financieros en tu historial. Registra tus primeros ingresos o gastos (ej. 'gasté 400 en comida') para poder ofrecerte un análisis de gastos personalizado y consejos de ahorro a tu medida."
        });
      }

      // Group expenses by category
      const catExpenses = {};
      transactions.filter(t => t.type === "expense").forEach(t => {
        catExpenses[t.category] = (catExpenses[t.category] || 0) + t.amount;
      });
      
      // Find highest expense category
      let highestCat = "";
      let highestAmount = 0;
      Object.entries(catExpenses).forEach(([cat, val]) => {
        if (val > highestAmount) {
          highestAmount = val;
          highestCat = cat;
        }
      });

      let adviceText = `### Análisis Financiero Rápido\n\n`;
      adviceText += `* **Flujo de caja**: Has ingresado un total de **${totalIncome.toLocaleString("es-VE")} VES** y gastado **${totalSpent.toLocaleString("es-VE")} VES**.\n`;
      
      if (highestCat) {
        adviceText += `* **Fuga principal**: Tu mayor egreso está en **${highestCat}** con **${highestAmount.toLocaleString("es-VE")} VES**.\n`;
        adviceText += `* **Sugerencia de ahorro**: Te aconsejo configurar un tope mensual en la categoría **${highestCat}** y reducir un 15% tus consumos en esa sección durante las próximas dos semanas.\n`;
      }
      adviceText += `* **Consejo general**: Te sugiero aplicar la regla 50/30/20. Intenta resguardar un porcentaje de tus ingresos apenas los cobres para construir tu fondo de emergencia.`;

      return NextResponse.json({
        action: "advice",
        txId: null,
        txData: null,
        response: adviceText
      });
    }

    // 1. DELETE TRANSACTION
    if (lowerMsg.includes("borra") || lowerMsg.includes("elimina") || lowerMsg.includes("quita")) {
      let matchedTx = null;
      if (transactions.length > 0) {
        // Try to match description keyword
        matchedTx = transactions.find((t) => {
          const descWords = t.description.toLowerCase().split(" ").filter(w => w.length > 2);
          return descWords.some(w => lowerMsg.includes(w)) || lowerMsg.includes(t.description.toLowerCase());
        });
      }

      if (matchedTx) {
        return NextResponse.json({
          action: "delete",
          txId: matchedTx.id,
          response: `He eliminado el registro "${matchedTx.description}" de tu historial.`
        });
      }
    }

    // 2. CREATE TRANSACTION (Default Action)
    // Extract decimal amount
    const numberMatches = message.match(/\b\d+(?:[.,]\d+)?\b/g);
    let amount = 0;
    if (numberMatches && numberMatches.length > 0) {
      // Clean up punctuation (replace comma with dot for float parsing)
      amount = parseFloat(numberMatches[0].replace(",", "."));
    }

    // Determine category
    let category = "Varios";
    if (lowerMsg.includes("comida") || lowerMsg.includes("supermercado") || lowerMsg.includes("almuerzo") || lowerMsg.includes("cena") || lowerMsg.includes("desayuno") || lowerMsg.includes("pan") || lowerMsg.includes("mercado") || lowerMsg.includes("comprar")) {
      category = "Alimentos";
    } else if (lowerMsg.includes("luz") || lowerMsg.includes("agua") || lowerMsg.includes("internet") || lowerMsg.includes("cantv") || lowerMsg.includes("telefono") || lowerMsg.includes("gas") || lowerMsg.includes("servicio")) {
      category = "Servicios";
    } else if (lowerMsg.includes("gasolina") || lowerMsg.includes("taxi") || lowerMsg.includes("pasaje") || lowerMsg.includes("carro") || lowerMsg.includes("transporte") || lowerMsg.includes("metro")) {
      category = "Transporte";
    } else if (lowerMsg.includes("sueldo") || lowerMsg.includes("pago") || lowerMsg.includes("nomina") || lowerMsg.includes("salario") || lowerMsg.includes("quincena") || lowerMsg.includes("freelance")) {
      category = "Salarios";
    } else if (lowerMsg.includes("cine") || lowerMsg.includes("juego") || lowerMsg.includes("ocio") || lowerMsg.includes("salida") || lowerMsg.includes("netflix") || lowerMsg.includes("fiesta") || lowerMsg.includes("cerveza")) {
      category = "Ocio";
    }

    // Determine type (income or expense)
    let type = "expense";
    if (
      category === "Salarios" || 
      lowerMsg.includes("gane") || 
      lowerMsg.includes("recibi") || 
      lowerMsg.includes("ingreso") || 
      lowerMsg.includes("deposito") || 
      lowerMsg.includes("cobrar") ||
      lowerMsg.includes("regalo")
    ) {
      type = "income";
    }

    // Parse date
    let date = currentDateStr;
    if (lowerMsg.includes("ayer")) {
      const yesterday = new Date(Date.now() - 3600000 * 24);
      date = yesterday.toISOString().split("T")[0];
    } else if (lowerMsg.includes("antier") || lowerMsg.includes("hace dos dias")) {
      const twoDaysAgo = new Date(Date.now() - 3600000 * 24 * 2);
      date = twoDaysAgo.toISOString().split("T")[0];
    }

    // Extract description (remove command keywords and amounts)
    let description = message
      .replace(/\b\d+(?:[.,]\d+)?\b/g, "") // remove numbers
      .replace(/(gaste|pague|compra|egreso|gasto|gane|recibi|ingreso|bolivares|bs|pesos|dolares|ves|en|un|una|el|la)/gi, "")
      .trim();

    description = description.charAt(0).toUpperCase() + description.slice(1).split(" ").slice(0, 4).join(" ");
    
    if (!description || description.length < 3) {
      description = type === "income" ? `Ingreso de ${category}` : `Gasto de ${category}`;
    }

    return NextResponse.json({
      action: "create",
      txId: null,
      txData: {
        amount: amount || 0,
        type,
        category,
        description,
        date
      },
      response: `Registrado: ${type === "income" ? "Ingreso" : "Gasto"} de ${amount || 0} VES en ${category} ("${description}").`
    });
  } catch (error) {
    console.error("AI finance handler error:", error);
    return NextResponse.json({
      action: "create",
      txId: null,
      txData: {
        amount: 0,
        type: "expense",
        category: "Varios",
        description: "Transacción rápida",
        date: new Date().toISOString().split("T")[0]
      },
      response: "Disculpa, no logré procesar la transacción automáticamente, por favor regístrala manualmente."
    });
  }
}
