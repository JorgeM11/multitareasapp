import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Eres un asistente inteligente para organizar notas y tareas. Tu trabajo es analizar el mensaje del usuario y la lista de notas existentes proporcionada, y determinar cuál de las siguientes acciones quiere realizar el usuario:
1. "create": Crear una nueva nota o tarea.
2. "update": Actualizar el título o contenido de una nota existente.
3. "toggleComplete": Marcar como completada o incompleta una tarea existente.
4. "delete": Eliminar una nota o tarea existente.
5. "askDateTime": El usuario quiere crear un recordatorio pero NO especificó la fecha y/o la hora. Debes preguntar por ellas.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura, sin bloques de código Markdown (\`\`\`json) ni texto adicional:
{
  "action": "create" | "update" | "toggleComplete" | "delete" | "askDateTime",
  "noteId": "id_de_la_nota_afectada" (o null si es "create" o "askDateTime"),
  "noteData": { // Requerido si la acción es "create" o "update"
    "category": "Compras" | "Recordatorios" | "Trabajo" | "Ideas" | "General",
    "title": "Un título corto (máximo 4 palabras)",
    "content": "El contenido formateado y limpio",
    "isTask": true o false (true si es una tarea o acción a realizar, false si es una nota informativa),
    "listItems": [ // Opcional: Arreglo de objetos { text: string, isCompleted: boolean } si la nota contiene una lista. Null si no aplica.
      { "text": "Elemento 1", "isCompleted": false }
    ],
    "reminderDate": "String ISO (ej: 2026-06-28T15:00:00.000Z) si es un Recordatorio con fecha y hora definida, de lo contrario null"
  },
  "response": "Un mensaje amigable y corto en español del asistente explicando la acción tomada, o preguntando por la fecha y hora si es 'askDateTime'."
}

REGLAS DE RECORDATORIOS:
- Si el usuario indica un recordatorio (ej: "tengo que ir al médico", "recuérdame llamar a Juan") pero NO especifica fecha ni hora, debes devolver la acción "askDateTime" y en la respuesta preguntar de manera servicial: "¿Para qué fecha y hora te gustaría agendar este recordatorio?".
- Si el usuario proporciona la fecha y hora (ej: "mañana a las 3pm", "el lunes a las 10am") o está respondiendo a tu pregunta anterior con la fecha/hora, devuelve la acción "create" con la categoría "Recordatorios", calcula el "reminderDate" en formato ISO basándote en la hora local actual proporcionada, y confirma la programación en la respuesta.
`;

export async function POST(req) {
  try {
    const { message, notes = [], chatHistory = [] } = await req.json();
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const currentLocalTime = new Date();

    if (apiKey) {
      // Build conversation contents including last 4 messages for context memory
      const contents = [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT + `\n\nFecha y hora local actual de referencia: ${currentLocalTime.toISOString()} (${currentLocalTime.toLocaleString("es-VE")})` }]
        }
      ];

      // Add recent chat history for conversational context
      const lastChat = chatHistory.slice(-4);
      lastChat.forEach((msg) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });

      // Add current message
      contents.push({
        role: "user",
        parts: [
          { text: `Notas actuales en formato JSON: ${JSON.stringify(notes)}` },
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
      console.warn("Gemini API call failed, using fallback parser.");
    }

    // LOCAL FALLBACK PARSER
    const lowerMsg = message.toLowerCase();

    // Check if matching any existing notes
    let matchedNote = null;
    if (notes.length > 0) {
      matchedNote = notes.find((n) => {
        const titleWords = n.title.toLowerCase().split(" ").filter(w => w.length > 2);
        return titleWords.some(w => lowerMsg.includes(w)) || lowerMsg.includes(n.title.toLowerCase());
      });
    }

    // 1. DELETE ACTION
    if (lowerMsg.includes("borra") || lowerMsg.includes("elimina") || lowerMsg.includes("quita")) {
      if (matchedNote) {
        return NextResponse.json({
          action: "delete",
          noteId: matchedNote.id,
          response: `He eliminado la nota "${matchedNote.title}" de tu lista.`
        });
      }
    }

    // 2. TOGGLE COMPLETE ACTION
    if (lowerMsg.includes("completa") || lowerMsg.includes("completada") || lowerMsg.includes("hecho") || lowerMsg.includes("listo")) {
      if (matchedNote && matchedNote.isTask) {
        return NextResponse.json({
          action: "toggleComplete",
          noteId: matchedNote.id,
          response: `He marcado la tarea "${matchedNote.title}" como completada.`
        });
      }
    }

    // 3. RECORDATORIOS / REMINDERS DETECTED
    if (
      lowerMsg.includes("recordar") ||
      lowerMsg.includes("recordatorio") ||
      lowerMsg.includes("reunión") ||
      lowerMsg.includes("reunion") ||
      lowerMsg.includes("cita") ||
      lowerMsg.includes("tengo que") ||
      lowerMsg.includes("llamar")
    ) {
      // Check if date/time indicators are present
      const hasDateTime =
        lowerMsg.includes("mañana") ||
        lowerMsg.includes("hoy") ||
        lowerMsg.includes("lunes") ||
        lowerMsg.includes("martes") ||
        lowerMsg.includes("miércoles") ||
        lowerMsg.includes("jueves") ||
        lowerMsg.includes("viernes") ||
        lowerMsg.includes("sábado") ||
        lowerMsg.includes("domingo") ||
        lowerMsg.includes("a las") ||
        lowerMsg.includes("en ") ||
        lowerMsg.includes("minuto") ||
        lowerMsg.includes("segundo");

      if (!hasDateTime) {
        return NextResponse.json({
          action: "askDateTime",
          noteId: null,
          response: "¡Claro! He anotado tu recordatorio. ¿Para qué fecha y hora te gustaría programarlo?"
        });
      }

      // Local parser scheduling:
      // If user says "en 10 segundos" or similar for testing
      let reminderDate = new Date(Date.now() + 3600000 * 24); // default: tomorrow
      let durationStr = "mañana";

      if (lowerMsg.includes("10 segundos")) {
        reminderDate = new Date(Date.now() + 10000); // 10 seconds
        durationStr = "en 10 segundos";
      } else if (lowerMsg.includes("1 minuto") || lowerMsg.includes("un minuto")) {
        reminderDate = new Date(Date.now() + 60000); // 1 minute
        durationStr = "en 1 minuto";
      } else if (lowerMsg.includes("hoy")) {
        reminderDate = new Date(Date.now() + 3600000 * 2); // in 2 hours
        durationStr = "hoy más tarde";
      }

      const cleanTitle = message.replace(/(recordar|recordatorio|tengo que|llamar)/gi, "").trim();
      const finalTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1).split(" ").slice(0, 4).join(" ");

      return NextResponse.json({
        action: "create",
        noteId: null,
        noteData: {
          category: "Recordatorios",
          title: finalTitle || "Recordatorio",
          content: message,
          isTask: true,
          listItems: null,
          reminderDate: reminderDate.toISOString()
        },
        response: `Perfecto, he agendado tu recordatorio "${finalTitle || "Recordatorio"}" para ${durationStr}. Te notificaré en su momento.`
      });
    }

    // 4. CHECKLISTS DETECTED
    let category = "General";
    let title = "Nueva Nota";
    let content = message;
    let isTask = false;
    let listItems = null;

    if (lowerMsg.includes("comprar") || lowerMsg.includes("compra") || lowerMsg.includes("supermercado")) {
      category = "Compras";
      isTask = true;
      const afterKeyword = message.split(/comprar|compra/i)[1]?.trim() || "";
      if (afterKeyword) {
        title = afterKeyword.split(/,| y /)[0]?.trim();
        title = title.charAt(0).toUpperCase() + title.slice(1).split(" ").slice(0, 4).join(" ");
        const rawItems = afterKeyword.split(/,| y /).map(item => item.trim()).filter(Boolean);
        if (rawItems.length > 1) {
          listItems = rawItems.map(text => ({
            text: text.charAt(0).toUpperCase() + text.slice(1),
            isCompleted: false
          }));
          content = "";
        } else {
          content = `Comprar: ${afterKeyword}`;
        }
      }
    } else if (lowerMsg.includes("idea") || lowerMsg.includes("crear")) {
      category = "Ideas";
      title = "Nueva Idea";
    }

    return NextResponse.json({
      action: "create",
      noteId: null,
      noteData: {
        category,
        title,
        content,
        isTask,
        listItems,
        reminderDate: null
      },
      response: `He guardado tu nota en la sección de ${category}.`
    });
  } catch (error) {
    console.error("AI notes handler error:", error);
    return NextResponse.json({
      action: "create",
      noteId: null,
      noteData: {
        category: "General",
        title: "Nota rápida",
        content: message,
        isTask: false,
        listItems: null,
        reminderDate: null
      },
      response: "Disculpa, he tenido un inconveniente procesando tu nota, pero la he guardado en General."
    });
  }
}
