import { NextFunction, Request, Response } from "express";
import { appConfig } from "../2-utils/app-config";
import { logger } from "../2-utils/logger";
import { ClientError } from "../3-models/client-error";
import { StatusCode } from "../3-models/enums";


class ErrorMiddleware {


    public catchAll = async(err: any, req: Request, res: Response, next: NextFunction) => {

        err.clientIp = req.clientIp;
        console.log(err);
        await logger.logError(err);

        const status = err.status || StatusCode.InternalServerError;

        const message = (status === StatusCode.InternalServerError && appConfig.isProduction) ? "Some Error, please try again" : err.message;

        res.status(status).send({ error: message })

    }

    public routeNotFound = (req: Request, res: Response, next: NextFunction)=>{
        const err = new ClientError(StatusCode.NotFound, `Route: ${req.originalUrl} on method ${req.method} not found`);
        next(err);
    }



}

export const errorMiddleware = new ErrorMiddleware();