import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { supabase } from '../lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProfilePage: React.FC = () => {
  const { user, userRole, signOut } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setUsername(user.username || '');
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update user profile in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName || null,
          username: username || null,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', user?.id);
      
      if (updateError) throw updateError;
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return '?';
    
    const firstInitial = user.first_name ? user.first_name.charAt(0).toUpperCase() : '';
    const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
    
    return firstInitial + lastInitial || firstInitial || '?';
  };
  
  return (
    <Layout title="Profile" hideNavigation={false}>
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user?.photo_url || ''} alt={user?.first_name || 'User'} />
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <h1 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h1>
            {user?.username && <p className="text-muted-foreground">@{user.username}</p>}
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {userRole}
              </span>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Profile updated successfully
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName || ''}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
