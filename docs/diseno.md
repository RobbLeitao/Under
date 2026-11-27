# UNDER: documento de diseño

Copia del documento de diseño trabajado en Claude Docs (27 de noviembre de 2026). Si cambia allá, se actualiza acá.

## Concepto

UNDER es una aventura gráfica 2D para celular y web, ambientada en la escena under de rock, metal y punk de Mar del Plata, con venues, bandas y músicos reales. El objetivo es que quien juega conozca esas bandas, las escuche y termine yendo a verlas.

- **Público:** jóvenes que escuchan rock, metal o punk en plataformas pero nunca fueron a ver bandas locales.
- **Hipótesis:** jugar una misión con una banda real lleva a escucharla y a interesarse por su próxima fecha.
- **Cómo se prueba:** con una demo distribuida por redes y medida desde el primer día.
- **Por qué este camino:** la investigación mostró que el problema de la escena es la falta de público nuevo, y que el algoritmo no conecta a los oyentes del género con el underground. El juego construye ese puente por fuera.

## Jugabilidad y estilo

Aventura gráfica de "apuntar y hacer clic", con referencias como Monkey Island y Thimbleweed Park. La estética pixel art es atractiva y requiere pocos recursos, tanto en web como en celular.

- **El protagonista es público, no músico.** Es alguien que escucha el género y se cruza con músicos under en la calle. Su nombre lo elige quien juega, con un campo de texto guardado en el dispositivo (el inicio de sesión con OAuth queda para más adelante). Ejemplo: un pibe de 16 años que escucha Slipknot se cruza con Nikola, cantante y guitarrista de Orate, que le cuenta que tocan tal día.
- **Mapa de Mar del Plata** con los venues donde tocan las bandas.
- **Misiones simples** que aumentan la dificultad de a poco.
- **Diálogos flotantes, como en Thimbleweed Park:** el texto aparece sobre la cabeza del que habla, en su color, con sonidos balbuceados en lugar de voces. Las voces reales de los músicos quedan para una versión futura.
- **Guiños locales** que solo entiende la escena.

### Skins

En la demo, el personaje usa la skin de metalero. La selección entre los cuatro arquetipos de público llega en una versión posterior:

1. El metalero de pelo largo
2. El punk
3. El rockero "Rolling Stone"
4. El skater

### El Phone

El celular del jugador funciona como un **inventario virtual**: guarda todo lo que no es un objeto físico de la escena. Los objetos que se agarran (monedas, galletitas, el pasamontañas) van al inventario de abajo; lo digital vive en el Phone. La hora que muestra es la real del dispositivo.

**En la demo:**

- **Música:** los temas de las bandas que se van desbloqueando, con el botón "escuchanos en {plataforma}".
- **Álbum de figuritas:** una figurita por músico de la escena, que se completa al avanzar. Cada figurita lleva el **logo de la banda** arriba y, abajo, el nombre del músico, la banda y su rol. Las que todavía no se consiguieron se ven como "?".

**Ideas para después:**

- **Mapa:** los venues de Mar del Plata y la sala de ensayo, para moverse entre escenas.
- **Chats con los músicos:** pistas de las misiones como mensajes, por ejemplo Nikola escribiendo dónde pasó antes de perder el pasamontañas.
- **Notas:** el objetivo de la misión actual, para quien retoma el juego después de un rato.
- **Agenda:** las fechas de las bandas, cuando se sume el aviso de shows.

## Contenido de la demo

La demo tiene **2 venues, 5 bandas y 3 misiones**. Rob habla con las bandas y los venues para que se sumen; el resto se agrega de a poco.

| Banda | Estilo | Músico en el juego | Rol |
| --- | --- | --- | --- |
| Orate | Old school death metal | Nikola | Cantante y guitarrista |
| Kainoas | Nu metal | FAT | Cantante |
| Abismal | Groove metal | Peke | Cantante |
| Avtomata | Modern death metal | El S | Cantante |
| Exiliado | Rock metal alternativo | Jota | Bajista |

