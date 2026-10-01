import { supabase } from './supabase';
import {
  DEFAULT_CONTENT,
  IslamicContent,
  Story,
  Manner,
  HisnItem,
} from '../data/islamicContent';

export type IslamicKind = 'story' | 'manner' | 'dhikr';
type AnyItem = Story | Manner | HisnItem;

const toRow = (kind: IslamicKind, item: AnyItem) => {
  const { id, ...data } = item as AnyItem & { id: string };
  return { id, kind, data };
};

// null = فشل التحميل. fromDb=false = الجدول فاضي فيُستخدم المحتوى الافتراضي من الكود
export async function fetchIslamicContent(): Promise<{ content: IslamicContent; fromDb: boolean } | null> {
  const { data, error } = await supabase
    .from('islamic_content')
    .select('*')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ fetchIslamicContent failed:', error.message);
    return null;
  }

  if (!data || data.length === 0) {
    return { content: DEFAULT_CONTENT, fromDb: false };
  }

  const content: IslamicContent = { stories: [], manners: [], hisn: [] };
  for (const r of data as any[]) {
    const item = { id: r.id, ...r.data };
    if (r.kind === 'story') content.stories.push(item as Story);
    else if (r.kind === 'manner') content.manners.push(item as Manner);
    else if (r.kind === 'dhikr') content.hisn.push(item as HisnItem);
  }
  return { content, fromDb: true };
}

export async function upsertIslamicItem(kind: IslamicKind, item: AnyItem): Promise<boolean> {
  const { data, error } = await supabase
    .from('islamic_content')
    .upsert(toRow(kind, item), { onConflict: 'kind,id' })
    .select('id');

  if (error) {
    console.error('❌ upsertIslamicItem failed:', error.message);
    return false;
  }
  return !!data && data.length > 0;
}

export async function deleteIslamicItem(kind: IslamicKind, id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('islamic_content')
    .delete()
    .eq('kind', kind)
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('❌ deleteIslamicItem failed:', error.message);
    return false;
  }
  return !!data && data.length > 0;
}

// رفع المحتوى الافتراضي لأول مرة (بنفس الـ id عشان تقدم الأطفال ما يضيعش)
export async function seedIslamicContent(content: IslamicContent): Promise<boolean> {
  const base = Date.now() - 3_600_000;
  let n = 0;
  const rows = [
    ...content.stories.map((s) => toRow('story', s)),
    ...content.manners.map((m) => toRow('manner', m)),
    ...content.hisn.map((h) => toRow('dhikr', h)),
  ].map((r) => ({ ...r, created_at: new Date(base + n++ * 1000).toISOString() }));

  const { error } = await supabase
    .from('islamic_content')
    .upsert(rows, { onConflict: 'kind,id' });

  if (error) {
    console.error('❌ seedIslamicContent failed:', error.message);
    return false;
  }
  return true;
}
