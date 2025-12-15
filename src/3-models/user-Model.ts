import Joi from "joi";
import { ClientError } from "./client-error";
import { StatusCode } from "./enums";

export class UserModel {

    public id: number;
    public firstName: string;
    public lastName: string;
    public email: string;
    public password: string;
    public roleId: number;

    public constructor(user: UserModel) {
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.roleId = user.roleId;
    }

    private static validationSchema = Joi.object({
        id: Joi.number().optional().integer().positive(),
        firstName: Joi.string().required().min(2).max(50),
        lastName: Joi.string().required().min(2).max(50),
        email: Joi.string().required().min(10).max(75),
        password: Joi.string().required().min(2).max(256),
        roleId: Joi.number().optional().integer().positive()
    })

    public validate(): void {
        const result = UserModel.validationSchema.validate(this);
        if (result.error) throw new ClientError(StatusCode.Unauthorized, result.error.message)
    }


}