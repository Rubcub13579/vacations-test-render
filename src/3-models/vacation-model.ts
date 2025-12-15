import { UploadedFile } from "express-fileupload";
import Joi from "joi";
import { ClientError } from "./client-error";
import { StatusCode } from "./enums";

export class VacationModel {

    public id: number;
    public destination: string;
    public description: string;
    public startDate: string;
    public endDate: string;
    public price: number;
    public image: UploadedFile;
    public imageUrl: string;

    public constructor(vacation: VacationModel) {
        this.id = vacation.id;
        this.destination = vacation.destination;
        this.description = vacation.description;
        this.startDate = vacation.startDate;
        this.endDate = vacation.endDate;
        this.price = vacation.price;
        this.image = vacation.image;
        this.imageUrl = vacation.imageUrl;
    }

    private static validationSchema = Joi.object({
        id: Joi.number().integer().positive().optional(),
        destination: Joi.string().min(2).max(50).required(),
        description: Joi.string().min(2).max(1000).allow(null).optional(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
        price: Joi.number().precision(2).min(0).max(9999).required(),
        image: Joi.object({
            name: Joi.string().required(),
            size: Joi.number().positive().required(),
            mimetype: Joi.string().valid("image/jpeg", "image/png", "image/webp").required(),
            data: Joi.any().required()
        }).unknown(true).optional()
    }).unknown(true);


    public validate(): void {
        const result = VacationModel.validationSchema.validate(this);
        if (result.error) throw new ClientError(StatusCode.BadRequest, result.error.message);
    }


};