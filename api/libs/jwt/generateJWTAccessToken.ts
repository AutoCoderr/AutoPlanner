import jwt from "jsonwebtoken";
import {IUserConnected} from "../../interfaces/models/User";

export default function generateJWTAccessToken(user: IUserConnected) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}