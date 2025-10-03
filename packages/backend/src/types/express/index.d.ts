import { IUserDocument } from '../../models/User.ts';

interface AppUser {
  appUser?: {
    id?: string;
    name?: string | null;
    role?: string;
    [key: string]: any;
  };
}

declare global {
  namespace Express {
    interface User extends IUserDocument {}
    interface Locals extends AppUser {}
  }
}
