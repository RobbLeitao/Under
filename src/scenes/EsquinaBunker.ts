import Phaser from 'phaser';
import { ANCHO, ALTO_ESCENA, ESCALA } from '../config';
import { ESQUINA_EL_BUNKER as DATOS, type Personaje, type PuntoInteres, type Respuesta } from '../data/escenas';
import { RESPUESTAS_POR_DEFECTO, RESPUESTA_USAR_POR_DEFECTO } from '../data/acciones';
import { DIALOGOS, type ClaveHablante, type Dialogo } from '../data/dialogos';
import { OBJETOS } from '../data/objetos';
import { MISION_1 } from '../data/misiones/mision1';
import type { Accion } from '../data/misiones/tipos';
import { cumple, hayNovedades, marcar, tieneMarca } from '../systems/estado';
import { aplicarEfectos, buscarRegla, texturaDe } from '../systems/misiones';
import { cortarFragmento, tocarFragmento } from '../systems/musica';
import { detenerAmbiente, iniciarAmbiente, pasaUnAuto } from '../systems/ambiente';
import { BarraAcciones } from '../ui/BarraAcciones';
import { reproducirDialogo } from '../ui/Vineta';
import { mostrarMisionCumplida } from '../ui/PanelMision';

/** Velocidad del jugador, en píxeles por segundo. */
const VELOCIDAD = 260;
/** Mitad del ancho del cuerpo del jugador en el piso, en unidades (para los choques). */
const MITAD_JUGADOR = 6;
/** Cuántas veces se rodean obstáculos al armar una ruta. */
const RODEOS_MAXIMOS = 4;
/** El perro se frena cada tanto: cuánto camina entre paradas y cuánto dura cada parada. */
const MS_PERRO_CAMINA = [3000, 8000];
const MS_PERRO_QUIETO = [1500, 4000];
/** Cada cuánto pasa un auto por la avenida (sonido ambiente). */
const MS_ENTRE_AUTOS = [7000, 18000];
/** Duración de la entrada de Nikola al empezar la misión. */
const MS_ENTRADA_NIKOLA = 2600;
/** Con teclado, el movimiento en profundidad (arriba/abajo) es más lento: la vereda es angosta. */
const FACTOR_PROFUNDIDAD = 0.5;
const LADO_BOTON_PAUSA = 56;

type Direccion = 'izquierda' | 'derecha' | 'arriba' | 'abajo';

/** Un personaje que pasea solo por la vereda (el perro). */
interface Paseante {
  sprite: Phaser.GameObjects.Sprite;
  datos: Personaje;
  /** 1 hacia la derecha, -1 hacia la izquierda. */
  sentido: 1 | -1;
  /** Posición en píxeles sin redondear (el sprite se ajusta a la grilla de 4 px). */
  x: number;
  quietoHasta: number;
  proximaParada: number;
}

const entre = ([min, max]: number[]) => min + Math.random() * (max - min);

/** Un punto del piso, en píxeles (posición de los pies). */
interface Punto {
  x: number;
  y: number;
}

/** Lo que ocupa un personaje en el piso, en píxeles: no se puede atravesar. */
interface Obstaculo extends Punto {
  /** Distancia mínima en x entre su centro y el del jugador (incluye el cuerpo del jugador). */
  mitadAncho: number;
  /** Cuánto ocupa hacia atrás y hacia adelante de sus pies. */
  mitadFondo: number;
}

/**
 * La esquina de El Bunker: fondo, jugador, Nikola y el perro. Se camina tocando el piso
 * o con el teclado (flechas o WASD); al tocar a alguien o algo, el jugador se acerca
 * y se elige una acción en la barra. Esc o P pausan.
 */
