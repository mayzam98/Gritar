import { Exercise } from '../domain/Exercise';
import type { HandCategory } from '../domain/Exercise';

export class GenerateWarmupRoutineUseCase {
  execute(category?: HandCategory): Exercise[] {
    const allExercises: Exercise[] = [
      // LEFT HAND
      new Exercise(
        'e1',
        'Araña Cromática (1-2-3-4)',
        'Ejercicio fundamental para la independencia de los dedos de la mano izquierda.',
        'LEFT_HAND',
        60,
        60,
        '',
        [
          'Coloca el dedo índice en el traste 1 de la 6ta cuerda.',
          'Usa un dedo diferente para cada traste consecutivo (1-2-3-4).',
          'Sube a la 5ta cuerda y repite el patrón hasta llegar a la 1ra.',
          'Mantén los dedos cerca del diapasón al levantarlos.'
        ]
      ),
      new Exercise(
        'e2',
        'Estiramiento de Dedos (1-3-2-4)',
        'Mejora la elasticidad y apertura de la mano izquierda.',
        'LEFT_HAND',
        60,
        50,
        '',
        [
          'Toca el traste 1 con el dedo índice.',
          'Toca el traste 3 con el anular (siente el estiramiento).',
          'Toca el traste 2 con el medio.',
          'Toca el traste 4 con el meñique.',
          'Repite subiendo por las cuerdas.'
        ]
      ),
      new Exercise(
        'e7',
        'Legato Trinos (Hammer/Pull)',
        'Desarrolla fuerza y resistencia explosiva en la mano izquierda.',
        'LEFT_HAND',
        45,
        70,
        '',
        [
          'Pisa el traste 5 con el índice en la 3ra cuerda y mantenlo anclado.',
          'Haz un hammer-on rápido al traste 6 con el medio y un pull-off de vuelta al 5.',
          'Hazlo lo más rápido y constante que puedas durante 15 segundos.',
          'Cambia y hazlo con el dedo anular (traste 7) y luego meñique (traste 8).'
        ]
      ),

      // RIGHT HAND
      new Exercise(
        'e3',
        'Púa Alternada Estricta',
        'Desarrolla velocidad y sincronización en la mano derecha.',
        'RIGHT_HAND',
        60,
        80,
        '',
        [
          'Toca al aire la 6ta cuerda con movimiento Abajo.',
          'Toca la misma cuerda con movimiento Arriba.',
          'Toca la 5ta cuerda Abajo, luego Arriba.',
          'Asegúrate de que el movimiento nazca de la muñeca, no del codo.'
        ]
      ),
      new Exercise(
        'e8',
        'Palm Mute Endurance',
        'Construye resistencia (stamina) rítmica para tocar metal o rock pesado.',
        'RIGHT_HAND',
        90,
        120,
        '',
        [
          'Coloca el borde de tu mano derecha sobre el puente.',
          'Toca corcheas constantes en la 6ta cuerda al aire (solo movimientos hacia abajo).',
          'Mantén la tensión uniforme. Si te duele el antebrazo, relaja la presión.'
        ]
      ),
      new Exercise(
        'e9',
        'String Skipping (Salto de Cuerdas)',
        'Precisión absoluta con la púa al cruzar distancias largas.',
        'RIGHT_HAND',
        60,
        60,
        '',
        [
          'Toca la 6ta cuerda al aire.',
          'Salta y toca la 4ta cuerda al aire.',
          'Toca la 5ta cuerda al aire.',
          'Salta y toca la 3ra cuerda al aire.',
          'Acostumbra a tu mano a medir la distancia de una cuerda saltada.'
        ]
      ),

      // BOTH HANDS
      new Exercise(
        'e4',
        'Sincronización Escala Mayor',
        'Alinea el cerebro con ambas manos tocando una escala musical.',
        'BOTH',
        120,
        70,
        '',
        [
          'Toca la escala de Do Mayor comenzando en la 5ta cuerda traste 3.',
          'Usa estricta púa alternada.',
          'Concéntrate en que el sonido de la púa ocurra exactamente en el mismo milisegundo que el dedo de la mano izquierda pisa el traste.'
        ]
      ),
      new Exercise(
        'e5',
        'Arpegios Sweep Picking Básicos',
        'Fluidez cruzando cuerdas en una sola dirección.',
        'BOTH',
        90,
        60,
        '',
        [
          'Toca un arpegio menor en las 3 primeras cuerdas.',
          'El movimiento de la mano derecha es un solo empuje hacia abajo (como rasguear lento).',
          'La mano izquierda debe presionar y soltar cada nota individualmente para que no suenen juntas como un acorde.'
        ]
      ),
      new Exercise(
        'e6',
        'Coordinación de Acordes Rápidos',
        'Memoria muscular para cambiar de acordes sin pausar el rasgueo.',
        'BOTH',
        90,
        80,
        '',
        [
          'Haz un rasgueo constante (Abajo, Arriba, Abajo, Arriba) de 4 tiempos.',
          'Cambia entre Do Mayor y Sol Mayor cada 2 tiempos.',
          'Regla de oro: El rasgueo de la mano derecha NUNCA se detiene, incluso si la mano izquierda no ha llegado a tiempo.'
        ]
      )
    ];

    if (category) {
      return allExercises.filter(e => e.category === category || e.category === 'BOTH');
    }

    // Default warmup mixes everything
    return allExercises.sort(() => 0.5 - Math.random()).slice(0, 4);
  }
}
