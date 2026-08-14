/** Fonte oficial JF4R (cálculo completo no browser GWT — sem API JSON de “calcular”). */
export const PROJEF_URL = 'https://www.jfrs.jus.br/projefweb/';

/** Catálogos públicos do PROJEF (critérios / indexadores) — não atualizam valor sozinhos. */
export const PROJEF_INDEXADOR_URL = 'https://www.jfrs.jus.br/projefweb/app/indexador';
export const PROJEF_CORRECAO_URL = 'https://www.jfrs.jus.br/projefweb/app/correcaoMonetaria';

export const PROJEF_HELP =
  'O PROJEF Web não expõe API JSON de cálculo. Use Selic (Bacen) nesta calculadora ou calcule no site e cole o valor.';

export function openProjef() {
  window.open(PROJEF_URL, '_blank', 'noopener,noreferrer');
}
