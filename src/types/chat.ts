export interface Message {
  id: string;
  content: string;
  sender: 'self' | 'other';
  timestamp: number;
}

export interface WordEntry {
  id: string;
  text: string;
  variants: string[];
  category: string;
}

// "帮我确认"类别
export interface ConfirmCategory {
  id: string;
  name: string;
  words: string[];
}

export interface Contact {
  id: string;
  name: string;
  status: string;
  wordBank: WordEntry[];
  confirmCategories: ConfirmCategory[];
  messages: Message[];
  avatarColor: string;
  replyDelay: number; // 回复延迟（毫秒）
}

// 反应时间选项（秒）
export const REPLY_DELAY_OPTIONS = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60] as const;
export const DEFAULT_REPLY_DELAY = 30;

export interface AppState {
  contacts: Contact[];
  activeContactId: string;
}

// 预设分类列表（普通词库分类）
export const WORD_CATEGORIES = [
  '早安问候',
  '晚安睡前',
  '关心体贴',
  '撒娇可爱',
  '表达爱意',
  '日常分享',
  '情绪安慰',
  '暧昧调情',
  '时间',
  '地点',
  '人物',
] as const;

export type WordCategory = (typeof WORD_CATEGORIES)[number];
