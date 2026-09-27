import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as Request & { user: string | jwt.JwtPayload }).user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
