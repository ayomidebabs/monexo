import axios from "axios";
import { redis } from "../config/db.js";

export async function getExchangeRate(currency: string) : Promise<number>{
    const key = `exchange_rate:${currency.toUpperCase}`;

    const cachedRate = await redis.get(key);
    if (cachedRate) return parseFloat(cachedRate);

    const res = await axios.get(`https://api.exchangerate.host/latest?base=USD`);
    const rate = res.data?.rates?.[currency.toUpperCase()];
    if (!rate) throw new Error(`Currency ${currency} not supported`);

    await redis.set(key, rate.toString(), "EX", 3600);
    return rate;
}