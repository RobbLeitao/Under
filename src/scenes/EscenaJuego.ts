import Phaser from 'phaser';
import { ANCHO, ALTO_ESCENA, ESCALA } from '../config';
import type { DatosEscena, Lado, Personaje, PuntoInteres, Respuesta } from '../data/escenas';
import { RESPUESTAS_POR_DEFECTO, RESPUESTA_USAR_POR_DEFECTO } from '../data/acciones';
import { DIALOGOS, type ClaveHablante, type Dialogo } from '../data/dialogos';
import { OBJETOS } from '../data/objetos';
import type { Accion, Efecto, Mision, Regla } from '../data/misiones/tipos';
import { cumple, guardarEscena, hayNovedades } from '../systems/estado';
import { aplicarEfectos, buscarRegla, misionQueTermina, texturaDe } from '../systems/misiones';
import { cortarFragmento } from '../systems/musica';
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
/** Cuántas veces se rehace la ruta hacia un mismo destino si alguien se cruza. */
const RECALCULOS_MAXIMOS = 3;
/** El perro se frena cada tanto: cuánto camina entre paradas y cuánto dura cada parada. */
const MS_PASEO_CAMINA = [3000, 8000];
const MS_PASEO_QUIETO = [1500, 4000];
/** Cada cuánto pasa un auto por la avenida (sonido ambiente). */
const MS_ENTRE_AUTOS = [7000, 18000];
/** Con teclado, el movimiento en profundidad (arriba/abajo) es más lento: la vereda es angosta. */
const FACTOR_PROFUNDIDAD = 0.5;
const LADO_BOTON_PAUSA = 56;
/** Tocar el piso a menos de esto del borde (en unidades) lleva a la escena de al lado. */
const MARGEN_SALIDA = 12;
/** Al entrar o salir por un borde, el jugador arranca o termina fuera de la pantalla, a esta distancia (unidades). */
const AFUERA = 12;
/** Al entrar por un borde, cuánto camina hacia adentro (unidades desde el borde de la zona caminable). */
const PASOS_ENTRADA = 16;
/** Fundido al pasar de una escena a otra. */
const MS_FUNDIDO = 280;

type Direccion = 'izquierda' | 'derecha' | 'arriba' | 'abajo';

/** Cómo se entra a una escena de juego: por qué borde y a qué altura de la vereda (unidades). */
export interface EntradaEscena {
  entrada?: Lado;
  y?: number;
  /** Sin borde: dónde aparece el jugador (unidades), en lugar del inicio de la escena. */
  x?: number;
}

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
export interface Punto {
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
 * Escena de juego armada a partir de sus datos (data/escenas.ts) y de las misiones que pasan
 * ahí: fondo, decorados, objetos, personajes y puntos para tocar. Se camina tocando el piso
 * o con el teclado (flechas o WASD); al tocar a alguien o algo, el jugador se acerca y se
 * elige una acción en la barra. Esc o P pausan. Por los bordes con `salidas` se pasa
 * caminando a la escena de al lado.
 */
export abstract class EscenaJuego extends Phaser.Scene {
  protected jugador!: Phaser.GameObjects.Sprite;
  /** Posición de los pies del jugador. */
  protected pies = { x: 0, y: 0 };
  /** Puntos que le faltan recorrer al jugador al caminar tocando (esquiva obstáculos). */
  private ruta: Punto[] = [];
  /** Adónde va la ruta actual (para recalcularla si alguien se cruza). */
  private destino: Punto | null = null;
  private recalculada = false;
  private recalculos = 0;
  /** El jugador está caminando (con la animación de caminar puesta). */
  private caminando = false;
  private paseantes: Paseante[] = [];
  /** Zonas tocables de cada punto: las de un paseante se mueven con él. */
  private zonas = new Map<string, Phaser.GameObjects.Zone>();
  protected barra!: BarraAcciones;
  private seleccionado: PuntoInteres | null = null;
  /** Se cumple cuando el jugador termina de caminar (o cuando lo interrumpen). */
  protected llegada: Promise<void> = Promise.resolve();
  private alLlegar?: () => void;
  /** Mientras hay un diálogo o una animación, las acciones nuevas se ignoran. */
  protected ocupado = false;
  private objetosEnEscena: { sprite: Phaser.GameObjects.Image; datos: DatosEscena['objetos'][number] }[] = [];
  /** Hay un diálogo, una animación o un panel en pantalla: el teclado no mueve al jugador. */
  protected enDialogo = false;
  private teclas: Record<Direccion, Phaser.Input.Keyboard.Key[]> = { izquierda: [], derecha: [], arriba: [], abajo: [] };
  private moviendoConTeclado = false;
  private fondo!: Phaser.GameObjects.Image;
  /** Borde hacia el que camina el jugador para irse de la escena (al tocar el piso cerca del borde). */
  private salidaPendiente: Lado | null = null;
  private saliendo = false;
  /** Por dónde entró el jugador a la escena (null si arrancó ahí). */
  protected entrada: EntradaEscena = {};

