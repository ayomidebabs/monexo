import { checkSchema, validationResult } from "express-validator"
import {
    Request, Response, NextFunction
 } from "express"

const updateUserRoleSchema = checkSchema({
    role: {
        in: ['body'],
        isIn: {
            options: [['customer', 'admin', 'seller']],
            errorMessage: 'Status must be one of: customer, admin or seller',
        },
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

export const validateUserRoleUpdate = [
    ...updateUserRoleSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
]