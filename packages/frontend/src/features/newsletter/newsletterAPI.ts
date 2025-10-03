import { apiSlice } from "../../app/apiSlice";

export const newsletterApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        subscribeNewsletter: builder.mutation<{ message: string }, { email: string }>({
            query: ({ email }) => ({
                url: '/newsletter/subscribe',
                method: 'POST',
                body: { email },
            })
        })
    }),
});

export const { useSubscribeNewsletterMutation } = newsletterApi;