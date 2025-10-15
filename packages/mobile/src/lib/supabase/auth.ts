import { supabase } from '@maity/shared';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure WebBrowser closes properly after auth
WebBrowser.maybeCompleteAuthSession();

export const AuthService = {
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async signIn({ email, password }: { email: string; password: string }) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signUp({ email, password, metadata }: { email: string; password: string; metadata?: any }) {
    return await supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
  },

  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email);
  },

  async signInWithOAuth(provider: 'google' | 'azure') {
    try {
      // Use the app's deep link with full path (Supabase requires full URL format)
      const redirectTo = 'maity://auth/callback';

      console.log('[OAuth] Starting OAuth flow with provider:', provider);
      console.log('[OAuth] Redirect URI:', redirectTo);

      // Start OAuth flow with Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true, // We handle the browser ourselves
        },
      });

      if (error) {
        console.error('[OAuth] Error creating auth URL:', error);
        return { data: null, error };
      }

      if (!data?.url) {
        console.error('[OAuth] No auth URL returned');
        return { data: null, error: new Error('No auth URL returned') };
      }

      console.log('[OAuth] Opening browser with URL:', data.url);

      // Set up URL listener before opening browser
      return new Promise((resolve) => {
        const subscription = Linking.addEventListener('url', async ({ url }) => {
          console.log('[OAuth] Received URL:', url);

          // Clean up listener
          subscription.remove();

          // Close the browser
          WebBrowser.dismissBrowser();

          // Check if this is our callback URL
          if (url.startsWith('maity://')) {
            try {
              // Parse the URL to extract tokens
              const urlObj = new URL(url);
              const fragment = urlObj.hash.substring(1); // Remove the '#'
              const params = new URLSearchParams(fragment);

              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');

              console.log('[OAuth] Extracted tokens:', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken
              });

              if (accessToken && refreshToken) {
                // Set the session with the tokens
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

                if (sessionError) {
                  console.error('[OAuth] Error setting session:', sessionError);
                  resolve({ data: null, error: sessionError });
                  return;
                }

                console.log('[OAuth] Session set successfully');
                resolve({ data: sessionData, error: null });
                return;
              } else {
                console.error('[OAuth] No tokens found in URL');
                resolve({ data: null, error: new Error('No tokens found in callback URL') });
                return;
              }
            } catch (parseError) {
              console.error('[OAuth] Error parsing callback URL:', parseError);
              resolve({ data: null, error: parseError as Error });
              return;
            }
          }
        });

        // Open browser for OAuth
        WebBrowser.openAuthSessionAsync(data.url, redirectTo)
          .then((result) => {
            console.log('[OAuth] Browser closed with result:', result.type);

            // If browser was dismissed without callback, clean up
            if (result.type === 'cancel' || result.type === 'dismiss') {
              subscription.remove();
              resolve({
                data: null,
                error: new Error(result.type === 'cancel' ? 'User cancelled OAuth flow' : 'OAuth flow was dismissed')
              });
            }
          })
          .catch((browserError) => {
            console.error('[OAuth] Browser error:', browserError);
            subscription.remove();
            resolve({ data: null, error: browserError });
          });
      });
    } catch (error) {
      console.error('[OAuth] Unexpected error:', error);
      return { data: null, error: error as Error };
    }
  },
};
