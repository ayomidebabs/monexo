import { checkSchema, validationResult } from "express-validator"
import {
    Request, Response, NextFunction
 } from "express"

const pidSchema = checkSchema({
    pId: {
        in: ['params'],
        isMongoId: {
            errorMessage: 'Invalid product ID',
        },
        notEmpty: {
            errorMessage: 'Product ID is required',
        },
    },
});

export const validatePid = [
    ...pidSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
]
 