import mysql2, { PoolOptions, QueryError, QueryResult } from "mysql2";
import { appConfig } from "./app-config";


class DAL {

    private options: PoolOptions = {
        host: appConfig.host,
        user: appConfig.user,
        password: appConfig.password,
        database: appConfig.database
    };


    private readonly connection = mysql2.createPool(this.options);

    public execute(sql: string, values?: Array<number | string>): Promise<QueryResult> {

        return new Promise<QueryResult>((resolve, reject) => { 

            this.connection.query(sql, values, (err: QueryError, result: QueryResult) => {

                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);

            });
        });
    }
}

export const dal = new DAL()