import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Telegram Bot Token from environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'Missing initData' });
    }

    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
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
    const userData = JSON.parse(userDataString);

    if (!userData.id) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    // Check if user exists in Supabase
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userData.id)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking user:', userError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Create or update user in Supabase
    if (!existingUser) {
      const { error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name || null,
          username: userData.username || null,
          language_code: userData.language_code || null,
          photo_url: userData.photo_url || null,
        });

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }
    } else {
      // Update existing user data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name || null,
          username: userData.username || null,
          language_code: userData.language_code || null,
          photo_url: userData.photo_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', userData.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'Failed to update user' });
      }
    }

    // Return validated user data
    return res.status(200).json({
      validated: true,
      user: userData,
    });
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
