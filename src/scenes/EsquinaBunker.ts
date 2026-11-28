import { ANCHO, ESCALA } from '../config';
import { ESQUINA_EL_BUNKER } from '../data/escenas';
import { MISION_1 } from '../data/misiones/mision1';
import { marcar, tieneMarca } from '../systems/estado';
import { tocarFragmento } from '../systems/musica';
import { EscenaJuego } from './EscenaJuego';

/** Duración de la entrada de Nikola al empezar la misión. */
const MS_ENTRADA_NIKOLA = 2600;

/**
 * La esquina de El Bunker, con el kiosco al lado: la misión 1. Por el borde derecho se pasa
 * caminando a la vereda de Perrier.
 */
export class EsquinaBunker extends EscenaJuego {
  constructor() {
    super(ESQUINA_EL_BUNKER, [MISION_1]);
  }

  /**
   * Paso 1 de la misión: el jugador entra caminando por la izquierda (o por donde venga)
   * mientras suena un riff en los auriculares y Nikola llega apurado desde la derecha.
   */
  protected alEmpezar() {
    if (tieneMarca(MISION_1.marcaInicio)) {
      super.alEmpezar();
      return;
    }
    const musica = MISION_1.musicaEntrada;
    if (musica) void tocarFragmento(this, musica.tema, musica);
    const lado = this.entrada.entrada ?? 'izquierda';
    void this.automatico(
      Promise.all([this.entrarCaminando(lado, lado === 'izquierda' ? this.datos.inicioJugador.x : undefined), this.entradaNikola()]),
    ).then(() => {
      marcar(MISION_1.marcaInicio);
      this.barra.mostrarMensaje('Nikola parece preocupado. Tocalo y hablale.', 5000);
    });
  }

  /** Nikola camina desde fuera de la pantalla, por la derecha, hasta su lugar. */
  private entradaNikola(): Promise<void> {
    const nikola = this.sprite('nikola');
    const datos = this.datos.personajes.find((p) => p.clave === 'nikola');
    if (!nikola || !datos) return Promise.resolve();
    const base = this.texturaPersonaje(datos);
    const destino = nikola.x;
    const piso = nikola.y;
    const pies = { x: ANCHO + nikola.width };

    return new Promise((resolver) => {
      // Camina hacia la izquierda: la hoja de caminar, espejada, como el jugador.
      nikola.setFlipX(true).play(`${base}-camina`);
      nikola.setPosition(pies.x, piso);
      this.tweens.add({
        targets: pies,
        x: destino,
        duration: MS_ENTRADA_NIKOLA,
        onUpdate: () => nikola.setPosition(Math.round(pies.x / ESCALA) * ESCALA, piso),
        onComplete: () => {
          nikola.stop();
          nikola.setTexture(base).setFlipX(false);
          nikola.setPosition(destino, piso);
          resolver();
        },
      });
    });
  }
}
