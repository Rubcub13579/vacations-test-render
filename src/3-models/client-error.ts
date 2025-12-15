import { StatusCode } from "./enums"


export class ClientError {

    public status: StatusCode;
    public message: string;

    public constructor(status: number, message: string) {
        this.status = status;
        this.message = message;
    }


}