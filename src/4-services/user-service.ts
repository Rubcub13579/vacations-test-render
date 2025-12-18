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

        const sql = `
  INSERT INTO users
  ("firstName", "lastName", email, password, "roleId")
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *
`;

        const values = [
            user.firstName,
            user.lastName,
            user.email,
            user.password,
            RoleModel.user,
        ];

        try {
            const [dbUser] = await dal.execute<UserModel>(sql, values);
            const token = cyber.getNewToken(dbUser);
            return token;
        } catch (err: any) {
            if (err.code === "23505") {
                throw new ClientError(StatusCode.Conflict, "Email is already taken");
            }
            throw err;
        }
    }

    public async login(credentials: CredentialsModel): Promise<string> {

        credentials.validate();

        credentials.password = cyber.hash(credentials.password);

        const sql = `
  SELECT *
  FROM users
  WHERE email = $1 AND password = $2
`;

        const users = await dal.execute<UserModel>(sql, [
            credentials.email,
            credentials.password,
        ]);

        if (!users.length)
            throw new ClientError(
                StatusCode.Unauthorized,
                "Incorrect email or password"
            );

        return cyber.getNewToken(users[0]);
    }
}

export const userService = new UserService();
