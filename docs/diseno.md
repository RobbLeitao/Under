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

**Venues:** Vinoteca Perrier y Teatro Vorterix. En Perrier está Raulo, el encargado (persona real): aparece en todas las misiones que pasan por ahí y puede ser protagonista de más de una. En la pared de Perrier hay un flyer que cambia con cada misión (la banda que toca esa noche); si el jugador pasa por la vereda y no hay misión en curso, no hay flyer. Sala de ensayo de todas las bandas, por ahora: El Bunker - Estudio y Salas de Ensayo.

### Misiones (borrador)

Las misiones son de público: el jugador no toca, sino que ayuda y descubre.

1. **El encuentro (fácil).** En la calle, el jugador se cruza con Nikola, de Orate, que perdió su pasamontañas camino al ensayo. Lo perdió en la misma cuadra de El Bunker, cerca del kiosco. Recompensa: un tema de Orate en el Phone del jugador y la invitación a escucharlos en {plataforma}.
2. **La cuarta cuerda: el show de Exiliado en Vinoteca Perrier (media).** A Jota se le corta la cuarta cuerda del bajo antes del show, y el jugador consigue un repuesto para que Exiliado pueda tocar. Recompensa: la figurita de Jota y un tema de Exiliado en el Phone. Guion completo más abajo. Abismal y Peke pasan a otra misión, a definir.
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
- **Animaciones:** todos los personajes caminan con el mismo movimiento (paso largo, pie en el aire y brazos que se balancean): el jugador, Nikola al llegar (con o sin pasamontañas) y el perro. Hacia la izquierda, espejado; quietos, vuelven al sprite base. Quien habla gesticula mientras dura el balbuceo de su línea. Las hojas de cuadros están en `public/assets/sprites/anim/`.
- **No se atraviesa a nadie:** el jugador no puede pasar a través de Nikola ni del perro. Con teclado frena al lado; al tocar un destino del otro lado, los rodea por atrás. El perro, si va a chocar con el jugador, se da vuelta.
- **La parada de colectivo tiene profundidad:** el jugador puede pasar por atrás (la parada lo tapa y se lo ve a través del vidrio) o por adelante.
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

## Misión 2: "La cuarta cuerda" (guion)

Una misión media, de 8 a 12 minutos, en la Vinoteca Perrier, la noche de un show de **Exiliado**. Presenta a **Jota**, el bajista, y a **Raulo**, el encargado de Perrier, y termina con el jugador en primera fila. La dificultad sube respecto de la misión 1 porque hay más pasos y una pista que hay que leer al mirar un objeto. No se combinan objetos: cada uno se usa solo.

Arte en el canvas de Claude Design: "Misión 2 · Vereda de Perrier", "Vereda de Perrier sin misión", "Misión 2 · El show de Exiliado, adentro de Perrier", "Personajes de la misión 2" y "Animaciones de la misión 2". Medidas y archivos en `docs/estilo-visual.md`.

### Cómo se llega

**Caminando.** Las escenas están una al lado de la otra: al llegar al borde derecho de la esquina de El Bunker, el jugador aparece en la vereda de Perrier, entrando por la izquierda. Al llegar al borde izquierdo de la vereda de Perrier, vuelve a la esquina de El Bunker, entrando por la derecha. En la misión 1, el jugador entra a la esquina por la izquierda (más adelante, desde una escena de inicio, como una plaza).

Se puede ir a Perrier en cualquier momento. Mientras la misión 1 no esté terminada, la vereda está **sin misión**: no hay flyer, el ventanal está apagado, Raulo dice que todavía no abrieron y la misión 2 no arranca. Jota sale a la vereda recién después de devolverle el pasamontañas a Nikola.

### Escenas

1. **La vereda de Perrier, al anochecer.** La puerta de madera con Raulo, el ventanal por el que se ve a Exiliado probando, el flyer del show pegado en la pared de ladrillos ("HOY EXILIADO", con el símbolo de la banda), la chapa con el número 2051 sobre la puerta, la farola al borde de la vereda y una rejilla de desagüe en el cordón.
2. **El salón de Perrier, durante el show.** Escena corta, sin control del jugador. Techo bajo de vigas, todo bañado en luz roja y rosa, humo naranja, Jota tocando y el resto de Exiliado en siluetas, y el público de espaldas.

