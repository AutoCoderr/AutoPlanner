import jwt from "jsonwebtoken";

export default function generateJWTAccessToken(user: {username: string, email: string}) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}