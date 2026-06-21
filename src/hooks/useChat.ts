import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, WordEntry, Contact, ConfirmCategory } from '@/types/chat';
import { contactsApi } from '@/services/api';

const STORAGE_KEY = 'love-talk-v4';

// 分类常量
const CAT = {
  morning: '早安问候',
  night: '晚安睡前',
  care: '关心体贴',
  cute: '撒娇可爱',
  love: '表达爱意',
  daily: '日常分享',
  comfort: '情绪安慰',
  flirty: '暧昧调情',
} as const;

// 100条带分类的预设词条
const DEFAULT_WORD_ENTRIES: { text: string; category: string }[] = [
  { text: '早安/早上好呀', category: CAT.morning },
  { text: '起床了吗/醒了吗', category: CAT.morning },
  { text: '新的一天也要元气满满', category: CAT.morning },
  { text: '今天天气不错哦', category: CAT.morning },
  { text: '记得吃早餐/别空腹', category: CAT.morning },
  { text: '今天也要加油呀', category: CAT.morning },
  { text: '睡得好吗/昨晚睡得好吗', category: CAT.morning },
  { text: '今天有什么安排', category: CAT.morning },
  { text: 'morning~ 想你啦', category: CAT.morning },
  { text: '快去洗漱吧/别赖床了', category: CAT.morning },
  { text: '今天也要想我哦', category: CAT.morning },
  { text: '嗯嗯/好哒 听你的', category: CAT.morning },

  { text: '晚安/好梦呀', category: CAT.night },
  { text: '早点睡/别熬夜了', category: CAT.night },
  { text: '一起睡觉/梦里见', category: CAT.night },
  { text: '今天累了吧/辛苦啦', category: CAT.night },
  { text: '盖好被子/别着凉了', category: CAT.night },
  { text: '睡不着的话想我', category: CAT.night },
  { text: '明天见/明天聊', category: CAT.night },
  { text: '做个好梦/梦到我哦', category: CAT.night },
  { text: '已经很晚啦 快去睡', category: CAT.night },
  { text: '闭上眼睛 想我就睡着啦', category: CAT.night },

  { text: '吃了吗/吃饭了吗', category: CAT.care },
  { text: '多喝热水/注意休息', category: CAT.care },
  { text: '别太累了/保重身体', category: CAT.care },
  { text: '记得吃药/按时吃药', category: CAT.care },
  { text: '最近天凉了 多加些衣服', category: CAT.care },
  { text: '天气变热了/注意防暑', category: CAT.care },
  { text: '你还好吗/怎么样了', category: CAT.care },
  { text: '工作别太晚/早点下班', category: CAT.care },
  { text: '路上注意安全/到家告诉我', category: CAT.care },
  { text: '身体不舒服吗/是不是累了', category: CAT.care },
  { text: '饿不饿/想吃什么', category: CAT.care },
  { text: '我给你点外卖吧', category: CAT.care },
  { text: '今天忙吗/忙完了吗', category: CAT.care },
  { text: '下班了吗/什么时候下班', category: CAT.care },
  { text: '好好吃饭/别将就', category: CAT.care },
  { text: '在家等我/我马上到', category: CAT.care },
  { text: '需要我帮忙吗/有我在', category: CAT.care },
  { text: '你就是我的全世界', category: CAT.care },

  { text: '亲爱的/宝贝/宝宝', category: CAT.cute },
  { text: '抱抱/亲亲/要抱抱', category: CAT.cute },
  { text: '想你了/好想你呀', category: CAT.cute },
  { text: '你在干嘛呢/在忙什么呢', category: CAT.cute },
  { text: '不理我了/怎么不回消息', category: CAT.cute },
  { text: '哼/不理你了/生气气', category: CAT.cute },
  { text: '人家想你了嘛', category: CAT.cute },
  { text: '好不好嘛/行不行嘛', category: CAT.cute },
  { text: '你最好了/你最棒了', category: CAT.cute },
  { text: '爱你哟/最爱你了', category: CAT.cute },
  { text: '嘿嘿/嘻嘻/傻笑中', category: CAT.cute },
  { text: '好无聊啊/陪我聊天嘛', category: CAT.cute },
  { text: '你有没有想我/想我了吗', category: CAT.cute },
  { text: '真讨厌/你好坏/坏死了', category: CAT.cute },
  { text: '人家不依嘛/不要嘛', category: CAT.cute },
  { text: '求你了/拜托拜托', category: CAT.cute },
  { text: '略略略/调皮', category: CAT.cute },
  { text: '就想粘着你', category: CAT.cute },

  { text: '我爱你/好爱你', category: CAT.love },
  { text: '有你在真好', category: CAT.love },
  { text: '最喜欢你了/超喜欢你', category: CAT.love },
  { text: '你对我真好/谢谢你', category: CAT.love },
  { text: '永远不会离开你', category: CAT.love },
  { text: '想一直陪着你', category: CAT.love },
  { text: '你是我的唯一', category: CAT.love },
  { text: '这辈子认定你了', category: CAT.love },
  { text: '遇见你真好/好幸运', category: CAT.love },
  { text: '想和你一起/想和你去', category: CAT.love },
  { text: '么么哒/么么', category: CAT.love },
  { text: '心里全是你/满脑子都是你', category: CAT.love },
  { text: '好幸福/好甜蜜', category: CAT.love },
  { text: '你是我的/我的', category: CAT.love },
  { text: '好想见你/想马上见到你', category: CAT.love },
  { text: '想抱你/想牵你的手', category: CAT.love },
  { text: '今晚月色真美', category: CAT.love },

  { text: '今天吃了好吃的/发现一家好吃的店', category: CAT.daily },
  { text: '刚看完一部电影/推荐你看', category: CAT.daily },
  { text: '听到一首歌想起你', category: CAT.daily },
  { text: '今天遇到了一件有趣的事', category: CAT.daily },
  { text: '好累啊/今天好忙', category: CAT.daily },
  { text: '好困啊/想睡觉觉', category: CAT.daily },
  { text: '今天心情不错/心情不太好', category: CAT.daily },
  { text: '下雨了/今天好冷', category: CAT.daily },
  { text: '想出去玩/想约会', category: CAT.daily },
  { text: '给你看个好玩的/给你分享个东西', category: CAT.daily },
  { text: '等你有空再说/你先忙', category: CAT.daily },
  { text: '随便/你决定/听你的', category: CAT.daily },
  { text: '拍给我看/发张照片', category: CAT.daily },

  { text: '怎么了/发生什么事了', category: CAT.comfort },
  { text: '别难过/有我在呢', category: CAT.comfort },
  { text: '没事的/会好起来的', category: CAT.comfort },
  { text: '我相信你/你可以的', category: CAT.comfort },
  { text: '别生气了/我错了', category: CAT.comfort },
  { text: '对不起/抱歉啦', category: CAT.comfort },
  { text: '都是我不好/原谅我嘛', category: CAT.comfort },
  { text: '下次不会了/我保证', category: CAT.comfort },

  { text: '你在想我吗/有没有想我', category: CAT.flirty },
  { text: '想听你的声音/给我发语音', category: CAT.flirty },
  { text: '想抱着你睡/想被你抱', category: CAT.flirty },
  { text: '梦里见/梦里找你', category: CAT.flirty },
];

