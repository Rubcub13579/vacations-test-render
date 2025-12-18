import dotenv from "dotenv";
dotenv.config();

class AppConfig {

    public readonly environment = process.env.ENVIRONMENT;
    public readonly isDevelopment = this.environment === "development";
    public readonly isTest = this.environment === "test";
    public readonly isStage = this.environment === "stage";
    public readonly isProduction = this.environment === "production";

    public readonly port = Number(process.env.PORT);

    // PostgreSQL
    public readonly dbHost = process.env.DB_HOST;
    public readonly dbPort = Number(process.env.DB_PORT);
    public readonly dbName = process.env.DB_NAME;
    public readonly dbUser = process.env.DB_USER;
    public readonly dbPassword = process.env.DB_PASSWORD;

    public readonly imagesUrl = process.env.IMAGES_URL;
    public readonly hashSalt = process.env.HASH_SALT;
}

export const appConfig = new AppConfig();
