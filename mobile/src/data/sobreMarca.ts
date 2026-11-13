/**
 * Conteúdo da tela "Sobre a marca" (textos do Figma 634:2240).
 *
 * Para incluir outro fundador no carrossel, adicione um item em `FUNDADORES`
 * (com a foto 3:4 em assets/images/). As setas do carrossel só ficam ativas
 * quando há mais de um fundador.
 */
import type { Imagem } from '../types';

export const PARAGRAFOS_SOBRE = [
  'A Zero Frame é uma marca de moda streetwear criada em São Paulo em 2025, inspirada na cultura urbana e na essência do skate dos anos 2000. Nascida em meio à movimentação da cidade, a marca carrega como base a liberdade de expressão, a criatividade e a atitude presentes nas ruas, traduzindo esses elementos em peças que refletem um estilo autêntico e contemporâneo.',
  'Voltada principalmente para adolescentes e jovens adultos, a Zero Frame busca se conectar com uma geração que valoriza identidade, estilo e originalidade. A marca trabalha com roupas e acessórios de diversas marcas, trazendo variedade e tendências do universo streetwear, além de desenvolver camisetas próprias com designs exclusivos, influenciados pela estética Y2K, pelo cenário do skate e pela cultura urbana.',
  'Cada peça é pensada para representar mais do que moda, mas um estilo de vida, onde o visual se torna uma forma de expressão pessoal. A loja física, localizada em São Paulo, foi criada para ser mais do que um ponto de venda, funcionando também como um espaço de encontro para pessoas que compartilham dos mesmos interesses, ideias e referências.',
];

export const DESTAQUE_SOBRE =
  'A Zero Frame não é apenas uma marca, mas um reflexo da cultura de rua, unindo moda, atitude e identidade em um só lugar.';

/** Seção "Missão" (Figma 675:1318). */
export const MISSAO =
  'Vestir quem faz a rua acontecer, e isso inclui todo mundo. Nascemos do skate e das ruas de São Paulo, onde cada pessoa tem espaço para ser quem é.';

/** Seção "Valores" (Figma 675:1325): o nome aparece em negrito, seguido de ": descrição". */
export const VALORES: { nome: string; descricao: string }[] = [
  {
    nome: 'Diversidade',
    descricao: 'valorizamos pessoas de todas as raças, gêneros, corpos, orientações e origens, na loja, nas campanhas e na equipe.',
  },
  {
    nome: 'Inclusão',
    descricao: 'criamos peças e experiências para corpos reais e investimos em acessibilidade, como o tradutor de Libras no site.',
  },
  {
    nome: 'Combate à discriminação',
    descricao: 'racismo, machismo, LGBTfobia ou qualquer forma de preconceito não têm espaço na Zero Frame.',
  },
  {
    nome: 'Responsabilidade social',
    descricao: 'apoiamos artistas e criadores locais e reconhecemos a origem da cultura de rua que nos inspira.',
  },
];

export interface Fundador {
  nome: string;
  funcao: string;
  bio: string;
  /** Foto retrato 3:4 (exibida em 192x256). */
  foto: Imagem;
  /**
   * Zoom/deslocamento opcional da foto dentro da moldura, em frações da moldura
   * (ex.: escala 1.34 = foto 34% maior). Sem isso, a foto 3:4 aparece inteira.
   */
  recorte?: { escalaX: number; escalaY: number; esquerda: number; topo: number };
  /** Links dos ícones. Sem link, o ícone mostra um aviso ao ser tocado. */
  github?: string;
  linkedin?: string;
}

/**
 * Fundadores, na mesma ordem da página "Sobre" da versão web
 * (github.com/murilokkj/zeroframe-final → FRONTEND/pages/sobre/sobre.html).
 * Fotos copiadas de lá e otimizadas (600px, JPEG) em assets/images/fundador-*.jpg.
 */
