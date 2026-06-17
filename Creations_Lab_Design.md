# Arquitectura Avanzada: El Laboratorio (Creaciones)

## 1. Visión General
El módulo de "Creaciones" está pensado para la experimentación. Para volverlo "Premium", el laboratorio debe no solo guardar acordes extraños, sino permitir compartirlos en redes sociales como una "Carta Coleccionable" y testearlos auditivamente cuerda por cuerda.

## 2. Tecnologías Core
*   **html-to-image:** Renderizado del componente DOM (la tarjeta de acorde) a PNG/JPEG para exportación.
*   **Web Audio API Avanzada:** Polifonía selectiva (tocar solo cuerdas específicas al tocarlas).

## 3. Tarjeta de Descubrimiento (Visual)
Cuando el motor de Inteligencia Artificial detecta características de un acorde ("Tensión", "Disonante", "Jazz"), estos "Tags" se renderizarán como sellos holográficos (usando CSS `backdrop-filter`, `mix-blend-mode`, y gradientes iridiscentes).

## 4. Exportación a Imagen (Compartir)
El usuario encontrará un botón "Compartir Descubrimiento".
La función aislará el contenedor del `InteractiveFretboard` y la información del acorde para generar una imagen estática limpia.

```typescript
// Implementación conceptual de la exportación
const exportChordToImage = async (chordElementId: string) => {
  const node = document.getElementById(chordElementId);
  if (!node) return;
  
  // Agregar una marca de agua temporalmente para la exportación
  const watermark = document.createElement('div');
  watermark.innerText = 'Creado en Gritar App';
  node.appendChild(watermark);

  const dataUrl = await htmlToImage.toPng(node);
  
  // Limpiar y descargar
  node.removeChild(watermark);
  downloadImage(dataUrl, 'mi-acorde-gritar.png');
};
```

## 5. El "Microscopio Sonoro"
En el laboratorio, tocar el botón "Reproducir" hará sonar el acorde completo. PERO, tocar físicamente en la UI una cuerda (la línea SVG) o un punto (traste), enviará una señal a la `AudioEngine` para reproducir ÚNICAMENTE esa frecuencia, permitiendo al usuario cazar notas muertas o entender exactamente de dónde viene la "tensión" de su creación.