### Paso a paso

1. **Llegar.** El jugador llega caminando desde la esquina de El Bunker. Por el ventanal se ve a Exiliado probando sonido.
2. **Hablar con Raulo.** Todavía no abrieron: están probando.
3. **Jota sale a la vereda** (escena automática, al terminar esa charla). Se le cortó la cuarta cuerda en la prueba, no trajo repuesto y las casas de música ya cerraron. Sin la cuarta no hay show.
4. **Hablar con Raulo otra vez.** Hace un mes un bajista se olvidó un estuche en el depósito, capaz con cuerdas. Pero se le cayó la llave por la rejilla. "Si me la sacás, te dejo pasar."
5. **Mirar la rejilla.** La llave está en un llavero con una argolla, abajo de todo. Con la mano no se llega.
6. **Pedirle algo a Jota.** El jugador le pide algo largo y finito para pescar la llave, y Jota le da la **cuerda cortada**.
7. **Mirar la cuerda.** La pista: "La punta quedó enrulada. Parece un gancho."
8. **Pescar la llave.** Usar la cuerda en la rejilla engancha la argolla: el jugador tiene la **llave del depósito**.
9. **Dar la llave a Raulo.** Abre el depósito, vuelve con un **juego de cuerdas** de bajo, se lo da al jugador y lo deja pasar.
10. **Dar las cuerdas a Jota.** Cambia la cuarta y Exiliado arranca el show. El show es una escena corta adentro del salón, de unos 10 segundos y sin control del jugador, con el fragmento del tema de Exiliado que el jugador gana, como en la misión 1.
11. **De vuelta en la vereda.** Fundido a negro y el jugador aparece en la vereda, solo con Raulo en la puerta, con la misión cumplida. Cierre y recompensas.

### Diálogos (borrador)

**Cómo hablan.** Raulo es tranquilo, de pocas palabras, seco y con humor; le dice "pendejo" al jugador. Jota está desesperado por el show y habla rápido. El jugador habla en blanco, Raulo en amarillo (`#FFD45A`) y Jota en lila (`#C9A0FF`).

**Antes de terminar la misión 1** (sin flyer en la pared y el ventanal apagado)

- **Raulo:** "Todavía no abrimos, pendejo. Pasá más tarde."
- **Mirar el ventanal:** "Está oscuro. No hay nadie."

**1. Llegar y hablar con Raulo**

- **Jugador:** "Buenas. ¿Se puede pasar?"
- **Raulo:** "Todavía no abrimos. Están probando sonido."
- **Raulo:** "Volvé a la noche, que toca Exiliado."

**2. Jota sale a la vereda** (escena automática, al terminar esa charla)

- **Jota:** "¡Noooo! ¡Se me cortó la cuarta!"
- **Jota:** "Y no traje repuesto… Las casas de música ya cerraron."
- **Jota:** "Sin la cuarta no hay show, Raulo."
- **Raulo:** "Tranquilo. Dejame pensar."

**3. Hablar con Jota**

- **Jugador:** "¿Te puedo ayudar?"
- **Jota:** "Si me conseguís una cuerda de bajo, te hago un monumento."
- **Jota:** "Pero a esta hora no la consigue nadie."

**4. Hablar con Raulo otra vez**

- **Raulo:** "Hace un mes un bajista se olvidó un estuche en el depósito."
- **Raulo:** "Capaz que tiene cuerdas. Pero la llave del depósito se me cayó por la rejilla."
- **Raulo:** "Si me la sacás, te dejo pasar."
- **Jugador:** "Hecho."

**5. La rejilla**

- **Mirar la rejilla:** "Allá abajo brilla un llavero con una argolla. Con la mano no llego."
- **Agarrar la rejilla:** "No entra ni un dedo."

**6. Pedirle algo a Jota** (después del paso 4)

- **Jugador:** "Necesito algo largo y finito para pescar una llave."
- **Jota:** "¿Largo y finito? Tomá la cuarta. Total, ya fue."
- El jugador recibe la **cuerda cortada**.

**7. La cuerda**

