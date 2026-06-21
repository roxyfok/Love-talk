import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Settings,
  Send,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  Heart,
  Pencil,
  Check,
  ListPlus,
  UserPlus,
  Users,
  Tag,
  Square,
  CheckSquare2,
  LogOut,
  Cloud,
  CloudOff,
} from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { WORD_CATEGORIES } from '@/types/chat';
import type { WordEntry, Contact } from '@/types/chat';

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/* ========== Settings Panel ========== */
function SettingsPanel({
  contact,
  wordBank,
  onAddWord,
  onRemoveWord,
  onUpdateWord,
  onSetName,
  onSetStatus,
  onClearMessages,
  onBatchAdd,
  onBatchRemoveWords,
  confirmCategories,
  onAddConfirmCategory,
  onRemoveConfirmCategory,
  onAddConfirmWord,
  onRemoveConfirmWord,
  replyDelay,
  onSetReplyDelay,
  onClose,
}: {
  contact: Contact;
  wordBank: WordEntry[];
  onAddWord: (text: string, category: string) => void;
  onRemoveWord: (id: string) => void;
  onUpdateWord: (id: string, text: string, category: string) => void;
  onSetName: (name: string) => void;
  onSetStatus: (status: string) => void;
  onClearMessages: () => void;
  onBatchAdd: (text: string, category: string) => void;
  onBatchRemoveWords: (ids: string[]) => void;
  confirmCategories: import('@/types/chat').ConfirmCategory[];
  onAddConfirmCategory: (name: string) => void;
  onRemoveConfirmCategory: (id: string) => void;
  onAddConfirmWord: (categoryId: string, word: string) => void;
  onRemoveConfirmWord: (categoryId: string, word: string) => void;
  replyDelay: number;
  onSetReplyDelay: (delayMs: number) => void;
  onClose: () => void;
}) {
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState<string>(WORD_CATEGORIES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingCategory, setEditingCategory] = useState<string>(WORD_CATEGORIES[0]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchCategory, setBatchCategory] = useState<string>(WORD_CATEGORIES[0]);
  const [showBatchInput, setShowBatchInput] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [batchDeleteMode, setBatchDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // 帮我确认管理
  const [newConfirmCatName, setNewConfirmCatName] = useState('');
  const [expandedConfirmCat, setExpandedConfirmCat] = useState<string | null>(null);
  const [newConfirmWord, setNewConfirmWord] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [wordBank.length]);

  const handleAdd = () => {
    if (!newWord.trim()) return;
    onAddWord(newWord.trim(), newCategory);
    setNewWord('');
  };

  const startEdit = (entry: WordEntry) => {
    setEditingId(entry.id);
    setEditingText(entry.text);
    setEditingCategory(entry.category || WORD_CATEGORIES[0]);
  };

  const saveEdit = () => {
    if (editingId && editingText.trim()) {
      onUpdateWord(editingId, editingText.trim(), editingCategory);
    }
    setEditingId(null);
    setEditingText('');
  };

  const handleBatchAdd = () => {
    const lines = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return;
    lines.forEach((line) => onBatchAdd(line, batchCategory));
    setBatchText('');
    setShowBatchInput(false);
  };

  // Batch delete handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectCategory = (cat: string) => {
    const ids = grouped[cat].map((e) => e.id);
    const allSelected = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    onBatchRemoveWords(Array.from(selectedIds));
    setSelectedIds(new Set());
    setBatchDeleteMode(false);
  };

  const exitBatchDeleteMode = () => {
    setBatchDeleteMode(false);
    setSelectedIds(new Set());
  };

  // Group word bank by category
  const grouped = wordBank.reduce<Record<string, WordEntry[]>>((acc, entry) => {
    const cat = entry.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => {
    const idxA = WORD_CATEGORIES.indexOf(a as any);
    const idxB = WORD_CATEGORIES.indexOf(b as any);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const filteredCategories =
    filterCategory === '全部' ? categories : categories.filter((c) => c === filterCategory);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#f1f5f6]">
      {/* Settings Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d1d1d1]/50">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[#5a5a5a] hover:text-[#e1b2b2] transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-sm font-medium text-[#5a5a5a]">设置</h2>
        <div className="w-10" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
        {/* Partner Info */}
        <section>
          <h3 className="text-xs font-medium text-[#8a8a8a] mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={12} />
            当前对话对象：{contact.name}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#8a8a8a] mb-1 block">昵称</label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => onSetName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] focus:outline-none focus:border-[#e1b2b2] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#8a8a8a] mb-1 block">状态</label>
              <input
                type="text"
                value={contact.status}
                onChange={(e) => onSetStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] focus:outline-none focus:border-[#e1b2b2] transition-colors"
              />
            </div>
          </div>
        </section>

        {/* 反应时间设置 */}
        <section>
          <h3 className="text-xs font-medium text-[#8a8a8a] mb-3 uppercase tracking-wider">
            反应时间
          </h3>
          <p className="text-xs text-[#8a8a8a] mb-3">
            对方回复消息的延迟时间（当前：{replyDelay / 1000}秒）
          </p>
          <div className="flex flex-wrap gap-2">
            {[15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => onSetReplyDelay(sec * 1000)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  replyDelay === sec * 1000
                    ? 'bg-[#e1b2b2]/30 text-[#5a5a5a] border border-[#e1b2b2]/40'
                    : 'bg-white/60 text-[#8a8a8a] border border-[#d1d1d1]/30 hover:bg-[#d2e6ec]/30'
                }`}
              >
                {sec}秒
              </button>
            ))}
          </div>
        </section>

        {/* Clear Messages */}
        <section>
          <h3 className="text-xs font-medium text-[#8a8a8a] mb-3 uppercase tracking-wider">
            聊天记录
          </h3>
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#f1d6d6]/50 text-[#5a5a5a] text-sm hover:bg-[#f1d6d6] transition-colors"
            >
              <Trash2 size={14} />
              清空与「{contact.name}」的聊天记录
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8a8a8a]">确定清空？</span>
              <button
                onClick={() => {
                  onClearMessages();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#f1d6d6] text-[#5a5a5a] text-xs hover:bg-[#e1b2b2] transition-colors"
              >
                确认
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-[#d2e6ec]/50 text-[#8a8a8a] text-xs hover:bg-[#d2e6ec] transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </section>

        {/* Word Bank */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-[#8a8a8a] uppercase tracking-wider">
              回复词库（共{wordBank.length}条）
            </h3>
            <button
              onClick={() => {
                if (batchDeleteMode) exitBatchDeleteMode();
                else setBatchDeleteMode(true);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] transition-colors ${
                batchDeleteMode
                  ? 'bg-[#f1d6d6] text-[#5a5a5a]'
                  : 'bg-[#d1d1d1]/20 text-[#8a8a8a] hover:bg-[#d1d1d1]/30'
              }`}
            >
              <Trash2 size={10} />
              {batchDeleteMode ? '退出' : '批量删除'}
            </button>
          </div>
          <p className="text-xs text-[#8a8a8a] mb-3 leading-relaxed">
            添加词条，用 "/" 分隔同义表达。发送30秒后，系统会随机抽取1~3条作为对方回复。
          </p>

          {/* Add new word - hidden in batch delete mode */}
          {!batchDeleteMode && (
          <>
          <div className="flex gap-2 mb-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-2 py-2 rounded-lg text-xs bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] focus:outline-none focus:border-[#e1b2b2] transition-colors"
            >
              {WORD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="例如：亲爱的/宝贝"
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] placeholder:text-[#8a8a8a]/60 focus:outline-none focus:border-[#e1b2b2] transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={!newWord.trim()}
              className="px-3 py-2 rounded-lg bg-[#d2e6ec]/70 text-[#5a5a5a] hover:bg-[#d2e6ec] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Batch add toggle */}
          <button
            onClick={() => setShowBatchInput(!showBatchInput)}
            className="flex items-center gap-1.5 text-xs text-[#8a8a8a] hover:text-[#e1b2b2] transition-colors mb-3"
          >
            <ListPlus size={14} />
            {showBatchInput ? '收起批量添加' : '批量添加词条'}
          </button>

          {/* Batch add textarea */}
          {showBatchInput && (
            <div className="mb-4 space-y-2">
              <select
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] focus:outline-none focus:border-[#e1b2b2] transition-colors"
              >
                {WORD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={'每行一条，例如：\n亲爱的/宝贝\n晚安 好梦\n一起睡觉\n早点睡/别熬夜'}
                rows={6}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] placeholder:text-[#8a8a8a]/50 focus:outline-none focus:border-[#e1b2b2] transition-colors resize-none"
              />
              <button
                onClick={handleBatchAdd}
                disabled={!batchText.trim()}
                className="w-full px-3 py-2 rounded-lg bg-[#d2e6ec]/70 text-[#5a5a5a] text-sm hover:bg-[#d2e6ec] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                批量添加
              </button>
            </div>
          )}
          </>
          )}

          {/* Batch delete notice */}
          {batchDeleteMode && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-[#f1d6d6]/30 border border-[#f1d6d6]/50">
              <span className="text-xs text-[#5a5a5a]">
                已选择 <strong>{selectedIds.size}</strong> 条词条
              </span>
            </div>
          )}

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => {
                if (batchDeleteMode) {
                  const allIds = wordBank.map((e) => e.id);
                  const allSelected = allIds.every((id) => selectedIds.has(id));
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    if (allSelected) allIds.forEach((id) => next.delete(id));
                    else allIds.forEach((id) => next.add(id));
                    return next;
                  });
                } else {
                  setFilterCategory('全部');
                }
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] transition-colors ${
                filterCategory === '全部' && !batchDeleteMode
                  ? 'bg-[#e1b2b2]/30 text-[#5a5a5a]'
                  : 'bg-[#d1d1d1]/20 text-[#8a8a8a] hover:bg-[#d1d1d1]/30'
              }`}
            >
              {batchDeleteMode ? '全选' : `全部(${wordBank.length})`}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (batchDeleteMode) toggleSelectCategory(cat);
                  else setFilterCategory(cat);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] transition-colors ${
                  filterCategory === cat && !batchDeleteMode
                    ? 'bg-[#e1b2b2]/30 text-[#5a5a5a]'
                    : 'bg-[#d1d1d1]/20 text-[#8a8a8a] hover:bg-[#d1d1d1]/30'
                }`}
              >
                {batchDeleteMode ? `${cat}` : `${cat}(${grouped[cat].length})`}
              </button>
            ))}
          </div>

          {/* Word list grouped by category */}
          <div className="space-y-4">
            {filteredCategories.map((cat) => (
              <div key={cat}>
                <div className="flex items-center gap-1 mb-1.5">
                  {batchDeleteMode && (
                    <button
                      onClick={() => toggleSelectCategory(cat)}
                      className="text-[#8a8a8a] hover:text-[#e1b2b2] transition-colors mr-0.5"
                    >
                      {grouped[cat].every((e) => selectedIds.has(e.id)) ? (
                        <CheckSquare2 size={12} className="text-[#e1b2b2]" />
                      ) : grouped[cat].some((e) => selectedIds.has(e.id)) ? (
                        <CheckSquare2 size={12} className="text-[#e1b2b2]/60" />
                      ) : (
                        <Square size={12} />
                      )}
                    </button>
                  )}
                  <Tag size={10} className="text-[#8a8a8a]" />
                  <span className="text-[10px] font-medium text-[#8a8a8a]">{cat}({grouped[cat].length})</span>
                </div>
                <div className="space-y-1.5">
                  {grouped[cat].map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 border border-[#d1d1d1]/40"
                    >
                      {batchDeleteMode ? (
                        <>
                          <button
                            onClick={() => toggleSelect(entry.id)}
                            className="text-[#8a8a8a] hover:text-[#e1b2b2] transition-colors"
                          >
                            {selectedIds.has(entry.id) ? (
                              <CheckSquare2 size={16} className="text-[#e1b2b2]" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                          <span className="flex-1 text-sm text-[#5a5a5a] ml-1">
                            {entry.text}
                          </span>
                        </>
                      ) : editingId === entry.id ? (
                        <>
                          <select
                            value={editingCategory}
                            onChange={(e) => setEditingCategory(e.target.value)}
                            className="px-1 py-0.5 rounded text-[10px] bg-white border border-[#d1d1d1]/60 text-[#5a5a5a] focus:outline-none"
                          >
                            {WORD_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') {
                                setEditingId(null);
                                setEditingText('');
                              }
                            }}
                            autoFocus
                            className="flex-1 text-sm bg-transparent text-[#5a5a5a] focus:outline-none"
                          />
                          <button
                            onClick={saveEdit}
                            className="text-[#e1b2b2] hover:text-[#d18a8a] transition-colors"
                          >
                            <Check size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-[#5a5a5a]">
                            {entry.text}
                          </span>
                          <button
                            onClick={() => startEdit(entry)}
                            className="text-[#8a8a8a] hover:text-[#e1b2b2] transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => onRemoveWord(entry.id)}
                            className="text-[#8a8a8a] hover:text-[#e1b2b2] transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {wordBank.length === 0 && (
              <p className="text-xs text-[#8a8a8a] text-center py-4">
                暂无词条，请添加
              </p>
            )}
          </div>

          {/* Batch delete action bar */}
          {batchDeleteMode && (
            <div className="sticky bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-[#f1f5f6]/95 backdrop-blur-sm border-t border-[#d1d1d1]/40 mt-4 -mx-4">
              <span className="text-xs text-[#8a8a8a]">
                已选 <strong className="text-[#5a5a5a]">{selectedIds.size}</strong> 条
              </span>
              <div className="flex gap-2">
                <button
                  onClick={exitBatchDeleteMode}
                  className="px-3 py-1.5 rounded-lg bg-[#d1d1d1]/20 text-[#8a8a8a] text-xs hover:bg-[#d1d1d1]/30 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f1d6d6] text-[#5a5a5a] text-xs hover:bg-[#e1b2b2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={12} />
                  删除
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 帮我确认类别管理 */}
        <section>
          <h3 className="text-xs font-medium text-[#8a8a8a] mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Heart size={12} />
            "帮我确认"类别管理
          </h3>
          <p className="text-xs text-[#8a8a8a] mb-3 leading-relaxed">
            当消息包含"帮我确认"时，对方将只能从选定的类别中回复。您可以自定义类别和词条。
          </p>

          {/* 添加新类别 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newConfirmCatName}
              onChange={(e) => setNewConfirmCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newConfirmCatName.trim()) {
                  onAddConfirmCategory(newConfirmCatName.trim());
                  setNewConfirmCatName('');
                }
              }}
              placeholder="新类别名称，例如：心情"
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] placeholder:text-[#8a8a8a]/60 focus:outline-none focus:border-[#e1b2b2] transition-colors"
            />
            <button
              onClick={() => {
                if (!newConfirmCatName.trim()) return;
                onAddConfirmCategory(newConfirmCatName.trim());
                setNewConfirmCatName('');
              }}
              disabled={!newConfirmCatName.trim()}
              className="px-3 py-2 rounded-lg bg-[#d2e6ec]/70 text-[#5a5a5a] hover:bg-[#d2e6ec] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* 类别列表 */}
          <div className="space-y-3">
            {confirmCategories.map((cat) => (
              <div key={cat.id} className="rounded-lg bg-white/60 border border-[#d1d1d1]/40 overflow-hidden">
                {/* 类别标题栏 */}
                <button
                  onClick={() => setExpandedConfirmCat(expandedConfirmCat === cat.id ? null : cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#d2e6ec]/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag size={12} className="text-[#8a8a8a]" />
                    <span className="text-sm font-medium text-[#5a5a5a]">{cat.name}</span>
                    <span className="text-[10px] text-[#8a8a8a]">({cat.words.length}条)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronLeft
                      size={14}
                      className={`text-[#8a8a8a] transition-transform ${expandedConfirmCat === cat.id ? 'rotate-90' : '-rotate-90'}`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveConfirmCategory(cat.id);
                      }}
                      className="p-0.5 rounded text-[#8a8a8a] hover:text-[#e1b2b2] transition-colors ml-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </button>

                {/* 展开的词条列表 */}
                {expandedConfirmCat === cat.id && (
                  <div className="px-3 pb-3 border-t border-[#d1d1d1]/30">
                    {/* 添加词条 */}
                    <div className="flex gap-2 mt-2 mb-2">
                      <input
                        type="text"
                        value={newConfirmWord}
                        onChange={(e) => setNewConfirmWord(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newConfirmWord.trim()) {
                            onAddConfirmWord(cat.id, newConfirmWord.trim());
                            setNewConfirmWord('');
                          }
                        }}
                        placeholder={`添加"${cat.name}"词条...`}
                        className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] placeholder:text-[#8a8a8a]/50 focus:outline-none focus:border-[#e1b2b2] transition-colors"
                      />
                      <button
                        onClick={() => {
                          if (!newConfirmWord.trim()) return;
                          onAddConfirmWord(cat.id, newConfirmWord.trim());
                          setNewConfirmWord('');
                        }}
                        disabled={!newConfirmWord.trim()}
                        className="px-2 py-1.5 rounded-lg bg-[#d2e6ec]/70 text-[#5a5a5a] hover:bg-[#d2e6ec] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* 词条标签 */}
                    <div className="flex flex-wrap gap-1.5">
                      {cat.words.map((word, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d2e6ec]/30 text-[11px] text-[#5a5a5a] border border-[#d1d1d1]/30"
                        >
                          {word}
                          <button
                            onClick={() => onRemoveConfirmWord(cat.id, word)}
                            className="text-[#8a8a8a] hover:text-[#e1b2b2] transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      {cat.words.length === 0 && (
                        <p className="text-[10px] text-[#8a8a8a] py-1">暂无词条</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {confirmCategories.length === 0 && (
              <p className="text-xs text-[#8a8a8a] text-center py-4">
                暂无类别，请添加
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ========== Confirm Modal ========== */
function ConfirmModal({
  categories,
  onSelect,
  onClose,
}: {
  categories: import('@/types/chat').ConfirmCategory[];
  onSelect: (categoryId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#5a5a5a]/20 backdrop-blur-sm">
      <div className="w-[300px] bg-[#f1f5f6] rounded-2xl shadow-lg border border-[#d1d1d1]/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[#5a5a5a] flex items-center gap-2">
            <Heart size={16} className="text-[#e1b2b2]" fill="#e1b2b2" />
            帮我确认
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8a8a8a] hover:text-[#5a5a5a] hover:bg-[#d1d1d1]/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-[#8a8a8a] mb-4">
          检测到"帮我确认"，请选择一个类别，对方将从该类别中随机回复：
        </p>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/60 border border-[#d1d1d1]/40 text-left hover:bg-[#e1b2b2]/10 hover:border-[#e1b2b2]/30 transition-all"
            >
              <div>
                <span className="text-sm font-medium text-[#5a5a5a]">{cat.name}</span>
                <span className="text-[10px] text-[#8a8a8a] ml-2">({cat.words.length}条)</span>
              </div>
              <ChevronLeft size={14} className="text-[#8a8a8a] rotate-180" />
            </button>
          ))}
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-[#8a8a8a] text-center py-4">
            暂无类别，请在设置中添加
          </p>
        )}
      </div>
    </div>
  );
}

/* ========== Add Contact Dialog ========== */
function AddContactDialog({
  onAdd,
  onClose,
}: {
  onAdd: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#5a5a5a]/20 backdrop-blur-sm">
      <div className="w-[280px] bg-[#f1f5f6] rounded-2xl shadow-lg border border-[#d1d1d1]/40 p-5">
        <h3 className="text-sm font-medium text-[#5a5a5a] mb-4 flex items-center gap-2">
          <UserPlus size={16} className="text-[#e1b2b2]" />
          添加对话对象
        </h3>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="输入昵称..."
          className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/80 border border-[#d1d1d1]/60 text-[#5a5a5a] placeholder:text-[#8a8a8a]/50 focus:outline-none focus:border-[#e1b2b2] transition-colors mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg bg-[#d1d1d1]/30 text-[#8a8a8a] text-sm hover:bg-[#d1d1d1]/50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 px-3 py-2 rounded-lg bg-[#e1b2b2] text-white text-sm hover:bg-[#d9a0a0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Main Chat Page ========== */
interface HomeProps {
  user: { id: string; email: string } | null;
  onLogout: () => void;
}

export default function Home({ user, onLogout }: HomeProps) {
  const navigate = useNavigate();
  const {
    contacts,
    activeContactId,
    activeContact,
    isTyping,
    confirmPending,
    switchContact,
    createContact,
    deleteContact,
    sendMessage,
    executeConfirmReply,
    cancelConfirm,
    addWordEntry,
    removeWordEntry,
    updateWordEntry,
    setContactName,
    setContactStatus,
    clearMessages,
    setReplyDelay,
    batchRemoveWordEntries,
    addConfirmCategory,
    removeConfirmCategory,
    addConfirmWord,
    removeConfirmWord,
    messagesEndRef,
  } = useChat(!!user);

  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteContact = (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId === contactId) {
      deleteContact(contactId);
      setDeletingId(null);
    } else {
      setDeletingId(contactId);
      setTimeout(() => setDeletingId((id) => (id === contactId ? null : id)), 3000);
    }
  };

  return (
    <div className="h-screen w-full bg-[#f1f5f6] flex justify-center items-center p-0 md:p-4">
      {/* Mobile-like container */}
      <div className="w-full h-full md:h-[85vh] md:max-w-[420px] md:rounded-2xl bg-[#f1f5f6] shadow-[0_8px_32px_rgba(90,90,90,0.08)] border border-[#d1d1d1]/30 relative overflow-hidden flex flex-col">
        {/* Top Header - Fixed */}
        <header className="flex-shrink-0 bg-[#f1f5f6]/90 backdrop-blur-md border-b border-[#d1d1d1]/40 z-10">
          {/* App Title Row */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="text-[#e1b2b2]" fill="#e1b2b2" />
              <h1 className="text-xs font-medium text-[#8a8a8a] tracking-wider">
                LOVE TALK
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              {user ? (
                <>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#d2e6ec]/40 text-[#5a5a5a] text-[10px]">
                    <Cloud size={10} className="text-[#8a8a8a]" />
                    <span className="max-w-[80px] truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-[#e1b2b2] hover:bg-[#f1d6d6]/30 transition-colors"
                    title="退出登录"
                  >
                    <LogOut size={14} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#d1d1d1]/20 text-[#8a8a8a] text-[10px] hover:bg-[#d2e6ec]/40 hover:text-[#5a5a5a] transition-colors"
                >
                  <CloudOff size={10} />
                  <span>登录</span>
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-[#5a5a5a] hover:bg-[#d1d1d1]/20 transition-colors"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Contact Tabs - Horizontal Scrollable */}
          <div
            ref={tabsRef}
            className="flex items-center gap-1.5 px-3 pb-2.5 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {contacts.map((contact) => (
              <div key={contact.id} className="relative flex-shrink-0">
                <button
                  onClick={() => {
                    switchContact(contact.id);
                    setDeletingId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    contact.id === activeContactId
                      ? 'bg-[#e1b2b2]/20 text-[#5a5a5a] border border-[#e1b2b2]/40'
                      : 'bg-[#d1d1d1]/20 text-[#8a8a8a] border border-transparent hover:bg-[#d1d1d1]/30'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-br ${contact.avatarColor} flex items-center justify-center`}
                  >
                    <Heart size={7} className="text-white" fill="white" />
                  </div>
                  <span className="max-w-[80px] truncate">{contact.name}</span>
                  {contact.id === activeContactId && contact.messages.filter((m) => m.sender === 'other').length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e1b2b2]" />
                  )}
                </button>
                {/* Delete button on hover/long-press indication */}
                {contacts.length > 1 && contact.id === activeContactId && (
                  <button
                    onClick={(e) => handleDeleteContact(contact.id, e)}
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      deletingId === contact.id
                        ? 'bg-[#f1d6d6] text-[#5a5a5a]'
                        : 'bg-[#d1d1d1]/50 text-[#8a8a8a] opacity-0 hover:opacity-100'
                    }`}
                    style={{ opacity: deletingId === contact.id ? 1 : undefined }}
                    title={deletingId === contact.id ? '再点一次确认删除' : '删除该对话对象'}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}

            {/* Add contact button */}
            <button
              onClick={() => setShowAddContact(true)}
              className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#d2e6ec]/50 text-[#8a8a8a] hover:bg-[#d2e6ec] hover:text-[#5a5a5a] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </header>

        {/* Messages Area - Scrollable */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
          {/* 帮我确认提示条 */}
          {confirmPending && (
            <div
              onClick={() => setShowConfirmModal(true)}
              className="sticky top-0 z-10 mx-[-4px] px-4 py-2.5 bg-[#e1b2b2]/15 border-y border-[#e1b2b2]/25 cursor-pointer hover:bg-[#e1b2b2]/25 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart size={14} className="text-[#e1b2b2]" fill="#e1b2b2" />
                  <span className="text-xs text-[#5a5a5a]">
                    已触发"帮我确认"，点击选择类别...
                  </span>
                </div>
                <ChevronLeft size={14} className="text-[#8a8a8a] rotate-180" />
              </div>
            </div>
          )}

          {activeContact.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
              <Heart size={32} className="text-[#e1b2b2] mb-3" fill="#e1b2b2" />
              <p className="text-sm text-[#8a8a8a]">
                与「{activeContact.name}」的私密对话
              </p>
              <p className="text-xs text-[#8a8a8a] mt-1">
                发送消息后，对方会从词库中随机回复
              </p>
            </div>
          )}

          {activeContact.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'self' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  msg.sender === 'self'
                    ? 'bg-[#f1d6d6]/80 text-[#5a5a5a] rounded-br-md'
                    : 'bg-[#dbe5f1]/80 text-[#5a5a5a] rounded-bl-md'
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-[10px] mt-1 text-[#8a8a8a]/60">
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#dbe5f1]/80 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Input Area - Fixed */}
        <footer className="flex-shrink-0 bg-[#f1f5f6]/90 backdrop-blur-md border-t border-[#d1d1d1]/40 px-4 py-3 z-10">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`对「${activeContact.name}」说点什么...`}
              className="flex-1 px-4 py-2.5 rounded-full text-[13px] bg-white/70 border border-[#d1d1d1]/40 text-[#5a5a5a] placeholder:text-[#8a8a8a]/50 focus:outline-none focus:border-[#e1b2b2]/60 focus:bg-white/90 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-[#e1b2b2] text-white hover:bg-[#d9a0a0] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>
        </footer>

        {/* Settings Overlay */}
        {showSettings && (
          <SettingsPanel
            contact={activeContact}
            wordBank={activeContact.wordBank}
            onAddWord={addWordEntry}
            onRemoveWord={removeWordEntry}
            onUpdateWord={updateWordEntry}
            onSetName={setContactName}
            onSetStatus={setContactStatus}
            onClearMessages={clearMessages}
            onBatchAdd={addWordEntry}
            onBatchRemoveWords={batchRemoveWordEntries}
            confirmCategories={activeContact.confirmCategories}
            onAddConfirmCategory={addConfirmCategory}
            onRemoveConfirmCategory={removeConfirmCategory}
            onAddConfirmWord={addConfirmWord}
            onRemoveConfirmWord={removeConfirmWord}
            replyDelay={activeContact.replyDelay}
            onSetReplyDelay={setReplyDelay}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Add Contact Dialog */}
        {showAddContact && (
          <AddContactDialog
            onAdd={(name) => createContact(name)}
            onClose={() => setShowAddContact(false)}
          />
        )}

        {/* Confirm Modal - 帮我确认 */}
        {(confirmPending || showConfirmModal) && (
          <ConfirmModal
            categories={activeContact.confirmCategories}
            onSelect={(catId) => {
              executeConfirmReply(catId);
              setShowConfirmModal(false);
            }}
            onClose={() => {
              cancelConfirm();
              setShowConfirmModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
