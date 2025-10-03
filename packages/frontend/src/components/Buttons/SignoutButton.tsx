import React from 'react';
import { useDispatch } from 'react-redux';
import { store, type AppDispatch } from '../../app/store';
import { signOut } from '../../features/auth/authSlice';
import getCsrfToken from '../../utils/getCsrfToken';
import { updateLocalCart } from '../../utils/localCartManager';
import { useNavigate } from 'react-router-dom';
import { selectAllCartItems } from '../../features/cart/cartSlice';

interface signoutBtnProps {
  setShowAppModal: React.Dispatch<React.SetStateAction<boolean>>;
  setAppModalMessage: React.Dispatch<React.SetStateAction<string>>;
}
const SignoutButton: React.FC<signoutBtnProps> = ({
  setShowAppModal,
  setAppModalMessage,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handlesignout = async () => {
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        throw new Error('Failed to fetch CSRF token');
      }
      await dispatch(signOut(csrfToken)).unwrap();
      updateLocalCart(selectAllCartItems(store.getState()));
      setAppModalMessage('Sign out sucessful, redirecting...');
      setShowAppModal(true);
      setTimeout(() => {
        setShowAppModal(false);
        navigate('/');
      }, 2000);
    } catch (error) {
      setAppModalMessage('An error occured while signing out');
      setShowAppModal(true);
      setTimeout(() => {
        setShowAppModal(false);
      }, 2000);
      console.error(error);
    }
  };
  return <button onClick={handlesignout}>Sign Out</button>;
};

export default SignoutButton;
