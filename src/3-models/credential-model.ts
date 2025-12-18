import Joi from "joi";
import { ClientError } from "./client-error";
import { StatusCode } from "./enums";

export class CredentialsModel {

    public email: string;
    public password: string;

    public constructor(credentials: Partial<CredentialsModel>) {
        this.email = credentials?.email?.trim();
        this.password = credentials?.password;
    }


    private static validationSchema = Joi.object({
        email: Joi.string().email().required().min(5).max(75),
        password: Joi.string().required().min(2).max(256)
    });


    public validate():void{
        const result = CredentialsModel.validationSchema.validate(this);
        if (result.error) throw new ClientError(StatusCode.BadRequest , result.error.message)
    }


}