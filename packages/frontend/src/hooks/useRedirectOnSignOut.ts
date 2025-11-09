import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../app/store';

export const useRedirectOnSignOut = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  const prevUserRef = useRef<typeof user | null>(user);

  useEffect(() => {
    const prevUser = prevUserRef.current;

    if (prevUser !== null && user === null && location.pathname !== '/') {
      setTimeout(() => navigate('/', { replace: true }), 2000);
    }

    prevUserRef.current = user;
  }, [user, location.pathname, navigate]);
};
