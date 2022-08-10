import {Router} from "express";
import validate from "../libs/validator/validate";
import RegisterForm from "../forms/RegisterForm";
import User from "../models/User";
import getDbFields from "../libs/validator/getDbFields";
import {IUserConnected, IUserCreation} from "../interfaces/models/User";
import {findOneUserByUsernameOrEmail} from "../repositories/UserRepository";
import bcrypt from "bcryptjs";
import generateJWTAccessToken from "../libs/jwt/generateJWTAccessToken";
import compileDataValues from "../libs/compileDatavalues";

const router = Router();

router.post("/register", (req,res) => {
    const validateRes = validate(req.body, RegisterForm);
    if (validateRes !== true)
        return res.status(422).json({violations: validateRes});

    User.create(<IUserCreation>getDbFields(req.body, RegisterForm))
        .then(() => res.sendStatus(201))
        .catch(e => res.sendStatus(e.name === 'SequelizeValidationError' ? 400 : e.name === 'SequelizeUniqueConstraintError' ? 409 : 500));
});

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
