import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si ya hay sesión activa al abrir la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setIsLoading(false);
    });

    // Escuchar cambios de sesión en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error) setProfile(data);
  };

  // Registro con Email y Password
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Crear el perfil del usuario en la tabla `profiles`
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        region: 'Región Metropolitana',
      });
    }
    return data;
  };

  // Login con Email y Password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // Cerrar Sesión
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Actualizar Zona del Perfil
  const updateZone = async (newZone) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ region: newZone })
      .eq('id', user.id);
    if (!error) setProfile(prev => ({ ...prev, region: newZone }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      signUp,
      signIn,
      logout,
      updateZone,
      // Compatibilidad con código existente que usa "login"
      login: signIn,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
