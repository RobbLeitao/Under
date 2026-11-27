# UNDER: estilo visual

Hecho en Claude Design. Los bocetos están en `assets/` y la versión que carga el juego en `public/assets/`.

## El norte: Thimbleweed Park

- **La luz cuenta la escena.** Es de noche y la luz sale de las cosas: vidrieras y ventanas encendidas, farolas con su cono, la lamparita roja de El Bunker. La luz se derrama sobre la vereda con capas semitransparentes.
- **Cada material con tres o cuatro tonos** (luz, base, sombra, contorno), no colores planos.
- **Cuadras con historia:** afiches, grafitis, cables, baldosas rotas, charcos. Los comercios siguen siendo genéricos.
- **Personajes cabezones,** en vista de tres cuartos o de frente, con contorno de color (ver Personajes).

## Lienzo

- **Tamaño base:** 1280x720 (16:9), escalado para ajustarse a la pantalla.
- **Escena:** 1280x560 arriba. Se dibuja en una grilla de 320x140 unidades y se escala x4, sin suavizado.
- **Barra de interfaz:** 160 px abajo, fondo `#15131A` con un borde superior de 4 px `#2B1D3A`.

## Tipografía

**Pixelify Sans** (Google Fonts), regular y bold, para toda la interfaz y los diálogos.

## Paleta

| Uso | Color |
| --- | --- |
| Cielo, de arriba hacia el horizonte | `#1B1430`, `#2B1D40`, `#46284F`, `#703557`, `#A64A53`, `#D96F50`, `#E8875A` |
| Fachada naranja | `#CF8049` |
| Luz cálida (vidrieras, ventanas, farola) | `#FFD27A` |
| Luz de El Bunker | `#FF4A3A` |
| Rojo (edificio del kiosco, acentos) | `#A7362F` |
| Vidrio del edificio moderno | `#5D6F7E` |
| Vereda | `#8A857E` |
| Cordón amarillo | `#D9B13B` |
| Calle | `#3B3B42` |
| Interfaz, acento | `#E8C46A` |
| Interfaz, fondo de botones | `#241F2E` con borde `#3A3348` |
| Texto secundario | `#9A8FB0` |
| Viñetas de diálogo | fondo `#F4EFE6`, borde y sombra `#15131A` |
| Fondo general | `#15131A` |

El cielo se pinta en franjas de 4 unidades, con el borde entre franjas tramado, para que el degradé no se vea escalonado.

## Personajes

**Proporción cabezona para todos:** la cabeza ocupa más o menos un tercio del alto, como Nikola. Miden entre 46 y 51 unidades de alto (se ven de unos 200 px en el juego), con vista de tres cuartos o de frente.

**Contorno de color:** cada borde es el tono vecino oscurecido, no negro parejo. Los sprites se dibujan como mapas de caracteres y el contorno se calcula solo.

Archivos en `assets/sprites/` y `public/assets/sprites/` (con su tamaño en `src/scenes/Preload.ts`):

| Sprite | Tamaño (unidades) |
| --- | --- |
| `jugador-metalero.svg` | 20x49 |
| `nikola.svg`, `nikola-pasamontanas.svg` | 22x51 |
| `perro.svg`, `perro-sin-pasamontanas.svg` | 26x15 |

- **Jugador, skin metalero:** pelo largo castaño con raya al medio que cae sobre los hombros, chaleco de jean con parches, remera negra con estampa, jean negro, zapatillas blancas.
- **Nikola (Orate):** pelo oscuro peinado para atrás, con entradas y canas a los costados; lentes de aviador negros que ocupan casi todo el ancho de la cara; bigote negro espeso, la zona de la boca oscura y la barba entrecana a los costados; remera negra y reloj negro. Mira hacia la izquierda.
- **Nikola con pasamontañas:** pasamontañas negro con la forma de su cabeza, **sin lentes**: por la abertura se ven la piel y los ojos, y abajo el hueco de la boca.
- **Perro:** marrón claro, con el pasamontañas negro en la boca (y la versión sin él).

## Escena: esquina de El Bunker

Basada en la cuadra real, con comercios genéricos, al anochecer. De izquierda a derecha: casa de piedra estilo Mar del Plata con postigos y tejas, con la parada de colectivo y el banco adelante; edificio naranja con balcones, persiana metálica con grafiti y afiches; un plátano; el kiosco iluminado (cartel azul, toldo a rayas, vidriera con golosinas); la puerta de El Bunker con el cartel del logo y una lamparita roja; edificio de vidrio con ventanas encendidas; edificio blanco con la farola. Cables cruzando la calle, vereda de baldosas, cordón amarillo y la calle con un charco que refleja el kiosco.

- **Fondo del juego:** `public/assets/escenas/esquina-el-bunker.svg`, sin personajes, monedas ni textos (los dibuja el juego).
- **Boceto completo, con personajes:** `assets/escenas/esquina-el-bunker-boceto.svg`.
- Las zonas que se tocan están en `src/data/escenas.ts`, en las mismas unidades de 320x140.

## Logo de El Bunker

Dibujado a mano en pixel art, solo con negro `#141018`, blanco `#F4EFE6` y rojo `#D62828`.

- **Grande:** `assets/logos/el-bunker.svg`, 72x78 unidades. Para la pantalla de carga, el Phone o el final de la misión.
- **Cartel de la puerta:** `assets/logos/el-bunker-cartel.svg`, 22x20, sobre una placa clara. El texto "EL BUNKER" lo dibuja el juego encima de la banda roja.

## Interfaz

- **Barra de abajo:** tres botones grandes (Mirar, Agarrar, Hablar), el texto de la acción actual arriba de ellos, inventario de cuatro lugares y botón **Phone** a la derecha.
- **Viñetas de diálogo:** caja clara con borde y sombra dura de 4 px, nombre del personaje arriba en rojo y texto grande.
- **Phone:** pantalla de celular de 360x640 con la hora real del dispositivo, apps Música y Álbum, y Mapa y Chats deshabilitados en la demo.
- **Figuritas del álbum:** carta clara de 3 por fila con el logo de la banda arriba, sobre una franja oscura (`#15131A`), y debajo el nombre del músico en rojo, la banda y el rol. Las que faltan se ven como una carta oscura con "?".

## Logos de las bandas

Son la única imagen del juego que no es pixel art: se usan tal como los manda cada banda.

- **Dónde van:** `public/assets/logos/<banda>.jpg` (o `.png`), y el nombre del archivo se anota en el campo `logo` de la banda en `src/data/bandas.ts`.
- **Formato:** JPG o PNG, horizontal, de al menos 600 px de ancho. Mejor sobre fondo oscuro o transparente, porque en la figurita se apoya sobre una franja oscura.
- **Tamaño en el juego:** se achica para entrar en 92x52 px. El juego hace esa copia chica una sola vez al cargar, con escalado suave, porque Phaser con `pixelArt: true` lo dejaría serruchado. No hace falta achicarlo a mano.
- **Sin logo todavía:** la figurita muestra el nombre de la banda en texto.

## Tipografía: negrita

La negrita de Pixelify Sans cierra la C, el 2 y el 5 (se leen O, 8 y 8). Todo el texto va en regular, salvo el logo "UNDER" y los botones de la barra, que no tienen esas letras.
