import { Response } from 'express';

declare module 'express' {
  interface Locals {
    appUser?: {
      id: string;
      name: string;
      role: string;
      [key: string]: any;
    };
  }
}
