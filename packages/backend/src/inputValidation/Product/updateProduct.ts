import { checkSchema, validationResult } from "express-validator"
import {Request, Response, NextFunction} from "express"

export const updateProductSchema = checkSchema({
    id: {
        in: ['params'],
        isMongoId: {
            errorMessage: 'Invalid product ID',
        },
        notEmpty: {
            errorMessage: 'Product ID is required',
        },
    },
    name: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Name must be a string',
        },
        trim: true,
        escape: true,
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: 'Name must be between 1 and 100 characters',
        },
    },
    price: {
        in: ['body'],
        optional: true,
        toFloat: true,
        isFloat: {
            options: { min: 0 },
            errorMessage: 'Price must be a positive number',
        },
    },
    category: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Category must be a string',
        },
        trim: true,
        escape: true,
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage: 'Category must be between 1 and 50 characters',
        },
        matches: {
            options: /^[a-zA-Z0-9\s-]+$/,
            errorMessage: 'Category contains invalid characters',
        },
    },
    description: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Description must be a string',
        },
        trim: true,
        escape: true,
        isLength: {
            options: { max: 500 },
            errorMessage: 'Description must be 500 characters or less',
        },
    },
    stock: {
        in: ['body'],
        optional: true,
        isInt: {
            options: { min: 0 },
            errorMessage: 'Stock must be a non-negative integer',
        },
        toInt: true,
    },
});

export const validateProductUpdate = [
    ...updateProductSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
];