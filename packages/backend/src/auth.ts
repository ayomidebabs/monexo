import dotenv from 'dotenv';
import { Request } from 'express';
import Google from '@auth/express/providers/google';
import Credentials from '@auth/express/providers/credentials';
import type { AuthConfig, Session } from '@auth/core/types';
import type { OAuthConfig, Provider } from '@auth/core/providers';
import type { JWT } from '@auth/core/jwt';

import User from './models/User.js';
import { validatePassword } from './utils/pswdEncryption.js';
import { updateLockout } from './utils/updateLockout.js';
import { AppError } from './middleware/GlobalErrorHandler.js';
import { userInfo } from 'os';

dotenv.config();

const { GOOGLE_ID, GOOGLE_SECRET, AUTH_SECRET } = process.env;
if (
  !GOOGLE_ID ||
  !GOOGLE_SECRET ||
  !AUTH_SECRET ||
  typeof GOOGLE_ID !== 'string' ||
  typeof GOOGLE_SECRET !== 'string' ||
  typeof AUTH_SECRET !== 'string'
) {
  throw new Error(
    'Missing or invalid required environment variables for Google OAuth'
  );
}

interface CustomSession extends Session {
  user: {
    id?: string;
    [key: string]: any;
  };
}

export const authConfig: AuthConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    Google({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
      async profile(profile) {
        let user = await User.findOne({ 'google.id': profile.id });
        try {
          if (!user)
            user = await User.create({
              name: profile.displayName,
              google: {
                id: profile.id,
                avatar: profile.photos?.[0].value,
              },
              strategy: 'google',
            });
        } catch (error) {
          throw new AppError((error as Error).message);
        }
        return {
          id: user.id.toString(),
          name: user.name,
          role: user.role,
        };
      },
    }) as OAuthConfig<any>,
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req: unknown) {
        const expressReq = req as Request & {
          lockoutKey?: string;
          lockoutDuration?: number;
          maxAttempts?: number;
        };
        const {
          lockoutKey = 'unknown',
          lockoutDuration = 15 * 60 * 1000,
          maxAttempts = 5,
        } = expressReq;

        try {
          if (
            !credentials?.email ||
            !credentials?.password ||
            typeof credentials.email !== 'string' ||
            typeof credentials.password !== 'string'
          ) {
            return null;
          }

          const user = await User.findOne({
            'local.email': credentials.email,
          });
          if (!user) {
            return null;
          }

          const isValidPswd = await validatePassword(
            credentials.password,
            user.local.password
          );
          if (!isValidPswd) {
            await updateLockout(lockoutKey, lockoutDuration, maxAttempts);
            user.failedSignInAttempts = (user.failedSignInAttempts || 0) + 1;
            if (user.failedSignInAttempts >= maxAttempts) {
              user.lockedUntil = new Date(Date.now() + lockoutDuration);
            }
            await user.save();
            return null;
          }

          user.failedSignInAttempts = 0;
          user.lockedUntil = undefined;
          await user.save();
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.local.email,
          };
        } catch (error) {
          throw new AppError((error as Error).message);
        }
      },
    }),
  ],
  secret: AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: CustomSession;
      token: JWT;
    }): Promise<CustomSession> {
      if (token.id) {
        try {
          const user = await User.findById(token.id);
          if (user) {
            switch (user.strategy) {
              case 'local':
                session.user = {
                  id: user.id,
                  name: user.name,
                  role: user.role,
                };
                break;
              case 'google':
                session.user = {
                  id: user.id,
                  name: user.name,
                  role: user.role,
                };
                break;
              case 'facebook':
                session.user = {
                  id: user.id,
                  name: user.name,
                  role: user.role,
                };
                break;
            }
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/signin')) {
        return baseUrl + '/signin-success';
      }
      if (url.includes('/signout')) {
        return baseUrl + '/signout-success';
      }
      return '';
    },
  },
};

authConfig.providers = authConfig.providers as Provider[];
