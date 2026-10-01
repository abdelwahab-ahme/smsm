import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { IslamicContent, Story, Manner, HisnItem, DEFAULT_CONTENT } from '../data/islamicContent';
import {
  fetchIslamicContent,
  upsertIslamicItem,
  deleteIslamicItem,
  seedIslamicContent,
  IslamicKind,
} from '../lib/islamicContentDb';

interface FormState {
  icon: string;
  title: string;
  summary: string;
  pages: string;
  question: string;
  options: string;
  correct: string;
  explanation: string;
  situation: string;
  note: string;
  when: string;
  parts: string;
}

const EMPTY_FORM: FormState = {
  icon: '',
  title: '',
  summary: '',
  pages: '',
  question: '',
  options: '',
  correct: '1',
  explanation: '',
  situation: '',
  note: '',
  when: '',
  parts: '',
};

const KIND_LABEL: Record<IslamicKind, string> = {
  story: 'قصص الأنبياء',
  manner: 'الأخلاق والآداب',
  dhikr: 'حصن البطل (الأذكار)',
};

const KIND_SINGLE: Record<IslamicKind, string> = {
  story: 'قصة',
  manner: 'موقف',
  dhikr: 'ذكر',
};

const lines = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

const inputCls =
  'w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white text-xs font-bold';
const labelCls = 'block text-xs font-black text-slate-700 dark:text-slate-300 mb-1';

