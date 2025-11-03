import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../../features/theme/themeSlice';
import {
  useGetThemePreferenceQuery,
  useUpdateThemePreferenceMutation,
} from '../../features/theme/themeAPI';
import type { RootState } from '../../app/store';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.theme);
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: serverTheme, isSuccess: isServerThemeSuccess } =
    useGetThemePreferenceQuery(undefined, { skip: !user });
  const [
    updateThemePreference,
    { isLoading: isUpdatingServerThemePreference },
  ] = useUpdateThemePreferenceMutation();

  // Track previous values to prevent loops
  const prevThemeRef = useRef<string | null>(null);
  const prevServerThemeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Guest: use localStorage or system
      const storedTheme = localStorage.getItem('theme') as
        | 'light'
        | 'dark'
        | 'system'
        | null;
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        dispatch(setTheme(storedTheme));
      } else {
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        dispatch(setTheme(prefersDark ? 'dark' : 'light'));
      }
    } else if (isServerThemeSuccess && serverTheme?.themePreference) {
      // Logged in: use server preference
      const serverPref = serverTheme.themePreference;
      if (serverPref !== theme && serverPref !== prevServerThemeRef.current) {
        dispatch(setTheme(serverPref));
      }
    }
  }, [user, serverTheme, isServerThemeSuccess, dispatch, theme]);

  // Apply theme to DOM + sync to server (only if changed)
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const effectiveTheme =
      theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

    root.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('theme', theme);

    // Sync to server only if logged in, changed, and not already syncing
    if (
      user &&
      serverTheme?.themePreference &&
      theme !== serverTheme.themePreference &&
      theme !== prevThemeRef.current &&
      !isUpdatingServerThemePreference
    ) {
      prevThemeRef.current = theme;
      updateThemePreference({ themePreference: theme })
        .unwrap()
        .catch(() => {
          prevThemeRef.current = null;
        });
    }

    prevThemeRef.current = theme;
    if (serverTheme?.themePreference) {
      prevServerThemeRef.current = serverTheme.themePreference;
    }
  }, [
    theme,
    user,
    serverTheme,
    updateThemePreference,
    isUpdatingServerThemePreference,
  ]);

  return <>{children}</>;
};

export default ThemeProvider;
