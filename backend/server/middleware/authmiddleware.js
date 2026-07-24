import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, access denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        req.user = user;

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

export default protect;