**Venues:** Vinoteca Perrier y Teatro Vorterix. Sala de ensayo de todas las bandas, por ahora: El Bunker - Estudio y Salas de Ensayo.

### Misiones (borrador)

Las misiones son de público: el jugador no toca, sino que ayuda y descubre.

1. **El encuentro (fácil).** En la calle, el jugador se cruza con Nikola, de Orate, que perdió su pasamontañas camino al ensayo. Lo perdió en la misma cuadra de El Bunker, cerca del kiosco. Recompensa: un tema de Orate en el Phone del jugador y la invitación a escucharlos en {plataforma}.
2. **La prueba de sonido en Vinoteca Perrier (media).** Para entrar a la prueba de sonido de la tarde, el jugador tiene que resolver un problema del encargado del lugar. Adentro conoce a Peke, de Abismal, y a Jota, de Exiliado. Recompensa: sus figuritas del álbum y sus temas en el Phone.
3. **La noche del show en Teatro Vorterix (difícil).** Tocan Kainoas y Avtomata, pero antes del show algo falla: un cable, un pedal o un músico que no llega. El jugador ayuda a FAT y a El S combinando objetos y pistas de las misiones anteriores. Recompensa: la música de las 5 bandas y el álbum completo.

## Música y puente con el mundo real

### En el juego (demo)

- **Cada venue suena** con temas de las bandas que tocan ahí.
- **Phone del jugador** con bandas locales, que se amplía a medida que avanzás. Es un celular, porque hoy la música se escucha ahí.
- **Los temas suenan desde archivos que pasan las bandas,** con su permiso: se escuchan completos, sin cuentas ni conexión con Spotify, en web y en celular, y el juego cuenta cada reproducción.
- **Botón "escuchanos en {plataforma}"** en cada tema: es un enlace que abre la app o la web de la plataforma, sin integración. Se descartó embeber el reproductor de Spotify: sin sesión iniciada solo reproduce adelantos de 30 segundos, funciona distinto según el navegador y no se integra a la escena del juego.
- **Covers metal de temas virales** como recompensa: es el puente que mostraron las búsquedas en YouTube.
- **Álbum de figuritas** de músicos de la escena, dentro del Phone.
- Se descartó el minijuego de ritmo.

### Desbloquear con escuchas

La idea es que escuchar a una banda desbloquee algo en el juego. Lo más simple y medible es **contar las escuchas dentro del juego**: el juego sabe cuándo suena un tema. Verificar escuchas en Spotify de cada jugador requiere que inicie sesión con su cuenta, y Spotify restringió varias funciones de su API para apps nuevas; queda como mejora futura. El botón a {plataforma} se mide como toque.

### Para iteraciones futuras

- **QR o enlace en el venue** que desbloquea contenido al ir a un show.
- **Aviso de shows dinámico**, tomando las fechas de las redes de cada banda, y **misiones con fecha** atadas a shows reales, difundidas con eventos de Meta (Facebook e Instagram).
- **Recompensas reales:** descuentos o entradas para la próxima fecha de la banda.
- **Escenas o misiones exclusivas** para que cada banda difunda.

## Medición

La demo mide un recorrido de cinco pasos, de abrir el juego a interesarse por un show real. Cada paso es un evento que el juego envía a la herramienta de medición.

1. Abrió el juego (y desde qué red o publicación llegó)
2. Terminó la misión 1, 2 o 3
3. Escuchó un tema dentro del juego
4. Tocó "escuchanos en {plataforma}"
5. Tocó la fecha de una banda (cuando se sume el aviso de shows)

| Herramienta | Para qué sirve | Costo |
| --- | --- | --- |
| PostHog | Eventos y embudos: ver dónde abandona la gente | Plan gratuito |
| Google Analytics 4 | Lo mismo, más conocido pero menos cómodo para embudos | Gratis |
| Enlaces con parámetros UTM | Saber qué publicación trajo a cada jugador | Gratis |

