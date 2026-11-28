import { VEREDA_PERRIER } from '../data/escenas';
import { EscenaJuego } from './EscenaJuego';

/**
 * La vereda de Vinoteca Perrier, a la derecha de la esquina de El Bunker. Sin la misión 1
 * terminada está sin misión (sin flyer, ventanal apagado); después, con el show de Exiliado.
 */
export class VeredaPerrier extends EscenaJuego {
  constructor() {
    super(VEREDA_PERRIER, []);
  }
}
