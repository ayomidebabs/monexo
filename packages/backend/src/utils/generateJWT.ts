import jwt from "jsonwebtoken"
export const generateJWT = (payload: { id: string, role: string }) => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1h" })
}