  protected constructor(
    protected readonly datos: DatosEscena,
    protected readonly misiones: Mision[],
  ) {
    super(datos.clave);
  }

  /** Deja todo como nuevo: la escena se vuelve a crear cada vez que se entra. */
  init(entrada?: EntradaEscena) {
    this.entrada = entrada ?? {};
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
    this.salidaPendiente = null;
    this.saliendo = false;
  }

  create() {
    guardarEscena(this.datos.clave);
    this.fondo = this.add.image(0, 0, this.texturaFondo()).setOrigin(0);

    for (const c of this.datos.carteles) {
      this.add
        .text(c.x * ESCALA, c.y * ESCALA, c.texto, {
          fontFamily: '"Pixelify Sans"',
          fontSize: `${Math.round(c.tamano * ESCALA)}px`,
          color: c.color,
        })
        .setOrigin(0.5);
    }

    for (const p of this.datos.personajes) {
      const sprite = this.add
        .sprite(p.x * ESCALA, p.y * ESCALA, this.texturaPersonaje(p))
        .setOrigin(0.5, 1)
        .setDepth(p.y * ESCALA)
        .setName(p.clave);
      // Jota es diestro: su sprite nunca se espeja, ni aunque algo lo pida al caminar.
      if (p.sinEspejar) {
        sprite.setFlipX = () => sprite;
        sprite.setFlip = () => sprite;
        sprite.toggleFlipX = () => sprite;
      }
      if (p.paseo) {
        const ahora = this.time.now;
        this.paseantes.push({
          sprite,
          datos: p,
          sentido: Math.random() < 0.5 ? 1 : -1,
          x: sprite.x,
          quietoHasta: 0,
          proximaParada: ahora + entre(MS_PASEO_CAMINA),
        });
      }
    }

    // Decorados que se ordenan por profundidad con el jugador (la parada de colectivo, las farolas).
    for (const d of this.datos.decorados) {
      this.add.image(d.x * ESCALA, d.y * ESCALA, d.textura).setOrigin(0).setDepth(d.base * ESCALA);
    }

    for (const datos of this.datos.objetos) {
      const sprite = this.add
        .image(datos.x * ESCALA, datos.y * ESCALA, datos.textura)
        .setOrigin(0)
        .setDepth(datos.y * ESCALA + 1);
      this.objetosEnEscena.push({ sprite, datos });
      if (datos.brilla) this.destello(sprite);
    }

    this.colocarJugador();
    this.jugador = this.add.sprite(0, 0, 'jugador').setOrigin(0.5, 1);
    this.actualizarJugador();

    this.barra = new BarraAcciones(this, {
      alElegirVerbo: (verbo) => this.actuar(verbo),
      alTocarPhone: () => this.abrirPhone(),
      alSoltarObjeto: (objeto, x, y) => this.soltarObjeto(objeto, x, y),
      alMirarObjeto: (objeto) => void this.mirarObjeto(objeto),
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
    for (const punto of [...this.datos.puntos].reverse()) {
      const z = punto.zona;
      const zona = this.add
        .zone(z.x * ESCALA, z.y * ESCALA, z.ancho * ESCALA, z.alto * ESCALA)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.tocarPunto(punto));
      this.zonas.set(punto.clave, zona);
    }
    this.actualizarApariencias();

    // Ambiente de calle: rumor de fondo y, cada tanto, un auto.
    iniciarAmbiente(this);
    const programarAuto = () =>
      this.time.delayedCall(entre(MS_ENTRE_AUTOS), () => {
        pasaUnAuto();
        programarAuto();
      });
    programarAuto();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      detenerAmbiente();
      // Un fragmento de fondo (el riff de la entrada) no sigue sonando en otra escena.
      cortarFragmento();
    });

