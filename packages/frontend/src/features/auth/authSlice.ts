import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';

export interface User {
  id: string;
  name: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (
    {
      name,
      email,
      password,
    }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post('/signup', { name, email, password });
      return res.data;
    } catch (error: unknown) {
      let message = 'Sign-up failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

export const signIn = createAsyncThunk(
  '/auth/signIn',
  async (
    {
      email,
      password,
      csrfToken,
    }: { email: string; password: string; csrfToken: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post(
        '/auth/callback/credentials',
        {
          email,
          password,
          csrfToken,
        },
        {
          withCredentials: true,
          params: { callbackUrl: '/signin' },
        }
      );
      return res.data;
    } catch (error: unknown) {
      let message = 'Sign-in failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (csrfToken: string, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        '/auth/signout',
        { csrfToken },
        {
          withCredentials: true,
          params: { callbackUrl: '/signout' },
        }
      );
      return res.data;
    } catch (error: unknown) {
      let message = 'Sign-out failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/me', { withCredentials: true });
      return res.data;
    } catch (error: unknown) {
      let message = 'Failed to fetch user';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearUser(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.status = 'succeeded';
          state.user = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.error = action.payload as string;
      })

      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.user = null;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state) => {
        state.status = 'succeeded';
        state.user = null;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.error = action.payload as string;
      })

      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signUp.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      .addCase(signOut.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = authSlice.actions;
export const { reducer: authReducer, reducerPath: authReducerPath } = authSlice;
