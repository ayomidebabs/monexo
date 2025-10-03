import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSignUpMutation } from '../../features/auth/authAPI';
import { useMergeRecentlyViewedMutation } from '../../features/recentlyViewed/recentlyviewedAPI';
import { getRecentlyViewedProducts, clearRecentlyViewedProducts } from '../../utils/recentlyViewed';
import type { RootState } from '../../app/store';

const SignUp: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signUp, { isLoading, isSuccess }] = useSignUpMutation();
  const [mergeRecentlyViewed] = useMergeRecentlyViewedMutation();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSignUp = async (formData: { email: string; password: string }) => {
    try {
      await signUp(formData).unwrap();
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

    useEffect(() => {
        if (isSuccess && user) {
            const localProducts = getRecentlyViewedProducts();
            if (localProducts.length > 0) {
                mergeRecentlyViewed({ products: localProducts });
                clearRecentlyViewedProducts();
            }
            navigate('/'); // Redirect to home
        }
    }, [isSuccess, user, mergeRecentlyViewed, navigate]);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = {
        email: e.currentTarget.email.value,
        password: e.currentTarget.password.value,
      };
      handleSignUp(formData);
    }}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit" disabled={isLoading}>Sign Up</button>
    </form>
  );
};

export default SignUp;