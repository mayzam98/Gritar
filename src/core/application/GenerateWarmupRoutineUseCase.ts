import { Exercise } from '../domain/Exercise';

export class GenerateWarmupRoutineUseCase {
  private availableExercises: Exercise[] = [
    new Exercise('1', 'Araña 1-2-3-4', 'Ejercicio cromático básico en todas las cuerdas.', 'BOTH', 60, 80, '', [
      'Posiciona tu dedo índice (1) en el primer traste de la 6ta cuerda.',
      'Toca con púa hacia abajo. Luego, coloca el dedo medio (2) en el segundo traste y toca con púa hacia arriba.',
      'Continúa con los dedos anular (3) y meñique (4).',
      'Desciende a la 5ta cuerda y repite el patrón. Mantén los dedos cerca del diapasón.'
    ], [
      { string: 6, fret: 1, finger: 1, color: '#3b82f6' },
      { string: 6, fret: 2, finger: 2, color: '#22c55e' },
      { string: 6, fret: 3, finger: 3, color: '#eab308' },
      { string: 6, fret: 4, finger: 4, color: '#ef4444' }
    ]),
    new Exercise('2', 'Trinos Dedo 1 y 2', 'Alternar notas rápidamente entre el dedo índice y medio.', 'LEFT_HAND', 60, 100, '', [
      'Coloca tu dedo índice en el traste 5 de la 3ra cuerda.',
      'Toca la nota y, sin levantar el índice, haz un "Hammer-on" rápido con tu dedo medio en el traste 6.',
      'Inmediatamente realiza un "Pull-off" de vuelta al traste 5.',
      'Repite el movimiento continuamente sin detenerte.'
    ], [
      { string: 3, fret: 5, finger: 1, color: '#3b82f6' },
      { string: 3, fret: 6, finger: 2, color: '#22c55e' }
    ]),
    new Exercise('3', 'Púa Alternada', 'Practicar abajo-arriba en cuerdas al aire.', 'RIGHT_HAND', 60, 120, '', [
      'Sostén la púa con firmeza pero sin tensar la muñeca.',
      'Comienza en la 6ta cuerda tocando con un movimiento hacia abajo.',
      'El siguiente ataque debe ser estrictamente hacia arriba.',
      'Toca 4 veces por cuerda usando metrónomo y luego cambia a la 5ta cuerda.'
    ], [
      // For open strings, we can represent them on fret 0 if we adjust the visualizer, or just show a marker.
      { string: 6, fret: 1, color: 'transparent' } // Placeholder for right hand exercise
    ]),
    new Exercise('4', 'Estiramiento 1-3-5', 'Ejercicios de amplitud en la mano izquierda.', 'LEFT_HAND', 60, 60, '', [
      'Coloca el dedo índice en el traste 1 de la 6ta cuerda.',
      'Estira el dedo anular para presionar el traste 3 de la misma cuerda.',
      'Estira el meñique para alcanzar el traste 5 de la misma cuerda.',
      'Si es muy doloroso, mueve el patrón a trastes más altos (ej: 5-7-9).'
    ], [
      { string: 6, fret: 1, finger: 1, color: '#3b82f6' },
      { string: 6, fret: 3, finger: 3, color: '#eab308' },
      { string: 6, fret: 5, finger: 4, color: '#ef4444' }
    ]),
    new Exercise('5', 'Salto de Cuerdas', 'Púa alternada saltando una cuerda intermedia.', 'RIGHT_HAND', 60, 90, '', [
      'Toca la 6ta cuerda al aire con la púa hacia abajo.',
      'Salta la 5ta cuerda y toca la 4ta cuerda al aire con la púa hacia arriba.',
      'Regresa a la 5ta cuerda con púa hacia abajo.',
      'Salta a la 3ra cuerda con púa hacia arriba. Mantén el movimiento de muñeca mínimo.'
    ], [
      { string: 6, fret: 1, color: 'transparent' } // Placeholder
    ]),
  ];

  execute(totalDurationMinutes: number): Exercise[] {
    const shuffled = [...this.availableExercises].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, totalDurationMinutes);
  }
}