    this.input.on('pointerdown', (puntero: Phaser.Input.Pointer, tocados: Phaser.GameObjects.GameObject[]) => {
      if (puntero.y >= ALTO_ESCENA || tocados.length > 0 || this.ocupado) return;
      this.seleccionado = null;
      this.barra.elegirObjeto(null);
      this.barra.setObjetivo(null);
      this.caminarHacia(puntero.x, puntero.y);
      const lado = this.ladoDeSalida(puntero.x);
      if (lado) {
        this.salidaPendiente = lado;
        if (this.ruta.length === 0) this.salir(lado);
      }
    });

    if (this.entrada.entrada) this.cameras.main.fadeIn(MS_FUNDIDO, 0, 0, 0);

    // Solo en desarrollo: ?dialogo=clave muestra ese diálogo al entrar y ?phone abre el Phone.
    const parametros = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
    const atajo = parametros?.get('dialogo');
    if (parametros?.has('phone')) {
      this.time.delayedCall(0, () => this.abrirPhone());
    } else if (atajo && atajo in DIALOGOS) {
      void this.dialogo(DIALOGOS[atajo as keyof typeof DIALOGOS]);
    } else {
      this.alEmpezar();
    }
  }

  /**
   * Lo que pasa al llegar a la escena. Por defecto, si se entró por un borde, el jugador
   * camina unos pasos hacia adentro. Cada escena puede sumar lo suyo (la entrada de Nikola).
   */
  protected alEmpezar() {
    if (this.entrada.entrada) void this.automatico(this.entrarCaminando());
  }

  /** Posición inicial de los pies: afuera del borde por el que entra, o el punto de inicio de la escena. */
  private colocarJugador() {
    const z = this.datos.zonaCaminable;
    const lado = this.entrada.entrada;
    const y = Phaser.Math.Clamp(this.entrada.y ?? this.datos.inicioJugador.y, z.yMin, z.yMax);
    if (lado) {
      this.pies = { x: this.xAfuera(lado), y: Math.round(y) * ESCALA };
    } else {
      const x = this.entrada.x ?? this.datos.inicioJugador.x;
      this.pies = { x: x * ESCALA, y: Math.round(y) * ESCALA };
    }
  }

  /** x (píxeles) fuera de la pantalla, del lado indicado. */
  private xAfuera(lado: Lado) {
    return (lado === 'izquierda' ? -AFUERA : ANCHO / ESCALA + AFUERA) * ESCALA;
  }

  /**
   * El jugador entra caminando desde fuera de la pantalla hasta `hastaX` (unidades), o unos
   * pasos adentro del borde por el que entró.
   */
  protected entrarCaminando(lado: Lado | undefined = this.entrada.entrada, hastaX?: number): Promise<void> {
    if (!lado) return Promise.resolve();
    const z = this.datos.zonaCaminable;
    const x = hastaX ?? (lado === 'izquierda' ? z.xMin + PASOS_ENTRADA : z.xMax - PASOS_ENTRADA);
    this.pies.x = this.xAfuera(lado);
    this.actualizarJugador();
    this.caminarHacia(x * ESCALA, this.pies.y, false);
    return this.llegada;
  }

