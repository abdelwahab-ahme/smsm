import { supabase } from './supabase';
import type { UserProfile, ParentProfile, Gender } from '../types';

/**
 * SAMASM DATABASE LAYER
 * ---------------------
 * التعامل الكامل مع Supabase
 */

// =========================
// USER PROFILES
// =========================

export async function getUserProfileByPackCode(
  packCode: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('pack_code', packCode)
    .maybeSingle();

  if (error) {
    console.error('Supabase: failed to get user profile', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    packCode: data.pack_code,
    gender: data.gender,
    avatar: data.avatar || '',
    points: data.points ?? 20,
    unlockedBadgeIds: data.unlocked_badge_ids || [],
    lastSolvedDate: data.last_solved_date,
    solvedChallengesCount: data.solved_challenges_count ?? 0,
    retryCount: data.retry_count ?? 0,
    mathSpeedHighScore: data.math_speed_high_score ?? 0,
    wheelSpinsCount: data.wheel_spins_count ?? 0,
    completedLabExperimentIds: [],
    labPointsEarned: data.lab_points_earned ?? 0,
    createdAt: data.created_at,
  };
}

// =========================
// CREATE USER PROFILE
// =========================

export async function createUserProfile(
  profile: UserProfile,
  parentId?: string | null
) {
  // توليد UUID فريد لمنع التعارض 409
  const uniqueId = profile.id && !profile.id.startsWith('hero-') 
    ? profile.id 
    : crypto.randomUUID();

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: uniqueId,
      parent_id: parentId ?? null,
      name: profile.name,
      pack_code: profile.packCode,
      gender: profile.gender,
      avatar: profile.avatar,
      points: profile.points ?? 20,
      solved_challenges_count: profile.solvedChallengesCount ?? 0,
      last_solved_date: profile.lastSolvedDate ?? null,
      math_speed_high_score: profile.mathSpeedHighScore ?? 0,
      wheel_spins_count: profile.wheelSpinsCount ?? 0,
      lab_points_earned: profile.labPointsEarned ?? 0,
      retry_count: profile.retryCount ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase: failed to create user profile', error);
    throw error;
  }

  return data;
}

// =========================
// CREATE CHILD PROFILE IN DB
// =========================

export async function createChildProfileInDb(
  profileData: Partial<UserProfile> & { name: string; packCode: string; gender: Gender; avatar: string },
  parentId?: string
): Promise<UserProfile | null> {
  try {
    const isUuid = (v?: string) =>
      !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

    const newChild = {
      id: isUuid(profileData.id) ? profileData.id! : crypto.randomUUID(),
      name: profileData.name,
      pack_code: profileData.packCode,
      gender: profileData.gender,
      avatar: profileData.avatar,
      religion: (profileData as any).religion ?? 'muslim',
      points: profileData.points ?? 20,
      unlocked_badge_ids: profileData.unlockedBadgeIds ?? ['curiosity_spark'],
      solved_categories: profileData.solvedCategories ?? [],
      solved_challenges_count: profileData.solvedChallengesCount ?? 0,
      last_solved_date: profileData.lastSolvedDate ?? null,
      retry_count: profileData.retryCount ?? 0,
      math_speed_high_score: profileData.mathSpeedHighScore ?? 0,
      wheel_spins_count: profileData.wheelSpinsCount ?? 0,
      lab_points_earned: profileData.labPointsEarned ?? 0,
      parent_id: parentId || null,
      created_at: profileData.createdAt ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([newChild])
      .select();

    if (error) {
      console.error('❌ Supabase Insert Error:', error);
      return null;
    }
    return data ? (data[0] as unknown as UserProfile) : null;
  } catch (err) {
    console.error('❌ Unexpected error in createChildProfileInDb:', err);
    return null;
  }
}

// =========================
// UPDATE USER PROFILE
// =========================

export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string;
    avatar: string;
    points: number;
    solvedChallengesCount: number;
    lastSolvedDate: string | null;
    mathSpeedHighScore: number;
    wheelSpinsCount: number;
    labPointsEarned: number;
    retryCount: number;
  }>
) {
  const dbUpdates = {
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.avatar !== undefined && { avatar: updates.avatar }),
    ...(updates.points !== undefined && { points: updates.points }),
    ...(updates.solvedChallengesCount !== undefined && {
      solved_challenges_count: updates.solvedChallengesCount,
    }),
    ...(updates.lastSolvedDate !== undefined && {
      last_solved_date: updates.lastSolvedDate,
    }),
    ...(updates.mathSpeedHighScore !== undefined && {
      math_speed_high_score: updates.mathSpeedHighScore,
    }),
    ...(updates.wheelSpinsCount !== undefined && {
      wheel_spins_count: updates.wheelSpinsCount,
    }),
    ...(updates.labPointsEarned !== undefined && {
      lab_points_earned: updates.labPointsEarned,
    }),
    ...(updates.retryCount !== undefined && {
      retry_count: updates.retryCount,
    }),
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase: failed to update user profile', error);
    throw error;
  }

  return data;
}

