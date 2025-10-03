import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import axios from '../../config/apiConfig';
import type { WishlistProduct } from './wishlistAPI';
import type { RootState } from '../../app/store';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/wishlist', { withCredentials: true });
      return res.data;
    } catch (error: unknown) {
      let message = 'Failed to fetch wishlist';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

const wishlistAdapter = createEntityAdapter({
  selectId: (product: WishlistProduct) => product.pId,
});

const initialState = wishlistAdapter.getInitialState<{
  status: string;
  wishlistIntent: {
    status: boolean;
    product: null | string;
  };
}>({
  status: 'idle',
  wishlistIntent: {
    status: false,
    product: null,
  },
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setGuestWishlistIntent: (
      state,
      action: PayloadAction<{ status: boolean; product: string | null }>
    ) => {
      state.wishlistIntent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchWishlist.fulfilled,
        (state, action: PayloadAction<WishlistProduct[]>) => {
          state.status = 'success';
          wishlistAdapter.setAll(state, action);
        }
      )
      .addCase(fetchWishlist.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { selectById: selectWishlistItemById } =
  wishlistAdapter.getSelectors((state: RootState) => state.wishlist);

export const { setGuestWishlistIntent } = wishlistSlice.actions;
export const { reducer: wishlistReducer, reducerPath: wishlistReducerPath } =
  wishlistSlice;
