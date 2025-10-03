import { createContext } from 'react';

export const modalContext = createContext<{
  setShowSignInModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreateAccountModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCheckoutModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAppModal: React.Dispatch<React.SetStateAction<boolean>>;
  setAppModalMessage: React.Dispatch<React.SetStateAction<string>>;
}>({
  setShowSignInModal: (value: React.SetStateAction<boolean>) => value,
  setShowCreateAccountModal: (value: React.SetStateAction<boolean>) => value,
  setShowCheckoutModal: (value: React.SetStateAction<boolean>) => value,
  setShowAppModal: (value: React.SetStateAction<boolean>) => value,
  setAppModalMessage: (value: React.SetStateAction<string>) => value,
});
