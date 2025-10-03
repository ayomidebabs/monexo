import { checkSchema, validationResult } from "express-validator"
import {Request, Response, NextFunction} from "express"

const createProductSchema = checkSchema({
    name: {
        trim: true,
        escape: true,
        notEmpty: {
            errorMessage: "Name is required"
        },
        isString: {
            errorMessage: 'Name must be a string',
        },
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: 'Name must be between 1 and 100 characters',
        }
    },
    price: {
        toFloat: true,
        isFloat: {
            options: { min: 0 },
            errorMessage: 'Price must be a positive number',
        },
    },
    category: {
        trim: true,
        escape: true,
        notEmpty: {
            errorMessage: "Category is required"
        },
        isString: {
            errorMessage: 'Category must be a string',
        },
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
        trim: true,
        escape: true,
        notEmpty: {
            errorMessage: "Description is required"
        },
        isString: {
            errorMessage: 'Description must be a string',
        },
        isLength: {
            options: { max: 500 },
            errorMessage: 'Description must be 500 characters or less',
        },
    },
    stock: {
        toInt: true,
        isInt: {
            options: { min: 0 },
            errorMessage: 'Stock must be a non-negative integer',
        },
    }
});

export const validateProductCreation = [
    ...createProductSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
];

