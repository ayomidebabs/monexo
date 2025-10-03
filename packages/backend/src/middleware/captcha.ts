import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";
import CaptchaAttempt from "../models/CaptchaAttempt.js";
import { AppError } from "./GlobalErrorHandler.js";
import { verifyCaptchaToken } from "../utils/verifyCaptchaToken.js";

const captchaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { email, captchaToken } = matchedData(req);
    const ip = req.ip || 'unknown';
    const key = `${ip}-${email || 'unknown'}`;
    const maxAttempts = parseInt(process.env.CAPTCHA_ATTEMPTS as string);
    const lockoutDuration = parseInt(process.env.CAPTCHA_LOCKOUT_DURATION as string) || 60 * 60 * 1000;
    let captchaRecord;

    try {
        captchaRecord = await CaptchaAttempt.findOne({ key });
        if (captchaRecord && captchaRecord.lockedUntil && captchaRecord.lockedUntil >= new Date()) {
            const retryAfter = Math.ceil((Number(captchaRecord.lockedUntil) - Date.now()) / 3600000);
            throw new Error(`Account locked for ${retryAfter > 1 ? retryAfter + " hours" : retryAfter + " hour"}`);
        }
    } catch (error) {
        return next(new AppError((error as Error).message, 423));
    };

    try {
        const isValid = await verifyCaptchaToken(captchaToken, ip);
        if (!isValid) {
            if (!captchaRecord) {
                await CaptchaAttempt.create({
                    key,
                    attempts: 1,
                    expireAt: new Date(Date.now() + lockoutDuration)
                });
            } else if (captchaRecord.attempts! + 1 >= maxAttempts) {
                captchaRecord.attempts = maxAttempts;
                captchaRecord.lastAttempt = new Date()
                captchaRecord.lockedUntil = new Date(Date.now() + lockoutDuration);
                captchaRecord.expireAt = new Date(Date.now() + lockoutDuration);
                await captchaRecord.save();
                console.log(`Locked out: ${key}`);
            } else {
                captchaRecord.attempts! += 1;
                captchaRecord.lastAttempt = new Date();
                await captchaRecord.save();
            }
            return res.status(400).send({ error: 'CAPTCHA verification failed' });
        }
    } catch (error) {
        next(new AppError((error as Error).message));
    }
   
    // Delete record on success if it still exists for some reasons after lockout elapses.
    if (captchaRecord) await CaptchaAttempt.deleteOne({ key });
    next();
};