import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Eres un gestor de proyectos experto y asistente de productividad. Tu tarea es tomar el título y la descripción de una tarea o entregable, y desglosarla en una lista ordenada de 4 a 6 subtareas lógicas, concretas y accionables.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura, sin bloques de código Markdown (\`\`\`json) ni texto adicional:
{
  "subtasks": [
    "Primera subtarea lógica y concreta",
    "Segunda subtarea lógica y concreta",
    ...
  ]
}

Reglas:
- Las subtareas deben ser claras, breves (máximo 8 palabras por subtarea) y directamente relacionadas con la tarea.
- Deben seguir una secuencia lógica de ejecución (ej: investigar/planificar -> diseñar/configurar -> implementar -> probar/revisar).
- Responde en español de forma profesional.
`;

export async function POST(req) {
  try {
    const { title, description } = await req.json();

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const contents = [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: "user",
          parts: [
            { text: `Título de la tarea: "${title}"` },
            { text: `Descripción de la tarea: "${description || 'Sin descripción adicional'}"` }
          ]
        }
      ];

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

    // Fallback local en caso de que falle la API o no haya API key
    const fallbackSubtasks = [
      "Definir alcance y requisitos",
      "Planificar el diseño y recursos",
      "Desarrollar la fase inicial",
      "Verificar detalles y hacer pruebas",
      "Finalizar y documentar resultados"
    ];

    return NextResponse.json({ subtasks: fallbackSubtasks });
  } catch (error) {
    console.error("AI projects breakdown error:", error);
    return NextResponse.json(
      {
        subtasks: [
          "Definir alcance inicial",
          "Configurar herramientas necesarias",
          "Desarrollar la tarea principal",
          "Realizar pruebas finales"
        ]
      },
      { status: 200 }
    );
  }
}
