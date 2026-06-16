export type GlossaryCategory = 'Fundamentos' | 'Mano Izquierda' | 'Mano Derecha' | 'Teoría Aplicada';

export interface GlossaryTerm {
  id: string;
  title: string;
  category: GlossaryCategory;
  description: string;
  tips: string;
  keywords: string[]; // Variations of the word to match in text
}

export const GUITAR_GLOSSARY: GlossaryTerm[] = [
  // Fundamentos
  {
    id: "pua",
    title: "Sujeción de Púa (Pick Grip)",
    category: "Fundamentos",
    description: "La técnica base de la mano derecha. Una sujeción incorrecta causa fatiga y falta de control. La púa debe descansar en el lateral del dedo índice doblado, presionada ligeramente con el pulgar.",
    tips: "No la aprietes demasiado fuerte. Deja asomar solo un par de milímetros de la punta para mayor precisión y ataque.",
    keywords: ["púa", "pua", "uñeta", "pick", "agarre"]
  },
  {
    id: "postura",
    title: "Postura Clásica vs Moderna",
    category: "Fundamentos",
    description: "La forma en que descansas la guitarra en tu cuerpo. La clásica (guitarra entre las piernas) favorece el acceso a trastes altos, la moderna (sobre la pierna derecha) es más relajada.",
    tips: "Si sufres de dolor de espalda o muñeca, prueba usar una correa incluso estando sentado, elevando el mástil a un ángulo de 45 grados.",
    keywords: ["postura", "sentado", "espalda"]
  },

  // Mano Izquierda
  {
    id: "hammer-on",
    title: "Hammer-on (Martilleo)",
    category: "Mano Izquierda",
    description: "Tocar una nota y, sin usar la púa de nuevo, golpear fuertemente el traste siguiente con otro dedo para generar sonido. Permite frases muy rápidas.",
    tips: "El movimiento debe nacer desde el nudillo y golpear rápido como un martillo, no simplemente presionar suavemente.",
    keywords: ["hammer-on", "hammer on", "martilleo", "ligado ascendente"]
  },
  {
    id: "pull-off",
    title: "Pull-off (Tirón)",
    category: "Mano Izquierda",
    description: "La técnica complementaria al hammer-on. Al levantar un dedo de la cuerda, realizas un pequeño movimiento hacia abajo (pellizco) para hacer sonar la nota que está pisando un dedo más atrás.",
    tips: "El error común es solo levantar el dedo. Debes literalmente 'jalar' la cuerda un milímetro hacia abajo al salir.",
    keywords: ["pull-off", "pull off", "tirón", "ligado descendente"]
  },
  {
    id: "bend",
    title: "Bending (Estiramiento)",
    category: "Mano Izquierda",
    description: "Empujar o jalar la cuerda verticalmente sobre el diapasón para subir su afinación uno o dos semitonos. Es la máxima expresión vocal de la guitarra.",
    tips: "Usa 2 o 3 dedos de apoyo detrás del dedo principal (usualmente el anular) para tener fuerza suficiente al estirar.",
    keywords: ["bend", "bending", "estirar"]
  },
  {
    id: "vibrato",
    title: "Vibrato",
    category: "Mano Izquierda",
    description: "Oscilación rítmica y controlada de la afinación de una nota sostenida. Se logra moviendo ligeramente la muñeca de forma circular o pivotante.",
    tips: "El vibrato no debe ser espasmódico. Asegúrate de hacer oscilaciones uniformes en tiempo y amplitud (rítmicas).",
    keywords: ["vibrato", "vibrar"]
  },

  // Mano Derecha
  {
    id: "alternate-picking",
    title: "Alternate Picking (Púa Alternada)",
    category: "Mano Derecha",
    description: "El motor de la velocidad. Consiste en golpear la cuerda alternando estrictamente: Abajo, Arriba, Abajo, Arriba; sin importar los cambios de cuerda.",
    tips: "Inclina la púa en un ángulo de 30 grados respecto a la cuerda para que corte el metal con menos resistencia.",
    keywords: ["alternate picking", "púa alternada", "velocidad"]
  },
  {
    id: "palm-mute",
    title: "Palm Mute (Sordina)",
    category: "Mano Derecha",
    description: "Apoyar el borde exterior de la palma de la mano derecha suavemente sobre las cuerdas justo donde nacen en el puente. Da el clásico sonido 'Chug' del metal y rock.",
    tips: "Si suena muerto, mueve la mano 1 cm hacia el puente. Si suena muy abierto, muévela 1 cm hacia el mástil.",
    keywords: ["palm mute", "chug", "sordina", "apagar"]
  },
  {
    id: "sweep-picking",
    title: "Sweep Picking (Barrido)",
    category: "Mano Derecha",
    description: "Tocar notas sucesivas en cuerdas adyacentes moviendo la púa en un solo movimiento fluido (barrido), casi como rasguear un acorde pero levantando los dedos de la mano izquierda uno a uno.",
    tips: "Sincronización total: la mano izquierda debe mutear la nota anterior inmediatamente después de tocarla.",
    keywords: ["sweep picking", "barrido", "arpegios"]
  },

  // Teoría Aplicada
  {
    id: "triadas",
    title: "Tríadas en el Diapasón",
    category: "Teoría Aplicada",
    description: "Acordes básicos reducidos a solo 3 notas (Tónica, Tercera y Quinta). Fundamentales para tocar ritmos de funk, R&B o solos con mucho sentido melódico.",
    tips: "Practica ubicar las tres inversiones de un mismo acorde mayor en las cuerdas 1, 2 y 3.",
    keywords: ["triadas", "inversiones"]
  },
  {
    id: "CAGED",
    title: "Sistema CAGED",
    category: "Teoría Aplicada",
    description: "Un mapa para visualizar el diapasón dividiendo la guitarra en 5 formas de acordes básicos abiertos (C, A, G, E, D) que se conectan entre sí a lo largo del mástil.",
    tips: "Aprende primero la forma 'E' (que es la típica cejilla de Sexta cuerda) y la forma 'A' (cejilla de Quinta cuerda).",
    keywords: ["caged", "sistema caged"]
  }
];
