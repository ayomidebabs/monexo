export interface Lockout {
  key: string;             
  attempts?: number;       
  lockedUntil?: Date;      
  expireAt: Date;          
}