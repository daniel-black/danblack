import type { ImageMetadata } from 'astro';
import chiptunes from './assets/projects/chiptunes.png';

export interface Project {
  name: string;
  url: string;
  /** Source code link, if public. */
  repo?: string;
  tagline: string;
  description: string;
  tags: string[];
  image?: { src: ImageMetadata; alt: string };
  /** Label for the call-to-action link. */
  cta?: string;
  /** A secondary link to try the project out, e.g. a shared song. */
  demo?: { url: string; label: string };
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: 'Chiptunes',
    url: 'https://chiptunes.studio/',
    repo: 'https://github.com/daniel-black/chiptune-tracker',
    tagline: 'A Game Boy–style music tracker that runs in your browser.',
    description:
      'Compose songs the way 8-bit composers did: note by note, in a grid. Write across three ' +
      "pulse channels and a noise channel, shape each note's duty cycle, volume, and rate, then " +
      'arrange patterns into a full song. Every sound is synthesized live with the Web Audio API. ' +
      'Share a song as a link with the whole song encoded in the URL, no server needed. Whoever ' +
      'opens it gets a preview player that shows the rows as they play, and can remix it in the ' +
      'editor. Download songs as WAV or M4A audio, an MP4 video, or plain text.',
    tags: ['React', 'TypeScript', 'Jotai', 'Tailwind', 'Web Audio API'],
    image: {
      src: chiptunes,
      alt: 'The Chiptunes editor with the song "Wild Encounter" open: rows of notes across three pulse channels and a noise channel, beside its Intro, Battle A, and Battle B patterns arranged into a sequence.',
    },
    cta: 'Make a song',
    demo: {
      label: 'Listen to “Wild Encounter”',
      // The whole song is encoded in the URL fragment; no server involved.
      url: 'https://chiptunes.studio/share#v1.7V3Lbts6EP2VgtmKgJ6U7Z1fMrrq8i4CL2RJBoKmduAqF7gI_O-FDTS10iuaPhapocI9x9L4zNGZITnkG9vlPyo2Yf88PZdflrti_7qrqwPz2Ete19Vh95NN3phfVOPUFxEfbZMNjzeB4LlIfJ6GYehHgShFEZ7GPZVsojbY-_3cr7v6sGceK_M6Z5PHxzf2_Wl3-pmX1-ef1Wncvj6Nm_KEeezf_fPrySz1WPla_8cmLPHZ0Ws3ii-M4nejMJEahQpP2u2fzkaH_Gw0Hl_YhMe11-rI6uHSEcY5e38C55LXWj3EkB0_j_z7P2gafXCnYeNL3eGgOxxz51uWqdnJPJIClIEAZZ0ABHokxSgDMcpAjNoY1BFAS9CdJeiOZgYtwHhbgPGmn0ELEKBFJwDpYNAcxGgOYqSZQXMQoDlNBs3A15rxiCiDpmjcPGAe6WfQFNYSzCPNDEKzsVUnAGnI4kB3yDIIzcYysgwynfZoZpDptEd3Fmc459HPINM5j4EsznDao5lBptMezQwynfMYyOIM5zz6GaT8n3Vkh3oU-RdmQuaR8hNM28kwSgbnkcOIvkfDw-g81Dk1AKeaxdFINa-7NEqQpK7tSR988Rtvp46O4js1jSLEqO1J8CfOdKqgP50jHmONnCd1MUY1xiKLY6zhiIsxO2PMygQgGJxH0kLbFo_8jzNqQ3Bq4LMH8eA8Gh5GUklqrugI1ZXHSyNFQV4iM9jqxU43e9pQO2QGW4oLOiGv9lp_QRPdDg1a7NgAjXyBu5NIU8xIIdY0HiRlTTdhRoY1piNNM3HQ_b1EidMMtrZ_qzNoAOI0srUbimsboJGmaqYj7X7iXFFP29CRpp3mP2v3io50Pse-z9oVDbWNO2N5sAnL0An843p99FgiNiJKi4CnIh_xeFTEfBRHEffDaFtFaSpC_09rkdLg99aiWV7Xz9WXKbveXbS8v7voT27YfXcRunykDii6NUpzbtj8ecVKF_3yThGOqjd-2QeNlhlKfFPUvblh9-sVRFmzaPmaOdb0zhr0tYyyxskNWbnRP-3dHzTSYhf6plmhNTZAYzlrPq3ctNU10ndC274zmlqDfgQosgYNs4wma_qD5obzEiiyRr_WONY41tzGmrYTeuiwxmkNWdbor2v6g0bLfisr5EZ5K7IFrNFfCzi5uUVuVojc4OdckJQbvRvOzMoNeoDCiiZr-oNGy6qNUeJolhuirIGqTsca89NoRFnj5Ias3OivbvqDpvtVGyu0xgZoLGfNp5UbaM81esyb5hYfOOHs7Zi37lmDhhm0aVQ_a4ieRD7Hdj0ZZI1-rSHKGlQ2HHEoVzdOcZzimKlu-oPmhgYspziONU5ufsvNqbfHL7ZlNApSPo5HgsdhseF5Efk8FUFQFeW2TMrxxbVBCoM_9vbMFHp7zN0c1La22nNvj9EmLzSsFSkK9eM3cWl7kjVn9WSqxwPjPexIKYW7Q1LYiLIGvcupG3Qcd64CNAdbcZvTF4qHwBDdBkeUO8QVp4ELqSOtUNboz3GtEB3o9EuirHGKQ05xZki2NmspcGzcl2AFcXTKzWpYlFG-VeyOm1kMFjhE9yUQZQ16oXA36DjuXAVoARY4C6TAcYozIMWhW-CgrKGbRVPceG0Fa5zikFOc5ul2itkaNJ9G9LgcK4ijU26mw6KM8gWPMGXMe-TkBsqfNdeejjiGlm-WTm4-udzQrW5Q1qhDA01BW6E1jjVObgaxdkN01_VwWQNdFmM9ZZaDK22Mbry2u7TpFxrHnasAQR0LzX3kOuXGlosXP5vc0MUFpYw6NNARuv1pDSl07u8kOQ-lUt3cLze3uUOXPv_j1Pp49NhLXtfVYfftUFYHNnlkflGNU19EfLRNNjzeBILnIvF5GoahHwWiFMXpL1W810exRajLX1t7bPPyg02CxD_-Ag',
    },
    featured: true,
  },
];
