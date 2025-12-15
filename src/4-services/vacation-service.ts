import { OkPacketParams } from "mysql2";
import { fileSaver } from "uploaded-file-saver";
import { appConfig } from "../2-utils/app-config";
import { dal } from "../2-utils/dal";
import { ClientError } from "../3-models/client-error";
import { StatusCode } from "../3-models/enums";
import { LikesModel } from "../3-models/like-model";
import { VacationModel } from "../3-models/vacation-model";

class VacationService {

    public async getAllVacations(): Promise<VacationModel[]> {
        const sql = "select id,destination, description, startDate, endDate, price, concat(?, imageName) as imageUrl from vacations order by startDate";
        const values = [appConfig.imagesUrl]

        const vacations = await dal.execute(sql, values) as VacationModel[];
        return vacations;
    }

    public async getOneVacation(vacationId: number): Promise<VacationModel> {

        const sql = "select *, concat(?, imageName) as imageUrl from vacations where id = ?";
        const values = [appConfig.imagesUrl, vacationId];

        const vacations = await dal.execute(sql, values) as VacationModel[]
        const vacation = vacations[0];
        return vacation
    }

    public async addVacation(vacation: VacationModel): Promise<VacationModel> {

        vacation.validate();

        const imageName = vacation.image ? await fileSaver.add(vacation.image) : null;

        const sql = "insert into vacations (destination, description, startDate, endDate, price, imageName) values(?, ?, ?, ?, ?, ?)";
        const values = [vacation.destination, vacation.description, vacation.startDate, vacation.endDate, vacation.price, imageName];

        const info = await dal.execute(sql, values) as OkPacketParams

        const dbVacation = await this.getOneVacation(info.insertId);
        console.log(dbVacation);

        return dbVacation;
    }

    public async updateVacation(vacation: VacationModel): Promise<VacationModel> {

        vacation.validate();
        let sql: string;
        let values: any[];

        // If a new image is provided, update everything including the image
        if (vacation.image) {
            // Get the old image name to delete it later
            const oldImageName = await this.getImageName(vacation.id);

            // Save the new image
            const newImageName = await fileSaver.add(vacation.image);

            sql = "UPDATE vacations SET destination = ?, description = ?, startDate = ?, endDate = ?, price = ?, imageName = ? WHERE id = ?";
            values = [vacation.destination, vacation.description, vacation.startDate, vacation.endDate, vacation.price, newImageName, vacation.id];

            // Delete the old image after successful update
            if (oldImageName) {
                await fileSaver.delete(oldImageName);
            }
        } else {
            // No new image provided, update everything except the image
            sql = "UPDATE vacations SET destination = ?, description = ?, startDate = ?, endDate = ?, price = ? WHERE id = ?";
            values = [vacation.destination, vacation.description, vacation.startDate, vacation.endDate, vacation.price, vacation.id];
        }

        const info = await dal.execute(sql, values) as OkPacketParams;

        if (info.affectedRows === 0) throw new ClientError(StatusCode.NotFound, `id ${vacation.id} not exist`);

        const dbVacation = await this.getOneVacation(vacation.id);
        console.log(dbVacation);

        return dbVacation;

    }

    public async deleteVacation(id: number): Promise<void> {
        const oldFileName = await this.getImageName(id);
        const sql = "delete from vacations where id = ?";
        const values = [id];
        const info = await dal.execute(sql, values) as OkPacketParams;
        if (info.affectedRows === 0) throw new ClientError(StatusCode.NotFound, `id ${id} not found`);
        await fileSaver.delete(oldFileName);
    }

    private async getImageName(id: number): Promise<string> {
        const sql = "select imageName from vacations where id = ?";
        const values = [id];
        const vacations = await dal.execute(sql, values);
        const vacation = vacations[0];
        if (!vacation) return null;
        return vacation.imageName
    }

    public async likeVacation(userId: number, vacationId: number): Promise<void> {
        const checkSql = "SELECT * FROM likes WHERE userId = ? AND vacationId = ?";
        const values = [userId, vacationId];
        const existing = await dal.execute(checkSql, values);
        if ((existing as any[]).length > 0) return;
        const insertSql = "INSERT INTO likes (userId, vacationId) values(?,?)";
        await dal.execute(insertSql, values);
    }

    public async unlikeVacation(userId: number, vacationId: number): Promise<void> {
        const sql = "DELETE FROM likes WHERE userId = ? AND vacationId = ?";
        const values = [userId, vacationId];
        await dal.execute(sql, values)
    }

    // shows user how many likes vacation has and if he liked it 
    public async getVacationLikes(vacationId: number, userId: number): Promise<{ likesCount: number, isLikedByUser: boolean }> {
        const sql = `
            SELECT
                (SELECT COUNT(*) FROM likes WHERE vacationId = ?) AS likesCount,
                EXISTS(SELECT * FROM likes WHERE vacationId = ? AND userId = ?) AS isLikedByUser
        `;
        const values = [vacationId, vacationId, userId]
        const result = await dal.execute(sql, values);

        return {
            likesCount: result[0].likesCount,
            isLikedByUser: result[0].isLikedByUser === 1
        };
    }

    // gets array of all vacation names and how many likes it has
    public async getAllVacationsLikes(): Promise<LikesModel[]> {
        const sql = `
        SELECT v.destination AS vacationName, COUNT(l.userId) AS likes FROM
        vacations as v LEFT JOIN likes as l ON v.id = l.vacationId
        GROUP BY v.id, v.destination ;
        `;
        const vacationsLikes = await dal.execute(sql) as LikesModel[];
        return vacationsLikes;
    }





}




export const vacationService = new VacationService();