import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CheckoutInfo {
  email: string | null;
  region: 'africa' | 'europe' | 'united states' | 'britain' | null;
  currency?: 'NGN' | 'GHS' | 'ZAR' | 'GBP' | 'EUR' | 'USD' | null;
}

const initialState: CheckoutInfo = {
  email: null,
  region: null,
  currency: null,
};

const authSlice = createSlice({
  name: 'checkoutInfo',
  initialState,
  reducers: {
    setCheckoutInfo(state, action: PayloadAction<CheckoutInfo>) {
      state.email = action.payload.email;
      state.region = action.payload.region;
      state.currency = action.payload.currency;
    },
  },
});

export const { setCheckoutInfo } = authSlice.actions;
export const {
  reducer: CheckoutInfoReducer,
  reducerPath: checkoutInfoReducerPath,
} = authSlice;
