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
| Texto de diálogo | color de cada personaje (jugador `#F4EFE6`, Nikola `#FF9A4A`, kiosquero `#8FD9FF`, Raulo `#FFD45A`, Jota `#C9A0FF`) con contorno `#0B0810` |
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
| `kiosquero.svg` | 18x23 |
| `raulo.svg` | 26x59 |
| `jota.svg` | 36x51 (con el bajo) |

- **Jugador, skin metalero:** pelo largo castaño con raya al medio que cae sobre los hombros, chaleco de jean con parches, remera negra con estampa, jean negro, zapatillas blancas.
- **Nikola (Orate):** pelo oscuro peinado para atrás, con entradas y canas a los costados; lentes de aviador negros que ocupan casi todo el ancho de la cara; bigote negro espeso, la zona de la boca oscura y la barba entrecana a los costados; remera negra y reloj negro. Mira hacia la izquierda.
- **Nikola con pasamontañas:** pasamontañas negro con la forma de su cabeza, **sin lentes**: por la abertura se ven la piel y los ojos, y abajo el hueco de la boca.
- **Perro:** marrón claro, con el pasamontañas negro en la boca (y la versión sin él).
- **Kiosquero:** una silueta violácea (`#24162F`, con un borde de luz `#4B3563`), de la cintura para arriba, recortada contra la luz del fondo del kiosco. Se para detrás del mostrador (pies en y 84) y gesticula al hablar (`kiosquero-habla`). No tiene rasgos a propósito: es un personaje genérico.
- **Raulo (encargado de Perrier):** el más alto del juego, casi 2 m. De frente: cresta canosa, costados rapados, párpados pesados, barba oscura con canas en el mentón, remera negra. Hojas `raulo-camina` (4 cuadros, 32x61) y `raulo-habla` (3 cuadros, 32x61).
- **Jota (Exiliado):** estatura media, pelo castaño ondulado por debajo de los hombros, barba tupida, campera de jean negra con botones, remera negra con estampa y el bajo oscuro con golpeador carey. **Es diestro: su sprite nunca se espeja**, ni al caminar hacia la izquierda. Al caminar no balancea los brazos porque sostiene el bajo. Hojas `jota-camina` (4 cuadros, 42x53) y `jota-habla` (3 cuadros, 42x53).

## Escena: esquina de El Bunker

Basada en la cuadra real, con comercios genéricos, al anochecer. De izquierda a derecha: casa de piedra estilo Mar del Plata con postigos y tejas, con la parada de colectivo y el banco adelante; edificio naranja con balcones, persiana metálica con grafiti y afiches; un plátano; el kiosco iluminado (cartel azul, toldo a rayas y una ventanita de atención con tubo de luz, tiras de snacks colgando, estantes, frascos de golosinas y un mostrador con vitrina; el kiosquero se ve detrás); la puerta de El Bunker con el cartel del logo y una lamparita roja; edificio de vidrio con ventanas encendidas; edificio blanco y la farola al borde de la vereda, casi sobre el asfalto. En el poste de la farola, el cartel de calle "AV. INDEPENDENCIA": placa azul `#1F3A7A` con borde blanco y letras de píxeles (no tipografía), para que sea 8 bits de verdad. Cables cruzando la calle, vereda de baldosas, cordón amarillo y la calle con un charco que refleja el kiosco.

- **Fondo del juego:** `public/assets/escenas/esquina-el-bunker.svg`, sin personajes, monedas ni textos (los dibuja el juego).
- **Farola:** `public/assets/escenas/farola-esquina.svg` (77x89, en x 231, y 28), con el cartel de AV. INDEPENDENCIA. Va como decorado con la base en y 116, para que tape al jugador cuando pasa por detrás.
- **Boceto completo, con personajes:** `assets/escenas/esquina-el-bunker-boceto.svg`.
- Las zonas que se tocan están en `src/data/escenas.ts`, en las mismas unidades de 320x140.

## Escena: vereda de Vinoteca Perrier

