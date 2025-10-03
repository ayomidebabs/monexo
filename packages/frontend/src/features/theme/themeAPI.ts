import { apiSlice } from "../../app/apiSlice";

export const themeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getThemePreference: builder.query<{ themePreference: 'light' | 'dark' | 'system' }, void>({
      query: () => '/user/theme',
      providesTags: ['Theme'],
    }),
    updateThemePreference: builder.mutation<
      { themePreference: 'light' | 'dark' | 'system' },
      { themePreference: 'light' | 'dark' | 'system' }
    >({
      query: ({ themePreference }) => ({
        url: '/user/theme',
        method: 'POST',
        body: { themePreference },
      }),
      invalidatesTags: ['Theme'],
    }),
    }),
});

export const { useGetThemePreferenceQuery, useUpdateThemePreferenceMutation } = themeApi;