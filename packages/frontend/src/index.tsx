import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppRoutes from './routes';
import { fetchCurrentUser } from './features/auth/authSlice';
import './styles/main.scss';
import CustomCursor from './components/common/customCursor';
import ThemeProvider from './components/common/themeProvider';
store.dispatch(fetchCurrentUser());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <CustomCursor />
        <AppRoutes></AppRoutes>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
