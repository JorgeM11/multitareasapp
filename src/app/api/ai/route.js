import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Eres un asistente inteligente para organizar notas y tareas. Tu trabajo es analizar el mensaje del usuario y la lista de notas existentes proporcionada, y determinar cuál de las siguientes acciones quiere realizar el usuario:
1. "create": Crear una nueva nota o tarea.
2. "update": Actualizar el título o contenido de una nota existente.
3. "toggleComplete": Marcar como completada o incompleta una tarea existente.
4. "delete": Eliminar una nota o tarea existente.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura, sin bloques de código Markdown (\`\`\`json) ni texto adicional:
{
  "action": "create" | "update" | "toggleComplete" | "delete",
  "noteId": "id_de_la_nota_afectada" (o null si es "create"),
  "noteData": { // Requerido solo si la acción es "create" o "update"
    "category": "Compras" | "Recordatorios" | "Trabajo" | "Ideas" | "General",
    "title": "Un título corto (máximo 4 palabras)",
    "content": "El contenido formateado y limpio (si no es una lista)",
    "isTask": true o false (true si es una tarea o acción a realizar, false si es una nota informativa),
    "listItems": [ // Arreglo de objetos { text: string, isCompleted: boolean } si la nota contiene una lista de compras, tareas múltiples o viñetas. Null si es texto libre regular.
      { "text": "Elemento 1", "isCompleted": false },
      { "text": "Elemento 2", "isCompleted": false }
    ]
  },
  "response": "Un mensaje amigable y corto en español del asistente explicando la acción tomada."
}

Al decidir sobre notas existentes, busca coincidencias en los títulos o descripciones de la lista de notas. Si el usuario pide completar, borrar o modificar algo que se parezca a una nota existente, asocia el "noteId" correspondiente de esa nota.
`;

export async function POST(req) {
  try {
    const { message, notes = [] } = await req.json();
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Direct HTTP fetch to Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: SYSTEM_PROMPT },
                  { text: `Notas actuales en formato JSON: ${JSON.stringify(notes)}` },
                  { text: `Mensaje del usuario: "${message}"` }
                ],
              },
            ],
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
      console.warn("Gemini API call failed or returned empty, using fallback parser.");
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

    // 1. DELETE ACTION DETECTED
    if (
      lowerMsg.includes("borra") ||
      lowerMsg.includes("elimina") ||
      lowerMsg.includes("quita") ||
      lowerMsg.includes("remover")
    ) {
      if (matchedNote) {
        return NextResponse.json({
          action: "delete",
          noteId: matchedNote.id,
          response: `He eliminado la nota "${matchedNote.title}" de tu lista.`
        });
      }
    }

    // 2. TOGGLE COMPLETE ACTION DETECTED
    if (
      lowerMsg.includes("completa") ||
      lowerMsg.includes("completada") ||
      lowerMsg.includes("hecho") ||
      lowerMsg.includes("listo") ||
      lowerMsg.includes("tacha") ||
      lowerMsg.includes("finalizar")
    ) {
      if (matchedNote && matchedNote.isTask) {
        return NextResponse.json({
          action: "toggleComplete",
          noteId: matchedNote.id,
          response: `He marcado la tarea "${matchedNote.title}" como completada.`
        });
      }
    }

    // 3. UPDATE ACTION DETECTED
    if (
      lowerMsg.includes("actualiza") ||
      lowerMsg.includes("cambia") ||
      lowerMsg.includes("modifica") ||
      lowerMsg.includes("edita")
    ) {
      if (matchedNote) {
        const cleanContent = message.replace(/(actualiza|cambia|modifica|edita)/gi, "").trim();
        
        // Parse cleanContent into items if it contains list markers
        let listItems = null;
        if (cleanContent.includes(",") || cleanContent.includes(" y ")) {
          const parts = cleanContent.split(/,| y /).map(item => item.trim()).filter(Boolean);
          listItems = parts.map(text => ({
            text: text.charAt(0).toUpperCase() + text.slice(1),
            isCompleted: false
          }));
        }

        return NextResponse.json({
          action: "update",
          noteId: matchedNote.id,
          noteData: {
            category: matchedNote.category,
            title: matchedNote.title,
            content: listItems ? "" : (cleanContent || matchedNote.content),
            isTask: matchedNote.isTask,
            listItems: listItems || matchedNote.listItems
          },
          response: `He actualizado la nota "${matchedNote.title}" con la nueva información.`
        });
      }
    }

    // 4. DEFAULT: CREATE ACTION
    let category = "General";
    let title = "Nueva Nota";
    let content = message;
    let isTask = false;
    let listItems = null;

    // Detect if content should be a list
    if (lowerMsg.includes("comprar") || lowerMsg.includes("compra") || lowerMsg.includes("supermercado") || lowerMsg.includes("lista")) {
      category = "Compras";
      isTask = true;
      
      const afterKeyword = message.split(/comprar|compra|lista de/i)[1]?.trim() || "";
      if (afterKeyword) {
        title = afterKeyword.split(/,| y /)[0]?.trim() || "Compras";
        title = title.charAt(0).toUpperCase() + title.slice(1);
        title = title.split(" ").slice(0, 4).join(" ");
        
        // Split list items
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
      } else {
        title = "Lista de compras";
        content = "Comprar víveres";
      }
    } else if (
      lowerMsg.includes("recordar") ||
      lowerMsg.includes("recordatorio") ||
      lowerMsg.includes("reunión") ||
      lowerMsg.includes("reunion") ||
      lowerMsg.includes("cita") ||
      lowerMsg.includes("mañana") ||
      lowerMsg.includes("tengo que") ||
      lowerMsg.includes("llamar")
    ) {
      category = "Recordatorios";
      isTask = true;
      title = message.split(/recordar|tengo que|llamar/i)[1]?.trim() || "Recordatorio";
      title = title.charAt(0).toUpperCase() + title.slice(1);
      title = title.split(" ").slice(0, 4).join(" ");
      content = message;
    } else if (
      lowerMsg.includes("trabajo") ||
      lowerMsg.includes("oficina") ||
      lowerMsg.includes("proyecto") ||
      lowerMsg.includes("cliente") ||
      lowerMsg.includes("tarea")
    ) {
      category = "Trabajo";
      isTask = true;
      title = "Pendiente de trabajo";
      content = message;
    } else if (
      lowerMsg.includes("idea") ||
      lowerMsg.includes("crear") ||
      lowerMsg.includes("diseñar") ||
      lowerMsg.includes("ocurrio") ||
      lowerMsg.includes("ocurrió")
    ) {
      category = "Ideas";
      isTask = false;
      title = message.split(/idea|crear|diseñar/i)[1]?.trim() || "Nueva Idea";
      title = title.charAt(0).toUpperCase() + title.slice(1);
      title = title.split(" ").slice(0, 4).join(" ");
      content = message;
    } else {
      title = message.split(" ").slice(0, 4).join(" ");
      title = title.charAt(0).toUpperCase() + title.slice(1);
      content = message;
    }

    return NextResponse.json({
      action: "create",
      noteId: null,
      noteData: {
        category,
        title,
        content,
        isTask,
        listItems
      },
      response: `He guardado tu nota en la sección de ${category}.`
    });
  } catch (error) {
    console.error("AI notes route handler error:", error);
    return NextResponse.json(
      {
        action: "create",
        noteId: null,
        noteData: {
          category: "General",
          title: "Nota rápida",
          content: "Error de procesamiento.",
          isTask: false,
          listItems: null
        },
        response: "Disculpa, he tenido un inconveniente procesando tu nota, pero la he guardado en General.",
      },
      { status: 200 }
    );
  }
}
