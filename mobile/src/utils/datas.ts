/**
 * Formatação de datas nos padrões usados nas telas.
 *
 * Todas recebem uma data ISO ("2026-10-15T14:32:00") ou um Date.
 */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const paraDate = (data: string | Date) => (typeof data === 'string' ? new Date(data) : data);
const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** "02 out 2026" — cards de pedido. */
export function formatarDataCurta(data: string | Date): string {
  const d = paraDate(data);
  return `${doisDigitos(d.getDate())} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** "15/10/2026" — topo da tela de detalhes do pedido. */
export function formatarDataNumerica(data: string | Date): string {
  const d = paraDate(data);
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "24 out, 14:32" — etapas da linha do tempo do pedido. */
export function formatarDiaHora(data: string | Date): string {
  const d = paraDate(data);
  return `${doisDigitos(d.getDate())} ${MESES[d.getMonth()]}, ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

/** "30 out" — previsão de entrega curta. */
export function formatarDiaMes(data: string | Date): string {
  const d = paraDate(data);
  return `${doisDigitos(d.getDate())} ${MESES[d.getMonth()]}`;
}
