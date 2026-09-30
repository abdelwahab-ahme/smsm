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
    // 💡 التعديل الجوهري: استخدام crypto.randomUUID() يمنع خطأ 409 نهائياً
    const generatedId = (profileData.id && profileData.id.includes('-') && !profileData.id.startsWith('hero-'))
      ? profileData.id
      : crypto.randomUUID();

    const newChild = {
      id: generatedId,
      name: profileData.name,
      pack_code: profileData.packCode,
      gender: profileData.gender,
      avatar: profileData.avatar,
      points: profileData.points || 20,
      parent_id: parentId || null,
      created_at: new Date().toISOString()
    };

    console.log('--- DB Insert Payload ---', newChild);

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([newChild])
      .select();

    if (error) {
      console.error('❌ Supabase Insert Error:', error);
      return null;
    }

    console.log('✅ Supabase Insert Success:', data);
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
    if (updates.points !== undefined) dbPayload.points = updates.points;
    if (updates.unlockedBadgeIds !== undefined) dbPayload.unlocked_badge_ids = updates.unlockedBadgeIds;
    if (updates.lastSolvedDate !== undefined) dbPayload.last_solved_date = updates.lastSolvedDate;
    if (updates.solvedChallengesCount !== undefined) dbPayload.solved_challenges_count = updates.solvedChallengesCount;
    if (updates.solvedCategories !== undefined) dbPayload.solved_categories = updates.solvedCategories;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(dbPayload)
      .eq('id', profileId)
      .select();

    if (error) {
      console.error('❌ Error updating child profile in DB:', error.message);
      return null;
    }

    console.log('✅ Supabase Profile Update Success:', data);
    return data ? (data[0] as unknown as UserProfile) : null;
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
    linkedPackCodes: [],
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

export async function getChildrenByParentId(parentId: string): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('parent_id', parentId);

    if (error) {
      console.error('Error fetching children for parent:', error.message);
      return [];
    }

    return (data || []) as UserProfile[];
  } catch (err) {
    console.error('Unexpected error in getChildrenByParentId:', err);
    return [];
  }
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