export async function updateChildProfileInDb(
  profileId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const dbPayload: Record<string, any> = {};

    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.packCode !== undefined) dbPayload.pack_code = updates.packCode;
    if (updates.gender !== undefined) dbPayload.gender = updates.gender;
    if (updates.avatar !== undefined) dbPayload.avatar = updates.avatar;
    if ((updates as any).religion !== undefined) dbPayload.religion = (updates as any).religion;
    if (updates.points !== undefined) dbPayload.points = updates.points;
    if (updates.unlockedBadgeIds !== undefined) dbPayload.unlocked_badge_ids = updates.unlockedBadgeIds;
    if (updates.lastSolvedDate !== undefined) dbPayload.last_solved_date = updates.lastSolvedDate;
    if (updates.solvedChallengesCount !== undefined) dbPayload.solved_challenges_count = updates.solvedChallengesCount;
    if (updates.solvedCategories !== undefined) dbPayload.solved_categories = updates.solvedCategories;
    if (updates.retryCount !== undefined) dbPayload.retry_count = updates.retryCount;
    if (updates.mathSpeedHighScore !== undefined) dbPayload.math_speed_high_score = updates.mathSpeedHighScore;
    if (updates.wheelSpinsCount !== undefined) dbPayload.wheel_spins_count = updates.wheelSpinsCount;
    if (updates.labPointsEarned !== undefined) dbPayload.lab_points_earned = updates.labPointsEarned;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(dbPayload)
      .eq('id', profileId)
      .select();

    if (error) {
      console.error('❌ Error updating child profile in DB:', error.message);
      return null;
    }

    // صفر صفوف = الـ RLS منع التعديل أو الـ id غلط
    if (!data || data.length === 0) {
      console.error('❌ Nothing updated (RLS blocked or id not found):', profileId);
      return null;
    }

    return data[0] as unknown as UserProfile;
  } catch (err) {
    console.error('❌ Unexpected error in updateChildProfileInDb:', err);
    return null;
  }
}
// =========================
// PARENTS & AUTH
// =========================

export async function getParentByEmail(
  email: string
): Promise<ParentProfile | null> {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Supabase: failed to get parent', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? undefined,
    linkedPackCodes: data.linked_pack_codes ?? [],
    createdAt: data.created_at,
  };
}

export async function sendParentOtp(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error('Supabase Auth: failed to send parent OTP', error);
    throw error;
  }

  return data;
}

export async function sendAdminOtp(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: false, // الأدمن لازم يكون له حساب موجود بالفعل
    },
  });

  if (error) {
    console.error('Supabase Auth: failed to send admin OTP', error);
    throw error;
  }

  return data;
}

export async function verifyParentOtp(
  email: string,
  token: string
) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'email',
  });

  if (error) {
    console.error('Supabase Auth: failed to verify parent OTP', error);
    throw error;
  }

  return data;
}

export async function getCurrentAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Supabase Auth: failed to get current user', error);
    return null;
  }

  return user;
}

