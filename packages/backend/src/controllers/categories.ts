import { NextFunction, Request, Response } from "express";
import Category from "../models/Category.js";
import { AppError } from "../middleware/GlobalErrorHandler.js";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.find();
        res.send(categories);
    } catch (error) {
        next(new AppError((error as Error).message));
    }
};

