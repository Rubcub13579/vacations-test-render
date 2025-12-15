import { NextFunction, Request, Response } from "express";
import { cyber } from "../2-utils/cyber";
import { ClientError } from "../3-models/client-error";
import { StatusCode } from "../3-models/enums";



class SecurityMiddleware {

    public validate(req: Request, res: Response, next: NextFunction): void {

        const header = req.headers.authorization;

        const token = header?.substring(7);

        if (!cyber.validationToken(token)) {
            const err = new ClientError(StatusCode.Unauthorized, "You are not logged in!");
            next(err);
            return;
        }

        next();
    }

    public validateAdmin(req: Request, res: Response, next: NextFunction): void{
        const header = req.headers.authorization;
        const token = header?.substring(7);
        if(!cyber.validationAdmin(token)){
            const err = new ClientError(StatusCode.Forbidden, "You are not admin!");
            next(err);
            return;
        }

        next()


    }





}

export const securityMiddleware = new SecurityMiddleware();