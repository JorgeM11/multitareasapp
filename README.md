# Sistema Multitarea (PWA Hub)

Este es un hub centralizado en forma de **Progressive Web App (PWA)** desarrollado con **Next.js (App Router)**, **Tailwind CSS v4**, y diseñado bajo estrictos criterios de accesibilidad (**WCAG 2.1 AA**). El hub sirve como contenedor modular para mini-aplicaciones de productividad optimizadas para cualquier dispositivo.

---

## 🚀 Arquitectura General y PWA

*   **Diseño Responsivo Intuitivo**: Grid de navegación principal adaptado a pantallas de escritorio y móviles. En dispositivos móviles, las mini-aplicaciones se muestran en forma de menú de accesos compactos (ícono + título).
*   **Branding y Assets**: Integración del logotipo oficial (`logo_app1.png`) configurado con proporción cuadrada y recorte `object-cover`.
*   **PWA Integrado**: Configurado con manifiesto dinámico (`manifest.js`) que define el inicio standalone, color de tema oscuro y provee los íconos de instalación en resoluciones estándar (`192x192`, `512x512` y variante `maskable` para Android).
*   **SEO de Alto Rendimiento**: Incluye `metadataBase`, metaetiquetas Open Graph (OG) y Twitter Cards en `layout.js` para previsualizar la carátula y el logo oficial al compartir enlaces de la aplicación.
*   **Prevención de Zoom en Móviles**: Viewport configurado estrictamente para evitar el auto-zoom nativo al interactuar con inputs en dispositivos móviles, mejorando la ergonomía de uso.

---

## 🛠️ Mini-Aplicaciones Integradas

### 1. Conversor y Monitor de Divisas (`/conversor`)
*   **Cotizaciones Reales (Venezuela)**: Consume las tasas oficiales en tiempo real del Banco Central de Venezuela (BCV) para **Dólar (USD)** y **Euro (EUR)** directamente desde los endpoints de DolarApi (`ve.dolarapi.com`). Las tasas no varían por compra/venta, operando bajo el valor único de referencia (`promedio`).
*   **Calculadora de Conversión**: Permite realizar cálculos cruzados entre USD, EUR y VES. Incluye un botón para intercambiar monedas (Swap `⇄`) con lógica de división automática e inversas.
*   **Micro-animaciones**: Botón de actualizar tasas con animación de rotación de 180° en hover y giro continuo (`animate-spin`) en carga.
*   **CustomSelect**: Menú de selección de divisas de vidrio oscuro con animaciones fluidas de entrada (escala/desvanecimiento), flecha giratoria y badges circulares para las monedas.

### 2. Notas (`/notas`) [Hito 3]
*   **Chat Conversacional con IA y Memoria Contextual**: Interfaz interactiva donde el usuario puede redactar sus notas o dar órdenes. Al enviar un mensaje, se invoca a la API de **Google Gemini 2.5 Flash** (`/api/ai`) enviando el historial reciente (`chatHistory`) para mantener memoria contextual de la conversación.
*   **Gestión de Recordatorios con Notificación**:
    *   Si el usuario indica un recordatorio sin fecha u hora, la IA detecta la omisión y responde preguntando amigablemente por los detalles de la agenda.
    *   Al recibir los datos, se calcula y almacena la marca de tiempo correspondiente en `reminderDate` (calculada dinámicamente según la hora local de Venezuela enviada en el prompt).
    *   Un observador en segundo plano en la app monitorea la hora local; al cumplirse el plazo, dispara una **Notificación Nativa del Navegador** en el sistema operativo y marca la nota/tarea automáticamente como completada.
*   **Acciones Autónomas**: La IA no solo crea notas, sino que analiza las notas activas para **actualizar**, **marcar como completada/incompleta** o **eliminar** notas existentes basándose en el lenguaje natural del usuario (ej: *"actualiza la nota de mercado y ponle comprar cilantro"*, *"borra el recordatorio de las 3pm"*).
*   **Fallback Local Inteligente**: Si la variable `GEMINI_API_KEY` no está configurada, la ruta API utiliza un avanzado parser por expresiones regulares a nivel de servidor que simula el procesamiento inteligente de la IA, permitiendo incluso agendar recordatorios de prueba cortos (ej: "en 10 segundos") y disparar notificaciones.
*   **Listas de Tareas (Checklists)**: Si la nota redactada contiene múltiples elementos (separados por comas, conjunciones o saltos de línea), el sistema la convierte automáticamente en un **checklist interactivo**. Cada elemento cuenta con un checkbox independiente para marcarlo como completado, y al tachar todos los elementos, la nota entera se auto-completa.
*   **Editor de Notas Manual Expandido**: En la pestaña "Secciones y Notas" se puede hacer clic en cualquier tarjeta o en el botón **"Abrir"** (representado con un ícono de edición de React Icons) para desplegar un editor modal expandido de alta definición (`max-w-xl`), con una caja de texto de **10 filas de altura** para redactar cómodamente. Si se escriben varias líneas en la descripción, se convertirá automáticamente en checklist.
*   **Scroll en Categorías**: El selector de categorías dentro del modal utiliza `CustomSelect` limitado a una altura máxima de **`max-h-[142px]`** para encuadrar exactamente tres categorías en pantalla, forzando un scroll vertical para revelar las demás.
### 3. Finanzas (`/finanzas`) [Hito 4]
*   **Balance Consolidado**: Resumen en tiempo real del **Balance Total** (verde/rojo según tendencia), **Ingresos** (verde esmeralda) y **Egresos** (carmesí suave).
*   **Registro Manual de Movimientos**: Formulario de carga rápida de transacciones. Permite conmutar dinámicamente entre Ingresos y Gastos, filtrando las categorías adecuadas y asignándolas vía `CustomSelect`.
*   **Límites de Presupuesto Mensual**: Panel interactivo para configurar el presupuesto máximo de gastos mensuales por sección (Alimentos, Servicios, Transporte, Ocio, Varios).
*   **Alertas Visuales de Consumo**:
    *   Gasto < 80%: Barra de progreso de color azul.
    *   Gasto >= 80%: Barra de progreso de color amarillo/naranja con badge de advertencia.
    *   Gasto >= 100%: Barra de progreso de color rojo parpadeante (`animate-pulse`) con advertencia crítica de límite superado.
