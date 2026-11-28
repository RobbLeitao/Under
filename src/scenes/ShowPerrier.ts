import Phaser from 'phaser';
import { ANCHO, ESCALA } from '../config';
import { DIALOGOS } from '../data/dialogos';
import { MISION_2 } from '../data/misiones/mision2';
import { cortarFragmento, pausarReproductor, tocarFragmento } from '../systems/musica';
import { crearBoton } from '../ui/Boton';
import { reproducirDialogo } from '../ui/Vineta';
import type { EntradaEscena } from './EscenaJuego';

/** Arriba de la cabeza de Jota, que está dibujado en el fondo del salón (unidades). */
const ANCLA_JOTA = { x: 197, y: 35 };
/** Cuánto queda en pantalla el saludo de Jota antes de irse solo. */
const MS_SALUDO = 3500;
const MS_FUNDIDO = 600;
const ANCHO_SALTAR = 140;
const ALTO_SALTAR = 56;
/** Dónde aparece el jugador en la vereda al volver: al lado de Raulo, en la puerta. */
const VUELTA_A_LA_VEREDA: EntradaEscena = { x: 142, y: 112 };

/**
 * El show de Exiliado adentro de Perrier (misión 2, paso 10). Escena corta y sin control:
 * suena el fragmento del tema mientras Jota saluda, y al final agradece con el botón de
 * {plataforma}. "Saltar" (o Esc) va directo a la vereda. Las recompensas ya se dieron al
 * entregar las cuerdas, así que saltar da lo mismo.
 */
export class ShowPerrier extends Phaser.Scene {
  private terminando = false;

  constructor() {
    super('ShowPerrier');
  }

  init() {
    this.terminando = false;
  }

  create() {
    this.add.image(0, 0, 'fondo-salon-perrier-show').setOrigin(0);
    this.cameras.main.fadeIn(MS_FUNDIDO, 0, 0, 0);

    // El tema del Phone se pausa para que se escuche el show.
    pausarReproductor();
    const musica = MISION_2.musicaShow;
    if (musica) void tocarFragmento(this, musica.tema, musica);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => cortarFragmento());

    // Saltar, en el lugar del botón de pausa (y Esc).
    const saltar = crearBoton(this, ANCHO - 16 - ANCHO_SALTAR, 16, ANCHO_SALTAR, 'Saltar', () => this.terminar(), 'oscuro', ALTO_SALTAR);
    saltar.setDepth(21000);
    this.input.keyboard?.on('keydown-ESC', () => this.terminar());

    void this.show(musica?.duracion ?? 10);
  }

  private async show(duracion: number) {
    const ancla = () => ({ x: ANCLA_JOTA.x * ESCALA, y: ANCLA_JOTA.y * ESCALA });
    // El agradecimiento llega cuando termina el fragmento; hasta entonces, el saludo y la música.
    const finDelTema = new Promise((r) => this.time.delayedCall(duracion * 1000, r));
    const saludo = DIALOGOS['show-saludo'];
    await reproducirDialogo(this, saludo.lineas, ancla, undefined, undefined, MS_SALUDO);
    await finDelTema;
    if (this.terminando) return;
    const gracias = DIALOGOS['show-gracias'];
    await reproducirDialogo(this, gracias.lineas, ancla, gracias.banda);
    this.terminar();
  }

  /** Fundido a negro y vuelta a la vereda, con solo Raulo en la puerta. */
  private terminar() {
    if (this.terminando) return;
    this.terminando = true;
    this.cameras.main.fadeOut(MS_FUNDIDO, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
      this.scene.start('VeredaPerrier', VUELTA_A_LA_VEREDA),
    );
  }
}
