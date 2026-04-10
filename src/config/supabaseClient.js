import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL decodificada desde el JWT (Identificador de tu servidor)
const supabaseUrl = 'https://zdabmithbzyehzcjvjek.supabase.co';

// Llave pública (ANON KEY) de acceso a la base de datos
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
