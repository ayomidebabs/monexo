import { checkSchema, validationResult } from "express-validator"
import {
    Request, Response, NextFunction
 } from "express"

const getOrderSchema = checkSchema({
    page: {
        optional: true,
        toInt: true,
        isInt: {
            options: { min: 1 },
            errorMessage: 'Page must be a positive integer',
        },
    },
    limit: {
        optional: true,
        toInt: true,
        isInt: {
            options: { min: 1, max: 100 },
            errorMessage: 'Limit must be a positive integer between 1 and 100',
        },
    },
    status: {
        optional: true,
        isIn: {
            options: [['pending', 'processing', 'shipped', 'delivered']],
            errorMessage: 'Status must be one of: pending, processing, shipped or delivered',
        },
    },
}, ["query"]);

export const validateGetOrder = [
    ...getOrderSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
]