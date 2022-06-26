import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
const _baseApi = '/api/v1/';

describe("Create user controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("Should be able to create a new user", async () => {
        const response = await request(app)
            .post(`${_baseApi}users`)
            .send({
                name: "User test",
                email: "user@test.com",
                password: "userpassword",
            });

        expect(response.status).toBe(201);
    });

    it("Should be able to create an user with the same email", async () => {
        await request(app)
            .post(`${_baseApi}users`)
            .send({
                name: "User test",
                email: "user@test.com",
                password: "userpassword",
            });

        const response = await request(app)
            .post(`${_baseApi}users`)
            .send({
                name: "User test",
                email: "user@test.com",
                password: "userpassword",
            });

        expect(response.status).toBe(400);
    });
});