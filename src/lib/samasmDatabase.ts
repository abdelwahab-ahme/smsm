import { supabase } from './supabase';
import type { UserProfile, ParentProfile } from '../types';

/**
 * SAMASM DATABASE LAYER
 * ---------------------
 * كل التعامل مع Supabase هيكون من هنا.
 * لا نحذف LocalStorage في المرحلة الحالية.
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
    unlockedBadgeIds: [],
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
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: profile.id,
      parent_id: parentId ?? null,
      name: profile.name,
      pack_code: profile.packCode,
      gender: profile.gender,
      avatar: profile.avatar,
      points: profile.points,
      solved_challenges_count: profile.solvedChallengesCount,
      last_solved_date: profile.lastSolvedDate,
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


// =========================
// PARENTS
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

  // Children will later be loaded through parent_id.
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? undefined,
    linkedPackCodes: [],
    createdAt: data.created_at,
  };
}


// =========================
// HEALTH CHECK
// =========================

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('daily_challenges')
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
// =========================
// PARENT AUTH
// =========================

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
  
  
  // =========================
  // CURRENT AUTH SESSION
  // =========================
  
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
  
  
  // =========================
  // PARENT PROFILE
  // =========================
  
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
  
  
  // =========================
  // SIGN OUT
  // =========================
  
  export async function signOutSupabase() {
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      console.error('Supabase Auth: sign out failed', error);
      throw error;
    }
  }
  // =========================
// VERIFY PARENT OTP
// =========================

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