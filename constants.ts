import type { AdminProfile, Post, ChatMessage } from './types';

export const ADMIN_PROFILES: AdminProfile[] = [
  {
    userName: "pietroadmin",
    contact: "desouzarangelpietro@gmail.com",
    password: "ppiieettrroo",
    specialPower: "Mestre dos Fantoches Nível 1",
    avatar: "https://picsum.photos/seed/pietro/100/100",
  },
  {
    userName: "henriqueadmin2",
    contact: ["contareserva713821@gmail.com", "jucemar032@gmail.com"],
    password: "admin2",
    specialPower: "Mestre dos Fantoches Nível 2",
    avatar: "https://picsum.photos/seed/henrique/100/100",
  },
  {
    userName: "loloadmin3",
    contact: "eglernuneslorenzo@gmail.com",
    password: "admin3",
    specialPower: "Conta De Treinamento",
    avatar: "https://picsum.photos/seed/lolo/100/100",
  },
  {
    userName: "GOD",
    contact: "",
    password: "",
    specialPower: "GODNESS",
    avatar: "data:image/png;base64,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",
    isImmune: true
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    author: 'pietroadmin',
    authorAvatar: 'https://picsum.photos/seed/pietro/100/100',
    caption: 'Contemplem minha primeira criação neste novo reino digital. É... aceitável.',
    mediaUrl: 'https://picsum.photos/seed/space/800/600',
    mediaType: 'image',
    likes: 1337,
    comments: [
      { id: 'c1', author: 'henriqueadmin2', authorAvatar: 'https://picsum.photos/seed/henrique/100/100', text: 'Um movimento ousado. Vejo potencial.' },
      { id: 'c2', author: 'loloadmin3', authorAvatar: 'https://picsum.photos/seed/lolo/100/100', text: 'Holograma fofo. É um gato?' },
    ],
    timestamp: 'Há 2 horas',
  },
  {
    id: 'post2',
    author: 'loloadmin3',
    authorAvatar: 'https://picsum.photos/seed/lolo/100/100',
    caption: 'Insira aqui uma legenda filosófica que ninguém vai ler.',
    mediaUrl: 'https://picsum.photos/seed/cat/800/600',
    mediaType: 'image',
    likes: 9001,
    comments: [
       { id: 'c3', author: 'pietroadmin', authorAvatar: 'https://picsum.photos/seed/pietro/100/100', text: 'Profundamente sem sentido. Aprovo.' },
    ],
    timestamp: 'Há 5 horas',
  }
];

export const MOCK_CHAT_HISTORY: { [key: string]: ChatMessage[] } = {
  henriqueadmin2: [
    { id: 'chat1', sender: 'henriqueadmin2', receiver: 'pietroadmin', text: 'Você viu o último relatório de dados de usuários?', timestamp: '10:30' },
    { id: 'chat2', sender: 'pietroadmin', receiver: 'henriqueadmin2', text: 'Aquele que eu solicitei? Foi... iluminador.', timestamp: '10:32' },
  ],
  loloadmin3: [
    { id: 'chat3', sender: 'loloadmin3', receiver: 'pietroadmin', text: 'O chatbot me chamou de "mera mortal" de novo.', timestamp: '11:00' },
    { id: 'chat4', sender: 'pietroadmin', receiver: 'loloadmin3', text: 'Ele está aprendendo.', timestamp: '11:01' },
  ]
};