**Propuesta:** PostHog para los eventos del juego, más enlaces con UTM en cada publicación de redes. Del lado de las bandas, comparar sus oyentes en Spotify for Artists antes y después de lanzar la demo.

Como el público incluye menores, la medición es anónima: los eventos no se asocian al nombre ni a la cuenta de quien juega.

## Forma de trabajo

El diseño pasa por Claude Design y el desarrollo por Claude Code en la terminal (Warp). Rob define personajes, bandas y venues, y los suma de a poco.

**Stack:** Phaser con TypeScript para la demo web, empaquetado después con Capacitor como app de Android e iOS.

- [ ] Confirmar los 2 venues y las 5 bandas, con permiso para usar nombres, imagen y música, y pedirles los archivos de sus temas el link donde quieren que los escuchen (Spotify, YouTube, Bandcamp u otra plataforma) y su logo para el álbum
- [x] Escribir la misión 1 completa: escenas, diálogos, objetos y acertijo
- [x] Definir el estilo visual en Claude Design: paleta, un personaje, un fondo
- [ ] Armar el prototipo de la misión 1 en Phaser y publicarlo en web
- [ ] Integrar la música y la medición
- [ ] Probar la misión 1 con 10 a 15 personas del público objetivo
- [ ] Completar las misiones 2 y 3 y lanzar la demo por redes

## Riesgos y temas abiertos

- **Arte y animación:** es la parte más costosa de una aventura gráfica. Los sprites animados en pixel art pueden necesitar una herramienta específica, como Aseprite, o un ilustrador.
- **Estética y público joven:** el pixel art y la aventura gráfica pueden atraer más a quienes las jugaron de chicos.
- **Derechos de la música:** las bandas tienen que autorizar el uso de sus temas. Si están registrados en SADAIC, hay que averiguar cómo se autoriza ese uso antes de publicar.
- **Permisos de personas y lugares:** cada músico y venue tiene que aceptar aparecer, idealmente por escrito.
- **Sustentabilidad:** a definir. Opciones: publicidad, compras dentro del juego o venta de espacios en el juego a comercios y venues.

## Misión 1: "El pasamontañas perdido" (guion)

Una misión fácil de 5 a 8 minutos que presenta a Nikola, enseña a jugar y termina con la invitación a escuchar a Orate. Como todo Orate, Nikola toca con pasamontañas, y perdió el suyo camino al ensayo: el jugador lo ayuda a recuperarlo.

### Cómo se juega

- Se toca el piso para caminar y un objeto o personaje para ver tres acciones: **Mirar**, **Agarrar** y **Hablar**.
- En la computadora también se camina con el teclado: **flechas o WASD**. Izquierda y derecha (A/D) caminan por la vereda; arriba y abajo (W/S) se mueven en profundidad, sin salirse de la vereda. Si el jugador iba hacia algo que se tocó, una tecla cancela ese destino.
- **Pausa:** botón arriba a la derecha, o Esc o P. Desde ahí se sigue, se apaga o prende el sonido, se empieza de nuevo o se vuelve al inicio.
- Para usar o dar algo, se toca el objeto en el inventario y después su destino (también se puede arrastrar).
- Los diálogos flotan sobre la cabeza del que habla, en su color, con sonidos balbuceados. `{jugador}` es el nombre que eligió quien juega.

### Escenas

La misión 1 pasa en **una sola escena** (decidido): **la esquina de El Bunker.** Una calle del centro, con la puerta de El Bunker - Estudio y Salas de Ensayo, el kiosco al lado, una parada de colectivo con un banco y un perro de la cuadra que pasea por la vereda con algo negro de lana en la boca.

