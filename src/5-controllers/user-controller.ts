import express, { NextFunction, Request, Response } from "express";
import { CredentialsModel } from "../3-models/credential-model";
import { StatusCode } from "../3-models/enums";
import { UserModel } from "../3-models/user-model";
import { userService } from "../4-services/user-service";



class UserController {

    public readonly router = express.Router();


    public constructor() {
        this.router.post("/api/register", this.register);
        this.router.post("/api/login", this.login);
    }


    private async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user = new UserModel(req.body);
            const token = await userService.register(user);
            res.status(StatusCode.Created).json(token);
        }
        catch (err) { next(err) }
    }

    private async login(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = new CredentialsModel(req.body);
            const token = await userService.login(credentials);
            res.json(token)
        }
        catch (err) { next(err) }
    }
}

export const userController = new UserController();