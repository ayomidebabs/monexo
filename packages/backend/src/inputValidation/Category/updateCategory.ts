import { checkSchema, validationResult } from "express-validator"
import {Request, Response, NextFunction } from "express"

const categoryUpdateSchema = checkSchema({
    name: {
        in: ["body"],
        optional: true,
        notEmpty: {
            errorMessage: "Name is required"
        }
    },
    id: {
        in: ["params"],
        isMongoId: {
            errorMessage: "Invalid ID"
        }
    }
});

export const validateCategoryUpdate = [
    ...categoryUpdateSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.user?.role !== "admin") return res.status(403).send({ message: "admin access required" });
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
];