// 默认"帮我确认"类别
const DEFAULT_CONFIRM_CATEGORIES: ConfirmCategory[] = [
  {
    id: 'cc-time',
    name: '时间',
    words: ['马上', '等一下', '今晚', '明天', '后天', '这周末', '等你有空', '晚上八点', '中午', '凌晨'],
  },
  {
    id: 'cc-place',
    name: '地点',
    words: ['你家', '我家', '咖啡店', '公园', '商场', '电影院', '餐厅', '海边', '图书馆', '健身房'],
  },
  {
    id: 'cc-people',
    name: '人物',
    words: ['就我们俩', '带上朋友', '叫上你闺蜜', '叫你兄弟一起', '我一个人来', '我爸妈也在', '同事聚会'],
  },
  {
    id: 'cc-mood',
    name: '心情',
    words: ['好开心', '有点难过', '超激动', '好平静', '很期待', '有点紧张', '很幸福'],
  },
  {
    id: 'cc-food',
    name: '食物',
    words: ['火锅', '烧烤', '日料', '中餐', '甜品', '奶茶', '披萨', '寿司', '家常菜', '麻辣烫'],
  },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const AVATAR_COLORS = [
  'from-[#e1b2b2] to-[#d2e6ec]',
  'from-[#b2c4e1] to-[#d2e6d6]',
  'from-[#d6b2e1] to-[#e6d6d2]',
  'from-[#b2d6c4] to-[#e1d6b2]',
  'from-[#c4b2d6] to-[#d6e1b2]',
  'from-[#e1c4b2] to-[#b2d6e1]',
];

function createDefaultContact(): Contact {
  return {
    id: generateId(),
    name: '亲爱的',
    status: '在线',
    wordBank: DEFAULT_WORD_ENTRIES.map((item, i) => ({
      id: `preset-${i + 1}`,
      text: item.text,
      variants: item.text.split('/').map((v) => v.trim()).filter(Boolean),
      category: item.category,
    })),
    confirmCategories: DEFAULT_CONFIRM_CATEGORIES.map((c) => ({ ...c, id: generateId() })),
    messages: [],
    avatarColor: AVATAR_COLORS[0],
    replyDelay: 30000,
  };
}

// 尝试从所有旧版本迁移数据
function migrateLegacyData(): { contacts: Contact[]; activeContactId: string } | null {
  const tryKeys = ['love-talk-v3', 'love-talk-v2', 'love-talk-data'];
  for (const key of tryKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed.contacts?.length > 0) {
        const contacts = parsed.contacts.map((c: any) => ({
          ...c,
          wordBank: (c.wordBank || []).map((w: any) => ({
            ...w,
            category: w.category || '其他',
          })),
          confirmCategories: c.confirmCategories?.length > 0
            ? c.confirmCategories
            : DEFAULT_CONFIRM_CATEGORIES.map((cc) => ({ ...cc, id: generateId() })),
          replyDelay: c.replyDelay || 30000,
        }));
        return { contacts, activeContactId: parsed.activeContactId || contacts[0].id };
      }
      // v1 格式 (单联系人)
      if (parsed.otherName !== undefined || parsed.messages) {
        const contact: Contact = {
          id: generateId(),
          name: parsed.otherName || '亲爱的',
          status: parsed.otherStatus || '在线',
          wordBank: (parsed.wordBank || []).map((w: any) => ({
            ...w,
            category: w.category || '其他',
          })),
          confirmCategories: DEFAULT_CONFIRM_CATEGORIES.map((c) => ({ ...c, id: generateId() })),
          messages: parsed.messages || [],
          avatarColor: AVATAR_COLORS[0],
          replyDelay: 30000,
        };
        return { contacts: [contact], activeContactId: contact.id };
      }
    } catch { /* ignore */ }
  }
  return null;
}

