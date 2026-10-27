import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Assignee } from '../types';

interface AuthContextType {
  session: Session | null;
  /** Signed-in user in the shape the board uses for assignees */
  user: Assignee | null;
  /** Whether the signed-in e-mail is on the workspace allowlist (null while checking) */
  isMember: boolean | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MEMBER_COLORS = ['#3b63f3', '#e2445c', '#00c875', '#fdab3d', '#a25ddc', '#0086c0', '#ff642e', '#037f4c'];

/** Builds an Assignee from a profile row; color and initials are derived so they're stable per user. */
export function toAssignee(p: { id: string; name: string; email?: string | null; avatar_url?: string | null }): Assignee {
  const hash = [...p.id].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const initials = p.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  return {
    id: p.id,
    name: p.name,
    email: p.email ?? '',
    avatar: p.avatar_url ?? '',
    initials: initials || '?',
    color: MEMBER_COLORS[hash % MEMBER_COLORS.length],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setIsMember(null);
      return;
    }
    supabase.rpc('is_member').then(({ data, error }) => setIsMember(!error && data === true));
  }, [userId]);

  const meta = session?.user.user_metadata ?? {};
  const user = session
    ? toAssignee({
        id: session.user.id,
        name: meta.full_name || meta.user_name || session.user.email?.split('@')[0] || 'Usuário',
        email: session.user.email,
        avatar_url: meta.avatar_url,
      })
    : null;

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.href },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isMember, loading, signInWithGithub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
