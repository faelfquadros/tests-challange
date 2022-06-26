import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database';
import request from 'supertest';

let connection: Connection;
const _baseApi = '/api/v1/';

describe("Authenticate user", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("Should be able to authenticate a user", async () => {

        await request(app)
            .post(`${_baseApi}users`)
            .send({
                name: "User test",
                email: "user@test.com",
                password: "userpassword",
            });

        const response = await request(app)
            .post(`${_baseApi}sessions`)
            .send({
                email: "user@test.com",
                password: "userpassword",
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("token");
        expect(typeof response.body.token).toBe("string");
    });
})