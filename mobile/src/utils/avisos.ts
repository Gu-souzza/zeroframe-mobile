/**
 * Avisos e confirmações que funcionam em Android, iOS **e Web**.
 *
 * O `Alert` do React Native não faz nada no navegador (React Native Web não
 * o implementa), então na web usamos `window.alert` / `window.confirm`.
 * Use estas funções no lugar de `Alert.alert` em todo o app.
 */
import { Alert, Platform } from 'react-native';

/** Mostra uma mensagem simples com botão "OK". */
export function avisar(titulo: string, mensagem?: string) {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
    return;
  }
  Alert.alert(titulo, mensagem);
}

/**
 * Pede confirmação ao usuário. Resolve `true` se ele confirmar.
 * Ex.: `if (await confirmar('Sair da conta?')) { ... }`
 */
export function confirmar(titulo: string, mensagem?: string, textoConfirmar = 'Confirmar'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(mensagem ? `${titulo}\n\n${mensagem}` : titulo));
  }
  return new Promise((resolve) => {
    Alert.alert(titulo, mensagem, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: textoConfirmar, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