export const IslamicContentManager: React.FC = () => {
  const [content, setContent] = useState<IslamicContent>(DEFAULT_CONTENT);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [fromDb, setFromDb] = useState(false);
  const [kind, setKind] = useState<IslamicKind>('story');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toast = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const setField = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const reload = async () => {
    const res = await fetchIslamicContent();
    if (res) {
      setContent(res.content);
      setFromDb(res.fromDb);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // لو الجدول فاضي نرفع المحتوى الافتراضي الأول، عشان الأطفال ما يخسروش الموجود
  const ensureSeeded = async (): Promise<boolean> => {
    if (status !== 'ready') {
      toast('المحتوى لسه بيتحمل أو فشل تحميله، حدّث الصفحة.', 'error');
      return false;
    }
    if (fromDb) return true;
    const ok = await seedIslamicContent(content);
    if (!ok) {
      toast('تعذر رفع المحتوى الافتراضي للداتابيز (راجع Console).', 'error');
      return false;
    }
    setFromDb(true);
    return true;
  };

  const handleSeedClick = async () => {
    setSaving(true);
    const ok = await ensureSeeded();
    setSaving(false);
    if (ok) {
      await reload();
      toast('تم رفع المحتوى الافتراضي إلى قاعدة البيانات!');
    }
  };

  const items: (Story | Manner | HisnItem)[] =
    kind === 'story' ? content.stories : kind === 'manner' ? content.manners : content.hisn;

  const describe = (item: Story | Manner | HisnItem): { title: string; sub: string; icon: string } => {
    if (kind === 'story') {
      const s = item as Story;
      return { icon: s.icon, title: s.title, sub: `${s.pages.length} صفحات • ${s.summary}` };
    }
    if (kind === 'manner') {
      const m = item as Manner;
      return { icon: m.icon, title: m.situation, sub: `${m.options.length} خيارات` };
    }
    const h = item as HisnItem;
    return { icon: h.icon, title: h.title, sub: `${h.parts.length} عبارات • ${h.when}` };
  };

  const toForm = (item: Story | Manner | HisnItem): FormState => {
    if (kind === 'story') {
      const s = item as Story;
      return {
        ...EMPTY_FORM,
        icon: s.icon,
        title: s.title,
        summary: s.summary,
        pages: s.pages.join('\n'),
        question: s.quiz.question,
        options: s.quiz.options.join('\n'),
        correct: String(s.quiz.correctIndex + 1),
        explanation: s.quiz.explanation,
      };
    }
    if (kind === 'manner') {
      const m = item as Manner;
      return {
        ...EMPTY_FORM,
        icon: m.icon,
        situation: m.situation,
        options: m.options.join('\n'),
        correct: String(m.correctIndex + 1),
        note: m.note,
      };
    }
    const h = item as HisnItem;
    return { ...EMPTY_FORM, icon: h.icon, title: h.title, when: h.when, parts: h.parts.join('\n') };
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (item: Story | Manner | HisnItem) => {
    setEditingId(item.id);
    setForm(toForm(item));
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId ?? `${kind}-${Date.now()}`;
    let item: Story | Manner | HisnItem;

    if (kind === 'story') {
      const pages = lines(form.pages);
      const options = lines(form.options);
      const correct = Number(form.correct) - 1;
      if (!form.title.trim() || pages.length === 0 || !form.question.trim() || options.length < 2) {
        toast('أكمل العنوان وصفحة واحدة على الأقل والسؤال وخيارين على الأقل.', 'error');
        return;
      }
      if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) {
        toast('رقم الإجابة الصحيحة خارج عدد الخيارات.', 'error');
        return;
      }
      item = {
        id,
        icon: form.icon.trim() || '📖',
        title: form.title.trim(),
        summary: form.summary.trim(),
        pages,
        quiz: {
          question: form.question.trim(),
          options,
          correctIndex: correct,
          explanation: form.explanation.trim(),
        },
      } as Story;
    } else if (kind === 'manner') {
      const options = lines(form.options);
      const correct = Number(form.correct) - 1;
      if (!form.situation.trim() || options.length < 2) {
        toast('اكتب الموقف وخيارين على الأقل.', 'error');
        return;
      }
      if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) {
        toast('رقم الإجابة الصحيحة خارج عدد الخيارات.', 'error');
        return;
      }
      item = {
        id,
        icon: form.icon.trim() || '🌟',
        situation: form.situation.trim(),
        options,
        correctIndex: correct,
        note: form.note.trim(),
      } as Manner;
    } else {
      const parts = lines(form.parts);
      if (!form.title.trim() || parts.length < 2) {
        toast('اكتب اسم الذكر وعبارتين على الأقل.', 'error');
        return;
      }
      item = {
        id,
        icon: form.icon.trim() || '🛡️',
        title: form.title.trim(),
        when: form.when.trim(),
        parts,
      } as HisnItem;
    }

    setSaving(true);
    if (!(await ensureSeeded())) {
      setSaving(false);
      return;
    }
    const ok = await upsertIslamicItem(kind, item);
    setSaving(false);

    if (!ok) {
      toast('فشل الحفظ في قاعدة البيانات (راجع Console).', 'error');
      return;
    }
    await reload();
    setFormOpen(false);
    toast(editingId ? 'تم حفظ التعديل بنجاح!' : `تمت إضافة ${KIND_SINGLE[kind]} جديدة بنجاح!`);
    setEditingId(null);
  };

  const remove = async (item: Story | Manner | HisnItem) => {
    const d = describe(item);
    if (!window.confirm(`هل تريد حذف "${d.title}" نهائياً؟`)) return;
    if (!(await ensureSeeded())) return;
    const ok = await deleteIslamicItem(kind, item.id);
    if (!ok) {
      toast('فشل الحذف من قاعدة البيانات (راجع Console).', 'error');
      return;
    }
    await reload();
    toast('تم الحذف بنجاح!');
  };

  return (
    <div className="space-y-4">
      {msg && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-between gap-3 border-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-300'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">إدارة ركن الإسلاميات 🌙</h2>
          <p className="text-xs text-slate-500 font-bold">
            أضف وعدّل واحذف القصص ومواقف الأخلاق والأذكار. أسئلة "هل تعلم؟" بتتدار من بنك الأسئلة (قسم الإسلاميات).
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={status !== 'ready'}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة {KIND_SINGLE[kind]} جديدة</span>
        </button>
      </div>

      {status === 'error' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 text-rose-900 dark:text-rose-200 text-xs sm:text-sm font-black flex items-center justify-between gap-3">
          <span>تعذر تحميل المحتوى من قاعدة البيانات. تأكد من إنشاء جدول islamic_content.</span>
          <button onClick={reload} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs shrink-0">
            إعادة المحاولة
          </button>
        </div>
      )}

      {status === 'ready' && !fromDb && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
            ⚠️ المحتوى الحالي مكتوب في الكود بس، ومش محفوظ في الداتابيز. ارفعه الأول عشان تقدر تعدّل وتحذف.
          </p>
          <button
            onClick={handleSeedClick}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-black text-xs shrink-0 cursor-pointer"
          >
            {saving ? 'جاري الرفع...' : 'رفع المحتوى للداتابيز الآن'}
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['story', 'manner', 'dhikr'] as IslamicKind[]).map((k) => {
          const count = k === 'story' ? content.stories.length : k === 'manner' ? content.manners.length : content.hisn.length;
          return (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`px-4 py-2 rounded-xl font-black text-xs shrink-0 cursor-pointer transition-colors ${
                kind === k
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {KIND_LABEL[k]} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {status === 'loading' && <p className="text-sm font-bold text-slate-500 text-center py-6">جاري التحميل...</p>}

        {status === 'ready' && items.length === 0 && (
          <p className="text-sm font-bold text-slate-500 text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            لا يوجد محتوى في هذا القسم. اضغط "إضافة" لإنشاء أول عنصر.
          </p>
        )}

        {items.map((item) => {
          const d = describe(item);
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl shrink-0">{d.icon}</span>
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-slate-950 dark:text-white truncate">{d.title}</h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">{d.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(item)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-200 text-rose-600 cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-teal-400 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                {editingId ? `تعديل ${KIND_SINGLE[kind]}` : `إضافة ${KIND_SINGLE[kind]} جديدة`}
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-slate-400 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className={labelCls}>أيقونة:</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setField('icon', e.target.value)}
                    placeholder="📖"
                    maxLength={4}
                    className={`${inputCls} text-center text-lg`}
                  />
                </div>

                {kind === 'manner' ? (
                  <div className="col-span-3">
                    <label className={labelCls}>الموقف *:</label>
                    <input
                      type="text"
                      value={form.situation}
                      onChange={(e) => setField('situation', e.target.value)}
                      placeholder="مثال: قابلت جارك في الطريق."
                      className={inputCls}
                    />
                  </div>
                ) : (
                  <div className="col-span-3">
                    <label className={labelCls}>{kind === 'story' ? 'عنوان القصة *:' : 'اسم الذكر *:'}</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setField('title', e.target.value)}
                      placeholder={kind === 'story' ? 'مثال: سيدنا إبراهيم والنار' : 'مثال: دعاء دخول المسجد'}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {kind === 'story' && (
                <>
                  <div>
                    <label className={labelCls}>سطر تعريفي قصير:</label>
                    <input
                      type="text"
                      value={form.summary}
                      onChange={(e) => setField('summary', e.target.value)}
                      placeholder="مثال: قصة الثقة بالله"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>صفحات القصة * (كل صفحة في سطر):</label>
                    <textarea
                      value={form.pages}
                      onChange={(e) => setField('pages', e.target.value)}
                      rows={5}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>سؤال القصة *:</label>
                    <input
                      type="text"
                      value={form.question}
                      onChange={(e) => setField('question', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              {kind === 'dhikr' && (
                <>
                  <div>
                    <label className={labelCls}>متى نقوله؟</label>
                    <input
                      type="text"
                      value={form.when}
                      onChange={(e) => setField('when', e.target.value)}
                      placeholder="مثال: نقوله عند دخول المسجد"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>العبارات بالترتيب الصحيح * (كل عبارة في سطر):</label>
                    <textarea
                      value={form.parts}
                      onChange={(e) => setField('parts', e.target.value)}
                      rows={5}
                      className={inputCls}
                    />
                    <p className="text-[10px] font-bold text-slate-500 mt-1">الطفل بيشوفها مخلوطة ويرتبها.</p>
                  </div>
                </>
              )}

              {(kind === 'story' || kind === 'manner') && (
                <>
                  <div>
                    <label className={labelCls}>الخيارات * (كل خيار في سطر):</label>
                    <textarea
                      value={form.options}
                      onChange={(e) => setField('options', e.target.value)}
                      rows={4}
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <label className={labelCls}>رقم الإجابة الصحيحة (1 = أول سطر):</label>
                      <input
                        type="number"
                        min={1}
                        value={form.correct}
                        onChange={(e) => setField('correct', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 pb-2">ترتيب الخيارات بيتغير عشوائياً للطفل.</p>
                  </div>
                </>
              )}

              {kind === 'story' && (
                <div>
                  <label className={labelCls}>تفسير الإجابة الصحيحة:</label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) => setField('explanation', e.target.value)}
                    rows={2}
                    className={inputCls}
                  />
                </div>
              )}

              {kind === 'manner' && (
                <div>
                  <label className={labelCls}>الملاحظة التربوية (تظهر بعد الإجابة الصحيحة):</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setField('note', e.target.value)}
                    rows={2}
                    className={inputCls}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-black text-xs shadow-md"
                >
                  {saving ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'نشر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
