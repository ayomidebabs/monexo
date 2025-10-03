import { checkSchema, validationResult } from "express-validator"
import {
    Request, Response, NextFunction
 } from "express"

const UserSignInSchema = checkSchema({
    email: {
        normalizeEmail: true,
        notEmpty: {
            errorMessage: "Email is required"
        },
        isEmail: {
            errorMessage: "Enter a valid email"
        }
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required',
        },
        isLength: {
            options: { min: 8, max: 64 },
            errorMessage: 'Password must be between 8 and 64 characters',
        },
        custom: {
            options: (value) => {
                const hasUpperCase = /[A-Z]/.test(value);
                const hasLowerCase = /[a-z]/.test(value);
                const hasNumber = /[0-9]/.test(value);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                if (!hasUpperCase) throw new Error('Password must contain at least one uppercase letter');

                if (!hasLowerCase) throw new Error('Password must contain at least one lowercase letter');

                if (!hasNumber) throw new Error('Password must contain at least one number');

                if (!hasSpecialChar) throw new Error('Password must contain at least one special character');
                return true;
            },
        },
    },
    csrfToken: {
        isString: {
            errorMessage: "csrfToken must be a string"
        }
    }
    // captchaToken: {
    //     isString: {
    //         errorMessage: "Captcha token must be a string"
    //     }
    // }
});

export const validateUserSignIn = [
    ...UserSignInSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
]