import { checkSchema, validationResult } from "express-validator"
import {Request, Response, NextFunction} from "express"

const themePreferenceSchema = checkSchema({
  themePreference: {
    isIn: {
          options: [['light', 'dark', 'system']],
        errorMessage: 'ThemePreference must be either "light", "dark" or "system"'
    },
  },
});

export const validateThemePreference = [
    ...themePreferenceSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
        next()
    }
]