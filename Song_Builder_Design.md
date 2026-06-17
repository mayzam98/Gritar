# Arquitectura Avanzada: Secuenciador / Song Builder

## 1. Visión General
El **Secuenciador** es un módulo completamente nuevo que evoluciona el concepto de "Transiciones". En lugar de alternar entre dos acordes, permite al usuario construir una pista (track) completa, ensamblando acordes y patrones rítmicos en una línea de tiempo horizontal.

## 2. Reutilización de Componentes Core
Para mantener la uniformidad visual y aprovechar el trabajo previo, el Secuenciador consumirá:
*   `StrummingVisualizer.tsx`: Para renderizar los bloques rítmicos dentro de la línea de tiempo.
*   `InteractiveFretboard.tsx` / `FretboardVisualizer.tsx`: Para previsualizar el acorde seleccionado en la cabeza lectora (playhead).
*   `store.ts`: Consumo directo de `savedSongs` y la librería base de `CORE_CHORDS`.

## 3. Modelo de Datos (Domain)
Se requiere un nuevo modelo en el estado global para representar un "Ensayo" o "Secuencia":

```typescript
interface SongSequence {
  id: string;
  name: string;
  bpm: number;
  timeSignature: string; // ej. "4/4"
  blocks: SequenceBlock[];
}

interface SequenceBlock {
  id: string;
  type: 'CHORD' | 'RHYTHM' | 'REST';
  value: any; // Acorde detallado o Patrón de Rasgueo
  durationBeats: number;
}
```

## 4. Diseño de la Interfaz (UI/UX)
La pantalla se dividirá en 3 zonas principales:
1.  **Panel de Herramientas (Arriba/Izquierda):** Un carrusel o cuadrícula con los Acordes (importados del repertorio o base) y los Ritmos disponibles.
2.  **Línea de Tiempo (Centro):** Una interfaz *Drag & Drop* (usando `@dnd-kit/core` o similar). Un carril horizontal donde el usuario arrastra las tarjetas de herramientas.
3.  **Reproductor y Visualizador (Abajo):** El botón de Play, control de BPM, y el `FretboardVisualizer` gigante que reacciona a la cabeza lectora de la línea de tiempo.

## 5. El Motor de Secuencia (The Playhead)
El corazón del módulo. Un `useEffect` acoplado a un `AudioContext` que avance de beat en beat.
*   Determinará qué bloque está activo.
*   Si es un bloque de "Acorde", enviará las coordenadas al `FretboardVisualizer`.
*   Si es un bloque de "Ritmo", leerá el array de pasos (`['↓', 'X', '↑']`) y disparará el sonido correspondiente (Tick o Mute) sincronizado visualmente iluminando la flecha en el `StrummingVisualizer` incrustado.

## 6. Siguientes Pasos
1. Instalar `@dnd-kit/core` y `@dnd-kit/sortable` para la lógica de arrastrar y soltar.
2. Crear la vista `Sequencer.tsx` y añadirla a `App.tsx` y `BottomNav.tsx`.
3. Mapear el estado inicial y el motor de tiempo.
