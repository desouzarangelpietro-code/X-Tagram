
export interface AdminProfile {
  userName: string;
  contact: string | string[];
  password?: string; // Made optional to not expose it everywhere
  specialPower: string;
  avatar: string;
  isImmune?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
}

export interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'none';
  likes: number;
  comments: Comment[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp: string;
}

export interface EventLogEntry {
  timestamp: string;
  user: string;
  action: string;
}

export interface Notification {
  id: string;
  text: string;
  timestamp: string;
  read: boolean;
}