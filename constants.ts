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
    specialPower: "Mestre dos Fantoches Nível 3",
    avatar: "https://picsum.photos/seed/lolo/100/100",
  },
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