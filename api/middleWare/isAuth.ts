import jwt from "jsonwebtoken";

export default function isAuth()  {
    return function (req, res, next) {
        const token = req.headers.authorization ? req.headers.authorization.split("Bearer ")[1]??null : null;

        if (!token)
            return res.sendStatus(401);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                if (err.name === "TokenExpiredError") return res.sendStatus(401);
                throw err;
            }
            req.user = user;
            next();
        });
    }
}