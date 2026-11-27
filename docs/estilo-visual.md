# UNDER: estilo visual

Primera propuesta hecha en Claude Design. Los bocetos están en `assets/`: sirven para fijar composición, colores e interfaz; el arte final necesita más detalle.

## Lienzo

- **Tamaño base:** 1280x720 (16:9), escalado para ajustarse a la pantalla.
- **Escena:** 1280x560 arriba. Se dibuja en una grilla de 320x140 unidades y se escala x4, sin suavizado.
- **Barra de interfaz:** 160 px abajo, fondo `#15131A` con un borde superior de 4 px `#2B1D3A`.

## Tipografía

**Pixelify Sans** (Google Fonts), regular y bold, para toda la interfaz y los diálogos.

## Paleta

| Uso | Color |
| --- | --- |
| Cielo, arriba | `#2B1D3A` |
| Cielo, bandas del atardecer | `#4A2A52`, `#7A3B55`, `#C25A4A`, `#E8875A` |
| Fachada naranja | `#D98A4E` |
| Rojo (edificio del kiosco, acentos) | `#A7362F` |
| Vidrio del edificio moderno | `#6F8290` |
| Vereda | `#8F8A84` |
| Cordón amarillo | `#D9B13B` |
| Calle | `#3B3B42` |
| Interfaz, acento | `#E8C46A` |
| Interfaz, fondo de botones | `#241F2E` con borde `#3A3348` |
| Texto secundario | `#9A8FB0` |
| Viñetas de diálogo | fondo `#F4EFE6`, borde y sombra `#15131A` |
| Fondo general | `#15131A` |

El cielo se pinta en franjas planas, no en degradé, para mantener el pixel art.

## Personajes

Sprites de 12x30 unidades (se ven de 48x120 px en el juego). Archivos en `assets/sprites/`.

- **Jugador, skin metalero:** pelo largo castaño oscuro, auriculares rojos, remera negra con estampa, jean azul, borcegos.
- **Nikola (Orate):** pelo oscuro hacia atrás con laterales canosos, anteojos de aviador, barba gris, remera negra, jean oscuro.
- **Nikola con pasamontañas:** pasamontañas negro con abertura para los ojos (se ven los anteojos) y la boca.
- **Perro:** marrón claro, 15x8 unidades, con el pasamontañas en la boca.

## Escena: esquina de El Bunker

Basada en la cuadra real (foto de Google Maps), con comercios genéricos. De izquierda a derecha: edificio claro con parada de colectivo y banco adelante, edificio naranja con balcones y una cortina metálica, edificio rojo con el kiosco (toldo a rayas rojas y blancas), la puerta angosta de El Bunker con su cartel, edificio moderno de vidrio, edificio claro con un farol. Dos árboles pelados sobre la vereda y la avenida adelante, con cordón amarillo.

Boceto: `assets/escenas/esquina-el-bunker-boceto.svg`.

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
