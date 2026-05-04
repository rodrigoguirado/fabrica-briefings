'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type UserRole = 'editor' | 'viewer';

export function useUserRole(): { role: UserRole | null; canEdit: boolean; loading: boolean } {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const raw = (data.user?.user_metadata as { role?: string } | undefined)?.role;
      setRole(raw === 'viewer' ? 'viewer' : 'editor');
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const raw = (session?.user?.user_metadata as { role?: string } | undefined)?.role;
      setRole(raw === 'viewer' ? 'viewer' : 'editor');
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { role, canEdit: role === 'editor', loading };
}