Basada en la foto de la fachada, al anochecer. De izquierda a derecha: casa de piedra con puerta blanca y farolito; el edificio de Perrier, de ladrillo, con ventanas encendidas arriba y la marquesina blanca; el cartel negro con el logo de Perrier sobre el ventanal; el ventanal, por el que se ve el salón; la chapa 2051 sobre la puerta de madera de dos hojas; la pared de ladrillo donde va el flyer; la farola al borde de la vereda; la persiana con grafiti genérico, un árbol y una casa de ladrillo. Vereda de baldosas rojas, cordón gris (no amarillo) y una rejilla de desagüe en el cordón, delante del ventanal.

- **Con misión (show esa noche):** `public/assets/escenas/vereda-perrier.svg`. El ventanal muestra el escenario con la banda en siluetas y luces, y la banderola de la puerta está encendida.
- **Sin misión:** `public/assets/escenas/vereda-perrier-sin-mision.svg`. Ventanal apagado (mesas con las sillas arriba), sin luz en la banderola ni sobre la vereda.
- **Flyer:** `public/assets/escenas/flyer-exiliado.svg` (39x40, en x 186, y 55). Es un objeto aparte que solo aparece mientras hay misión; cada misión en Perrier tiene su flyer. El de Exiliado lleva el símbolo de la banda en pixel art.
- **Farola:** `public/assets/escenas/farola-perrier.svg` (22x89, en x 212, y 28), decorado con la base en y 116.
- **Rejilla:** en el cordón, de x 104 a 120 (y 117 a 122).
- **Boceto completo:** `assets/escenas/vereda-perrier-boceto.svg`.

## Escena: el show adentro de Perrier

`public/assets/escenas/salon-perrier-show.svg`: escena corta y sin control, basada en la foto del salón. Techo bajo de vigas de madera, paredes bañadas en luz roja y rosa, humo naranja, tachos de luz y una barra violeta sobre el escenario, ventilador en la pared, Jota tocando a la derecha (ya dibujado en el fondo), el resto de Exiliado en siluetas y el público de espaldas en tres filas. Sin logos.

## Objetos de la misión 2

En `public/assets/objetos/`, de 16x16: `cuerda-cortada.svg` (cuerda enrollada con la punta enrulada y la bolita dorada), `llave-deposito.svg` (llave dorada con argolla) y `cuerdas-bajo.svg` (sobre de cuerdas nuevas).

## Logo de Vinoteca Perrier

En pixel art, en un solo color, como el original.

- **Grande:** `assets/logos/perrier.svg`, 96x41 unidades, en negro.
- **Cartel de la fachada:** `assets/logos/perrier-cartel.svg`, 44x16, en blanco sobre el cartel negro (ya está dibujado en el fondo de la vereda).

## Logo de El Bunker

Dibujado a mano en pixel art, solo con negro `#141018`, blanco `#F4EFE6` y rojo `#D62828`.

- **Grande:** `assets/logos/el-bunker.svg`, 72x78 unidades. Para la pantalla de carga, el Phone o el final de la misión.
- **Cartel de la puerta:** `assets/logos/el-bunker-cartel.svg`, 22x20, sobre una placa clara. El texto "EL BUNKER" lo dibuja el juego encima de la banda roja.

## Interfaz

- **Barra de abajo:** tres botones grandes (Mirar, Agarrar, Hablar), el texto de la acción actual arriba de ellos, inventario de cuatro lugares y botón **Phone** a la derecha.
- **Diálogos, como en Thimbleweed Park:** el texto flota sobre la cabeza del que habla, sin caja ni nombre, en el color de cada personaje (campo `color` en `src/data/dialogos.ts`) y con un contorno oscuro de 8 px para leerse sobre cualquier fondo. La línea aparece entera, centrada, de 30 px y hasta 560 px de ancho; cada toque pasa a la siguiente. El botón "escuchanos en {plataforma}" va abajo del texto. Un personaje nuevo necesita un color que se distinga de los demás.
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
