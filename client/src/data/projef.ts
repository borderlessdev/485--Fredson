/** Fonte oficial de atualização de valores (Justiça Federal — RS / 4ª Região). */
export const PROJEF_URL = 'https://www.jfrs.jus.br/projefweb/';

export const PROJEF_HELP =
  'Atualize o cálculo no PROJEF Web e importe aqui o valor resultante. O sistema oficial não possui API pública — a integração é híbrida.';

export function openProjef() {
  window.open(PROJEF_URL, '_blank', 'noopener,noreferrer');
}