*   **Historial de Transacciones**: Lista detallada de registros filtrable por tipo y categoría, con opción de eliminación y recálculo automático de balances.
*   **Sincronización**: Almacenamiento local automático en `localStorage`.
*   **Registro Automatizado por IA [Hito 5]**:
    *   **Consola de Asistente IA**: Módulo interactivo de chat integrado en el Dashboard financiero para registrar o eliminar movimientos mediante comandos escritos en lenguaje natural (ej: *"gaste 450 en farmacia hoy"*).
    *   **Procesamiento de Lenguaje Natural**: Conexión con la API de Gemini 2.5 Flash (`/api/finanzas/ai`) que procesa la frase y la mapea en variables estructuradas (monto, tipo, categoría y descripción), con soporte para calcular fechas de comandos relativos (ej: *"ayer"*, *"el lunes"*).
    *   **Fallback por Expresiones Regulares**: Intérprete alternativo local en Node.js que procesa comandos simulados en caso de desconexión o falta de API Key en el entorno.
    *   **Persistencia de Consola**: El historial de interacción con el asistente financiero se almacena localmente en `localStorage`.
*   **Gráficos de Distribución SVG y Asesor Financiero [Hito 6]**:
    *   **Gráfico de Dona Dinámico**: Representación visual circular utilizando elementos `<circle>` en SVG puro para reflejar la proporción de gastos del mes.
    *   **Interactividad SVG**: Efecto de transición en hover que incrementa dinámicamente el grosor del segmento y despliega tooltip detallado.
    *   **Leyenda Inteligente**: Desglose lateral con colores coincidentes que reporta el monto total consumido por sección en VES y su porcentaje.
    *   **Consejo de IA**: Botón interactivo *"Pedir Análisis a Asistente IA"* que abre el popover de chat y gatilla una solicitud de análisis a Gemini, quien emite un diagnóstico financiero estructurado e identifica la principal fuga de capital.

### 4. Proyectos y Listas Inteligentes (`/proyectos`)
*   **Vistas de Tablero y Lista**: Alterna entre una interfaz visual de **Tablero Kanban** ("Por Hacer", "En Progreso", "Completado") ideal para computadoras, y una **Vista de Lista** compacta y tabular para visualizar rápidamente los detalles de vencimiento y prioridad.
*   **Desglose de Tareas Asistido por IA**: Endpoint `/api/proyectos/ai` conectado con **Gemini 2.5 Flash** que toma el título y descripción de cualquier tarea compleja y genera un desglose secuencial de 4 a 6 subtareas lógicas y accionables.
*   **Interactividad y Progreso**: Visualización dinámica del porcentaje de subtareas completadas por tarea, con una barra de progreso que se actualiza en tiempo real.
*   **Diseño Responsivo e Iconografía Unificada**: Integración total de **React Icons** (`react-icons/fa`) para todos los elementos interactivos (cerrar, eliminar, editar, avanzar/retroceder en móvil, agregar y asistente de IA), evitando emojis genéricos en los botones de control.
*   **Sincronización Local**: Carga con proyectos semilla de demostración en su primer inicio y almacena el estado completo en `localStorage` para persistencia continua.

---

## 📋 Configuración y Ejecución Local

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno**:
    Crea un archivo `.env.local` en la raíz del proyecto y agrega tu API Key de Gemini:
    ```env
    GEMINI_API_KEY=tu_clave_api_de_google_studio_aqui
    ```
3.  **Correr en modo desarrollo**:
    ```bash
    npm run dev
    ```
4.  **Generar compilación de producción**:
    ```bash
    npm run build
    ```
5.  **Correr compilación local**:
    ```bash
    npm run start
    ```