export const FUNDADORES: Fundador[] = [
  {
    nome: 'Gustavo Souza',
    funcao: 'Engenharia de Software',
    bio: 'Estudante de Análise e Desenvolvimento de Sistemas, com interesse em Inteligência Artificial, automação de processos e tecnologia aplicada ao ambiente corporativo. Possui experiência na área administrativa, contribuindo para o desenvolvimento de uma visão voltada à otimização de tarefas e integração de sistemas. Perfil dedicado e interessado em inovação, buscando aprimorar conhecimentos em soluções inteligentes e automações.',
    foto: require('../../assets/images/fundador-gustavo.jpg'),
    github: 'https://github.com/gu-souzza',
    linkedin: 'https://www.linkedin.com/in/gustavo-souza-5837a235a/',
  },
  {
    nome: 'Jesuan Duarte',
    funcao: 'Back-End e Banco de Dados',
    bio: 'Desenvolvedor em formação com foco em back-end, com experiência no desenvolvimento de sistemas utilizando C# e ASP.NET Core, aplicando arquitetura em camadas, boas práticas de software e integração de sistemas. Perfil dedicado e interessado em tecnologia, buscando constantemente aprimorar conhecimentos em segurança, experiência do usuário e desenvolvimento de aplicações modernas.',
    foto: require('../../assets/images/fundador-jesuan.jpg'),
    github: 'https://github.com/jesuanduarte',
    linkedin: 'https://www.linkedin.com/in/jesuan-duarte/',
  },
  {
    nome: 'Murilo Cruz Rodrigues',
    funcao: 'Front-End e Design UI/UX',
    // Bio e foto do Figma (mais completas que as da versão web); links da versão web.
    bio: 'Desenvolvedor em início de carreira com foco em front-end, possuo experiência na construção de interfaces utilizando HTML, CSS e JavaScript, com atenção às boas práticas de UI/UX e responsividade. Tenho perfil criativo e interesse em design digital, o que contribui para a criação de soluções modernas e funcionais. Estou em constante aprendizado, buscando aprimorar minhas habilidades técnicas e expandir meus conhecimentos, incluindo integração com back-end. Comprometido com a evolução profissional, procuro oportunidades para aplicar e desenvolver minhas competências na área de tecnologia.',
    foto: require('../../assets/images/fundador-murilo.jpg'),
    // Enquadramento do Figma (634:2262): foto 133,96% x 133,68%, deslocada -24,19% / -33,64%.
    recorte: { escalaX: 1.3396, escalaY: 1.3368, esquerda: -0.2419, topo: -0.3364 },
    github: 'https://github.com/murilokkj',
    linkedin: 'https://www.linkedin.com/in/murilo-cruz-rodrigues/',
  },
  {
    nome: 'Pedro Calqui',
    funcao: 'Machine Learning e Front-End',
    bio: 'Profissional com foco em Inteligência Artificial aplicada a negócios, com experiência em automação de processos comerciais e desenvolvimento de agentes de IA. Atua com ferramentas como n8n, Claude, OpenClaw e Google Cloud Platform, criando soluções escaláveis e eficientes para otimização de processos. Perfil analítico e orientado a resultados, unindo visão estratégica e interesse constante por inovação tecnológica.',
    foto: require('../../assets/images/fundador-pedro-calqui.jpg'),
    github: 'https://github.com/pedrocalqui',
    linkedin: 'https://www.linkedin.com/in/pedrocalqui/',
  },
  {
    nome: 'Pedro Silva',
    funcao: 'Back-End e Banco de Dados',
    bio: 'Desenvolvedor em formação com foco em desenvolvimento web e back-end, com interesse em banco de dados, Python e criação de sistemas funcionais e organizados. Perfil analítico e criativo, buscando constantemente aprender novas tecnologias e aprimorar habilidades práticas no desenvolvimento de soluções eficientes e modernas.',
    foto: require('../../assets/images/fundador-pedro-silva.jpg'),
    // TODO: o site também não tem o GitHub dele (link "#").
    github: undefined,
    linkedin: 'https://www.linkedin.com/in/pedro-silva-6a6775246/',
  },
  {
    nome: 'Ricardo Mariano',
    funcao: 'Engenharia de Software e Full-Stack',
    bio: 'Técnico em Informática e estudante de Análise e Desenvolvimento de Sistemas, com foco em análise de dados e desenvolvimento back-end. Possui experiência com linguagens como Python, PHP, C e C#, além de conhecimentos em bancos de dados relacionais e tecnologias front-end utilizando HTML, CSS e JavaScript. Perfil dinâmico e colaborativo, com interesse em resolução de problemas, liderança técnica e desenvolvimento de soluções eficientes.',
    foto: require('../../assets/images/fundador-ricardo.jpg'),
    github: 'https://github.com/Ricardo-Jorge-Mariano',
    linkedin: 'https://www.linkedin.com/in/ricardo-jorge-mariano-b0439733b/',
  },
  {
    nome: 'Vinicius Pescuma',
    funcao: 'Engenharia de Software',
    bio: 'Profissional da área de tecnologia com foco em automação e inteligência artificial, atuando em suporte técnico e operação de chatbots com IA. Possui experiência com processos automatizados e soluções tecnológicas voltadas ao atendimento e suporte de sistemas. Perfil analítico e proativo, com forte interesse em inovação, aprendizado contínuo e desenvolvimento de soluções modernas e eficientes.',
    foto: require('../../assets/images/fundador-vinicius.jpg'),
    // TODO: o site também não tem o GitHub dele (link "#").
    github: undefined,
    linkedin: 'https://www.linkedin.com/in/vin%C3%ADcius-pescuma-de-moraes-8768a937b/',
  },
];
