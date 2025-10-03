import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../../features/theme/themeSlice';
import { useGetThemePreferenceQuery, useUpdateThemePreferenceMutation } from '../../features/theme/themeAPI';
import type { RootState } from '../../app/store';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.theme);
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: serverTheme } = useGetThemePreferenceQuery(undefined, { skip: !user });
  const [updateThemePreference] = useUpdateThemePreferenceMutation();

  useEffect(() => {
    // Initialize theme
    if (user && serverTheme) {
      dispatch(setTheme(serverTheme.themePreference));
    } else {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      if (storedTheme) {
        dispatch(setTheme(storedTheme));
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        dispatch(setTheme(prefersDark ? 'dark' : 'light'));
      }
    }
  }, [dispatch, user, serverTheme]);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effectiveTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    console.log(effectiveTheme)
    root.setAttribute('data-theme', effectiveTheme);

    // Sync with server for logged-in users
    if (user && serverTheme?.themePreference !== theme) {
      updateThemePreference({ themePreference: theme });
    }
  }, [theme, user, serverTheme, updateThemePreference]);

  return <>{children}</>;
};

export default ThemeProvider;