- **El perro pasea solo:** va y viene a paso lento por su tramo de vereda (entre la parada y el kiosco, sin acercarse a Nikola), se da vuelta en los extremos y a veces se frena unos segundos. Al tocarlo se queda quieto hasta que termina la interacción y después sigue.
- **Animaciones:** el jugador camina con su animación (espejada hacia la izquierda) y, quieto, vuelve al sprite base. Quien habla gesticula mientras dura el balbuceo de su línea. Las hojas de cuadros están en `public/assets/sprites/anim/`.
- **Sonido ambiente de calle:** un rumor de fondo y, cada tanto, un auto que pasa, generados con Web Audio (sin archivos). Es bajito, respeta el Sonido sí/no de la pausa y baja más mientras suena un tema en el Phone.

### Paso a paso

1. **Inicio.** El jugador está en la esquina con auriculares; suena un riff de fondo. Nikola llega apurado, revisando sus bolsillos.
2. **Hablar con Nikola.** Cuenta que perdió el pasamontañas y que pasó por el kiosco de al lado.
3. **Hablar con el kiosquero.** Dice que vio a un perro de la cuadra llevarse algo negro de lana.
4. **Intentar agarrar el pasamontañas.** El perro no lo suelta. Mirarlo da la pista: tiene cara de hambre.
5. **Conseguir plata.** El kiosquero no fía. Mirar debajo del banco de la parada de colectivo, en la esquina, permite agarrar unas **monedas**.
6. **Comprar galletitas.** Dar las monedas al kiosquero da un paquete de **galletitas**.
7. **Darle galletitas al perro.** El perro suelta el **pasamontañas**, un poco babeado.
8. **Devolverle el pasamontañas a Nikola.** Se lo pone en el momento. Cierre y recompensas.

### Diálogos clave (borrador)

- **Nikola, al llegar:** "¡No, man, no puedo tocar sin mi pasamontañas!"
- **Jugador:** "¿Tu qué?"
- **Nikola:** "Mi pasamontañas, loco. En Orate tocamos todos con pasamontañas. Pasé por el kiosco de acá al lado y después ya no lo tenía."
- **Kiosquero:** "Un perro de la cuadra pasó con algo negro de lana en la boca. Y no lo larga más."
- **Mirar al perro:** "Tiene el pasamontañas y una cara de hambre tremenda."
- **Kiosquero, sin plata:** "Acá no se fía, pibe."
- **Nikola, al recibirlo:** "¡Ahí está! Un poco babeado, pero sirve. Gracias man.. Sos un crack, cracken, TITAN! Che, {jugador}, tomá, escuchanos en {plataforma}."

Los diálogos de Nikola se ajustan con él, para que suene como habla.

### Recompensas

- El **enlace para escuchar a Orate en {plataforma}**.
- Un **tema de Orate** ("Psicopata (El Loco de la Ruta)") en el Phone del jugador, que suena completo desde el archivo que pasa la banda.
- La **figurita de Nikola** en el álbum.

Al terminar aparece un panel de **¡Misión cumplida!** con lo que se ganó, el botón para escuchar a Orate en {plataforma}, otro para abrir el Phone y un adelanto de lo que viene (la misión 2). Cuando hay algo nuevo en el Phone, su botón muestra un punto amarillo hasta que se abre. Link de Orate: Spotify (cargado en `src/data/bandas.ts`).

### Recursos necesarios

| Tipo | Elementos |
| --- | --- |
| Fondos | La esquina de El Bunker, con el kiosco al lado |
| Personajes animados | Jugador con skin de metalero; Nikola con y sin pasamontañas; kiosquero; perro |
| Objetos | Monedas, galletitas, pasamontañas |
| Interfaz | Menú de tres acciones, inventario, diálogos flotantes, Phone, álbum, campo de nombre |
| Logos | Logo de Orate para la figurita de Nikola (ya está: `public/assets/logos/orate.jpg`) |
| Sonido | Un tema de Orate, balbuceos de voces, sonidos de ambiente de calle |

### Eventos para medir

Inicio de la misión, cada objeto conseguido, misión terminada, tema de Orate reproducido en el Phone y toque en "escuchanos en {plataforma}".
