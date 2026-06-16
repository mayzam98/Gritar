export interface GlossaryTerm {
  id: string;
  title: string;
  description: string;
  tips: string;
  keywords: string[]; // Variations of the word to match in text
}

export const GUITAR_GLOSSARY: GlossaryTerm[] = [
  {
    id: "hammer-on",
    title: "Hammer-on (Martilleo)",
    description: "Técnica donde tocas una nota y luego 'martilleas' con otro dedo de la mano izquierda en un traste más agudo de la misma cuerda para que suene sin volver a usar la púa.",
    tips: "Golpea la cuerda con fuerza y precisión usando la punta del dedo.",
    keywords: ["hammer-on", "hammer on", "martilleo"]
  },
  {
    id: "pull-off",
    title: "Pull-off (Tirón)",
    description: "Lo opuesto al Hammer-on. Tienes dos dedos pisando la misma cuerda; al levantar el dedo más agudo, 'jalas' ligeramente la cuerda hacia abajo para que suene la nota que está pisando el otro dedo.",
    tips: "No solo levantes el dedo, pellizca un poco la cuerda al salir.",
    keywords: ["pull-off", "pull off", "tirón"]
  },
  {
    id: "pua",
    title: "Púa (Uñeta / Pick)",
    description: "Pequeña pieza de plástico usada para golpear las cuerdas con la mano derecha. 'Púa alternada' significa tocar una vez hacia abajo y la siguiente hacia arriba estrictamente.",
    tips: "Sostén la púa entre el pulgar y el índice, dejando asomar solo la punta.",
    keywords: ["púa", "pua", "uñeta", "pick"]
  },
  {
    id: "traste",
    title: "Traste (Fret)",
    description: "Los separadores de metal en el mástil de la guitarra. Pisar un traste acorta la vibración de la cuerda y cambia la nota musical.",
    tips: "Pisa la cuerda justo detrás de la barrita de metal (no encima ni muy atrás) para que el sonido sea limpio y no trastee.",
    keywords: ["traste", "trastes", "fret", "frets"]
  },
  {
    id: "cromatico",
    title: "Escala Cromática",
    description: "Tocar notas consecutivas traste por traste (ej: 1, 2, 3, 4). Es el ejercicio fundamental para ganar independencia y fuerza en los dedos.",
    tips: "Usa un dedo diferente para cada traste (índice al 1, medio al 2, anular al 3, meñique al 4).",
    keywords: ["cromático", "cromatico"]
  },
  {
    id: "diapason",
    title: "Diapasón (Fretboard)",
    description: "La madera plana a lo largo del mástil donde se encuentran los trastes y donde presionas las cuerdas con los dedos.",
    tips: "Mantén el pulgar apoyado en la parte de atrás del mástil para tener buena presión en el diapasón.",
    keywords: ["diapasón", "diapason", "mástil", "mastil"]
  }
];