  /** Mientras dura algo automático (una entrada, una escena), el jugador no controla nada. */
  protected async automatico<T>(promesa: Promise<T>): Promise<T> {
    this.ocupado = true;
    this.enDialogo = true;
    try {
      return await promesa;
    } finally {
      this.ocupado = false;
      this.enDialogo = false;
    }
  }

  /** Si tocar el piso en x (píxeles) lleva a otra escena, el borde correspondiente. */
  private ladoDeSalida(x: number): Lado | null {
    const z = this.datos.zonaCaminable;
    const u = x / ESCALA;
    if (u <= z.xMin + MARGEN_SALIDA && this.datos.salidas?.izquierda) return 'izquierda';
    if (u >= z.xMax - MARGEN_SALIDA && this.datos.salidas?.derecha) return 'derecha';
    return null;
  }

  /** Lo que hay que hacer antes de irse de la escena (por ejemplo, marcar algo). */
  protected alSalir(_lado: Lado) {}

  /** El jugador sale caminando por un borde y aparece en la escena de al lado, entrando por el borde opuesto. */
  protected salir(lado: Lado) {
    const destino = this.datos.salidas?.[lado];
    if (!destino || this.saliendo) return;
    this.saliendo = true;
    this.ocupado = true;
    this.enDialogo = true;
    this.salidaPendiente = null;
    this.moviendoConTeclado = false;
    this.seleccionado = null;
    this.barra.elegirObjeto(null);
    this.barra.setObjetivo(null);
    this.alSalir(lado);

    // Sigue caminando hasta salir de la pantalla mientras todo se funde a negro.
    this.alLlegar?.();
    this.alLlegar = undefined;
    this.destino = null;
    this.ruta = [{ x: this.xAfuera(lado), y: this.pies.y }];
    this.iniciarPasos();
    const y = Math.round(this.pies.y / ESCALA);
    this.cameras.main.fadeOut(MS_FUNDIDO, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const entrada: EntradaEscena = { entrada: lado === 'izquierda' ? 'derecha' : 'izquierda', y };
      this.scene.start(destino, entrada);
    });
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
    if (!this.scene.isActive() || this.saliendo) return;
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
    const base = this.texturaPersonaje(p.datos);
    const elegido = this.seleccionado?.clave === p.datos.clave;
    if (!elegido && tiempo >= p.proximaParada) {
      p.quietoHasta = tiempo + entre(MS_PASEO_QUIETO);
      p.proximaParada = p.quietoHasta + entre(MS_PASEO_CAMINA);
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

    // La zona tocable acompaña al paseante siempre, quieto o caminando.
    const zona = this.zonas.get(p.datos.clave);
    const punto = this.datos.puntos.find((q) => q.clave === p.datos.clave);
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
   * Una tecla cancela el destino tocado (y la acción que esperaba la llegada). Llegar a un
   * borde con salida lleva a la escena de al lado.
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
      this.salidaPendiente = null;
      this.detener();
      if (this.seleccionado) {
        this.seleccionado = null;
        this.barra.setObjetivo(null);
      }
      this.iniciarPasos();
    }
    if (dx) this.jugador.setFlipX(dx < 0);

    const z = this.datos.zonaCaminable;
    const avance = (VELOCIDAD * delta) / 1000;
    // Eje por eje: contra un obstáculo, el jugador se desliza por el costado en vez de atravesarlo.
    const nx = Phaser.Math.Clamp(this.pies.x + dx * avance, z.xMin * ESCALA, z.xMax * ESCALA);
    if (!this.bloquea(this.pies, { x: nx, y: this.pies.y })) this.pies.x = nx;
    const ny = Phaser.Math.Clamp(this.pies.y + dy * avance * FACTOR_PROFUNDIDAD, z.yMin * ESCALA, z.yMax * ESCALA);
    if (!this.bloquea(this.pies, { x: this.pies.x, y: ny })) this.pies.y = ny;
    this.actualizarJugador();

