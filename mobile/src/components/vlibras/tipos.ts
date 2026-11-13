/** Props comuns às versões web e nativa do widget do VLibras. */
export interface WidgetVLibrasProps {
  /** Avisa o LibrasContext quando o painel abre/fecha (só no celular). */
  aoMudarAtivo: (ativo: boolean) => void;
  /** O widget informa aqui a função que envia um texto para o avatar (null ao desmontar). */
  registrarTradutor: (tradutor: ((texto: string) => void) | null) => void;
}

/** Endereço oficial do widget do VLibras (governo federal). */
export const URL_VLIBRAS = 'https://vlibras.gov.br/app';
