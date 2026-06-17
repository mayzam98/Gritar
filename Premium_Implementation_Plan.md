# Plan de Implementación Premium (God Mode) - Gritar

Este documento detalla la arquitectura, los requisitos técnicos y los pasos secuenciales para transformar cada una de las 6 secciones de la plataforma "Gritar" en experiencias interactivas de primer nivel mundial.

---

## 1. Gimnasio (Librería de Acordes Interactiva)

### Visión Premium
Tarjetas de acordes con físicas en 3D (tilt effect) y retroalimentación auditiva real. El usuario podrá escuchar cómo suena exactamente el acorde sintetizado al tocar un botón, lo que ancla el aprendizaje visual con el entrenamiento auditivo.

### Requisitos Técnicos
*   **Web Audio API:** Para la síntesis de frecuencias (creación de un sintetizador básico de cuerdas punteadas).
*   **framer-motion:** Para animaciones de interacción y el efecto de inclinación 3D dependiente de la posición del ratón o toque.

### Pasos de Implementación
1.  **Motor de Audio:** Crear `AudioEngine.ts` en `src/core/infrastructure/audio` que mapee posiciones (cuerda/traste) a frecuencias reales en Hz (ej. A4 = 440Hz).
2.  **Sintetizador de Acordes:** Implementar un método `playChord(positions)` que dispare las frecuencias con un ligero retraso (stagger) para simular un rasgueo hacia abajo.
3.  **UI/Físicas 3D:** Modificar la tarjeta de acorde en `Gym.tsx` usando `onMouseMove` y `useMotionValue` de Framer Motion para rotar la tarjeta sutilmente en los ejes X e Y (Tilt).
4.  **Integración:** Añadir un botón premium de "Escuchar" flotando sobre el diapasón.

---

## 2. Transiciones y Constructor de Canciones (Song Builder)

### Visión Premium
El usuario no solo verá "el antes y el después", sino que verá **el movimiento** físico. Los dedos se animarán viajando a través del diapasón con trayectorias curvas y "ghost trails".
Además, se construirá un **Constructor de Ritmos y Canciones (Song Builder)**. Será un entorno interactivo donde el usuario armará patrones personalizados arrastrando y soltando elementos (flechas, bajos, puntos, silencios, arpegios) en una línea de tiempo, permitiéndole concatenar múltiples acordes para estructurar canciones completas paso a paso.

### Requisitos Técnicos
*   **Animaciones SVG:** Interpolación de coordenadas `x` e `y` y trayectorias de Bézier.
*   **Audio (Metrónomo Complejo):** Mapeo de frecuencias distintas para bajos (B) y apagados (X).
*   **Drag & Drop UI:** Librería como `@dnd-kit/core` para arrastrar piezas rítmicas o bloques de acordes en la línea de tiempo.

### Pasos de Implementación
1.  **Refactor del Visualizador:** Implementar trayectorias fantasma (Ghost Trails) y saltos parabólicos en la animación de las posiciones. *(Completado)*
2.  **Lógica del Metrónomo Polifónico:** Integrar un selector de ritmos latinos con sonidos característicos para bajos y apagados. *(Completado)*
3.  **Módulo Song Builder (Próxima Fase):** Diseñar una paleta de arrastrar y soltar (Drag & Drop) con herramientas rítmicas (↓, ↑, B, X, •, Arpegio).
4.  **Línea de Tiempo de Acordes:** Crear una pista (track) donde el usuario pueda encolar secuencias como `[Acorde C] -> [Patrón Pop] -> [Acorde Am] -> [Patrón Arpegio]`.
5.  **Motor de Secuencia:** Expandir el loop del metrónomo para recorrer el array de la línea de tiempo, ejecutando toda la canción de manera autónoma.

---

## 3. Físico (Motor de Rendimiento Deportivo)

### Visión Premium
Visualización de progreso estilo fitness. Un anillo de progreso de neón en lugar de texto plano. Un sistema de "Sobrecarga Progresiva" donde el BPM aumenta dinámicamente a medida que el temporizador avanza, forzando al usuario al límite.

### Requisitos Técnicos
*   **SVG Animado:** Para el anillo de progreso circular.
*   **Lógica de Rampa:** Algoritmo que aumente variables linealmente a lo largo del tiempo.

