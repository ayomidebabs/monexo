import { checkSchema, validationResult } from "express-validator"
import {Request, Response, NextFunction } from "express"

const categoryDeletionSchema = checkSchema({
    id: {
        in: ["params"],
        isMongoId: {
            errorMessage: "Invalid ID"
        }
    }
});

export const validateCategoryDeletion = [
    ...categoryDeletionSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.user?.role !== "admin") return res.status(403).send({ message: "admin access required" });
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
];