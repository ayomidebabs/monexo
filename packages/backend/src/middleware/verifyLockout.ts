import dotenv from "dotenv";
dotenv.config();
import { matchedData } from "express-validator";
import { Request, Response, NextFunction } from "express"; 
import Lockout from "../models/Lockout.js";
import { AppError } from "./GlobalErrorHandler.js";
interface AuthRequest extends Request {
    lockoutKey: string; lockoutDuration: number; maxAttempts: number;
}
    
export const verifyLockout = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = matchedData(req);
    const ip = req.ip;
    const key = `${ip}-${email || 'unknown'}`;
    const maxAttempts = parseInt(process.env.LOCKOUT_ATTEMPTS as string);
    const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION as string);
 
    try {
        const lockout = await Lockout.findOne({ key });
        if (lockout && lockout.lockedUntil && lockout.lockedUntil > new Date()) {
            const retryAfter = Math.ceil((Number(lockout.lockedUntil) - Date.now()) / 3600000);
            throw new Error(`Account locked for ${retryAfter} hour`);
        }
    } catch (error) {
        return next(new AppError((error as Error).message, 423));
    }

    (req as AuthRequest).lockoutKey = key;
    (req as AuthRequest).lockoutDuration = lockoutDuration;
    (req as AuthRequest).maxAttempts = maxAttempts;
    next();
};





// asyncHandler(async (req, res) => {
//   const { username, password } = req.body;
//   const { lockoutKey, lockoutDuration, maxAttempts } = req; 

//   if (!username || !password) {
//     throw new Error('Missing username or password', 400);
//   } 

//   const user = await User.findOne({ username });
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     await updateLockout(lockoutKey, lockoutDuration, maxAttempts);
//     user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
//     if (user.failedLoginAttempts >= maxAttempts) {
//       user.lockedUntil = new Date(Date.now() + lockoutDuration);
//     }
//     await user.save();
//     throw new Error('Invalid credentials', 401);
//   } 

//   // Reset on success
//   user.failedLoginAttempts = 0;
//   user.lockUntil = null;
//   await user.save();
//   await Lockout.deleteOne({ key: lockoutKey }); 

//   res.status(200).json({ message: 'Logged in successfully', userId: user._id });
// })); 

// 5. Manual Unlock Endpoint
// Allow admins or email-based resets
// app.post('/unlock', asyncHandler(async (req, res) => {
//   const { key } = req.body;
//   if (!key) throw new Error('Lockout key required', 400); 

//   const result = await Lockout.deleteOne({ key });
//   if (result.deletedCount === 0) {
//     throw new Error('No lockout found for this key', 404);
//   } 

//   // Optionally reset user lockout
//   const [ip, username] = key.split('-');
//   if (username !== 'unknown') {
//     await User.updateOne({ username }, { failedLoginAttempts: 0, lockUntil: null });
//   } 

//   logger.info(Unlocked: ${key});
//   res.status(200).json({ message: 'Unlocked successfully' });
// }));