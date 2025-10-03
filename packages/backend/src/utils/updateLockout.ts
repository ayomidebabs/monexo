import Lockout from "../models/Lockout.js";

export const updateLockout = async (key: string, lockoutDuration: number, maxAttempts: number) => {
    let lockout = await Lockout.findOne({ key });
    if (!lockout) {
        lockout = await Lockout.create({
            key,
            attempts: 1,
            expireAt: new Date(Date.now() + lockoutDuration),
        });
    }
    else if (Number(lockout.attempts) + 1 >= maxAttempts) {
        lockout.attempts = maxAttempts;
        lockout.lockedUntil = new Date(Date.now() + lockoutDuration);
        lockout.expireAt = new Date(Date.now() + lockoutDuration);
        await lockout.save();
    } else {
        lockout.attempts! += 1;
        await lockout.save();
    }
};