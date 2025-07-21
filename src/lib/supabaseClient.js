import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgmdqayaqafxutbncypt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWRxYXlhcWFmeHV0Ym5jeXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzE5NzAsImV4cCI6MjA2NTI0Nzk3MH0.pa7ROTfaf7rGeB384j6Rh3oNZ6F1lHf3R-wg45ayrC4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);