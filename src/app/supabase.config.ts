import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aplusyghdeuyewrstikg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbHVzeWdoZGV1eWV3cnN0aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzU5MTksImV4cCI6MjA3MzIxMTkxOX0.n1m0CnGGWYVex9AGB9XEsUNDs-VLorFK2tjyKLfQIps';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);