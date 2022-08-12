import {Router} from "express";
import computeForm from "../libs/form/computeForm";
import RegisterForm from "../forms/RegisterForm";
import User from "../models/User";
import {IUserConnected} from "../interfaces/models/User";
import {findOneUserByUsernameOrEmail} from "../repositories/UserRepository";
import bcrypt from "bcryptjs";
import generateJWTAccessToken from "../libs/jwt/generateJWTAccessToken";
import compileDataValues from "../libs/compileDatavalues";
import post from "../libs/crud/post";

const router = Router();


router.post("/register", post(RegisterForm, User, {
    errorCode: (e) => e.name === 'SequelizeValidationError' ? 400 : e.name === 'SequelizeUniqueConstraintError' ? 409 : 500
}));

router.post("/login", async (req,res) => {
    const {usernameOrEmail,password} = req.body;

    if (!usernameOrEmail || !password)
        return res.sendStatus(400);

    const user = await findOneUserByUsernameOrEmail(usernameOrEmail);
    if (user === null || !(await bcrypt.compare(req.body.password, user.password)))
        return res.sendStatus(401);

    const userObj: IUserConnected = {
        ...compileDataValues(user),
        password: undefined,
        updatedAt: undefined,
        createdAt: undefined
    }

    res.status(200).json({
        ...userObj,
        access_token: generateJWTAccessToken(userObj)
    })
});

export default router
