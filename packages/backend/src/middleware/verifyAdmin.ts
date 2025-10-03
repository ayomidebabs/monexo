import { Request, Response, NextFunction } from "express"; "express"

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") return res.status(403).send({ message: "Admin access required" });
    next();
}