export class EsquinaBunker extends Phaser.Scene {
  private jugador!: Phaser.GameObjects.Sprite;
  /** Posición de los pies del jugador. */
  private pies = { x: 0, y: 0 };
  /** Puntos que le faltan recorrer al jugador al caminar tocando (esquiva obstáculos). */
  private ruta: Punto[] = [];
  /** Adónde va la ruta actual (para recalcularla si alguien se cruza). */
  private destino: Punto | null = null;
  private recalculada = false;
  /** El jugador está caminando (con la animación de caminar puesta). */
  private caminando = false;
  private paseantes: Paseante[] = [];
  /** Zonas tocables de cada punto: las de un paseante se mueven con él. */
  private zonas = new Map<string, Phaser.GameObjects.Zone>();
  private barra!: BarraAcciones;
  private seleccionado: PuntoInteres | null = null;
  /** Se cumple cuando el jugador termina de caminar (o cuando lo interrumpen). */
  private llegada: Promise<void> = Promise.resolve();
  private alLlegar?: () => void;
  /** Mientras hay un diálogo o una animación, las acciones nuevas se ignoran. */
  private ocupado = false;
  private objetosEnEscena: { sprite: Phaser.GameObjects.Image; datos: (typeof DATOS.objetos)[number] }[] = [];
  /** Hay un diálogo, una animación o un panel en pantalla: el teclado no mueve al jugador. */
  private enDialogo = false;
  private teclas: Record<Direccion, Phaser.Input.Keyboard.Key[]> = { izquierda: [], derecha: [], arriba: [], abajo: [] };
  private moviendoConTeclado = false;

  constructor() {
    super('EsquinaBunker');
  }

  /** Deja todo como nuevo: la escena se vuelve a crear al empezar de nuevo o al volver del inicio. */
  init() {
    this.pies = { x: 0, y: 0 };
    this.ruta = [];
    this.destino = null;
    this.recalculada = false;
    this.caminando = false;
    this.paseantes = [];
    this.zonas = new Map();
    this.seleccionado = null;
    this.llegada = Promise.resolve();
    this.alLlegar = undefined;
    this.ocupado = false;
    this.objetosEnEscena = [];
    this.enDialogo = false;
    this.moviendoConTeclado = false;
  }

  create() {
    this.add.image(0, 0, DATOS.fondo).setOrigin(0);

    for (const c of DATOS.carteles) {
      this.add
        .text(c.x * ESCALA, c.y * ESCALA, c.texto, {
          fontFamily: '"Pixelify Sans"',
          fontSize: `${Math.round(c.tamano * ESCALA)}px`,
          color: c.color,
        })
        .setOrigin(0.5);
    }

    for (const p of DATOS.personajes) {
      const sprite = this.add
        .sprite(p.x * ESCALA, p.y * ESCALA, texturaDe(MISION_1, p.clave, p.textura))
        .setOrigin(0.5, 1)
        .setDepth(p.y * ESCALA)
        .setName(p.clave);
      if (p.paseo) {
        const ahora = this.time.now;
        this.paseantes.push({
          sprite,
          datos: p,
          sentido: Math.random() < 0.5 ? 1 : -1,
          x: sprite.x,
          quietoHasta: 0,
          proximaParada: ahora + entre(MS_PERRO_CAMINA),
        });
      }
    }

    // Decorados que se ordenan por profundidad con el jugador (la parada de colectivo).
    for (const d of DATOS.decorados) {
      this.add.image(d.x * ESCALA, d.y * ESCALA, d.textura).setOrigin(0).setDepth(d.base * ESCALA);
    }

    for (const datos of DATOS.objetos) {
      const sprite = this.add
        .image(datos.x * ESCALA, datos.y * ESCALA, datos.textura)
        .setOrigin(0)
        .setDepth((datos.y * ESCALA) + 1);
      this.objetosEnEscena.push({ sprite, datos });
      if (datos.brilla) this.destello(sprite);
    }
    this.actualizarObjetosEnEscena();

    this.pies = { x: DATOS.inicioJugador.x * ESCALA, y: DATOS.inicioJugador.y * ESCALA };
    this.jugador = this.add.sprite(0, 0, 'jugador').setOrigin(0.5, 1);
    this.actualizarJugador();

    this.barra = new BarraAcciones(this, {
      alElegirVerbo: (verbo) => this.actuar(verbo),
      alTocarPhone: () => this.abrirPhone(),
      alSoltarObjeto: (objeto, x, y) => this.soltarObjeto(objeto, x, y),
    });

    this.barra.setNovedad(hayNovedades());
    // Al volver del Phone, el punto de novedades se apaga. Los eventos de la escena
    // sobreviven a un reinicio, así que se sueltan al apagarla.
    const alVolver = () => this.barra.setNovedad(hayNovedades());
    this.events.on(Phaser.Scenes.Events.RESUME, alVolver);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(Phaser.Scenes.Events.RESUME, alVolver));

    this.crearBotonPausa();
    this.crearTeclas();

