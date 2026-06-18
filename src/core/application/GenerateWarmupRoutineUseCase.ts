import { Exercise } from '../domain/Exercise';
import type { HandCategory, Position } from '../domain/Exercise';

export class GenerateWarmupRoutineUseCase {
  execute(category?: HandCategory): Exercise[] {
    const allExercises: Exercise[] = [
      // ----------------------------------------------------
      // LEFT HAND EXERCISES
      // ----------------------------------------------------
      new Exercise(
        'lh1',
        'Araña Cromática (1-2-3-4)',
        'Ejercicio fundamental para la independencia de los dedos de la mano izquierda en la 6ta cuerda.',
        'LEFT_HAND',
        60,
        60,
        80,
        '',
        [
          'Coloca el dedo índice en el traste 1.',
          'Usa un dedo diferente para cada traste consecutivo (1-2-3-4).',
          'Mantén los dedos cerca del diapasón al levantarlos.'
        ],
        undefined,
        [
          [{ string: 6, fret: 1, finger: 1, color: '#3b82f6', id: 'active' }],
          [{ string: 6, fret: 2, finger: 2, color: '#eab308', id: 'active' }],
          [{ string: 6, fret: 3, finger: 3, color: '#22c55e', id: 'active' }],
          [{ string: 6, fret: 4, finger: 4, color: '#ef4444', id: 'active' }]
        ]
      ),
      new Exercise(
        'lh2',
        'Estiramiento (1-3-2-4)',
        'Mejora la elasticidad y apertura de la mano izquierda cruzando dedos.',
        'LEFT_HAND',
        60,
        50,
        70,
        '',
        [
          'Toca el traste 1 con el índice.',
          'Estira al traste 3 con el anular.',
          'Vuelve al traste 2 con el medio.',
          'Sube al traste 4 con el meñique.'
        ],
        undefined,
        [
          [{ string: 5, fret: 1, finger: 1, id: 'active' }],
          [{ string: 5, fret: 3, finger: 3, id: 'active' }],
          [{ string: 5, fret: 2, finger: 2, id: 'active' }],
          [{ string: 5, fret: 4, finger: 4, id: 'active' }]
        ]
      ),
      new Exercise(
        'lh3',
        'Trinos (Hammer-On / Pull-Off)',
        'Desarrolla fuerza explosiva usando ligados.',
        'LEFT_HAND',
        45,
        70,
        90,
        '',
        [
          'Pisa el traste 5 con el índice y mantenlo anclado.',
          'Haz un hammer-on rápido al traste 6 con el medio.',
          'Haz un pull-off para volver al 5.'
        ],
        undefined,
        [
          [{ string: 3, fret: 5, finger: 1, color: '#a855f7', id: 'hammer1' }],
          [{ string: 3, fret: 5, finger: 1, color: '#a855f7', id: 'hammer1' }, { string: 3, fret: 6, finger: 2, color: '#ef4444', id: 'hammer2' }]
        ]
      ),
      new Exercise(
        'lh4',
        'Salto de Cuerdas en Zigzag',
        'Mejora la precisión vertical de los dedos al cambiar de cuerdas.',
        'LEFT_HAND',
        60,
        55,
        75,
        '',
        [
          'Traste 5 en 6ta cuerda (índice).',
          'Traste 6 en 5ta cuerda (medio).',
          'Traste 7 en 4ta cuerda (anular).',
          'Traste 8 en 3ra cuerda (meñique).'
        ],
        undefined,
        [
          [{ string: 6, fret: 5, finger: 1, id: 'active' }],
          [{ string: 5, fret: 6, finger: 2, id: 'active' }],
          [{ string: 4, fret: 7, finger: 3, id: 'active' }],
          [{ string: 3, fret: 8, finger: 4, id: 'active' }]
        ]
      ),
      new Exercise(
        'lh5',
        'Escala Pentatónica Menor (Am)',
        'Memoria muscular para la escala más usada en el rock.',
        'LEFT_HAND',
        60,
        80,
        100,
        '',
        [
          'Toca las notas de la caja 1 de La Menor Pentatónica.',
          'Trastes 5 y 8 en la 6ta cuerda.',
          'Trastes 5 y 7 en la 5ta, 4ta y 3ra.'
        ],
        undefined,
        [
          [{ string: 6, fret: 5, finger: 1, id: 'active' }],
          [{ string: 6, fret: 8, finger: 4, id: 'active' }],
          [{ string: 5, fret: 5, finger: 1, id: 'active' }],
          [{ string: 5, fret: 7, finger: 3, id: 'active' }],
          [{ string: 4, fret: 5, finger: 1, id: 'active' }],
          [{ string: 4, fret: 7, finger: 3, id: 'active' }]
        ]
      ),
      new Exercise(
        'lh6',
        'Ligados Descendentes (Pull-offs)',
        'Fortalece los dedos al "jalar" la cuerda hacia abajo.',
        'LEFT_HAND',
        60,
        60,
        90,
        '',
        [
          'Coloca los 4 dedos en la segunda cuerda (trastes 1, 2, 3, 4).',
          'Tira del meñique (4) hacia abajo para que suene el anular (3).',
          'Repite sucesivamente hasta llegar al índice (1).'
        ],
        undefined,
        [
          [
            { string: 2, fret: 4, finger: 4, color: '#ef4444', id: 'f4' }, 
            { string: 2, fret: 3, finger: 3, color: '#22c55e', id: 'f3' }, 
            { string: 2, fret: 2, finger: 2, color: '#eab308', id: 'f2' }, 
            { string: 2, fret: 1, finger: 1, color: '#3b82f6', id: 'f1' }
          ],
          [
            { string: 2, fret: 3, finger: 3, color: '#22c55e', id: 'f3' }, 
            { string: 2, fret: 2, finger: 2, color: '#eab308', id: 'f2' }, 
            { string: 2, fret: 1, finger: 1, color: '#3b82f6', id: 'f1' }
          ],
          [
            { string: 2, fret: 2, finger: 2, color: '#eab308', id: 'f2' }, 
            { string: 2, fret: 1, finger: 1, color: '#3b82f6', id: 'f1' }
          ],
          [
            { string: 2, fret: 1, finger: 1, color: '#3b82f6', id: 'f1' }
          ]
        ]
      ),
      new Exercise(
        'lh7',
        'Independencia: 1-4-2-3',
        'Rompe los patrones habituales del cerebro para ganar agilidad.',
        'LEFT_HAND',
        60,
        50,
        85,
        '',
        [
          'Usa la 3ra cuerda.',
          'Toca el traste 1, luego salta al 4.',
          'Vuelve al 2, y luego al 3.',
          'Este cruce de dedos entrena los tendones independientes.'
        ],
        undefined,
        [
          [{ string: 3, fret: 1, finger: 1, color: '#3b82f6', id: 'active' }],
          [{ string: 3, fret: 4, finger: 4, color: '#ef4444', id: 'active' }],
          [{ string: 3, fret: 2, finger: 2, color: '#eab308', id: 'active' }],
          [{ string: 3, fret: 3, finger: 3, color: '#22c55e', id: 'active' }]
        ]
      ),
      new Exercise(
        'lh8',
        'Deslizamientos (Slides)',
        'Suaviza la fricción y conecta posiciones del mástil rápidamente.',
        'LEFT_HAND',
        60,
        60,
        80,
        '',
        [
          'Pisa el traste 5 de la 4ta cuerda con el dedo índice.',
          'Sin soltar la presión, desliza el dedo hasta el traste 7.',
          'Deslízalo de vuelta al 5.'
        ],
        undefined,
        [
          [{ string: 4, fret: 5, finger: 1, color: '#a855f7', id: 'active' }],
          [{ string: 4, fret: 7, finger: 1, color: '#a855f7', id: 'active' }]
        ]
      ),

      // ----------------------------------------------------
      // RIGHT HAND EXERCISES (Focus on Strumming/Picking)
      // ----------------------------------------------------
      new Exercise(
        'rh1',
        'Púa Alternada Estricta',
        'Desarrolla velocidad y sincronización en la mano derecha (cuerda abierta).',
        'RIGHT_HAND',
        60,
        80,
        120,
        '',
        [
          'Toca al aire la 6ta cuerda con movimiento Abajo.',
          'Toca la misma cuerda con movimiento Arriba.',
          'El movimiento debe nacer de la muñeca.'
        ],
        undefined, // No left hand positions needed
        undefined,
        ['↓', '↑', '↓', '↑', '↓', '↑', '↓', '↑']
      ),
      new Exercise(
        'rh2',
        'Palm Mute Continuo (Metal)',
        'Construye resistencia (stamina) rítmica pesada.',
        'RIGHT_HAND',
        60,
        100,
        140,
        '',
        [
          'Coloca el borde de tu mano sobre el puente.',
          'Toca corcheas constantes hacia abajo en la 6ta cuerda.',
          'Mantén la tensión uniforme.'
        ],
        undefined,
        undefined,
        ['↓', '↓', '↓', '↓', '↓', '↓', '↓', '↓']
      ),
      new Exercise(
        'rh3',
        'Galope de Caballería',
        'El ritmo clásico de Iron Maiden. Un golpe de corchea y dos semicorcheas.',
        'RIGHT_HAND',
        45,
        90,
        130,
        '',
        [
          'Toca Abajo (pausa breve) - Abajo - Arriba.',
          'El acento va en el primer golpe hacia abajo.'
        ],
        undefined,
        undefined,
        ['↓', '-', '↓', '↑', '↓', '-', '↓', '↑']
      ),
      new Exercise(
        'rh4',
        'Rasgueo Funk con Muteos',
        'Afloja la muñeca y desarrolla groove rítmico.',
        'RIGHT_HAND',
        60,
        80,
        110,
        '',
        [
          'Rasgueo de semicorcheas continuo (16th notes).',
          'Intercala rasgueos limpios con golpes muteados (X).',
          'La mano no debe detenerse nunca.'
        ],
        undefined,
        undefined,
        ['↓', '↑X', '↓X', '↑', '↓X', '↑X', '↓', '↑X']
      ),
      new Exercise(
        'rh5',
        'Cross-Picking Básico',
        'Precisión al saltar cuerdas con la púa en un arpegio.',
        'RIGHT_HAND',
        60,
        60,
        80,
        '',
        [
          'Toca 6ta Abajo, 4ta Arriba, 5ta Abajo, 3ra Arriba.',
          'Mantén la púa paralela a las cuerdas.'
        ],
        undefined,
        undefined,
        ['B', '↑', '↓', '↑']
      ),
      new Exercise(
        'rh6',
        'Tresillos de Púa (Triplets)',
        'Interioriza el ritmo de 3/4 o blues shuffle.',
        'RIGHT_HAND',
        60,
        70,
        100,
        '',
        [
          'Agrupa los rasgueos de a tres: 1-2-3, 1-2-3.',
          'La púa será Abajo-Arriba-Abajo, y luego Arriba-Abajo-Arriba.',
          'Siente el acento cada tres golpes.'
        ],
        undefined,
        undefined,
        ['↓', '↑', '↓', '↑', '↓', '↑']
      ),
      new Exercise(
        'rh7',
        'Economy Sweep Muteado',
        'Eficiencia absoluta: la púa "cae" a través de las cuerdas en lugar de saltarlas.',
        'RIGHT_HAND',
        60,
        60,
        90,
        '',
        [
          'Mutea las cuerdas con tu mano izquierda (no pises, solo apoya).',
          'Púa hacia Abajo 3 veces seguidas empujando.',
          'Púa hacia Arriba 3 veces jalando.'
        ],
        undefined,
        undefined,
        ['↓', '↓', '↓', '↑', '↑', '↑']
      ),
      new Exercise(
        'rh8',
        'Rasgueo de Balada (Fogata)',
        'El patrón rítmico más famoso del mundo pop/rock.',
        'RIGHT_HAND',
        60,
        65,
        90,
        '',
        [
          'Aprende el clásico: Abajo, Abajo-Arriba, Arriba-Abajo-Arriba.',
          'El secreto está en mantener la mano moviéndose en los silencios (-).'
        ],
        undefined,
        undefined,
        ['↓', '-', '↓', '↑', '-', '↑', '↓', '↑']
      ),

      // ----------------------------------------------------
      // BOTH HANDS EXERCISES
      // ----------------------------------------------------
      new Exercise(
        'bh1',
        'Sincronización Total',
        'Alinea el cerebro: la púa debe golpear exactamente cuando el dedo pisa el traste.',
        'BOTH',
        60,
        70,
        100,
        '',
        [
          'Escala cromática 1-2-3-4.',
          'Cada dedo debe corresponder a un movimiento de púa alternada.'
        ],
        undefined,
        [
          [{ string: 6, fret: 1, finger: 1, id: 'active' }],
          [{ string: 6, fret: 2, finger: 2, id: 'active' }],
          [{ string: 6, fret: 3, finger: 3, id: 'active' }],
          [{ string: 6, fret: 4, finger: 4, id: 'active' }]
        ],
        ['↓', '↑', '↓', '↑']
      ),
      new Exercise(
        'bh2',
        'Cambio de Acordes Rápidos',
        'Memoria muscular para no detener el ritmo.',
        'BOTH',
        90,
        75,
        105,
        '',
        [
          'Alterna entre Do Mayor (C) y Sol Mayor (G).',
          'El rasgueo NUNCA se detiene, incluso si la mano izquierda se atrasa.'
        ],
        [
          { string: 5, fret: 3, finger: 3 }, { string: 4, fret: 2, finger: 2 }, { string: 2, fret: 1, finger: 1 },
          { string: 6, fret: 3, finger: 2, color: '#f59e0b' }, { string: 5, fret: 2, finger: 1, color: '#f59e0b' }, { string: 1, fret: 3, finger: 3, color: '#f59e0b' }
        ],
        [
          [{ string: 5, fret: 3, finger: 3 }, { string: 4, fret: 2, finger: 2 }, { string: 2, fret: 1, finger: 1 }],
          [{ string: 6, fret: 3, finger: 2 }, { string: 5, fret: 2, finger: 1 }, { string: 1, fret: 3, finger: 3 }]
        ],
        ['↓', '↓', '↑', '↑', '↓', '↑']
      ),
      new Exercise(
        'bh3',
        'Sweep Picking Intro (3 Cuerdas)',
        'Fluidez al "barrer" las cuerdas en una sola dirección.',
        'BOTH',
        60,
        60,
        90,
        '',
        [
          'Arpegio Menor en las 3 primeras cuerdas (trastes 12-10-9).',
          'La mano derecha es un solo empuje fluido hacia abajo.',
          'La mano izquierda "rueda" los dedos para que no suene como acorde.'
        ],
        undefined,
        [
          [{ string: 3, fret: 9, finger: 1, id: 'active' }],
          [{ string: 2, fret: 10, finger: 2, id: 'active' }],
          [{ string: 1, fret: 12, finger: 4, id: 'active' }],
          [{ string: 1, fret: 8, finger: 1, id: 'active' }] // Pull off
        ],
        ['↓', '↓', '↓', '↑']
      ),
      new Exercise(
        'bh4',
        'Independencia Polirrítmica',
        'Mano izquierda haciendo ligados mientras la derecha rasguea al aire.',
        'BOTH',
        45,
        50,
        70,
        '',
        [
          'Haz ligados (hammer-on) en la 5ta cuerda repetidamente.',
          'Al mismo tiempo rasguea las primeras 3 cuerdas al aire.'
        ],
        undefined,
        [
          [{ string: 5, fret: 5, finger: 1, id: 'hammer1' }],
          [{ string: 5, fret: 5, finger: 1, id: 'hammer1' }, { string: 5, fret: 7, finger: 3, id: 'hammer2' }]
        ],
        ['↓', '-', '↓', '-']
      ),
      new Exercise(
        'bh5',
        'Arpegio Fingerpicking (P-I-M-A)',
        'Usa los dedos de la mano derecha junto con un acorde estático.',
        'BOTH',
        60,
        60,
        85,
        '',
        [
          'Coloca un acorde de Re Menor (Dm).',
          'Mano derecha: Pulgar (4ta), Índice (3ra), Medio (2da), Anular (1ra).'
        ],
        undefined,
        [
          [{ string: 3, fret: 2, finger: 2 }, { string: 2, fret: 3, finger: 3 }, { string: 1, fret: 1, finger: 1 }]
        ],
        ['B', 'P', 'P', 'P']
      )
    ];

    if (category) {
      return allExercises.filter(e => e.category === category || e.category === 'BOTH');
    }

    // Default warmup mixes everything
    return allExercises.sort(() => 0.5 - Math.random()).slice(0, 5);
  }
}
