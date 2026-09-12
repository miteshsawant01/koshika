import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://hytzgimcitwdvsdzgjxz.supabase.co';
const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) || 'sb_publishable_m0s-xmDsN3rKnYRdt8Z3Ag_hzf15P8O';


export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
