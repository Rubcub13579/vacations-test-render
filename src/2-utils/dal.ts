import { Pool } from "pg";
import { appConfig } from "./app-config";

class DAL {

    private pool = new Pool({
        host: appConfig.dbHost,
        port: appConfig.dbPort,
        database: appConfig.dbName,
        user: appConfig.dbUser,
        password: appConfig.dbPassword,
        ssl: { rejectUnauthorized: false } // REQUIRED on Render
    });

    public async execute<T>(sql: string, values?: any[]): Promise<T[]> {
        const result = await this.pool.query(sql, values);
        return result.rows;
    }

    public async executeNonQuery(sql: string, values?: any[]): Promise<number> {
        const result = await this.pool.query(sql, values);
        return result.rowCount ?? 0;
    }
}

export const dal = new DAL();
