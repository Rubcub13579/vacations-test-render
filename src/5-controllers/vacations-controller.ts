import express, { NextFunction, Request, Response } from "express";
import { fileSaver } from "uploaded-file-saver";
import { cyber } from "../2-utils/cyber";
import { StatusCode } from "../3-models/enums";
import { VacationModel } from "../3-models/vacation-model";
import { vacationService } from "../4-services/vacation-service";
import { securityMiddleware } from "../6-middleware/security-middleware";


class VacationsController {

    public readonly router = express.Router();

    public constructor() {
        //vacations
        this.router.get("/api/vacations/", securityMiddleware.validate,this.getAllVacations);
        this.router.get("/api/vacations/:id", securityMiddleware.validate,this.getOneVacation);
        this.router.post("/api/vacations/", securityMiddleware.validate, securityMiddleware.validateAdmin, this.addVacation);
        this.router.put("/api/vacations/:id", securityMiddleware.validate, securityMiddleware.validateAdmin, this.updateVacation);
        this.router.delete("/api/vacations/:id", securityMiddleware.validate, securityMiddleware.validateAdmin, this.deleteVacation);
        
        //get image
        this.router.get("/api/vacations/images/:imageName", this.getImageFile);

        //likes
        this.router.post("/api/vacations/like/:id", securityMiddleware.validate, this.likeVacation);
        this.router.delete("/api/vacations/like/:id", securityMiddleware.validate, this.unlikeVacation);
        this.router.get("/api/vacations/like/:id", securityMiddleware.validate, this.showVacationLike);
        this.router.get("/api/all-likes/", securityMiddleware.validate, securityMiddleware.validateAdmin, this.getAllVacationsLikes)
    }



    private async getAllVacations(req: Request, res: Response, next: NextFunction) {
        try {
            const vacations = await vacationService.getAllVacations();
            res.json(vacations);
        }
        catch (err: any) { next(err) }
    }

    private async getOneVacation(req: Request, res: Response, next: NextFunction) {
        try {
            const id = +req.params.id
            const vacation = await vacationService.getOneVacation(id);
            res.json(vacation)
        }
        catch (err: any) { next(err) }
    }

    private async addVacation(req: Request, res: Response, next: NextFunction) {
        try {
            req.body.image = req.files?.image;
            const vacation = new VacationModel(req.body)
            const dbVacation = await vacationService.addVacation(vacation);
            res.status(StatusCode.Created).json(dbVacation);
        }
        catch (err: any) { next(err) }
    }

    private async updateVacation(req: Request, res: Response, next: NextFunction) {
        try {
            req.body.id = +req.params.id;
            req.body.image = req.files?.image;
            const vacation = new VacationModel(req.body);
            const dbVacation = await vacationService.updateVacation(vacation);
            res.status(StatusCode.Ok).json(dbVacation);
        }
        catch (err: any) { next(err) }
    }

    private async deleteVacation(req: Request, res: Response, next: NextFunction) {
        try {
            const id = +req.params.id;
            await vacationService.deleteVacation(id);
            res.status(StatusCode.NoContent).json()

        }
        catch (err: any) { next(err) }
    }

    private async getImageFile(req: Request, res: Response, next: NextFunction) {
        try {
            const imageName = req.params.imageName;
            const imagePath = fileSaver.getFilePath(imageName);
            res.sendFile(imagePath)
        }
        catch (err: any) { next(err) }
    }

    private async likeVacation(req: Request, res: Response, next: NextFunction) {
        try {
            const vacationId = +req.params.id;
            const token = req.headers.authorization?.substring(7);
            const user = cyber.getUserFromToken(token);
            const userId = user.id;

            await vacationService.likeVacation(userId, vacationId);

            res.status(StatusCode.Created).json("like")
        }
        catch (err: any) { next(err) }
    }

    private async unlikeVacation(req: Request, res: Response, next: NextFunction) {
        try {
            const vacationId = +req.params.id;
            const token = req.headers.authorization?.substring(7);
            const user = cyber.getUserFromToken(token);
            const userId = user.id
            await vacationService.unlikeVacation(userId, vacationId);
            res.status(StatusCode.NoContent).json("unlike");
        }
        catch (err: any) { next(err) };
    }

    private async showVacationLike(req: Request, res: Response, next: NextFunction) {
        try {
            const vacationId = +req.params.id;
            const token = req.headers.authorization?.substring(7);
            const user = cyber.getUserFromToken(token);
            const userId = user.id;

            const likes = await vacationService.getVacationLikes(vacationId, userId);
            res.json(likes);
        }
        catch (err: any) { next(err); }
    }

    private async getAllVacationsLikes(req: Request, res: Response, next: NextFunction) {
        try {
            const vacationsLikes = await vacationService.getAllVacationsLikes();
            res.json(vacationsLikes);
        } catch (err) { next(err) }
    }

}

export const vacationsController = new VacationsController();