### Pasos de Implementación
1.  **Componente Circular:** Crear `NeonProgressRing.tsx` usando un SVG con `stroke-dasharray` animado según el porcentaje de tiempo restante.
2.  **BPM Dinámico:** Modificar el modelo de `Exercise` para incluir `startBpm` y `targetBpm`.
3.  **Lógica del Temporizador:** En `PhysicalExercises.tsx`, calcular el BPM actual en cada segundo: `currentBpm = startBpm + ((targetBpm - startBpm) * progressPercentage)`.
4.  **Diseño:** Añadir gradientes de color al anillo (ej. Verde al inicio, Naranja en medio, Rojo vibrante en los últimos 10 segundos).

---

## 4. Creaciones (El Laboratorio Compartible)

### Visión Premium
El acorde creado no solo se guarda, sino que se diagnostica detalladamente. Se permite tocar individualmente cada cuerda para buscar notas muertas, y se puede exportar el resultado como una imagen gráfica pulida para Instagram/WhatsApp.

### Requisitos Técnicos
*   **html-to-image:** Librería para rasterizar el componente DOM a PNG/JPEG.
*   **Web Audio API:** Reproducción individual por posición.

### Pasos de Implementación
1.  **Reproductor de Punteo:** En `InteractiveFretboard`, añadir un evento `onClick` a las cuerdas/posiciones activas para emitir el sonido de esa nota específica (AudioEngine).
2.  **Tarjetas de Diagnóstico:** Rediseñar la sección de "Análisis Inteligente" para que los "Tags" (Ej: "Disonante", "Tensión") parezcan sellos holográficos.
3.  **Exportación Visual:** Implementar un botón "Compartir Descubrimiento". Usar `html-to-image` para capturar el componente de la tarjeta, añadir una marca de agua estilizada de "Gritar" y descargarla en el dispositivo del usuario.

---

## 5. Técnica (Academia Gamificada)

### Visión Premium
Un aspecto de curso de "Masterclass". En lugar de modales flotantes simples, habrá un seguimiento de progreso persistente ("15% de Fundamentos Dominados") y animaciones SVG o micro-interacciones que den vida al concepto.

### Requisitos Técnicos
*   **Zustand (Store):** Añadir un array de `masteredTechniques: string[]`.
*   **Framer Motion:** Micro-animaciones abstractas.

### Pasos de Implementación
1.  **Estado Persistente:** Añadir `markTechniqueAsMastered` a `store.ts`.
2.  **Barra de Progreso:** Diseñar un encabezado de Academia que muestre una barra de progreso global basada en cuántas técnicas tienen el estado "mastered".
3.  **Animaciones Conceptuales:** Crear componentes reactivos. Por ejemplo, para "Vibrato", un componente que muestre una línea recta que, al pasar el ratón, comience a ondularse como una onda senoidal.
4.  **UI de Celebración:** Añadir un efecto sutil de celebración (glow o confeti) cuando un usuario hace clic en "¡Dominado!".

---

## 6. Repertorio (Sincronización YouTube-Mástil Modo Dios)

### Visión Premium
El Santo Grial del proyecto. Reproducir el video de YouTube en una ventana pequeña superior mientras que el diapasón interactivo grande abajo se ilumina y cambia de acordes de forma totalmente sincronizada con el video, sirviendo como un clon exacto de lo que hace el profesor.

### Requisitos Técnicos
*   **YouTube IFrame API / react-youtube:** Para controlar el reproductor y obtener el tiempo actual (`getCurrentTime()`) a 60 fps.

### Pasos de Implementación
1.  **Incrustar Reproductor:** Crear el componente `YouTubeSyncPlayer.tsx` utilizando la API de YouTube para cargar el video sin salir de la app.
2.  **Bucle de Sincronización:** Implementar un `requestAnimationFrame` o un intervalo de alta frecuencia (cada 100ms) que lea el tiempo actual del video.
3.  **Match de Acordes:** Comparar el tiempo actual con el array `chordTimestamps`. Cuando el tiempo cruce un umbral, extraer el acorde y enviarlo al estado del componente.
4.  **Actualización Dinámica:** Renderizar el `FretboardVisualizer` con las posiciones del acorde activo en tiempo real. Añadir una transición suave para que el salto de los dedos se vea natural y guíe la vista.
