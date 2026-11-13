/**
 * Regras de validação dos formulários de login e cadastro.
 *
 * Cada função devolve `null` quando o valor é válido, ou a mensagem de
 * erro que deve aparecer abaixo do campo.
 *
 * Importante: a API TAMBÉM deve validar tudo isso no servidor — validação
 * no app é só para dar retorno rápido ao usuário.
 */

export const SENHA_TAMANHO_MINIMO = 6;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Letras (com acento), espaços, apóstrofo e hífen. */
const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

export function validarEmail(email: string): string | null {
  const valor = email.trim();
  if (!valor) return 'Informe seu e-mail.';
  if (!REGEX_EMAIL.test(valor)) return 'E-mail inválido. Ex.: nome@email.com';
  return null;
}

export function validarSenha(senha: string): string | null {
  if (!senha) return 'Informe sua senha.';
  if (senha.length < SENHA_TAMANHO_MINIMO) {
    return `A senha deve ter no mínimo ${SENHA_TAMANHO_MINIMO} caracteres.`;
  }
  return null;
}

export function validarConfirmacaoSenha(senha: string, confirmacao: string): string | null {
  if (!confirmacao) return 'Confirme sua senha.';
  if (senha !== confirmacao) return 'As senhas não coincidem.';
  return null;
}

/** Nome completo: só letras, pelo menos nome e sobrenome. */
export function validarNome(nome: string): string | null {
  const valor = nome.trim().replace(/\s+/g, ' ');
  if (!valor) return 'Informe seu nome.';
  if (!REGEX_NOME.test(valor)) return 'Use apenas letras no nome.';
  const partes = valor.split(' ');
  if (partes.length < 2 || partes.some((p) => p.length < 2)) {
    return 'Informe nome e sobrenome.';
  }
  return null;
}

/** Telefone brasileiro com DDD: fixo (10 dígitos) ou celular (11 dígitos, começando com 9). */
export function validarTelefone(telefone: string): string | null {
  const digitos = somenteDigitos(telefone);
  if (!digitos) return 'Informe seu telefone.';
  if (digitos.length !== 10 && digitos.length !== 11) return 'Telefone inválido. Inclua o DDD.';
  if (Number(digitos.slice(0, 2)) < 11) return 'DDD inválido.';
  if (digitos.length === 11 && digitos[2] !== '9') return 'Celular deve começar com 9 após o DDD.';
  return null;
}

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/**
 * Aplica a máscara de telefone enquanto o usuário digita.
 * "11987654321" → "(11) 98765-4321"  |  "1132654321" → "(11) 3265-4321"
 */
export function mascararTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Formata número como moeda brasileira, no estilo do Figma: "R$1100,00". */
export function formatarPreco(valor: number, comEspaco = false): string {
  // Cards usam "R$1100,00"; resumo do carrinho e pedidos usam "R$ 1100,00".
  return `R$${comEspaco ? ' ' : ''}${valor.toFixed(2).replace('.', ',')}`;
}
