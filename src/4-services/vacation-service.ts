import { fileSaver } from "uploaded-file-saver";
import { appConfig } from "../2-utils/app-config";
import { dal } from "../2-utils/dal";
import { ClientError } from "../3-models/client-error";
import { StatusCode } from "../3-models/enums";
import { LikesModel } from "../3-models/like-model";
import { VacationModel } from "../3-models/vacation-model";

class VacationService {

    public async getAllVacations(): Promise<VacationModel[]> {

        const sql = `
            SELECT 
                id,
                destination,
                description,
                "startDate",
                "endDate",
                price,
                CONCAT($1, "imageName") AS "imageUrl"
            FROM vacations
            ORDER BY "startDate"
        `;

        return await dal.execute<VacationModel>(sql, [appConfig.imagesUrl]);
    }

    public async getOneVacation(vacationId: number): Promise<VacationModel> {

        const sql = `
            SELECT 
                *,
                CONCAT($1, "imageName") AS "imageUrl"
            FROM vacations
            WHERE id = $2
        `;

        const vacations = await dal.execute<VacationModel>(sql, [appConfig.imagesUrl, vacationId]);
        return vacations[0];
    }

    public async addVacation(vacation: VacationModel): Promise<VacationModel> {

        vacation.validate();

        const imageName = vacation.image
            ? await fileSaver.add(vacation.image)
            : null;

        const sql = `
            INSERT INTO vacations
            (destination, description, "startDate", "endDate", price, "imageName")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            vacation.destination,
            vacation.description,
            vacation.startDate,
            vacation.endDate,
            vacation.price,
            imageName
        ];

        const [dbVacation] = await dal.execute<VacationModel>(sql, values);
        return dbVacation;
    }

    public async updateVacation(vacation: VacationModel): Promise<VacationModel> {

        vacation.validate();

        let sql: string;
        let values: any[];

        if (vacation.image) {

            const oldImageName = await this.getImageName(vacation.id);
            const newImageName = await fileSaver.add(vacation.image);

            sql = `
                UPDATE vacations
                SET destination=$1, description=$2, "startDate"=$3,
                    "endDate"=$4, price=$5, "imageName"=$6
                WHERE id=$7
                RETURNING *
            `;

            values = [
                vacation.destination,
                vacation.description,
                vacation.startDate,
                vacation.endDate,
                vacation.price,
                newImageName,
                vacation.id
            ];

            if (oldImageName) await fileSaver.delete(oldImageName);

        } else {

            sql = `
                UPDATE vacations
                SET destination=$1, description=$2, "startDate"=$3,
                    "endDate"=$4, price=$5
                WHERE id=$6
                RETURNING *
            `;

            values = [
                vacation.destination,
                vacation.description,
                vacation.startDate,
                vacation.endDate,
                vacation.price,
                vacation.id
            ];
        }

        const vacations = await dal.execute<VacationModel>(sql, values);
        if (!vacations.length)
            throw new ClientError(StatusCode.NotFound, `id ${vacation.id} not exist`);

        return vacations[0];
    }

    public async deleteVacation(id: number): Promise<void> {

        const oldImageName = await this.getImageName(id);

        const sql = `
            DELETE FROM vacations
            WHERE id=$1
        `;

        const affected = await dal.executeNonQuery(sql, [id]);

        if (affected === 0)
            throw new ClientError(StatusCode.NotFound, `id ${id} not found`);

        if (oldImageName) await fileSaver.delete(oldImageName);
    }

    private async getImageName(id: number): Promise<string | null> {

        const sql = `
            SELECT "imageName"
            FROM vacations
            WHERE id=$1
        `;

        const result = await dal.execute<{ imageName: string }>(sql, [id]);
        return result[0]?.imageName ?? null;
    }

    public async likeVacation(userId: number, vacationId: number): Promise<void> {

        const sql = `
            INSERT INTO likes (userId, vacationId)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `;

        await dal.execute(sql, [userId, vacationId]);
    }

    public async unlikeVacation(userId: number, vacationId: number): Promise<void> {

        const sql = `
            DELETE FROM likes
            WHERE userId=$1 AND vacationId=$2
        `;

        await dal.executeNonQuery(sql, [userId, vacationId]);
    }

    public async getVacationLikes(
    vacationId: number,
    userId: number
): Promise<{ likesCount: number; isLikedByUser: boolean }> {

    const sql = `
        SELECT
            COUNT(*)::int AS "likesCount",
            EXISTS (
                SELECT 1 FROM likes
                WHERE "vacationId" = $1 AND "userId" = $2
            ) AS "isLikedByUser"
        FROM likes
        WHERE "vacationId" = $1
    `;

    const [result] = await dal.execute<{
        likesCount: number;
        isLikedByUser: boolean;
    }>(sql, [vacationId, userId]);

    return result;
}


    public async getAllVacationsLikes(): Promise<LikesModel[]> {

        const sql = `
            SELECT
                v.destination AS "vacationName",
                COUNT(l.userId) AS likes
            FROM vacations v
            LEFT JOIN likes l ON v.id = l.vacationId
            GROUP BY v.id, v.destination
        `;

        return await dal.execute<LikesModel>(sql);
    }
}

export const vacationService = new VacationService();
