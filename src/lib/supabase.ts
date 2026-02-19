import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ckilxbljczwiiwdkipir.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ArnQr-ig6qwBBsI4Ghe63A_nnH_N3H8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
