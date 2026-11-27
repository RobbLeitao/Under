# UNDER

Aventura gráfica 2D en pixel art, ambientada en la escena under de rock, metal y punk de Mar del Plata, con bandas, músicos y venues reales. El objetivo es que quien juega conozca esas bandas, las escuche y termine yendo a verlas.

- Diseño completo: `docs/diseno.md` (la fuente de verdad del juego).
- Estilo visual, paleta y medidas: `docs/estilo-visual.md`.
- Bocetos de arte: `assets/` (sprites y escena en SVG de pixel art).

## Stack

- **Phaser 3 + TypeScript + Vite** para la demo web.
- **Capacitor**, más adelante, para empaquetar el mismo código como app de Android e iOS. No sumar Capacitor hasta que se pida.
- Sin backend en la demo. El nombre del jugador y el progreso se guardan en el dispositivo (`localStorage`).
- Medición con PostHog, anónima, cuando se pida (ver `docs/diseno.md`, sección Medición).

## Comandos

- `npm install`
- `npm run dev`: servidor de desarrollo de Vite.
- `npm run build`: build de producción en `dist/`.

## Estructura propuesta

```
src/
  main.ts            configuración de Phaser (1280x720, pixelArt: true, escalado FIT)
  config.ts          medidas del lienzo (ancho, alto, escala, alto de escena y barra)
  scenes/            una escena de Phaser por lugar del juego, más Boot y Preload
  ui/                barra de acciones, inventario, Phone, diálogos flotantes
  data/              misiones, diálogos, bandas, objetos (datos, no lógica)
  systems/           inventario, estado de misión, guardado, audio
public/
  assets/            sprites, fondos y audio que carga Phaser
assets/              bocetos y fuentes de arte (no se sirven)
docs/                diseño y estilo
```

## Convenciones

- **Idioma:** todo el texto del juego en español rioplatense (vos, tomá, escuchanos). Código, nombres de archivos y commits pueden ir en español o inglés, pero de forma consistente dentro de cada archivo.
- **Pixel art nítido:** `pixelArt: true` y `roundPixels: true` en Phaser. Arte base a escala 1:4 dentro de un lienzo de 1280x720 (escena de 320x140 unidades sobre 1280x560, más una barra de interfaz de 160 px).
- **Datos separados de la lógica:** diálogos, misiones y bandas viven en `src/data/` como objetos tipados, para que agregar una banda o un diálogo no toque el código de las escenas.
- **Variables de texto:** `{jugador}` es el nombre que eligió quien juega; `{plataforma}` es el link que manda cada banda (Spotify, YouTube, Bandcamp u otra). Nunca hardcodear una plataforma.
- **Celular primero en la interacción:** todo se juega con toques. Mirar, Agarrar y Hablar son tres botones grandes (mínimo 44 px de alto); para usar o dar un objeto se toca en el inventario y después se toca el destino (también se puede arrastrar).
- **Teclado, además de los toques:** flechas y WASD mueven al jugador. Izquierda/derecha (A/D) caminan por la vereda; arriba/abajo (W/S) se mueven en profundidad dentro de la franja de la vereda, sin salirse. Si el jugador iba hacia un punto tocado, una tecla cancela ese destino (y la acción que esperaba). Las teclas no se capturan y existen solo en las escenas de juego, para no interferir con el campo del nombre en la pantalla de inicio. Esc o P abren la pausa.
- **Pausa:** botón arriba a la derecha de cada escena de juego (y Esc o P). Menú con Seguir, Sonido sí/no (se guarda en el dispositivo), Empezar de nuevo (pide confirmación y borra el avance, no el nombre) e Ir al inicio.
- **Inventario vs. Phone:** los objetos físicos (monedas, galletitas, pasamontañas) van al inventario de abajo; lo digital (música, álbum de figuritas) vive en el Phone.

## Reglas

- **Personas, bandas y lugares reales:** solo los que figuran en `docs/diseno.md`, que dieron (o van a dar) su permiso. No sumar otros.
- **Sin marcas de terceros:** los comercios de las escenas son genéricos. Solo El Bunker, los venues y las bandas del juego llevan su nombre.
- **Logos de las bandas:** van en `public/assets/logos/` y se anotan en `src/data/bandas.ts` (campo `logo`). Se muestran en las figuritas del álbum. Formato y tamaño en `docs/estilo-visual.md`. No dejar assets en `dist/`: el build la borra.
- **Música:** los temas suenan desde archivos que pasan las bandas, en `public/assets/audio/`. No embeber reproductores de Spotify ni bajar audio de plataformas. Si todavía no hay archivo, usar un placeholder silencioso y dejarlo anotado.
- **Privacidad:** el público incluye menores. No pedir mail, edad ni datos personales; la medición no se asocia al nombre del jugador.

## Forma de trabajo

- **De dónde sale el diseño:** del canvas de Claude Design (arte, interfaz, composición) y de `docs/diseno.md` (jugabilidad, misiones, diálogos). Si un pedido choca con alguno de los dos, preguntar antes de inventar.
- **Pedidos con criterios de aceptación:** cada tarea llega con criterios de aceptación. Son la vara para dar algo por terminado y para probarlo.
- **Una rama por tarea:** cada tarea va en su propia rama, creada desde `main` actualizado, con un nombre corto y descriptivo en kebab-case (por ejemplo, `pausa-y-teclado`).
- **Nunca subir directo a `main`:** los cambios llegan a `main` solo a través de un pull request.
- **Pull request a `main`:** con un resumen de qué cambia y de cómo se probó, criterio por criterio (y capturas cuando el cambio se ve). Anotar también lo que quedó pendiente o sin probar.
- **Revisión antes del merge:** el PR se revisa antes de mergearlo. El merge lo hace quien revisa, no Claude.

## Primeras tareas

1. Inicializar el proyecto con Vite + TypeScript + Phaser 3, con la configuración de `src/main.ts` descrita arriba.
2. Escena de inicio: logo "UNDER" y campo para que el jugador escriba su nombre (se guarda en el dispositivo).
3. Escena "Esquina de El Bunker" a partir de `assets/escenas/esquina-el-bunker-boceto.svg`: fondo, jugador, Nikola y el perro, con caminar al tocar el piso.
4. Barra de interfaz con Mirar, Agarrar y Hablar, inventario de cuatro lugares y botón Phone.
5. Sistema de diálogos en viñetas con los diálogos de la misión 1 (`docs/diseno.md`).
6. La misión 1 completa, paso a paso, con su estado guardado.
7. El Phone con las apps Música y Álbum, como en el boceto de Claude Design.

Decisión abierta: si la misión 1 usa una sola escena (El Bunker con el kiosco al lado, como en el boceto) o dos (El Bunker y la avenida Independencia, como en el guion). Hasta que se decida, construir la versión de una sola escena.
