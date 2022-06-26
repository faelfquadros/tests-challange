import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database';
import request from 'supertest';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

let connection: Connection;
const _baseApi = '/api/v1/';
let password = 'admin';

describe("Authenticate user controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        const id = uuidv4();
        const hashedPassword = await hash(password, 8);

        await connection.query(`
            insert into users (id, name, email, password, created_at, updated_at)
            values('${id}', 'admin', 'admin@testschallange.com', '${hashedPassword}', 'now()', 'now()')`);
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("Should be able to authenticate a user", async () => {
        const response = await request(app)
            .post(`${_baseApi}sessions`)
            .send({
                email: "admin@testschallange.com",
                password,
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("token");
        expect(typeof response.body.token).toBe("string");
    });

    it("Should not be able to authenticate user that passes wrong email", async () => {
        const response = await request(app)
            .post(`${_baseApi}sessions`)
            .send({
                email: "wrongemail@testschallange.com",
                password,
            });

        expect(response.status).toBe(401);
    });

    it("Should not be able to authenticate user that passes wrong password", async () => {
        const response = await request(app)
            .post(`${_baseApi}sessions`)
            .send({
                email: "admin@testschallange.com",
                password: "wrongpassword",
            });

        expect(response.status).toBe(401);
    });
})