function loadState(): { contacts: Contact[]; activeContactId: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.contacts?.length > 0) {
        return {
          contacts: parsed.contacts,
          activeContactId: parsed.activeContactId || parsed.contacts[0].id,
        };
      }
    }
  } catch { /* ignore */ }

  const legacy = migrateLegacyData();
  if (legacy) return legacy;

  const defaultContact = createDefaultContact();
  return { contacts: [defaultContact], activeContactId: defaultContact.id };
}

function saveState(contacts: Contact[], activeContactId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ contacts, activeContactId }));
  } catch { /* ignore */ }
}

// Convert backend contact format to frontend Contact
function mapBackendContact(c: any): Contact {
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    wordBank: (c.word_bank || []) as WordEntry[],
    confirmCategories: (c.confirm_categories || []) as ConfirmCategory[],
    messages: (c.messages || []) as Message[],
    avatarColor: c.avatar_color,
    replyDelay: c.reply_delay,
  };
}

// Convert frontend Contact to backend format for create/update
function toBackendContact(c: Contact) {
  return {
    name: c.name,
    status: c.status,
    word_bank: c.wordBank,
    confirm_categories: c.confirmCategories,
    messages: c.messages,
    avatar_color: c.avatarColor,
    reply_delay: c.replyDelay,
  };
}

