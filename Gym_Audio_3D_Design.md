# Arquitectura Avanzada: Gimnasio (Audio + Físicas 3D)

## 1. Visión General
Transformar la librería estática de acordes en una experiencia inmersiva. El usuario debe "sentir" el acorde visualmente mediante efectos holográficos (tilt 3D) y auditivamente mediante un motor de síntesis de guitarra real.

## 2. Tecnologías Core
*   **Web Audio API:** Para generar las frecuencias de las cuerdas en tiempo real sin depender de pesados archivos MP3.
*   **Framer Motion (useMotionValue, useTransform):** Para la física 3D basada en el puntero del mouse o giroscopio del móvil.

## 3. Implementación: Motor de Audio (AudioEngine.ts)
Crearemos una clase que mapee las notas (E2, A2, D3, G3, B3, E4) a sus frecuencias base, y le sume semitonos según el traste pisado.

```typescript
// Lógica base del sintetizador
export class GuitarAudioEngine {
  private ctx: AudioContext;
  // ...
  public playChord(positions: Position[]) {
    // 1. Calcular frecuencias de cada cuerda tocada
    // 2. Disparar oscilador tipo 'triangle' o 'sawtooth' con filtro paso-bajo
    // 3. Aplicar un pequeño delay (stagger) de ~10ms entre cuerdas para simular el rasgueo
  }
}
```

## 4. Implementación: Físicas 3D (Hologram Tilt)
En el componente `InteractiveFretboard` o la tarjeta del Gimnasio:

```tsx
const x = useMotionValue(200);
const y = useMotionValue(200);
const rotateX = useTransform(y, [0, 400], [15, -15]);
const rotateY = useTransform(x, [0, 400], [-15, 15]);

return (
  <motion.div 
    style={{ x, y, rotateX, rotateY, perspective: 1000 }}
    onMouseMove={handleMouse}
  >
    {/* Contenido del Diapasón */}
  </motion.div>
)
```

## 5. Diseño y "Wow Factor"
*   Al tocar el botón de "Reproducir Acorde", se emitirá una onda expansiva (ripple effect) desde el centro del componente.
*   Iluminar temporalmente los "puntos de los dedos" en rojo neón a medida que suena la cuerda correspondiente, sincronizado a la perfección.
