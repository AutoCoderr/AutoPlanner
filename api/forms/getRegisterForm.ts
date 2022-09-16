import IForm from "../interfaces/form/IForm";
import email from "../asserts/email";
import password from "../asserts/password";
import confirm_password from "../asserts/confirm_password";
import IFormGetter from "../interfaces/form/IFormGetter";
import User from "../models/User";

const getRegisterForm: IFormGetter<User> = () => ({
    model: User,
    fields: {
        email: {
            msg: "Adresse mail invalide",
            required: true,
            valid: email
        },
        username: {
            msg: "Nom d'utilisateur incorrect",
            required: true,
            valid: value => value.length > 1 && value.length <= 50
        },
        password: {
            msg: "Le mot de passe n'est pas assez complexe",
            required: true,
            valid: password
        },
        confirm_password: {
            msg: "Vos deux mot de passe ne correspondent pas",
            required: true,
            valid: confirm_password,
            inDB: false
        }
    }
})

export default getRegisterForm;