    // Se crean al revés: en Phaser la última zona queda arriba, y así gana la primera de la
    // lista (los personajes) cuando se superpone con un objeto del fondo, igual que al soltar.
    // Nikola va primero en la lista, así que su zona queda arriba de todas: el perro,
    // aunque pase cerca, nunca le tapa un toque.
    for (const punto of [...DATOS.puntos].reverse()) {
      const z = punto.zona;
      const zona = this.add
        .zone(z.x * ESCALA, z.y * ESCALA, z.ancho * ESCALA, z.alto * ESCALA)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.tocarPunto(punto));
      this.zonas.set(punto.clave, zona);
    }

    // Ambiente de calle: rumor de fondo y, cada tanto, un auto.
    iniciarAmbiente(this);
    const programarAuto = () =>
      this.time.delayedCall(entre(MS_ENTRE_AUTOS), () => {
        pasaUnAuto();
        programarAuto();
      });
    programarAuto();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => detenerAmbiente());

    this.input.on('pointerdown', (puntero: Phaser.Input.Pointer, tocados: Phaser.GameObjects.GameObject[]) => {
      if (puntero.y >= ALTO_ESCENA || tocados.length > 0 || this.ocupado) return;
      this.seleccionado = null;
      this.barra.elegirObjeto(null);
      this.barra.setObjetivo(null);
      this.caminarHacia(puntero.x, puntero.y);
    });

    // Solo en desarrollo: ?dialogo=clave muestra ese diálogo al entrar y ?phone abre el Phone.
    const parametros = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
    const atajo = parametros?.get('dialogo');
    if (parametros?.has('phone')) {
      this.time.delayedCall(0, () => this.abrirPhone());
    } else if (atajo && atajo in DIALOGOS) {
      const d: Dialogo = DIALOGOS[atajo as keyof typeof DIALOGOS];
      void this.dialogo(d);
    } else if (!tieneMarca(MISION_1.marcaInicio)) {
      this.entradaNikola();
    }
  }

  /** Paso 1 de la misión: suena un riff en los auriculares y Nikola llega apurado desde la derecha. */
  private entradaNikola() {
    const musica = MISION_1.musicaEntrada;
    if (musica) void tocarFragmento(this, musica.tema, musica);

    const nikola = this.children.getByName('nikola') as Phaser.GameObjects.Sprite;
    const datos = DATOS.personajes.find((p) => p.clave === 'nikola');
    const base = datos ? texturaDe(MISION_1, datos.clave, datos.textura) : 'nikola';
    const destino = nikola.x;
    const piso = nikola.y;
    const pies = { x: ANCHO + nikola.width };
    this.ocupado = true;
    this.enDialogo = true;

    // Camina hacia la izquierda: la hoja de caminar, espejada, como el jugador.
    nikola.setFlipX(true).play(`${base}-camina`);
    this.tweens.add({
      targets: pies,
      x: destino,
      duration: MS_ENTRADA_NIKOLA,
      onUpdate: () => nikola.setPosition(Math.round(pies.x / ESCALA) * ESCALA, piso),
      onComplete: () => {
        nikola.stop();
        nikola.setTexture(base).setFlipX(false);
        nikola.setPosition(destino, piso);
        marcar(MISION_1.marcaInicio);
        this.ocupado = false;
        this.enDialogo = false;
        this.barra.mostrarMensaje('Nikola parece preocupado. Tocalo y hablale.', 5000);
      },
    });
    nikola.setPosition(pies.x, piso);
  }

  /** Botón de pausa arriba a la derecha; queda por encima de las viñetas. */
  private crearBotonPausa() {
    const x = ANCHO - 16 - LADO_BOTON_PAUSA;
    const y = 16;
    const fondo = this.add
      .rectangle(x, y, LADO_BOTON_PAUSA, LADO_BOTON_PAUSA, 0x241f2e, 0.9)
      .setOrigin(0)
      .setStrokeStyle(4, 0x3a3348)
      .setDepth(21000)
      .setInteractive({ useHandCursor: true });
    this.add
      .graphics()
      .setDepth(21001)
      .fillStyle(0xf4efe6)
      .fillRect(x + 18, y + 16, 8, 24)
      .fillRect(x + 30, y + 16, 8, 24);
    fondo.on('pointerup', () => this.abrirPausa());
  }

  private abrirPausa() {
    if (!this.scene.isActive()) return;
    this.scene.launch('Pausa', { volverA: this.scene.key });
    this.scene.pause();
  }

  /**
   * Flechas y WASD. Sin captura de teclas, para no robarle letras a ningún campo de texto.
   * Las teclas son de esta escena: en la pantalla de inicio no existen.
   */
  private crearTeclas() {
    const teclado = this.input.keyboard;
    if (!teclado) return;
    const K = Phaser.Input.Keyboard.KeyCodes;
    const tecla = (codigo: number) => teclado.addKey(codigo, false);
    this.teclas = {
      izquierda: [tecla(K.LEFT), tecla(K.A)],
      derecha: [tecla(K.RIGHT), tecla(K.D)],
      arriba: [tecla(K.UP), tecla(K.W)],
      abajo: [tecla(K.DOWN), tecla(K.S)],
    };
    teclado.on('keydown-ESC', () => this.abrirPausa());
    teclado.on('keydown-P', () => this.abrirPausa());
  }

  update(tiempo: number, delta: number) {
    this.moverConTeclado(delta);
    this.seguirRuta(delta);
    for (const paseante of this.paseantes) this.pasear(paseante, tiempo, delta);
  }

  /**
   * El perro va y viene por su tramo de vereda a paso lento, se da vuelta en los extremos
   * y a veces se frena. Mientras el jugador lo tiene elegido, se queda quieto.
   */
  private pasear(p: Paseante, tiempo: number, delta: number) {
    const paseo = p.datos.paseo;
    if (!paseo) return;
    const base = texturaDe(MISION_1, p.datos.clave, p.datos.textura);
    const elegido = this.seleccionado?.clave === p.datos.clave;
    if (!elegido && tiempo >= p.proximaParada) {
      p.quietoHasta = tiempo + entre(MS_PERRO_QUIETO);
      p.proximaParada = p.quietoHasta + entre(MS_PERRO_CAMINA);
    }

    if (elegido || tiempo < p.quietoHasta) {
      // Quieto: sprite base, en el lugar donde está.
      if (p.sprite.anims.isPlaying) p.sprite.stop();
      if (p.sprite.texture.key !== base) p.sprite.setTexture(base);
    } else {
      // Primero la animación y después el paso: nunca se mueve sin animar.
      p.sprite.play(`${base}-camina`, true);
      const siguiente = p.x + p.sentido * paseo.velocidad * ESCALA * (delta / 1000);
      // No atraviesa al jugador: si lo va a chocar, se da vuelta.
      if (this.chocaConJugador(p, siguiente) && !this.chocaConJugador(p, p.x)) {
        p.sentido = p.sentido === 1 ? -1 : 1;
      } else {
        p.x = siguiente;
      }
      const min = paseo.xMin * ESCALA;
      const max = paseo.xMax * ESCALA;
      if (p.x <= min || p.x >= max) {
        p.x = Phaser.Math.Clamp(p.x, min, max);
        p.sentido = p.sentido === 1 ? -1 : 1;
      }
      p.sprite.setFlipX(p.sentido === -1);
    }
    p.sprite.x = Math.round(p.x / ESCALA) * ESCALA;

    // La zona tocable acompaña al perro siempre, quieto o caminando.
    const zona = this.zonas.get(p.datos.clave);
    const punto = DATOS.puntos.find((q) => q.clave === p.datos.clave);
    if (zona && punto) zona.x = p.sprite.x + (punto.zona.x - p.datos.x) * ESCALA;
  }

  /** Adónde camina el jugador para interactuar: si el punto es un paseante, se mueve con él. */
  private acercarseA(punto: PuntoInteres) {
    const paseante = this.paseantes.find((p) => p.datos.clave === punto.clave);
    const x = paseante ? paseante.sprite.x / ESCALA + (punto.acercarse.x - paseante.datos.x) : punto.acercarse.x;
    return { x: x * ESCALA, y: punto.acercarse.y * ESCALA };
  }

  private apretada(direccion: Direccion) {
    return this.teclas[direccion].some((t) => t.isDown);
  }

  /**
   * Izquierda/derecha caminan por la vereda; arriba/abajo, en profundidad dentro de la franja.
   * Una tecla cancela el destino tocado (y la acción que esperaba la llegada).
   */
  private moverConTeclado(delta: number) {
    if (this.enDialogo) return;
    const dx = Number(this.apretada('derecha')) - Number(this.apretada('izquierda'));
    const dy = Number(this.apretada('abajo')) - Number(this.apretada('arriba'));

    if (!dx && !dy) {
      if (this.moviendoConTeclado) {
        this.moviendoConTeclado = false;
        this.detener();
      }
      return;
    }

    if (!this.moviendoConTeclado || this.ruta.length > 0) {
      this.moviendoConTeclado = true;
      this.ruta = [];
      this.destino = null;
      this.detener();
      if (this.seleccionado) {
        this.seleccionado = null;
        this.barra.setObjetivo(null);
      }
      this.iniciarPasos();
    }
    if (dx) this.jugador.setFlipX(dx < 0);

    const z = DATOS.zonaCaminable;
    const avance = (VELOCIDAD * delta) / 1000;
    // Eje por eje: contra un obstáculo, el jugador se desliza por el costado en vez de atravesarlo.
    const nx = Phaser.Math.Clamp(this.pies.x + dx * avance, z.xMin * ESCALA, z.xMax * ESCALA);
    if (!this.bloquea(this.pies, { x: nx, y: this.pies.y })) this.pies.x = nx;
    const ny = Phaser.Math.Clamp(this.pies.y + dy * avance * FACTOR_PROFUNDIDAD, z.yMin * ESCALA, z.yMax * ESCALA);
    if (!this.bloquea(this.pies, { x: this.pies.x, y: ny })) this.pies.y = ny;
    this.actualizarJugador();
  }

  // ---------- Choques con Nikola y el perro ----------

  /** Lo que ocupan en el piso los personajes con cuerpo, donde están ahora. */
  private obstaculos(): Obstaculo[] {
    const lista: Obstaculo[] = [];
    for (const p of DATOS.personajes) {
      if (!p.cuerpo) continue;
      const sprite = this.children.getByName(p.clave) as Phaser.GameObjects.Sprite | null;
      if (!sprite) continue;
      lista.push({
        x: sprite.x,
        y: sprite.y,
        mitadAncho: (p.cuerpo.mitadAncho + MITAD_JUGADOR) * ESCALA,
        mitadFondo: p.cuerpo.mitadFondo * ESCALA,
      });
    }
    return lista;
  }

  private dentro(o: Obstaculo, p: Punto) {
    return Math.abs(p.x - o.x) < o.mitadAncho && Math.abs(p.y - o.y) < o.mitadFondo;
  }

  /**
   * Pasar de `desde` a `hasta` choca con alguien. Si ya estaba encima (por ejemplo, el perro
   * se le paró al lado), se lo deja salir: solo se bloquea entrar.
   */
  private bloquea(desde: Punto, hasta: Punto) {
    return this.obstaculos().some((o) => this.dentro(o, hasta) && !this.dentro(o, desde));
  }

  /** El perro, en la posición x (píxeles), chocaría con el jugador. */
  private chocaConJugador(p: Paseante, x: number) {
    const cuerpo = p.datos.cuerpo;
    if (!cuerpo) return false;
    return (
      Math.abs(x - this.pies.x) < (cuerpo.mitadAncho + MITAD_JUGADOR) * ESCALA &&
      Math.abs(p.sprite.y - this.pies.y) < cuerpo.mitadFondo * ESCALA
    );
  }

  /** Primer obstáculo que corta el tramo de a hasta b (se revisa cada 4 px). */
  private obstaculoEnTramo(a: Punto, b: Punto): Obstaculo | null {
    const pasos = Math.max(1, Math.ceil(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / ESCALA));
    const lista = this.obstaculos().filter((o) => !this.dentro(o, a));
    for (let i = 1; i <= pasos; i++) {
      const q = { x: a.x + ((b.x - a.x) * i) / pasos, y: a.y + ((b.y - a.y) * i) / pasos };
      const o = lista.find((ob) => this.dentro(ob, q));
      if (o) return o;
    }
    return null;
  }

  /** Línea por la que se rodea un obstáculo: por atrás, o por adelante si atrás no entra. */
  private filaDeRodeo(o: Obstaculo): number | null {
    const z = DATOS.zonaCaminable;
    const atras = o.y - o.mitadFondo - ESCALA;
    const adelante = o.y + o.mitadFondo + ESCALA;
    if (atras >= z.yMin * ESCALA) return atras;
    if (adelante <= z.yMax * ESCALA) return adelante;
    return null;
  }

  /** Si el destino cae adentro de alguien, se corre al lugar libre más cercano. */
  private liberar(p: Punto): Punto {
    const o = this.obstaculos().find((ob) => this.dentro(ob, p));
    if (!o) return p;
    const fila = this.filaDeRodeo(o);
    if (fila !== null) return { x: p.x, y: fila };
    const lado = p.x < o.x ? -1 : 1;
    return { x: o.x + lado * (o.mitadAncho + ESCALA), y: p.y };
  }

  /** Ruta hasta el destino: en línea recta, o rodeando por atrás a quien esté en el camino. */
  private planificar(desde: Punto, hasta: Punto): Punto[] {
    const z = DATOS.zonaCaminable;
    const enVereda = (q: Punto) => ({
      x: Phaser.Math.Clamp(q.x, z.xMin * ESCALA, z.xMax * ESCALA),
      y: Phaser.Math.Clamp(q.y, z.yMin * ESCALA, z.yMax * ESCALA),
    });
    const ruta: Punto[] = [];
    let actual = desde;
    for (let i = 0; i < RODEOS_MAXIMOS; i++) {
      const o = this.obstaculoEnTramo(actual, hasta);
      if (!o) break;
      const lado = Math.sign(hasta.x - actual.x) || 1;
      const fila = this.filaDeRodeo(o);
      if (fila === null) {
        // No se puede rodear: se queda antes del obstáculo.
        ruta.push(enVereda({ x: o.x - lado * (o.mitadAncho + ESCALA), y: actual.y }));
        return ruta;
      }
      const entrada = enVereda({ x: o.x - lado * (o.mitadAncho + ESCALA), y: fila });
      const salida = enVereda({ x: o.x + lado * (o.mitadAncho + ESCALA), y: fila });
      // Solo hace falta pasar por la salida si el destino está del otro lado.
      ruta.push(entrada);
      if (Math.sign(hasta.x - salida.x) === lado || Math.abs(hasta.x - o.x) < o.mitadAncho) ruta.push(salida);
      actual = ruta[ruta.length - 1];
    }
    ruta.push(hasta);
    return ruta;
  }

  /** Avanza por la ruta. Si alguien se cruza, la recalcula una vez; si sigue trabado, se queda. */
  private seguirRuta(delta: number) {
    if (this.ruta.length === 0 || this.moviendoConTeclado) return;
    const objetivo = this.ruta[0];
    const paso = (VELOCIDAD * delta) / 1000;
    const dx = objetivo.x - this.pies.x;
    const dy = objetivo.y - this.pies.y;
    const distancia = Math.hypot(dx, dy);
    const llega = distancia <= paso;
    const siguiente = llega ? objetivo : { x: this.pies.x + (dx / distancia) * paso, y: this.pies.y + (dy / distancia) * paso };

    if (this.bloquea(this.pies, siguiente)) {
      if (!this.recalculada && this.destino) {
        this.recalculada = true;
        this.ruta = this.planificar(this.pies, this.liberar(this.destino));
        return;
      }
      this.ruta = [];
      this.detener();
      return;
    }

    if (Math.abs(dx) >= 1) this.jugador.setFlipX(dx < 0);
    this.pies = { x: siguiente.x, y: siguiente.y };
    this.actualizarJugador();
    if (llega) {
      this.ruta.shift();
      this.recalculada = false;
      if (this.ruta.length === 0) this.detener();
    }
  }

  /** Muestra un diálogo; mientras dura, el teclado no mueve al jugador. */
  private async dialogo(d: Dialogo) {
    this.enDialogo = true;
    await reproducirDialogo(this, d.lineas, (quien) => this.ancla(quien), d.banda, (quien, hablando) =>
      this.gesto(quien, hablando),
    );
    this.enDialogo = false;
  }

  /** Sprite y textura base de quien habla (el kiosquero no tiene sprite). */
  private hablante(quien: ClaveHablante): { sprite: Phaser.GameObjects.Sprite; base: string } | null {
    if (quien === 'jugador') return { sprite: this.jugador, base: 'jugador' };
    const datos = DATOS.personajes.find((p) => p.clave === quien);
    const sprite = this.children.getByName(quien) as Phaser.GameObjects.Sprite | null;
    if (!datos || !sprite) return null;
    return { sprite, base: texturaDe(MISION_1, datos.clave, datos.textura) };
  }

  /** Mientras dura el balbuceo de su línea, el que habla gesticula; después vuelve al sprite base. */
  private gesto(quien: ClaveHablante, hablando: boolean) {
    const h = this.hablante(quien);
    if (!h) return;
    const animacion = `${h.base}-habla`;
    if (hablando && this.anims.exists(animacion)) {
      h.sprite.play(animacion);
    } else {
      h.sprite.stop();
      h.sprite.setTexture(h.base);
    }
  }

  /** Abre el Phone encima de la escena, que queda en pausa hasta que se cierre. */
  private abrirPhone(pantalla?: 'musica' | 'album') {
    if (this.ocupado) return;
    cortarFragmento();
    this.scene.launch('Phone', { volverA: this.scene.key, pantalla });
    this.scene.pause();
  }

  /** Soltar un objeto del inventario: si cayó sobre algo, el jugador va y lo usa ahí. */
  private soltarObjeto(objeto: string, x: number, y: number) {
    if (this.ocupado) return;
    const punto = DATOS.puntos.find((q) => this.zonas.get(q.clave)?.getBounds().contains(x, y));
    if (!punto) return;
    this.seleccionar(punto);
    void this.actuar({ usar: objeto });
  }

  /** Tocar algo en la escena: si hay un objeto del inventario elegido, se usa ahí. */
  private tocarPunto(punto: PuntoInteres) {
    if (this.ocupado) return;
    const objeto = this.barra.objetoElegido;
    this.seleccionar(punto);
    if (objeto) {
      this.barra.elegirObjeto(null);
      void this.actuar({ usar: objeto });
    }
  }

  private seleccionar(punto: PuntoInteres) {
    this.seleccionado = punto;
    this.barra.setObjetivo(punto.nombre);
    const destino = this.acercarseA(punto);
    this.caminarHacia(destino.x, destino.y, false);
  }

  /**
   * Espera a que el jugador llegue, aplica la regla de la misión que corresponda
   * y muestra la respuesta en viñetas.
   */
  private async actuar(accion: Accion) {
    const punto = this.seleccionado;
    if (!punto || this.ocupado) return;
    this.ocupado = true;
    await this.llegada;
    // Si mientras caminaba tocó otra cosa, la acción ya no corresponde.
    if (this.seleccionado !== punto) {
      this.ocupado = false;
      return;
    }

    const regla = buscarRegla(MISION_1, punto.clave, accion);
    const respuesta: Respuesta =
      regla?.respuesta ??
      (typeof accion === 'string' ? (punto.respuestas[accion] ?? RESPUESTAS_POR_DEFECTO[accion]) : RESPUESTA_USAR_POR_DEFECTO);

    // Los efectos van antes del diálogo: Nikola ya tiene puesto el pasamontañas cuando agradece.
    const terminaMision = regla?.efectos?.some((e) => 'marcar' in e && e.marcar === MISION_1.marcaFin) ?? false;
    const agregados = aplicarEfectos(regla?.efectos);
    this.actualizarApariencias();

    const dialogo: Dialogo =
      typeof respuesta === 'string' ? { lineas: [{ quien: 'jugador', texto: respuesta }] } : DIALOGOS[respuesta.dialogo];
    await this.dialogo(dialogo);

    if (terminaMision) {
      this.barra.setNovedad(hayNovedades());
      const recompensas = (regla?.efectos ?? []).flatMap((e) => ('recompensa' in e ? [e.recompensa] : []));
      this.enDialogo = true;
      const salida = await mostrarMisionCumplida(this, MISION_1, recompensas);
      this.enDialogo = false;
      this.ocupado = false;
      if (salida === 'phone') this.abrirPhone('musica');
      return;
    }
    if (this.paseantes.some((p) => p.datos.clave === punto.clave) && this.seleccionado === punto) {
      // Terminó la interacción con el perro: se lo suelta y sigue paseando.
      this.seleccionado = null;
      this.barra.setObjetivo(null);
    }
    if (agregados.length) {
      const nombres = agregados.map((o) => OBJETOS[o]?.nombre ?? o).join(' y ');
      this.barra.mostrarMensaje(`Conseguiste ${nombres}. Tocá el objeto abajo y después dónde usarlo.`, 6000);
    }
    this.ocupado = false;
  }

  private actualizarObjetosEnEscena() {
    for (const { sprite, datos } of this.objetosEnEscena) sprite.setVisible(cumple(datos.si));
  }

  /** Un pixel claro que titila arriba del objeto cada tanto. */
  private destello(sprite: Phaser.GameObjects.Image) {
    const chispa = this.add
      .rectangle(sprite.x + sprite.width / 2, sprite.y - ESCALA, ESCALA, ESCALA, 0xfff4c8)
      .setOrigin(0)
      .setDepth(sprite.depth)
      .setVisible(false);
    this.time.addEvent({
      delay: 1800,
      loop: true,
      callback: () => {
        if (!sprite.visible) return chispa.setVisible(false);
        chispa.setVisible(true);
        this.time.delayedCall(220, () => chispa.setVisible(false));
      },
    });
  }

  private actualizarApariencias() {
    this.actualizarObjetosEnEscena();
    for (const p of DATOS.personajes) {
      const sprite = this.children.getByName(p.clave) as Phaser.GameObjects.Image | null;
      sprite?.setTexture(texturaDe(MISION_1, p.clave, p.textura));
    }
  }

  /** Punto arriba de la cabeza de quien habla, en píxeles. */
  private ancla(quien: ClaveHablante) {
    if (quien === 'jugador') return { x: this.jugador.x, y: this.jugador.y - this.jugador.height - 8 };
    const sprite = this.children.getByName(quien) as Phaser.GameObjects.Image | null;
    if (sprite) return { x: sprite.x, y: sprite.y - sprite.height - 8 };
    const fija = DATOS.anclas[quien];
    return fija ? { x: fija.x * ESCALA, y: fija.y * ESCALA } : { x: this.jugador.x, y: 200 };
  }

  private caminarHacia(x: number, y: number, marcar = true) {
    const z = DATOS.zonaCaminable;
    const destinoX = Phaser.Math.Clamp(x, z.xMin * ESCALA, z.xMax * ESCALA);
    const destinoY = Phaser.Math.Clamp(y, z.yMin * ESCALA, z.yMax * ESCALA);
    // Se ajusta a la grilla de 4 px para no salir del pixel art.
    const fx = Math.round(destinoX / ESCALA) * ESCALA;
    const fy = Math.round(destinoY / ESCALA) * ESCALA;

    // Si el destino cae adentro de Nikola o del perro, se corre al lugar libre más cercano.
    const destino = this.liberar({ x: fx, y: fy });
    const distancia = Phaser.Math.Distance.Between(this.pies.x, this.pies.y, destino.x, destino.y);
    if (distancia < ESCALA) {
      this.ruta = [];
      this.destino = null;
      this.detener();
      this.llegada = Promise.resolve();
      return;
    }

    if (marcar) this.marcarDestino(destino.x, destino.y);
    this.alLlegar?.();
    this.llegada = new Promise((resolver) => (this.alLlegar = resolver));
    this.destino = destino;
    this.recalculada = false;
    this.ruta = this.planificar(this.pies, destino);
    this.iniciarPasos();
  }

  /** Pone la animación de caminar (se mantiene mientras el jugador se mueve). */
  private iniciarPasos() {
    if (this.caminando) return;
    this.caminando = true;
    this.jugador.play('jugador-camina');
  }

  /** Quieto: vuelve al sprite base, de frente. */
  private detener() {
    if (this.caminando) {
      this.caminando = false;
      this.jugador.stop();
      this.jugador.setTexture('jugador').setFlipX(false);
    }
    this.actualizarJugador();
    this.alLlegar?.();
    this.alLlegar = undefined;
  }

  private actualizarJugador() {
    const x = Math.round(this.pies.x / ESCALA) * ESCALA;
    const y = Math.round(this.pies.y / ESCALA) * ESCALA;
    this.jugador.setPosition(x, y).setDepth(y + 0.5);
  }

  /** Cuadradito que marca adónde va el jugador. */
  private marcarDestino(x: number, y: number) {
    const marca = this.add.rectangle(x, y, ESCALA * 2, ESCALA * 2, 0xe8c46a).setDepth(1);
    this.tweens.add({ targets: marca, alpha: 0, duration: 500, onComplete: () => marca.destroy() });
  }
}
