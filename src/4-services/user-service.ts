import { OkPacketParams } from "mysql2";
import { cyber } from "../2-utils/cyber";
import { dal } from "../2-utils/dal";
import { ClientError } from "../3-models/client-error";
import { CredentialsModel } from "../3-models/credential-model";
import { StatusCode } from "../3-models/enums";
import { RoleModel } from "../3-models/role-model";
import { UserModel } from "../3-models/user-Model";


class UserService {


    public async register(user: UserModel): Promise<string> {

        user.password = cyber.hash(user.password);

        const sql = "INSERT INTO users (firstName, lastName, email, password, roleId) VALUES (?, ?, ?, ?, ?)";
        const values = [user.firstName, user.lastName, user.email, user.password, RoleModel.user];

        try {
            const info: OkPacketParams = await dal.execute(sql, values) as OkPacketParams;
            user.id = info.insertId;
            user.roleId = RoleModel.user;
            const token = cyber.getNewToken(user);
            return token;
        }
        catch (err: any) {
            if (err.code === "ER_DUP_ENTRY") {
                throw new ClientError(StatusCode.Conflict, "Email is already taken");
            }
            throw err;
        }
    }


    public async login(credentials: CredentialsModel): Promise<string> {

        credentials.password = cyber.hash(credentials.password);

        const sql = "select * from users where email = ? and password = ?";
        const values = [credentials.email, credentials.password];

        const users = await dal.execute(sql, values) as UserModel[];
        const user = users[0];

        if (!user) throw new ClientError(StatusCode.Unauthorized, "Incorrect email or password");

        const token = cyber.getNewToken(user);

        return token;

    }
}

export const userService = new UserService();
