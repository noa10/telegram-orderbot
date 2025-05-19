import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common Supabase operations
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return false;
  }

  return true;
};

// Function to create a custom session for Telegram users
export const createTelegramSession = async (telegramUserData: any) => {
  try {
    // First, check if a user with this Telegram ID exists in the users table
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUserData.id)
      .single();

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking for existing user:', queryError);
      throw queryError;
    }

    // Generate a unique email based on Telegram ID
    const email = `telegram_${telegramUserData.id}@example.com`;

    // Use a secure random password (this is just for linking accounts, user never sees it)
    const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

    // If user doesn't exist in auth system, sign them up
    if (!existingUser) {
      // Create a new user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            telegram_id: telegramUserData.id,
            first_name: telegramUserData.first_name,
            last_name: telegramUserData.last_name || null,
            username: telegramUserData.username || null,
          }
        }
      });

      if (error) {
        console.error('Error creating new user:', error);
        throw error;
      }

      return data.user;
    } else {
      // User exists, sign them in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If sign-in fails (e.g., password changed), try to update password and sign in again
      if (error && error.message.includes('Invalid login credentials')) {
        // Reset password for the user
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

        if (resetError) {
          console.error('Error resetting password:', resetError);
          throw resetError;
        }

        // Try signing in with the new password
        const { data: newData, error: newError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (newError) {
          console.error('Error signing in after password reset:', newError);
          throw newError;
        }

        return newData.user;
      } else if (error) {
        console.error('Error signing in:', error);
        throw error;
      }

      return data.user;
    }
  } catch (err) {
    console.error('Error in createTelegramSession:', err);
    return null;
  }
};