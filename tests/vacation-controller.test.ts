import { expect } from "chai";
import { describe, it } from "mocha";
import path from "path";
import supertest from "supertest";
import { StatusCode } from "../src/3-models/enums";
import { LikesModel } from "../src/3-models/like-model";
import { VacationModel } from "../src/3-models/vacation-model";
import { app } from "../src/app";



describe("Testing VacationController", () => {

    // gets an admin token

    let token: string;

    before(async () => {
        const credentials = { email: "bart@gmail.com", password: "1234" };
        const loginResponse = await supertest(app.server)
            .post("/api/login")
            .send(credentials);
        token = loginResponse.body;
    })


    it("should return vacations array", async () => {
        const response = await supertest(app.server).get("/api/vacations").auth(token, { type: "bearer" })
        const vacations: VacationModel[] = response.body;
        expect(vacations.length).to.be.greaterThanOrEqual(1);
        expect(vacations[0]).to.contains.keys("id", "destination", "description", "startDate", "endDate", "price", "imageUrl")
        expect(vacations[0]).to.not.be.empty;
    });

    it("should return one vacation", async () => {
        const response = await supertest(app.server).get("/api/vacations/7").auth(token, { type: "bearer" })
        const vacation: VacationModel = response.body;
        expect(vacation).to.contains.keys("id", "destination", "description", "startDate", "endDate", "price", "imageUrl")
        expect(vacation).to.not.be.empty;
    });

    it("should add a new vacation", async () => {
        const imagePath = path.join(__dirname, "resources", "pizza.jpeg");
        const response = await supertest(app.server)
            .post("/api/vacations")
            .auth(token, { type: "bearer" })
            .field("destination", "country name")
            .field("description", "description of country")
            .field("startDate", "2026-12-21")
            .field("endDate", "2027-12-21")
            .field("price", 2000)
            .attach("image", imagePath);
        const dbVacation: VacationModel = response.body;
        expect(dbVacation).to.not.be.empty;
        expect(dbVacation).to.contain.keys("id", "destination", "description", "startDate", "endDate", "price", "imageUrl");
    });

    it("should return all vacations likes", async () => {
        const response = await supertest(app.server).get("/api/all-likes").auth(token, { type: "bearer" })
        const likes: LikesModel[] = response.body;
        expect(likes[0]).to.not.be.empty;
        expect(likes[0]).to.contains.keys("vacationName", "likes");
    });

    it("should return the amount of likes and boolean if user liked the current vacation", async () => {
        const response = await supertest(app.server).get("/api/vacations/like/6").auth(token, { type: "bearer" })
        const like: LikesModel = response.body;
        expect(like).to.not.be.empty;
        expect(like).to.contains.keys("likesCount", "isLikedByUser");
    });

    it("should return 404 error on route not found", async () => {
        const response = await supertest(app.server).get("/api/unExistingUrl");
        expect(response.status).to.be.equal(StatusCode.NotFound);
    });

    it("should return 404 error on resource not found", async () => {
        const response = await supertest(app.server).get("/api/vacations/33333333");
        expect(response.status).to.be.equal(StatusCode.NotFound);
    });


});