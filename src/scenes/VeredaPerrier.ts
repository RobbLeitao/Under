import Phaser from 'phaser';
import { ESCALA } from '../config';
import { VEREDA_PERRIER, type Lado } from '../data/escenas';
import { MISION_2 } from '../data/misiones/mision2';
import { marcar, tieneMarca } from '../systems/estado';
import { reglaFinal } from '../systems/misiones';
import { EscenaJuego } from './EscenaJuego';

/** Velocidad de Jota y de Raulo en las escenas automáticas, en unidades por segundo. */
const VELOCIDAD_PERSONAJE = 28;
/** Altura de los pies en el umbral de la puerta de Perrier (unidades). */
const Y_PUERTA = 101;
const X_PUERTA = 164;
const MS_PUERTA = 350;
/** Lo que tarda Raulo adentro, buscando en el depósito. */
const MS_DEPOSITO = 1800;
const MS_FUNDIDO_SHOW = 600;

/**
 * La vereda de Vinoteca Perrier, a la derecha de la esquina de El Bunker: la misión 2.
 * Sin la misión 1 terminada está sin misión (sin flyer, ventanal apagado).
 */
export class VeredaPerrier extends EscenaJuego {
  constructor() {
    super(VEREDA_PERRIER, [MISION_2]);
  }

  /** Al volver del show (o si se cortó antes del cierre): Raulo y el panel de misión cumplida. */
  protected alEmpezar() {
    if (!tieneMarca(MISION_2.marcaFin) || tieneMarca('mision2-cierre')) {
      super.alEmpezar();
      return;
    }
    void this.cierre();
  }

  private async cierre() {
    this.ocupado = true;
    this.enDialogo = true;
    this.cameras.main.fadeIn(600, 0, 0, 0);
    await new Promise((r) => this.time.delayedCall(700, r));
    await this.dialogo(this.comoDialogo({ dialogo: 'raulo-buena-banda' }));
    marcar('mision2-cierre');
    const regla = reglaFinal(MISION_2);
    if (regla) await this.misionCumplida(MISION_2, regla);
    this.ocupado = false;
    this.enDialogo = false;
  }

  /** El flyer sigue en la pared hasta que el jugador se va después del show; la próxima vez ya no está. */
  protected alSalir(_lado: Lado) {
    if (tieneMarca(MISION_2.marcaFin)) marcar('flyer-exiliado-retirado');
  }

  protected async secuencia(nombre: string) {
    if (nombre === 'jota-sale') await this.automatico(this.jotaSale());
    else if (nombre === 'deposito') await this.automatico(this.rauloVaAlDeposito());
    else if (nombre === 'show') await this.automatico(this.irAlShow());
  }

  /** Paso 3: Jota sale por la puerta, detrás de Raulo, y camina hasta delante del ventanal. */
  private async jotaSale() {
    const jota = this.sprite('jota');
    const datos = this.datos.personajes.find((p) => p.clave === 'jota');
    if (!jota || !datos) return;
    jota.setTexture('jota').setPosition(X_PUERTA * ESCALA, Y_PUERTA * ESCALA).setDepth(Y_PUERTA * ESCALA);
    jota.setAlpha(0).setVisible(true);
    await this.tween({ targets: jota, alpha: 1, duration: MS_PUERTA });
    await this.caminarPersonaje(jota, 'jota', datos.x, datos.y);
  }

  /** Paso 9: Raulo entra al depósito por la puerta y vuelve. */
  private async rauloVaAlDeposito() {
    const raulo = this.sprite('raulo');
    const datos = this.datos.personajes.find((p) => p.clave === 'raulo');
    if (!raulo || !datos) return;
    await this.caminarPersonaje(raulo, 'raulo', X_PUERTA, Y_PUERTA);
    await this.tween({ targets: raulo, alpha: 0, duration: MS_PUERTA });
    await new Promise((r) => this.time.delayedCall(MS_DEPOSITO, r));
    await this.tween({ targets: raulo, alpha: 1, duration: MS_PUERTA });
    await this.caminarPersonaje(raulo, 'raulo', datos.x, datos.y);
  }

  /** Paso 10: fundido y al salón, al show. */
  private irAlShow() {
    return new Promise<void>((resolver) => {
      this.cameras.main.fadeOut(MS_FUNDIDO_SHOW, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('ShowPerrier');
        resolver();
      });
    });
  }

  /**
   * Un personaje camina en línea recta hasta (x, y) en unidades, con su hoja de caminar.
   * Hacia la izquierda se espeja, salvo los que nunca se espejan (Jota).
   */
  private caminarPersonaje(sprite: Phaser.GameObjects.Sprite, base: string, x: number, y: number): Promise<void> {
    const desde = { x: sprite.x, y: sprite.y };
    const hasta = { x: x * ESCALA, y: y * ESCALA };
    const distancia = Phaser.Math.Distance.Between(desde.x, desde.y, hasta.x, hasta.y) / ESCALA;
    if (distancia < 1) return Promise.resolve();
    sprite.setFlipX(hasta.x < desde.x).play(`${base}-camina`);
    const pos = { ...desde };
    return this.tween({
      targets: pos,
      x: hasta.x,
      y: hasta.y,
      duration: (distancia / VELOCIDAD_PERSONAJE) * 1000,
      onUpdate: () => {
        const py = Math.round(pos.y / ESCALA) * ESCALA;
        sprite.setPosition(Math.round(pos.x / ESCALA) * ESCALA, py).setDepth(py);
      },
    }).then(() => {
      sprite.stop();
      sprite.setTexture(base).setFlipX(false);
    });
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolver) => this.tweens.add({ ...config, onComplete: () => resolver() }));
  }
}
