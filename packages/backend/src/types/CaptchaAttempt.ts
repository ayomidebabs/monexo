export interface CaptchaAttempt {
    key: string;         
    attempts?: number;  
    lastAttempt: Date;
    lockedUntil?: Date; 
    expireAt: Date;      
}