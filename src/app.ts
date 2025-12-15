import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import requestIp from "request-ip";
import { fileSaver } from "uploaded-file-saver";
import { appConfig } from "./2-utils/app-config";
import { userController } from "./5-controllers/user-controller";
import { vacationsController } from "./5-controllers/vacations-controller";
import { errorMiddleware } from "./6-middleware/error-middleware";

const port = appConfig.port || 3001

class App {


    public readonly server = express();

    public start(): void {

        this.server.use(cors())
        //Request body creating
        this.server.use(express.json({ limit: "10mb" }));

        // file upload
        this.server.use(fileUpload({
            limits: { fileSize: 10 * 1024 * 1024 },
            abortOnLimit: true,
            createParentPath: true
        }));

        //IP Request
        this.server.use(requestIp.mw());

        fileSaver.config(path.join(__dirname, "1-assets", "images"))


        this.server.use("/", vacationsController.router);
        this.server.use("/", userController.router);

        //Error middleware
        this.server.use("*", errorMiddleware.routeNotFound);
        this.server.use(errorMiddleware.catchAll);

        this.server.listen(port, () => console.log("Listening on http://localhost:" + port));

    }
}

export const app = new App()
app.start();