    if (dx < 0 && this.pies.x <= z.xMin * ESCALA && this.datos.salidas?.izquierda) this.salir('izquierda');
    else if (dx > 0 && this.pies.x >= z.xMax * ESCALA && this.datos.salidas?.derecha) this.salir('derecha');
  }

  // ---------- Choques con los personajes ----------

  /** Lo que ocupan en el piso los personajes con cuerpo que están en la escena, donde están ahora. */
  private obstaculos(): Obstaculo[] {
    const lista: Obstaculo[] = [];
    for (const p of this.datos.personajes) {
      if (!p.cuerpo) continue;
      const sprite = this.children.getByName(p.clave) as Phaser.GameObjects.Sprite | null;
      if (!sprite?.visible) continue;
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

  /** El paseante, en la posición x (píxeles), chocaría con el jugador. */
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

  /**
   * Línea por la que se rodea un obstáculo: por atrás, o por adelante si atrás no entra.
   * Si el destino está delante del obstáculo (la rejilla, delante de Jota), por adelante:
   * por atrás no se llega sin atravesarlo.
   */
  private filaDeRodeo(o: Obstaculo, hasta?: Punto): number | null {
    const z = this.datos.zonaCaminable;
    const atras = o.y - o.mitadFondo - ESCALA;
    const adelante = o.y + o.mitadFondo + ESCALA;
    const entraAtras = atras >= z.yMin * ESCALA;
    const entraAdelante = adelante <= z.yMax * ESCALA;
    if (hasta && hasta.y >= o.y + o.mitadFondo && entraAdelante) return adelante;
    if (entraAtras) return atras;
    if (entraAdelante) return adelante;
    return null;
  }

  private mismo(a: Obstaculo | null, b: Obstaculo) {
    return a !== null && a.x === b.x && a.y === b.y;
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
    const z = this.datos.zonaCaminable;
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
      const fila = this.filaDeRodeo(o, hasta);
      if (fila === null) {
        // No se puede rodear: se queda antes del obstáculo.
        ruta.push(enVereda({ x: o.x - lado * (o.mitadAncho + ESCALA), y: actual.y }));
        return ruta;
      }
      const entrada = enVereda({ x: o.x - lado * (o.mitadAncho + ESCALA), y: fila });
      const salida = enVereda({ x: o.x + lado * (o.mitadAncho + ESCALA), y: fila });
      // Solo hace falta pasar por la salida si desde la entrada todavía se lo atraviesa.
      ruta.push(entrada);
      if (this.mismo(this.obstaculoEnTramo(entrada, hasta), o)) ruta.push(salida);
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

    if (!this.saliendo && this.bloquea(this.pies, siguiente)) {
      if (!this.recalculada && this.destino && this.recalculos < RECALCULOS_MAXIMOS) {
        this.recalculada = true;
        this.recalculos++;
        this.ruta = this.planificar(this.pies, this.liberar(this.destino));
        return;
      }
      this.ruta = [];
      this.salidaPendiente = null;
      this.detener();
      return;
    }

    if (Math.abs(dx) >= 1) this.jugador.setFlipX(dx < 0);
    this.pies = { x: siguiente.x, y: siguiente.y };
    this.actualizarJugador();
    if (llega) {
      this.ruta.shift();
      this.recalculada = false;
      if (this.ruta.length === 0 && !this.saliendo) {
        this.detener();
        if (this.salidaPendiente) this.salir(this.salidaPendiente);
      }
    }
  }

  /** Muestra un diálogo; mientras dura, el teclado no mueve al jugador. */
  protected async dialogo(d: Dialogo) {
    const antes = this.enDialogo;
    this.enDialogo = true;
    await reproducirDialogo(this, d.lineas, (quien) => this.ancla(quien), d.banda, (quien, hablando) =>
      this.gesto(quien, hablando),
    );
    this.enDialogo = antes;
  }

  /** Textura que le toca a un personaje según el avance de las misiones de la escena. */
  protected texturaPersonaje(p: Personaje) {
    return texturaDe(this.misiones, p.clave, p.textura);
  }

  /** Sprite de un personaje de la escena por su clave. */
  protected sprite(clave: string) {
    return this.children.getByName(clave) as Phaser.GameObjects.Sprite | null;
  }

  /** Sprite y textura base de quien habla (si no tiene sprite en la escena, null). */
  private hablante(quien: ClaveHablante): { sprite: Phaser.GameObjects.Sprite; base: string } | null {
    if (quien === 'jugador') return { sprite: this.jugador, base: 'jugador' };
    const datos = this.datos.personajes.find((p) => p.clave === quien);
    const sprite = this.sprite(quien);
    if (!datos || !sprite) return null;
    return { sprite, base: this.texturaPersonaje(datos) };
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
  protected abrirPhone(pantalla?: 'musica' | 'album') {
    if (this.ocupado) return;
    cortarFragmento();
    this.scene.launch('Phone', { volverA: this.scene.key, pantalla });
    this.scene.pause();
  }

  /** El punto se puede tocar: se cumple su condición y, si es un personaje, está en la escena. */
  private puntoActivo(punto: PuntoInteres) {
    if (!cumple(punto.si)) return false;
    const personaje = this.datos.personajes.find((p) => p.clave === punto.clave);
    return !personaje || cumple(personaje.si);
  }

  /** Soltar un objeto del inventario: si cayó sobre algo, el jugador va y lo usa ahí. */
  private soltarObjeto(objeto: string, x: number, y: number) {
    if (this.ocupado) return;
    const punto = this.datos.puntos.find((q) => this.puntoActivo(q) && this.zonas.get(q.clave)?.getBounds().contains(x, y));
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

  /** Suelta lo que estaba elegido en la escena (la barra vuelve a "Tocá algo…"). */
  protected soltarSeleccion() {
    this.seleccionado = null;
    this.barra.setObjetivo(null);
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

    const regla = buscarRegla(this.misiones, this.datos.reglas ?? [], punto.clave, accion);
    const respuesta: Respuesta =
      regla?.respuesta ??
      (typeof accion === 'string'
        ? (punto.respuestas[accion] ?? RESPUESTAS_POR_DEFECTO[accion])
        : (OBJETOS[accion.usar]?.usarEnOtraCosa ?? RESPUESTA_USAR_POR_DEFECTO));

    // Los efectos van antes del diálogo: Nikola ya tiene puesto el pasamontañas cuando agradece.
    const termina = misionQueTermina(this.misiones, regla);
    const agregados = this.efectos(regla?.efectos);
    await this.dialogo(this.comoDialogo(respuesta));

    // Una escena automática (Jota sale, Raulo va al depósito, el show) y lo que viene después.
    if (regla?.secuencia) {
      await this.secuencia(regla.secuencia);
      if (!this.scene.isActive()) return;
    }
    if (regla?.despues) {
      agregados.push(...this.efectos(regla.despues.efectos));
      if (regla.despues.respuesta) await this.dialogo(this.comoDialogo(regla.despues.respuesta));
      if (regla.despues.secuencia) {
        await this.secuencia(regla.despues.secuencia);
        if (!this.scene.isActive()) return;
      }
    }

    if (termina && regla && !regla.secuencia) {
      await this.misionCumplida(termina, regla);
      return;
    }
    if (this.paseantes.some((p) => p.datos.clave === punto.clave) && this.seleccionado === punto) {
      // Terminó la interacción con el perro: se lo suelta y sigue paseando.
      this.soltarSeleccion();
    }
    if (agregados.length) {
      const nombres = agregados.map((o) => OBJETOS[o]?.nombre ?? o).join(' y ');
      this.barra.mostrarMensaje(`Conseguiste ${nombres}. Tocá el objeto abajo y después dónde usarlo.`, 6000);
    }
    this.ocupado = false;
  }

  /** Aplica efectos y pone la escena de acuerdo con el avance. Devuelve los objetos que se agregaron. */
  private efectos(efectos: Efecto[] | undefined) {
    const agregados = aplicarEfectos(efectos);
    this.actualizarApariencias();
    return agregados;
  }

  /** Una frase suelta la dice el jugador; si no, es un diálogo de data/dialogos.ts. */
  protected comoDialogo(respuesta: Respuesta): Dialogo {
    return typeof respuesta === 'string' ? { lineas: [{ quien: 'jugador', texto: respuesta }] } : DIALOGOS[respuesta.dialogo];
  }

  /** Mirar un objeto del inventario: el jugador dice cómo es. */
  private async mirarObjeto(objeto: string) {
    if (this.ocupado) return;
    this.ocupado = true;
    await this.dialogo(this.comoDialogo(OBJETOS[objeto]?.mirar ?? RESPUESTAS_POR_DEFECTO.mirar));
    this.ocupado = false;
  }

  /**
   * Escena automática de una regla (data/misiones/). Cada escena hace las suyas; mientras dura,
   * el jugador no controla nada.
   */
  protected async secuencia(_nombre: string): Promise<void> {}

  /** Panel de "¡Misión cumplida!" con las recompensas de la regla que la terminó. */
  protected async misionCumplida(mision: Mision, regla: Regla) {
    this.barra.setNovedad(hayNovedades());
    const recompensas = (regla.efectos ?? []).flatMap((e) => ('recompensa' in e ? [e.recompensa] : []));
    this.ocupado = true;
    this.enDialogo = true;
    const salida = await mostrarMisionCumplida(this, mision, recompensas);
    this.enDialogo = false;
    this.ocupado = false;
    if (salida === 'phone') this.abrirPhone('musica');
  }

  private texturaFondo() {
    return this.datos.fondoSegun?.find((f) => cumple(f.si))?.textura ?? this.datos.fondo;
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

  /** Pone fondo, objetos, personajes y zonas tocables de acuerdo con el avance. */
  protected actualizarApariencias() {
    this.fondo.setTexture(this.texturaFondo());
    for (const { sprite, datos } of this.objetosEnEscena) sprite.setVisible(cumple(datos.si));
    for (const p of this.datos.personajes) {
      const sprite = this.sprite(p.clave);
      if (!sprite) continue;
      sprite.setVisible(cumple(p.si));
      if (!sprite.anims.isPlaying) sprite.setTexture(this.texturaPersonaje(p));
    }
    for (const punto of this.datos.puntos) {
      const zona = this.zonas.get(punto.clave);
      if (zona?.input) zona.input.enabled = this.puntoActivo(punto);
    }
  }

  /** Punto arriba de la cabeza de quien habla, en píxeles. */
  private ancla(quien: ClaveHablante) {
    if (quien === 'jugador') return { x: this.jugador.x, y: this.jugador.y - this.jugador.height - 8 };
    const sprite = this.sprite(quien);
    if (sprite?.visible) return { x: sprite.x, y: sprite.y - sprite.height - 8 };
    const fija = this.datos.anclas[quien];
    return fija ? { x: fija.x * ESCALA, y: fija.y * ESCALA } : { x: this.jugador.x, y: 200 };
  }

  protected caminarHacia(x: number, y: number, marcar = true) {
    const z = this.datos.zonaCaminable;
    const destinoX = Phaser.Math.Clamp(x, z.xMin * ESCALA, z.xMax * ESCALA);
    const destinoY = Phaser.Math.Clamp(y, z.yMin * ESCALA, z.yMax * ESCALA);
    // Se ajusta a la grilla de 4 px para no salir del pixel art.
    const fx = Math.round(destinoX / ESCALA) * ESCALA;
    const fy = Math.round(destinoY / ESCALA) * ESCALA;
    this.salidaPendiente = null;

    // Si el destino cae adentro de alguien, se corre al lugar libre más cercano.
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
    this.recalculos = 0;
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
