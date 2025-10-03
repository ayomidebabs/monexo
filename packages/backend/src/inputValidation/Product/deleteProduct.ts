import { checkSchema, validationResult } from "express-validator"
import {Request, Response, NextFunction} from "express"

export const deleteProductSchema = checkSchema({
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

export const validateProductDeletion = [
    ...deleteProductSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
];