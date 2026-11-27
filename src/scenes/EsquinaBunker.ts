import Phaser from 'phaser';
import { ANCHO, ALTO_ESCENA, ESCALA } from '../config';
import { ESQUINA_EL_BUNKER as DATOS, type PuntoInteres, type Respuesta } from '../data/escenas';
import { RESPUESTAS_POR_DEFECTO, RESPUESTA_USAR_POR_DEFECTO } from '../data/acciones';
import { DIALOGOS, type ClaveHablante, type Dialogo } from '../data/dialogos';
import { OBJETOS } from '../data/objetos';
import { MISION_1 } from '../data/misiones/mision1';
import type { Accion } from '../data/misiones/tipos';
import { marcar, tieneMarca } from '../systems/estado';
import { aplicarEfectos, buscarRegla, texturaDe } from '../systems/misiones';
import { BarraAcciones } from '../ui/BarraAcciones';
import { reproducirDialogo } from '../ui/Vineta';

/** Velocidad del jugador, en píxeles por segundo. */
const VELOCIDAD = 260;
/** Cada cuánto alterna el paso (rebote de 4 px) mientras camina. */
const MS_POR_PASO = 140;
/** Duración de la entrada de Nikola al empezar la misión. */
const MS_ENTRADA_NIKOLA = 2600;

/**
 * La esquina de El Bunker: fondo, jugador, Nikola y el perro. Se camina tocando el piso;
 * al tocar a alguien o algo, el jugador se acerca y se elige una acción en la barra.
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

  constructor() {
    super('EsquinaBunker');
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

    this.pies = { x: DATOS.inicioJugador.x * ESCALA, y: DATOS.inicioJugador.y * ESCALA };
    this.jugador = this.add.image(0, 0, 'jugador').setOrigin(0.5, 1);
    this.actualizarJugador();

    this.barra = new BarraAcciones(this, {
      alElegirVerbo: (verbo) => this.actuar(verbo),
      alTocarPhone: () => this.abrirPhone(),
      alSoltarObjeto: (objeto, x, y) => this.soltarObjeto(objeto, x, y),
    });

    for (const punto of DATOS.puntos) {
      const z = punto.zona;
      this.add
        .zone(z.x * ESCALA, z.y * ESCALA, z.ancho * ESCALA, z.alto * ESCALA)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => !this.ocupado && this.seleccionar(punto));
    }

    this.input.on('pointerdown', (puntero: Phaser.Input.Pointer, tocados: Phaser.GameObjects.GameObject[]) => {
      if (puntero.y >= ALTO_ESCENA || tocados.length > 0 || this.ocupado) return;
      this.seleccionado = null;
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
      void reproducirDialogo(this, d.lineas, (quien) => this.ancla(quien), d.banda);
    } else if (!tieneMarca(MISION_1.marcaInicio)) {
      this.entradaNikola();
    }
  }

  /**
   * Paso 1 de la misión: Nikola llega apurado desde la derecha.
   * PENDIENTE: acá suena un riff de fondo cuando Orate pase el archivo
   * (public/assets/audio/); mientras tanto, silencio.
   */
  private entradaNikola() {
    const nikola = this.children.getByName('nikola') as Phaser.GameObjects.Image;
    const destino = nikola.x;
    const piso = nikola.y;
    const pies = { x: ANCHO + nikola.width };
    let paso = 0;
    this.ocupado = true;

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
        this.barra.mostrarMensaje('Nikola parece preocupado. Tocalo y hablale.', 5000);
      },
    });
    nikola.setPosition(pies.x, piso);
  }

  /** Abre el Phone encima de la escena, que queda en pausa hasta que se cierre. */
  private abrirPhone() {
    if (this.ocupado) return;
    this.scene.launch('Phone', { volverA: this.scene.key });
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
    await reproducirDialogo(this, dialogo.lineas, (quien) => this.ancla(quien), dialogo.banda);

    if (terminaMision) this.barra.mostrarMensaje(MISION_1.mensajeFinal, 8000);
    else if (agregados.length) {
      const nombres = agregados.map((o) => OBJETOS[o]?.nombre ?? o).join(' y ');
      this.barra.mostrarMensaje(`Conseguiste ${nombres}.`);
    }
    this.ocupado = false;
  }

  private actualizarApariencias() {
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
    this.pasos ??= this.time.addEvent({
      delay: MS_POR_PASO,
      loop: true,
      callback: () => {
        this.rebote = this.rebote ? 0 : ESCALA;
        this.actualizarJugador();
      },
    });

    this.caminata = this.tweens.add({
      targets: this.pies,
      x: fx,
      y: fy,
      duration: (distancia / VELOCIDAD) * 1000,
      onUpdate: () => this.actualizarJugador(),
      onComplete: () => this.detener(),
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
