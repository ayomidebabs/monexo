import { createContext } from 'react';

export const searchContext = createContext<{
  search: string;
  category: string;
}>({
  search: '',
  category: '',
});
