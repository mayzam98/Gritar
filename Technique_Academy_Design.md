# Arquitectura Avanzada: Academia Gamificada (Técnica)

## 1. Visión General
El módulo de Técnica dejará de ser una simple enciclopedia para convertirse en una **Masterclass Gamificada**. Conceptos abstractos como "Vibrato" o "Palm Mute" serán enseñados a través de micro-animaciones interactivas.

## 2. Sistema de Progreso Persistente
Necesitamos expandir el Store Global para rastrear la experiencia del usuario.

```typescript
// En store.ts
interface AppState {
  // ...
  masteredTechniques: string[]; // ['vibrato', 'hammer-on']
  markTechniqueAsMastered: (id: string) => void;
}
```

## 3. Micro-Animaciones Conceptuales (El Core)
En lugar de texto, usaremos componentes que "demuestren" físicamente el concepto.

*   **Vibrato:** Un componente SVG con una línea de cuerda `path`. Cuando el usuario le hace hover, la línea recta cambia suavemente a una onda senoidal animada (usando `d` paths variables en Framer Motion).
*   **Palm Mute:** Un bloque de sonido que se "apaga" bruscamente.
*   **Bending:** Una flecha SVG que se curva hacia arriba en tiempo real.

## 4. UI de Celebración (Gamificación)
Implementación de refuerzos positivos en el flujo de usuario:
*   Barra de progreso global de nivel: "Nivel 2: Explorador de Trastes (15% técnicas dominadas)".
*   Al marcar una técnica como "Dominada", la tarjeta explota en confeti digital ligero (usando `react-confetti` o una solución SVG nativa) y adquiere un borde dorado brillante permanente para indicar la maestría.
