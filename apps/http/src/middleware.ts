import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function authMiddleware(req:Request,res:Response,next:NextFunction){
//     const authHeader =  req.headers.authorization;
//     if(!authHeader || !authHeader.startsWith("Bearer ")) {
//          res.status(401).json({ message: "Unauthorized" });
//          return;
//     }

//     const token = authHeader.split(" ")[1];
    const token = req.cookies.token;
    if(!token) {
         res.status(401).json({ message: "Unauthorized" });
         return;
    }
    try{
        const decoded = jwt.verify(token,JWT_SECRET) as { userId: string };

        req.userId = decoded.userId; // Attach the decoded user info to the request object
        next(); // Call the next middleware or route handler

    } catch {
         res.status(401).json({ message: "Unauthorized" });
         return;
    }
}