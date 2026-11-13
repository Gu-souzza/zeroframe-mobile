import type { MensagemSuporte } from '../types';
import { enviar } from './api';
import { obterUsuarioAtual } from './authService';

export const HORARIO_ATENDIMENTO = 'Seg-Sex: 08:00 às 18:00';

export async function enviarMensagemSuporte(mensagem: MensagemSuporte) {
  const usuario = await obterUsuarioAtual();
  if (!usuario) throw new Error('Entre na sua conta para continuar.');
  return enviar<{ protocolo: string }>('/suporte', 'POST', { ...usuario, ...mensagem });
}
