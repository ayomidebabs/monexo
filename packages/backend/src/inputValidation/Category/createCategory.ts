import { checkSchema, validationResult } from "express-validator"
import {Request, Response, NextFunction } from "express"

const categoryCreationSchema = checkSchema({
    name: {
        trim: true,
        notEmpty: {
            errorMessage: "Name is required"
        },
    },
    description: {
        trim: true,
        notEmpty: {
            errorMessage: "Description is required"
        }
    }
});

export const validateCategoryCreation = [
    ...categoryCreationSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.user?.role !== "admin") return res.status(403).send({ message: "admin access required" });
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
];