export function useChat(isLoggedIn: boolean) {
  const [contacts, setContacts] = useState<Contact[]>(() => loadState().contacts);
  const [activeContactId, setActiveContactId] = useState(() => loadState().activeContactId);
  const [isTyping, setIsTyping] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  // Load from backend when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    setSyncStatus('syncing');
    contactsApi.getAll()
      .then((data) => {
        if (cancelled) return;
        if (data.contacts.length > 0) {
          const mapped = data.contacts.map(mapBackendContact);
          setContacts(mapped);
          setActiveContactId((prev) => {
            const exists = mapped.find((c: Contact) => c.id === prev);
            return exists ? prev : mapped[0].id;
          });
        } else {
          // If no contacts on server, create default
          const defaultContact = createDefaultContact();
          contactsApi.create(toBackendContact(defaultContact)).then(() => {
            if (!cancelled) {
              setContacts([defaultContact]);
              setActiveContactId(defaultContact.id);
            }
          }).catch(() => {
            if (!cancelled) {
              setContacts([defaultContact]);
              setActiveContactId(defaultContact.id);
            }
          });
        }
        setSyncStatus('idle');
      })
      .catch(() => {
        if (!cancelled) setSyncStatus('error');
      });
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  // Sync to backend (debounced) when logged in, otherwise save to localStorage
  useEffect(() => {
    if (pendingSaveRef.current) clearTimeout(pendingSaveRef.current);

    if (!isLoggedIn) {
      saveState(contacts, activeContactId);
      return;
    }

    // Debounced backend sync for updates
    pendingSaveRef.current = setTimeout(() => {
      const active = contacts.find((c) => c.id === activeContactId);
      if (!active) return;
      contactsApi.update(active.id, toBackendContact(active)).catch(() => {
        // silent fail, will retry on next change
      });
    }, 2000);

    return () => {
      if (pendingSaveRef.current) clearTimeout(pendingSaveRef.current);
    };
  }, [contacts, activeContactId, isLoggedIn]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContact?.messages]);

  const updateActiveContact = useCallback(
    (updater: (contact: Contact) => Contact) => {
      setContacts((prev) => prev.map((c) => (c.id === activeContactId ? updater(c) : c)));
    },
    [activeContactId]
  );

  const switchContact = useCallback((contactId: string) => {
    setActiveContactId(contactId);
    setIsTyping(false);
    setConfirmPending(false);
  }, []);

  const createContact = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newContact: Contact = {
      id: generateId(),
      name: trimmed,
      status: '在线',
      wordBank: DEFAULT_WORD_ENTRIES.map((item, i) => ({
        id: `preset-${i + 1}`,
        text: item.text,
        variants: item.text.split('/').map((v) => v.trim()).filter(Boolean),
        category: item.category,
      })),
      confirmCategories: DEFAULT_CONFIRM_CATEGORIES.map((c) => ({ ...c, id: generateId() })),
      messages: [],
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      replyDelay: 30000,
    };

    if (isLoggedIn) {
      try {
        const data = await contactsApi.create(toBackendContact(newContact));
        const created = mapBackendContact(data.contact);
        setContacts((prev) => [...prev, created]);
        setActiveContactId(created.id);
        return created.id;
      } catch {
        // fallback to local
      }
    }

    setContacts((prev) => [...prev, newContact]);
    setActiveContactId(newContact.id);
    setConfirmPending(false);
    return newContact.id;
  }, [isLoggedIn]);

  const deleteContact = useCallback(
    async (contactId: string) => {
      if (isLoggedIn) {
        try { await contactsApi.delete(contactId); } catch { /* fallback */ }
      }
      setContacts((prev) => {
        const filtered = prev.filter((c) => c.id !== contactId);
        if (filtered.length === 0) {
          const newDefault = createDefaultContact();
          setActiveContactId(newDefault.id);
          // If logged in, sync new default to backend
          if (isLoggedIn) {
            contactsApi.create(toBackendContact(newDefault)).catch(() => {});
          }
          return [newDefault];
        }
        if (activeContactId === contactId) {
          setActiveContactId(filtered[0].id);
        }
        return filtered;
      });
      setConfirmPending(false);
    },
    [activeContactId, isLoggedIn]
  );

  const setContactName = useCallback(
    (name: string) => {
      updateActiveContact((c) => ({ ...c, name: name.trim() || c.name }));
    },
    [updateActiveContact]
  );

  const setContactStatus = useCallback(
    (status: string) => {
      updateActiveContact((c) => ({ ...c, status: status.trim() || c.status }));
    },
    [updateActiveContact]
  );

  // Send message - 检测"帮我确认"
  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !activeContact) return;

      const userMsg: Message = {
        id: generateId(),
        content: trimmed,
        sender: 'self',
        timestamp: Date.now(),
      };

      updateActiveContact((c) => ({ ...c, messages: [...c.messages, userMsg] }));

      // 检测是否包含"帮我确认"
      if (trimmed.includes('帮我确认')) {
        setConfirmPending(true);
        return;
      }

      // 普通回复流程 - 使用设置的延迟
      const delay = activeContact.replyDelay;
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const currentContact =
          contacts.find((c) => c.id === activeContactId) || activeContact;
        if (currentContact.wordBank.length === 0) return;
        const replyCount = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...currentContact.wordBank].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(replyCount, shuffled.length));

        selected.forEach((entry, idx) => {
          setTimeout(() => {
            const variant =
              entry.variants[Math.floor(Math.random() * entry.variants.length)];
            const replyMsg: Message = {
              id: generateId(),
              content: variant,
              sender: 'other',
              timestamp: Date.now(),
            };
            setContacts((prev) =>
              prev.map((c) =>
                c.id === activeContactId
                  ? { ...c, messages: [...c.messages, replyMsg] }
                  : c
              )
            );
          }, idx * 2000);
        });
      }, delay);
    },
    [activeContact, activeContactId, contacts, updateActiveContact]
  );

  // 执行"帮我确认"回复
  const executeConfirmReply = useCallback(
    (categoryId: string) => {
      const currentContact = contacts.find((c) => c.id === activeContactId) || activeContact;
      const category = currentContact.confirmCategories.find((c) => c.id === categoryId);
      if (!category || category.words.length === 0) {
        setConfirmPending(false);
        return;
      }

      setConfirmPending(false);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const word = category.words[Math.floor(Math.random() * category.words.length)];
        const replyMsg: Message = {
          id: generateId(),
          content: word,
          sender: 'other',
          timestamp: Date.now(),
        };
        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? { ...c, messages: [...c.messages, replyMsg] }
              : c
          )
        );
      }, currentContact.replyDelay);
    },
    [activeContact, activeContactId, contacts]
  );

  const cancelConfirm = useCallback(() => {
    setConfirmPending(false);
  }, []);

  // 普通词库操作
  const addWordEntry = useCallback(
    (text: string, category: string = '其他') => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const variants = trimmed.split('/').map((v) => v.trim()).filter(Boolean);
      if (variants.length === 0) return;
      const entry: WordEntry = { id: generateId(), text: trimmed, variants, category };
      updateActiveContact((c) => ({ ...c, wordBank: [...c.wordBank, entry] }));
    },
    [updateActiveContact]
  );

  const removeWordEntry = useCallback(
    (id: string) => {
      updateActiveContact((c) => ({
        ...c,
        wordBank: c.wordBank.filter((e) => e.id !== id),
      }));
    },
    [updateActiveContact]
  );

  const updateWordEntry = useCallback(
    (id: string, text: string, category: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const variants = trimmed.split('/').map((v) => v.trim()).filter(Boolean);
      updateActiveContact((c) => ({
        ...c,
        wordBank: c.wordBank.map((e) =>
          e.id === id ? { ...e, text: trimmed, variants, category } : e
        ),
      }));
    },
    [updateActiveContact]
  );

  const batchRemoveWordEntries = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      updateActiveContact((c) => ({
        ...c,
        wordBank: c.wordBank.filter((e) => !ids.includes(e.id)),
      }));
    },
    [updateActiveContact]
  );

  const clearMessages = useCallback(() => {
    updateActiveContact((c) => ({ ...c, messages: [] }));
  }, [updateActiveContact]);

  const setReplyDelay = useCallback(
    (delayMs: number) => {
      updateActiveContact((c) => ({ ...c, replyDelay: delayMs }));
    },
    [updateActiveContact]
  );

  // 帮我确认类别管理
  const addConfirmCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const newCategory: ConfirmCategory = {
        id: generateId(),
        name: trimmed,
        words: [],
      };
      updateActiveContact((c) => ({
        ...c,
        confirmCategories: [...c.confirmCategories, newCategory],
      }));
    },
    [updateActiveContact]
  );

  const removeConfirmCategory = useCallback(
    (id: string) => {
      updateActiveContact((c) => ({
        ...c,
        confirmCategories: c.confirmCategories.filter((cat) => cat.id !== id),
      }));
    },
    [updateActiveContact]
  );

  const addConfirmWord = useCallback(
    (categoryId: string, word: string) => {
      const trimmed = word.trim();
      if (!trimmed) return;
      updateActiveContact((c) => ({
        ...c,
        confirmCategories: c.confirmCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, words: [...cat.words, trimmed] } : cat
        ),
      }));
    },
    [updateActiveContact]
  );

  const removeConfirmWord = useCallback(
    (categoryId: string, word: string) => {
      updateActiveContact((c) => ({
        ...c,
        confirmCategories: c.confirmCategories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, words: cat.words.filter((w) => w !== word) }
            : cat
        ),
      }));
    },
    [updateActiveContact]
  );

  return {
    contacts,
    activeContactId,
    activeContact,
    isTyping,
    confirmPending,
    syncStatus,
    switchContact,
    createContact,
    deleteContact,
    sendMessage,
    executeConfirmReply,
    cancelConfirm,
    addWordEntry,
    removeWordEntry,
    updateWordEntry,
    batchRemoveWordEntries,
    setContactName,
    setContactStatus,
    clearMessages,
    setReplyDelay,
    addConfirmCategory,
    removeConfirmCategory,
    addConfirmWord,
    removeConfirmWord,
    messagesEndRef,
  };
}
