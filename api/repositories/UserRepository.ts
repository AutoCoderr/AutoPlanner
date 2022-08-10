import User from "../models/User";
import {Op} from "sequelize";
import compileDataValues from "../libs/compileDatavalues";

export function findOneUserByUsernameOrEmail(usernameOrEmail: string): Promise<null|User> {
    return <Promise<null|User>>User.findOne({
        where: {
            [Op.or]: [
                {
                    username: usernameOrEmail
                },
                {
                    email: usernameOrEmail
                }
            ]
        }
    }).then(res => compileDataValues(res));
}