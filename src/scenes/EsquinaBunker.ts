import Phaser from 'phaser';
import { ANCHO, ALTO_ESCENA, ESCALA } from '../config';
import { ESQUINA_EL_BUNKER as DATOS, type PuntoInteres, type Respuesta } from '../data/escenas';
import { RESPUESTAS_POR_DEFECTO, RESPUESTA_USAR_POR_DEFECTO } from '../data/acciones';
import { DIALOGOS, type ClaveHablante, type Dialogo } from '../data/dialogos';
import { OBJETOS } from '../data/objetos';
import { MISION_1 } from '../data/misiones/mision1';
import type { Accion } from '../data/misiones/tipos';
import { cumple, hayNovedades, marcar, tieneMarca } from '../systems/estado';
import { aplicarEfectos, buscarRegla, texturaDe } from '../systems/misiones';
import { cortarFragmento, tocarFragmento } from '../systems/musica';
import { BarraAcciones } from '../ui/BarraAcciones';
import { reproducirDialogo } from '../ui/Vineta';
import { mostrarMisionCumplida } from '../ui/PanelMision';

/** Velocidad del jugador, en píxeles por segundo. */
const VELOCIDAD = 260;
/** Cada cuánto alterna el paso (rebote de 4 px) mientras camina. */
const MS_POR_PASO = 140;
/** Duración de la entrada de Nikola al empezar la misión. */
const MS_ENTRADA_NIKOLA = 2600;
/** Con teclado, el movimiento en profundidad (arriba/abajo) es más lento: la vereda es angosta. */
const FACTOR_PROFUNDIDAD = 0.5;
const LADO_BOTON_PAUSA = 56;

type Direccion = 'izquierda' | 'derecha' | 'arriba' | 'abajo';

/**
 * La esquina de El Bunker: fondo, jugador, Nikola y el perro. Se camina tocando el piso
 * o con el teclado (flechas o WASD); al tocar a alguien o algo, el jugador se acerca
 * y se elige una acción en la barra. Esc o P pausan.
 */
export class EsquinaBunker extends Phaser.Scene {
  private jugador!: Phaser.GameObjects.Image;
  /** Posición de los pies del jugador; el sprite la sigue con el rebote del paso. */
  private pies = { x: 0, y: 0 };
  private caminata?: Phaser.Tweens.Tween;
  private pasos?: Phaser.Time.TimerEvent;
  private rebote = 0;
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
    this.caminata = undefined;
    this.pasos = undefined;
    this.rebote = 0;
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
      this.add
        .image(p.x * ESCALA, p.y * ESCALA, texturaDe(MISION_1, p.clave, p.textura))
        .setOrigin(0.5, 1)
        .setDepth(p.y * ESCALA)
        .setName(p.clave);
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
    this.jugador = this.add.image(0, 0, 'jugador').setOrigin(0.5, 1);
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

    for (const punto of DATOS.puntos) {
      const z = punto.zona;
      this.add
        .zone(z.x * ESCALA, z.y * ESCALA, z.ancho * ESCALA, z.alto * ESCALA)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.tocarPunto(punto));
    }

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

    const nikola = this.children.getByName('nikola') as Phaser.GameObjects.Image;
    const destino = nikola.x;
    const piso = nikola.y;
    const pies = { x: ANCHO + nikola.width };
    let paso = 0;
    this.ocupado = true;
    this.enDialogo = true;

    const pasos = this.time.addEvent({
      delay: MS_POR_PASO,
      loop: true,
      callback: () => (paso = paso ? 0 : ESCALA),
    });
    this.tweens.add({
      targets: pies,
      x: destino,
      duration: MS_ENTRADA_NIKOLA,
      onUpdate: () => nikola.setPosition(Math.round(pies.x / ESCALA) * ESCALA, piso - paso),
      onComplete: () => {
        pasos.remove();
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

  update(_tiempo: number, delta: number) {
    this.moverConTeclado(delta);
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

    if (!this.moviendoConTeclado || this.caminata?.isPlaying()) {
      this.moviendoConTeclado = true;
      this.caminata?.stop();
      this.caminata = undefined;
      this.detener();
      if (this.seleccionado) {
        this.seleccionado = null;
        this.barra.setObjetivo(null);
      }
      this.iniciarPasos();
    }

    const z = DATOS.zonaCaminable;
    const avance = (VELOCIDAD * delta) / 1000;
    this.pies.x = Phaser.Math.Clamp(this.pies.x + dx * avance, z.xMin * ESCALA, z.xMax * ESCALA);
    this.pies.y = Phaser.Math.Clamp(this.pies.y + dy * avance * FACTOR_PROFUNDIDAD, z.yMin * ESCALA, z.yMax * ESCALA);
    this.actualizarJugador();
  }

  /** Muestra un diálogo; mientras dura, el teclado no mueve al jugador. */
  private async dialogo(d: Dialogo) {
    this.enDialogo = true;
    await reproducirDialogo(this, d.lineas, (quien) => this.ancla(quien), d.banda);
    this.enDialogo = false;
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
    const ux = x / ESCALA;
    const uy = y / ESCALA;
    const punto = DATOS.puntos.find(
      ({ zona: z }) => ux >= z.x && ux <= z.x + z.ancho && uy >= z.y && uy <= z.y + z.alto,
    );
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
    this.caminarHacia(punto.acercarse.x * ESCALA, punto.acercarse.y * ESCALA, false);
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

    const distancia = Phaser.Math.Distance.Between(this.pies.x, this.pies.y, fx, fy);
    if (distancia < ESCALA) {
      this.caminata?.stop();
      this.detener();
      this.llegada = Promise.resolve();
      return;
    }

    if (marcar) this.marcarDestino(fx, fy);
    this.caminata?.stop();
    this.alLlegar?.();
    this.llegada = new Promise((resolver) => (this.alLlegar = resolver));
    this.iniciarPasos();

    this.caminata = this.tweens.add({
      targets: this.pies,
      x: fx,
      y: fy,
      duration: (distancia / VELOCIDAD) * 1000,
      onUpdate: () => this.actualizarJugador(),
      onComplete: () => this.detener(),
    });
  }

  /** Rebote de 4 px que alterna mientras el jugador camina. */
  private iniciarPasos() {
    this.pasos ??= this.time.addEvent({
      delay: MS_POR_PASO,
      loop: true,
      callback: () => {
        this.rebote = this.rebote ? 0 : ESCALA;
        this.actualizarJugador();
      },
    });
  }

  private detener() {
    this.pasos?.remove();
    this.pasos = undefined;
    this.rebote = 0;
    this.actualizarJugador();
    this.alLlegar?.();
    this.alLlegar = undefined;
  }

  private actualizarJugador() {
    const x = Math.round(this.pies.x / ESCALA) * ESCALA;
    const y = Math.round(this.pies.y / ESCALA) * ESCALA;
    this.jugador.setPosition(x, y - this.rebote).setDepth(y + 0.5);
  }

  /** Cuadradito que marca adónde va el jugador. */
  private marcarDestino(x: number, y: number) {
    const marca = this.add.rectangle(x, y, ESCALA * 2, ESCALA * 2, 0xe8c46a).setDepth(1);
    this.tweens.add({ targets: marca, alpha: 0, duration: 500, onComplete: () => marca.destroy() });
  }
}
