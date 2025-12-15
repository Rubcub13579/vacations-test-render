import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { RoleModel } from "../3-models/role-model";
import { UserModel } from "../3-models/user-Model";
import { appConfig } from "./app-config";





class Cyber {

    public getNewToken(user: UserModel): string {

        delete user.password;

        const payload = { user };
        const options: SignOptions = { expiresIn: "3h" };

        const token = jwt.sign(payload, "TheAmazingClassOf4578-111", options);
        return token;

    }


    public validationToken(token: string): boolean {
        try {
            if (!token) return false;
            jwt.verify(token, "TheAmazingClassOf4578-111");
            return true
        }
        catch (err: any) {
            return false;
        }
    }


    public validationAdmin(token: string): boolean {
        const payload = jwt.decode(token) as { user: UserModel };
        const user = payload.user;
        return user.roleId === RoleModel.admin;
    }


    public hash(plainText: string): string {
        const hashedText = crypto.createHmac("sha512", appConfig.hashSalt).update(plainText).digest("hex");
        return hashedText
    }

    public getUserFromToken(token: string): UserModel {
        const payload = jwt.verify(token, "TheAmazingClassOf4578-111") as { user: UserModel };
        return payload.user;
    }
    

}


export const cyber = new Cyber() 