/**
 * STEMBRIDGE AI - Supabase Client
 * Zero-dependency client connecting directly to Supabase REST API
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hytzgimcitwdvsdzgjxz.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_m0s-xmDsN3rKnYRdt8Z3Ag_hzf15P8O';

export const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,

  async from(table) {
    return {
      async select(columns = '*') {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(columns)}`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          return { data: null, error: err };
        }
        const data = await res.json();
        return { data, error: null };
      },

      async insert(rows) {
        const payload = Array.isArray(rows) ? rows : [rows];
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          return { data: null, error: err };
        }
        const data = await res.json();
        return { data, error: null };
      }
    };
  }
};

export default supabase;
