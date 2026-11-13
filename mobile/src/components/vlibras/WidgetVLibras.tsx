/**
 * VLibras no ANDROID/iOS.
 *
 * O widget oficial do VLibras só existe para páginas web, então ele roda numa
 * WebView com a mesma página que o site usa. Este componente:
 *
 * 1. mostra o botão flutuante azul na lateral direita (igual ao do site);
 * 2. ao tocar, abre o painel com o avatar (a WebView é criada no 1º toque e
 *    depois só fica escondida, para não carregar o avatar de novo);
 * 3. registra (`registrarTradutor`) a função que manda um texto para o avatar
 *    (`window.plugin.translate`, a função pública do widget);
 * 4. quando o usuário fecha pelo "X" do próprio widget, a página avisa
 *    ("fechado") e o painel some.
 *
 * Precisa de internet: o avatar é baixado de vlibras.gov.br (o 1º carregamento
 * demora alguns segundos e mostra "Iniciando..." dentro do painel).
 */
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { iconesComuns } from '../../theme/icones';
import { fontes } from '../../theme/tipografia';
import { Icone } from '../Icone';
import { URL_VLIBRAS, type WidgetVLibrasProps } from './tipos';

// Tamanho do cartão do widget (260x373) + margem que ele mesmo deixa em volta.
const LARGURA_PAINEL = 276;
const ALTURA_PAINEL = 400;
const AZUL_VLIBRAS = '#1351B4';

/**
 * Página carregada na WebView. Funções expostas para o app:
 * - __zfAbrir(): abre o widget;
 * - __zfTraduzir(texto): traduz o texto (guarda na fila se o avatar ainda carrega).
 * Mensagens enviadas ao app: "fechado".
 */
const PAGINA = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:transparent}
  /* O botão do próprio widget fica escondido: o app tem o seu. */
  #vlibras-access-wrapper{display:none!important}
</style></head><body>
<script src="${URL_VLIBRAS}/vlibras-plugin.js"></script>
<script>
(function(){
  var fila = null;
  function avisar(m){ if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(m); }
  function pronto(){ return window.plugin && typeof window.plugin.translate === 'function'; }

  window.__zfTraduzir = function(texto){ if (pronto()) window.plugin.translate(texto); else fila = texto; };
  window.__zfAbrir = function(){ if (window.VLibrasWidget && window.VLibrasWidget.open) window.VLibrasWidget.open(); };

  new window.VLibras.Widget('${URL_VLIBRAS}');

  // Abre assim que o widget terminar de montar o botão (após o DOMContentLoaded).
  var esperaAbrir = setInterval(function(){
    if (window.VLibrasWidget && window.VLibrasWidget.open) { clearInterval(esperaAbrir); window.__zfAbrir(); }
  }, 50);

  // Traduz o que ficou na fila enquanto o avatar carregava.
  var esperaAvatar = setInterval(function(){
    if (pronto()) { clearInterval(esperaAvatar); if (fila) { window.plugin.translate(fila); fila = null; } }
  }, 300);

  // Detecta o "X" do widget: ao fechar, o botão interno volta a aparecer
  // (style "display: flex"); enquanto aberto ele fica com "display: none".
  var esperaBotao = setInterval(function(){
    var w = document.getElementById('vlibras-access-wrapper');
    var botao = w && w.shadowRoot && w.shadowRoot.querySelector('#vlibras-access');
    if (!botao) return;
    clearInterval(esperaBotao);
    var jaAbriu = botao.style.display === 'none';
    new MutationObserver(function(){
      if (botao.style.display === 'none') jaAbriu = true;
      else if (jaAbriu) avisar('fechado');
    }).observe(botao, { attributes: true, attributeFilter: ['style'] });
  }, 100);
})();
</script></body></html>`;

export function WidgetVLibras({ aoMudarAtivo, registrarTradutor }: WidgetVLibrasProps) {
  // `WebView<object>`: o tipo padrão da lib (`WebView<undefined>`) vira `never` neste TypeScript.
  const refWebView = useRef<WebView<object>>(null);
  /** A WebView só é criada no 1º toque (não gasta dados de quem não usa). */
  const [iniciado, setIniciado] = useState(false);
  const [aberto, setAberto] = useState(false);

  // Liga a função de tradução do LibrasContext a esta WebView.
  useEffect(() => {
    registrarTradutor((texto) => {
      refWebView.current?.injectJavaScript(`window.__zfTraduzir(${JSON.stringify(texto)}); true;`);
    });
    return () => registrarTradutor(null);
  }, [registrarTradutor]);

  function abrir() {
    if (iniciado) refWebView.current?.injectJavaScript('window.__zfAbrir(); true;');
    setIniciado(true);
    setAberto(true);
    aoMudarAtivo(true);
  }

  function aoReceberMensagem(evento: WebViewMessageEvent) {
    if (evento.nativeEvent.data === 'fechado') {
      setAberto(false);
      aoMudarAtivo(false);
    }
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {/* Botão flutuante (mesma posição do site: direita, meio da tela). */}
      {!aberto && (
        <Pressable
          onPress={abrir}
          accessibilityRole="button"
          accessibilityLabel="Abrir o VLibras: conteúdo acessível em Libras"
          hitSlop={6}
          style={estilos.botao}
        >
          <Icone fonte={iconesComuns.vlibras} largura={40} altura={40} />
        </Pressable>
      )}

      {iniciado && (
        <View
          pointerEvents={aberto ? 'box-none' : 'none'}
          style={[estilos.painel, !aberto && estilos.escondido]}
        >
          <View style={estilos.dica}>
            <Text style={estilos.textoDica}>Toque em um texto para ver em Libras</Text>
          </View>
          <WebView<object>
            ref={refWebView}
            source={{ html: PAGINA, baseUrl: 'https://vlibras.gov.br' }}
            originWhitelist={['*']}
            onMessage={aoReceberMensagem}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            bounces={false}
            style={estilos.webView}
            containerStyle={estilos.webView}
          />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  botao: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -20,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
  },
  painel: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -ALTURA_PAINEL / 2,
    width: LARGURA_PAINEL,
    height: ALTURA_PAINEL,
  },
  escondido: {
    // Escondido (não desmontado) para o avatar não precisar carregar de novo.
    opacity: 0,
  },
  dica: {
    position: 'absolute',
    bottom: '100%',
    right: 8,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: AZUL_VLIBRAS,
  },
  textoDica: {
    fontFamily: fontes.medium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
