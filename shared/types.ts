export type Member = {
  id: number;
  name: string;
  nickname: string;
  team: string;
  birthday: string;
  height: string;
  generation: string;
  imageUrl?: string;
};

export type TheaterShow = {
  id: number;
  title: string;
  team: string;
  date: string;
  time: string;
  location: string;
  setlist: string;
  members: string;
};

export type Livestream = {
  id: number;
  title: string;
  member: string;
  isLive: boolean;
  thumbnailUrl?: string;
  streamUrl: string;
};

export type MusicTrack = {
  id: number;
  title: string;
  artist: string;
  albumCover?: string;
  duration: string;
  currentTime?: string;
};

export type TicketType = 'general' | 'bot-help' | 'event';

export type StatusMessage = {
  text: string;
  type: 'watching' | 'listening' | 'playing';
};

export type BotCommand = {
  name: string;
  description: string;
  usage: string;
};
