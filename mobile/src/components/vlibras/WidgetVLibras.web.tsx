/**
 * VLibras na WEB: só carrega o script oficial, como na versão web da Zero Frame
 * (`<script src="https://vlibras.gov.br/app/vlibras-plugin.js">` +
 * `new VLibras.Widget(...)`). O próprio widget desenha o botão azul na lateral
 * e traduz o texto em que o usuário clicar, então não há nada para renderizar.
 */
import { useEffect } from 'react';

import { URL_VLIBRAS, type WidgetVLibrasProps } from './tipos';

declare global {
  interface Window {
    VLibras?: { Widget: new (caminho: string) => unknown };
  }
}

const ID_SCRIPT = 'vlibras-plugin';

export function WidgetVLibras(_props: WidgetVLibrasProps) {
  useEffect(() => {
    // Carrega só uma vez (o recarregamento rápido do Expo remonta o componente).
    if (document.getElementById(ID_SCRIPT)) return;
    const script = document.createElement('script');
    script.id = ID_SCRIPT;
    script.src = `${URL_VLIBRAS}/vlibras-plugin.js`;
    script.async = true;
    script.onload = () => {
      if (window.VLibras) new window.VLibras.Widget(URL_VLIBRAS);
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