export async function createParentProfile(
  authUserId: string,
  name: string,
  email: string,
  phone?: string
) {
  const { data, error } = await supabase
    .from('parents')
    .insert({
      id: authUserId,
      name: name.trim() || 'ولي أمر',
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase: failed to create parent profile', error);
    throw error;
  }

  return data;
}

export function mapProfileRow(p: any): UserProfile {
  return {
    id: p.id,
    name: p.name,
    packCode: p.pack_code || '',
    gender: p.gender || 'boy',
    avatar: p.avatar || '👦',
    religion: p.religion || 'muslim',
    points: p.points ?? 20,
    unlockedBadgeIds: p.unlocked_badge_ids || ['curiosity_spark'],
    lastSolvedDate: p.last_solved_date,
    solvedChallengesCount: p.solved_challenges_count ?? 0,
    solvedCategories: p.solved_categories || [],
    retryCount: p.retry_count ?? 0,
    mathSpeedHighScore: p.math_speed_high_score ?? 0,
    wheelSpinsCount: p.wheel_spins_count ?? 0,
    labPointsEarned: p.lab_points_earned ?? 0,
    createdAt: p.created_at,
  } as UserProfile;
}

export async function getChildrenByParentId(parentId: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('parent_id', parentId);

  if (error) {
    console.error('Error fetching children for parent:', error.message);
    return [];
  }
  return (data || []).map(mapProfileRow);
}

export async function linkChildByCode(code: string): Promise<UserProfile> {
  const { data, error } = await supabase.rpc('link_child_by_code', { p_code: code });
  if (error) throw error;
  return mapProfileRow(data);
}

export async function createChildForParent(name: string, code: string): Promise<UserProfile> {
  const { data, error } = await supabase.rpc('create_child_for_parent', { p_name: name, p_code: code });
  if (error) throw error;
  return mapProfileRow(data);
}

export async function unlinkChildFromParent(childId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('unlink_child', { p_child_id: childId });
  if (error) {
    console.error('Unlink failed:', error.message);
    return false;
  }
  return Boolean(data);
}

// للأدمن فقط: تحميل كل الأطفال وأولياء الأمور مع الربط
export async function loadAdminData(): Promise<{ profiles: UserProfile[]; parents: ParentProfile[] }> {
  const [pRes, parRes] = await Promise.all([
    supabase.from('user_profiles').select('*'),
    supabase.from('parents').select('*'),
  ]);
  if (pRes.error) console.error('Admin load profiles failed:', pRes.error.message);
  if (parRes.error) console.error('Admin load parents failed:', parRes.error.message);

  const rows = pRes.data || [];
  const profiles = rows.map(mapProfileRow);
  const parents: ParentProfile[] = (parRes.data || []).map((p: any) => ({
    id: p.id,
    name: p.name || 'ولي أمر',
    email: p.email || '',
    phone: p.phone ?? undefined,
    linkedPackCodes: rows.filter((c: any) => c.parent_id === p.id).map((c: any) => c.pack_code),
    createdAt: p.created_at,
  }));
  return { profiles, parents };
}

// للأدمن فقط: إضافة ولي أمر وربط الأكواد
export async function createParentByAdmin(parent: ParentProfile): Promise<boolean> {
  const { error } = await supabase.from('parents').insert({
    id: parent.id,
    name: parent.name,
    email: parent.email.toLowerCase(),
  });
  if (error) {
    console.error('Admin create parent failed:', error.message);
    return false;
  }
  const codes = parent.linkedPackCodes.map((c) => c.toUpperCase());
  if (codes.length > 0) {
    const { error: linkErr } = await supabase
      .from('user_profiles')
      .update({ parent_id: parent.id })
      .in('pack_code', codes);
    if (linkErr) console.error('Admin link children failed:', linkErr.message);
  }
  return true;
}

export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase Auth: sign out failed', error);
    throw error;
  }
}

// =========================
// CHALLENGES HISTORY
// =========================

export async function recordSolvedChallengeInDb(
  profileId: string,
  challengeId: string,
  pointsEarned: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_challenges')
      .insert([
        {
          user_id: profileId,
          challenge_id: challengeId,
          points_earned: pointsEarned,
          completed_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('❌ Error recording challenge in DB:', error.message);
      return false;
    }

    console.log('✅ Challenge completion recorded in Supabase successfully');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error in recordSolvedChallengeInDb:', err);
    return false;
  }
}

export async function getChildChallengesHistory(
  profileId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', profileId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching child challenges history:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Unexpected error in getChildChallengesHistory:', err);
    return [];
  }
}

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Supabase connection test failed:', error);
    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
    data,
  };
}
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');

  if (error) {
    console.error('Supabase: failed to verify admin role', error);
    throw error;
  }

  return Boolean(data);
}

export async function getUserProfileById(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase: failed to get profile by id', error);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    packCode: data.pack_code || '',
    gender: data.gender || 'boy',
    avatar: data.avatar || '👦',
    religion: data.religion || 'muslim',
    points: data.points ?? 20,
    unlockedBadgeIds: data.unlocked_badge_ids || ['curiosity_spark'],
    lastSolvedDate: data.last_solved_date,
    solvedChallengesCount: data.solved_challenges_count ?? 0,
    solvedCategories: data.solved_categories || [],
    retryCount: data.retry_count ?? 0,
    mathSpeedHighScore: data.math_speed_high_score ?? 0,
    wheelSpinsCount: data.wheel_spins_count ?? 0,
    labPointsEarned: data.lab_points_earned ?? 0,
    createdAt: data.created_at,
  } as UserProfile;
}



export async function deleteChildProfileFromDb(profileId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', profileId)
    .select('id');

  if (error) {
    console.error('❌ Delete child failed:', error.message);
    return false;
  }

  // لو رجع صفر صفوف يبقى الـ RLS منع الحذف من غير خطأ
  if (!data || data.length === 0) {
    console.error('❌ Nothing deleted (RLS blocked or id not found)');
    return false;
  }

  return true;
}
export async function deleteParentFromDb(parentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('parents')
    .delete()
    .eq('id', parentId)
    .select('id');

  if (error) {
    console.error('❌ Delete parent failed:', error.message);
    return false;
  }
  if (!data || data.length === 0) {
    console.error('❌ Nothing deleted (RLS blocked or id not found)');
    return false;
  }
  return true;
}