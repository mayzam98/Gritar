# Arquitectura Avanzada: Motor de Rendimiento Físico

## 1. Visión General
Transformar el módulo "Físico" de un simple cronómetro a una herramienta de entrenamiento de resistencia ("Sobrecarga Progresiva"). A medida que el tiempo avanza, la dificultad (el metrónomo) se vuelve dinámicamente más difícil.

## 2. Tecnologías Core
*   **SVG Animado (`stroke-dashoffset`):** Para el anillo de progreso circular en alta definición.
*   **React `useEffect` Loops:** Para el cálculo constante de variables de estrés (BPM interpolado).

## 3. Modelo de Sobrecarga Progresiva
```typescript
interface PhysicalExercise {
  id: string;
  name: string;
  durationSeconds: number;
  startBPM: number;  // Ej: 60
  targetBPM: number; // Ej: 120 (el objetivo final al terminar el tiempo)
}
```

## 4. Motor de Interpolación en Tiempo Real
En cada pulso (o cada segundo), la aplicación calcula la velocidad actual requerida:

```typescript
const progressRatio = timeElapsed / totalDuration;
const currentBPM = Math.floor(startBPM + (targetBPM - startBPM) * progressRatio);
// Update Metronome tempo instantly
```

## 5. Interfaz Visual: Neon Progress Ring
*   **Anillo Exterior:** El tiempo restante del ejercicio.
*   **Anillo Interior (Palpitante):** Representa el BPM actual.
*   **Efecto de Estrés Visual:** 
    *   De 0% a 50%: Color Verde Neón (Calentamiento).
    *   De 50% a 80%: Color Naranja Ámbar.
    *   De 80% a 100%: Color Rojo Vibrante con un ligero efecto de "cámara temblorosa" (Camera Shake) usando Framer Motion para simular el fallo muscular o fatiga, motivando al usuario a empujar más duro.