- **Mirar la cuerda:** "La punta quedó enrulada. Parece un gancho."
- **Usar la cuerda en la rejilla:** "Un poquito más… ¡La tengo!" El jugador recibe la **llave del depósito**.
- **Usar la cuerda en otra cosa:** "No, eso no."

**8. Darle la llave a Raulo**

- **Raulo:** "Mirá vos. Esperá acá."
- (Raulo entra y vuelve.)
- **Raulo:** "Había un juego de cuerdas nuevo. Tomá, dáselo vos."
- **Raulo:** "Y pasá, que te lo ganaste."
- El jugador recibe el **juego de cuerdas**.

**9. Darle las cuerdas a Jota**

- **Jota:** "¡Son de bajo! ¡Y nuevas!"
- **Jota:** "Dame dos minutos y arrancamos."
- (Pasa al salón.)

**10. El show, en el salón**

- **Jota, desde el escenario:** "¡Buenas noches, Perrier! ¡Somos Exiliado!"
- (Suenan unos 10 segundos del tema de Exiliado que el jugador gana en esta misión, desde el archivo que pasa la banda. La escena dura lo que dura ese fragmento.)
- **Jota, al final:** "Che, {jugador}, sin vos no tocábamos. Tomá, escuchanos en {plataforma}."

**Saltar la escena.** Durante el show hay un botón **Saltar** arriba a la derecha, en el lugar del de pausa (mínimo 44 px de alto), y Esc hace lo mismo. Saltar lleva directo a la vereda con Raulo y la misión cumplida: el tema, la figurita y el enlace se ganan igual.

**11. De vuelta en la vereda** (después del fundido, solo Raulo en la puerta)

- **Raulo:** "Buena banda, ¿no? Volvé cuando quieras, pendejo."
- El flyer sigue en la pared hasta que el jugador se va de la pantalla. La próxima vez que pase, ya no está.

**Mirar y agarrar en la vereda**

- **Raulo:** "Raulo, el encargado. Es enorme, pero tiene cara de buen tipo."
- **Jota:** "Jota, el bajista de Exiliado. Está desesperado."
- **El bajo de Jota:** "Un bajo de cuatro cuerdas. Bueno, de tres."
- **El flyer:** "Hoy toca Exiliado. Está bueno el símbolo."
- **Agarrar el flyer:** "Mejor lo dejo. Si no, ¿cómo se enteran?"
- **El ventanal:** "Exiliado está probando. Se escucha hasta acá afuera."
- **La puerta:** "Una puerta de madera de las de antes."
- **La chapa:** "Perrier, 2051. Desde 1992."
- **Hablar con Raulo después de darle la llave:** "Pasá, pasá."

Los diálogos de Raulo y de Jota se ajustan con ellos, para que suenen como hablan.

### Recompensas

- La **figurita de Jota** en el álbum.
- Un **tema de Exiliado** en el Phone, desde el archivo que pasa la banda.
- El **enlace para escuchar a Exiliado** en {plataforma}.

### Recursos necesarios

| Tipo | Elementos |
| --- | --- |
| Fondos | La vereda de Perrier con show y sin misión; el salón durante el show |
| Decorados | La farola al borde de la vereda (tapa al jugador cuando pasa por detrás) |
| Objeto en escena | El flyer de Exiliado, solo mientras hay misión |
| Personajes | Jota y Raulo, con animaciones de caminar y de hablar |
| Objetos | Cuerda cortada, llave del depósito (con argolla), juego de cuerdas de bajo |
| Música | Un tema de Exiliado (y el fragmento de unos 10 segundos para el show) |

### Notas para el arte y el desarrollo

- **Jota es diestro:** pulsa con la mano derecha y pisa con la izquierda, con el mástil hacia su izquierda. Su sprite **nunca se espeja**, ni al caminar hacia la izquierda, porque quedaría zurdo.
- **Todos los que caminan tienen animación de caminar y de hablar**, con el mismo esquema de 4 cuadros que el jugador y Nikola.
- **El flyer de la pared es un objeto aparte del fondo:** el de esta misión es el de Exiliado. Sin misión en curso, la pared queda sin flyer.

### Temas abiertos

- El tema de Exiliado y su fragmento de 10 segundos: falta el archivo.
- Pendiente para más adelante: la misión de Abismal y Peke.
