import { checkSchema, validationResult } from "express-validator"
import {
    Request, Response, NextFunction
 } from "express"

const updateOrderSchema = checkSchema({
    status: {
        in: ['body'],
        isIn: {
            options: [['pending', 'processing', 'shipped', 'delivered']],
            errorMessage: 'Status must be one of: pending, processing, shipped or delivered',
        },
        notEmpty: {
             errorMessage: 'Status is required',
        }
    },
    id: {
        in: ['params'],
        isMongoId: {
            errorMessage: 'Invalid product ID',
        },
        notEmpty: {
            errorMessage: 'Product ID is required',
        },
    },
});

export const validateOrderUpdate = [
    ...updateOrderSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
]