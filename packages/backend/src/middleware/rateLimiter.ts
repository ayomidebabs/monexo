import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/db.js";

type Data = boolean | number | string;
type RedisReply = Data | Data[]

export const apiLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: [string, ...(string|Buffer)[]]) : Promise<RedisReply> => redis.call(...args) as Promise<RedisReply>,
        prefix: "api:",
    }),
    windowMs: 15 * 60 * 60,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
    keyGenerator: (req) => `${req.ip}-${req.user || "unknown"}`,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

export const signInLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: [string, ...(string|Buffer)[]]) : Promise<RedisReply> => redis.call(...args) as Promise<RedisReply>,
        prefix: "api:",
    }),
    windowMs: 5 * 60 * 60,
    max: 5,
    message: "Too many requests from this IP, please try again after 5 minutes",
    keyGenerator: (req) => `${req.ip}-${req.user || "unknown"}`,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
