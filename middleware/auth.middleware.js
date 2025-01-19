import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.log("Token missing");
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const isBlackListed = await redisClient.get(token);
        console.log("Is token blacklisted?", isBlackListed);  // Log Redis check result

        if (isBlackListed) {
            res.cookie('token', '');  // Clear the cookie
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach the decoded user data to the request object
        console.log("Decoded user:", decoded);  // Log decoded user data for debugging
        next();  // Proceed to the next middleware/handler
    } catch (error) {
        console.error("Error during token verification:", error);  // Log the error
        res.status(401).send({ error: 'Unauthorized User' });
    }
}
