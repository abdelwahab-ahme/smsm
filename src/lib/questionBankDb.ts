import { supabase } from './supabase';
import type { BankQuestion } from '../types';

const rowToQuestion = (r: any): BankQuestion => ({
  id: r.id,
  category: r.category,
  categoryLabel: r.category_label,
  categoryIcon: r.category_icon,
  categoryColor: r.category_color || '',
  title: r.title,
  question: r.question,
  options: r.options || [],
  correctOptionId: r.correct_option_id,
  explanation: r.explanation || '',
  funFact: r.fun_fact || '',
  hint: r.hint || '',
  points: r.points ?? 15,
  isIslamic: r.is_islamic === true || r.category === 'islamic',
});

const questionToRow = (q: BankQuestion) => ({
  id: q.id,
  category: q.category,
  category_label: q.categoryLabel,
  category_icon: q.categoryIcon,
  category_color: q.categoryColor || '',
  title: q.title,
  question: q.question,
  options: q.options,
  correct_option_id: q.correctOptionId,
  explanation: q.explanation || '',
  fun_fact: q.funFact || '',
  hint: q.hint || '',
  points: q.points ?? 15,
});

// null = فشل التحميل، [] = الجدول فاضي
export async function fetchQuestionBank(): Promise<BankQuestion[] | null> {
  const { data, error } = await supabase
    .from('bank_questions')
    .select('*')
    .order('created_at', { ascending: false })
    .order('id');

  if (error) {
    console.error('❌ fetchQuestionBank failed:', error.message);
    return null;
  }
  return (data || []).map(rowToQuestion);
}

export async function upsertQuestion(q: BankQuestion): Promise<boolean> {
  const { data, error } = await supabase
    .from('bank_questions')
    .upsert(questionToRow(q), { onConflict: 'id' })
    .select('id');

  if (error) {
    console.error('❌ upsertQuestion failed:', error.message);
    return false;
  }
  return !!data && data.length > 0;
}

export async function deleteQuestionById(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bank_questions')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('❌ deleteQuestion failed:', error.message);
    return false;
  }
  return !!data && data.length > 0;
}

// رفع مجموعة أسئلة دفعة واحدة (الأسئلة الموجودة في الكود)
export async function seedQuestionBank(list: BankQuestion[]): Promise<boolean> {
  const rows = list.map(questionToRow);
  for (let i = 0; i < rows.length; i += 50) {
    const { error } = await supabase
      .from('bank_questions')
      .upsert(rows.slice(i, i + 50), { onConflict: 'id' });
    if (error) {
      console.error('❌ seedQuestionBank failed:', error.message);
      return false;
    }
  }
  return true;
}