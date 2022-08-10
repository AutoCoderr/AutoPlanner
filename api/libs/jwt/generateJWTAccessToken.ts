import jwt from "jsonwebtoken";
import User from "../../models/User";

export default function generateJWTAccessToken(user: User) {
    return jwt.sign({
            ...user,
            password: undefined,
            updatedAt: undefined,
            createdAt: undefined
        },
        process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}