import { createClient } from '@supabase/supabase-js';
import { createHmac, randomBytes } from 'crypto';

// Initialize Supabase client with service role key for admin operations
// Use correct environment variable names for server-side code
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey
  });
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Telegram Bot Token from environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error('Missing Telegram Bot Token');
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  console.log('Telegram validation API called');

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);
    const { initData } = req.body;

    if (!initData) {
      console.log('Missing initData in request');
      return res.status(400).json({ error: 'Missing initData' });
    }

    if (!botToken) {
      console.log('Bot token not configured');
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Check Supabase connection
    try {
      const { data: dbTest, error: dbError } = await supabase.from('roles').select('*').limit(1);
      console.log('Database connection test:', { success: !dbError, error: dbError, data: dbTest });

      if (dbError) {
        console.error('Database connection error:', dbError);
        return res.status(500).json({ error: 'Database connection error', details: dbError });
      }
    } catch (dbTestError) {
      console.error('Failed to test database connection:', dbTestError);
    }

    // Parse the initData string
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return res.status(400).json({ error: 'Invalid initData: missing hash' });
    }

    // Remove the hash from the data string for validation
    urlParams.delete('hash');

    // Sort the params alphabetically as required by Telegram
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create HMAC-SHA-256 signature using the bot token
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const signature = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Verify the signature
    if (signature !== hash) {
      return res.status(401).json({ error: 'Invalid hash' });
    }

    // Check if auth_date is recent (within the last day)
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime - authDate > 86400) {
      return res.status(401).json({ error: 'Authentication data is outdated' });
    }

    // Extract user data
    const userDataString = urlParams.get('user') || '{}';
    const telegramUserData = JSON.parse(userDataString);

    if (!telegramUserData.id) {
      return res.status(400).json({ error: 'Invalid user data: missing id' });
    }
    const telegramId = telegramUserData.id;

    // Generate deterministic email and secure password
    const email = `telegram_user_${telegramId}@example.com`;
    const generatedPassword = randomBytes(16).toString('hex');

    let auth_uid: string;
    let authUserError: any;

    // 4. Obtain or create the user in auth.users
    const { data: { users: existingAuthUsers }, error: listError } = await supabase.auth.admin.listUsers({ email });

    if (listError) {
      console.error('Error listing auth users:', listError);
      return res.status(500).json({ error: 'Error checking for existing authentication user', details: listError.message });
    }

    if (existingAuthUsers && existingAuthUsers.length > 0) {
      auth_uid = existingAuthUsers[0].id;
      console.log(`Auth user found with ID: ${auth_uid} for email: ${email}`);
    } else {
      console.log(`No auth user found for email: ${email}, creating new auth user.`);
      const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
        email: email,
        password: generatedPassword,
        email_confirm: true, // Auto-confirm email for these users
        user_metadata: { telegram_id: telegramId } // Optional: store telegram_id in auth.users metadata
      });

      if (createAuthError) {
        console.error('Error creating auth user:', createAuthError);
        return res.status(500).json({ error: 'Failed to create authentication user', details: createAuthError.message });
      }
      if (!newAuthUser || !newAuthUser.user || !newAuthUser.user.id) {
        console.error('New auth user data is invalid:', newAuthUser);
        return res.status(500).json({ error: 'Failed to get ID from new authentication user' });
      }
      auth_uid = newAuthUser.user.id;
      console.log(`New auth user created with ID: ${auth_uid}`);
    }

    // 5. Synchronize with public.users table
    let userProfile;
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('id, telegram_id, first_name, last_name, username, language_code, photo_url') // Select all relevant fields
      .eq('telegram_id', telegramId)
      .maybeSingle(); // Use maybeSingle to handle 0 or 1 row without error

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means "Not found"
      console.error('Error checking user profile:', profileError);
      return res.status(500).json({ error: 'Database error checking user profile', details: profileError.message });
    }

    const profileData = {
      id: auth_uid, // Crucial: Set public.users.id to auth_uid
      telegram_id: telegramId,
      first_name: telegramUserData.first_name,
      last_name: telegramUserData.last_name || null,
      username: telegramUserData.username || null,
      language_code: telegramUserData.language_code || null,
      photo_url: telegramUserData.photo_url || null,
      updated_at: new Date().toISOString(),
    };

    if (existingProfile) {
      console.log(`Updating existing profile for telegram_id: ${telegramId} with auth_uid: ${auth_uid}`);
      const { data: updatedProfile, error: updateProfileError } = await supabase
        .from('users')
        .update(profileData)
        .eq('telegram_id', telegramId)
        .select()
        .single();

      if (updateProfileError) {
        console.error('Error updating user profile:', updateProfileError);
        return res.status(500).json({ error: 'Failed to update user profile', details: updateProfileError.message });
      }
      userProfile = updatedProfile;
      console.log('User profile updated:', userProfile);
    } else {
      console.log(`No existing profile for telegram_id: ${telegramId}, creating new profile with auth_uid: ${auth_uid}`);
      const { data: newProfile, error: insertProfileError } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();

      if (insertProfileError) {
        console.error('Error inserting user profile:', insertProfileError);
        return res.status(500).json({ error: 'Failed to insert user profile', details: insertProfileError.message });
      }
      userProfile = newProfile;
      console.log('User profile created:', userProfile);
    }

    // 6. Synchronize roles in public.user_roles
    const { data: existingUserRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', auth_uid)
      .maybeSingle();

    if (roleCheckError) {
      console.error('Error checking user role:', roleCheckError);
      return res.status(500).json({ error: 'Failed to check user role', details: roleCheckError.message });
    }

    if (!existingUserRole) {
      console.log(`No role found for user_id: ${auth_uid}, assigning default 'user' role.`);
      const defaultRoleId = 1; // Assuming 'user' role ID is 1. Consider fetching dynamically if it can change.
      const { error: insertRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: auth_uid,
          role_id: defaultRoleId, // Default 'user' role
        });

      if (insertRoleError) {
        console.error('Error assigning default role:', insertRoleError);
        // Non-critical, but log it. User will effectively be 'user' by default RLS policies.
        // Potentially return an error if role assignment is critical for immediate functionality.
        // For now, we'll proceed.
      } else {
        console.log(`Default 'user' role assigned to user_id: ${auth_uid}`);
      }
    } else {
      console.log(`User_id: ${auth_uid} already has a role:`, existingUserRole);
    }

    // Get the user's role name for the response
    let userRoleName = 'user'; // Default if lookup fails or no role found (though we try to assign one)
    const { data: roleData, error: fetchRoleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', auth_uid)
      .maybeSingle(); // Use maybeSingle as user might not have a role or role table might be inaccessible

    if (fetchRoleError) {
      console.warn('Could not fetch role name for user:', auth_uid, fetchRoleError.message);
      // Keep default 'user' roleName
    } else if (roleData && roleData.roles && roleData.roles.name) {
      userRoleName = roleData.roles.name;
    } else if (roleData && !roleData.roles) {
        // This case means the user_roles entry exists, but the join to roles failed (e.g. role_id is invalid)
        // Or roles table is empty for that role_id.
        console.warn(`User role entry found for ${auth_uid} but no corresponding role name in 'roles' table. Role data:`, roleData);
    }


    // Return validated user data with role
    return res.status(200).json({
      validated: true,
      user: { // Return the profile data from public.users which now includes the correct id
        id: userProfile.id, // This is auth_uid
        telegram_id: userProfile.telegram_id,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        username: userProfile.username,
        language_code: userProfile.language_code,
        photo_url: userProfile.photo_url,
      },
      role: userRoleName,
    });
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
