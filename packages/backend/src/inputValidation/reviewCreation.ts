import { checkSchema, validationResult } from "express-validator"
import {Request, Response, NextFunction} from "express"

const reviewCreationSchema = checkSchema({
    rating: {
        toInt: true,
        isInt: {
            options: { min: 1, max: 5 },
            errorMessage: "Rating must be an integer between 1 and 5"
        }
    },
    Comment: {
        optional: true,
        trim: true,
        escape: true,
        isString: {
            errorMessage: "Comment must be a string"
        }
    },
    pId: {
         isMongoId: {
            errorMessage: "Invalid ID"
        }
    },
});

export const validateReviewCreation = [
    ...reviewCreationSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
]