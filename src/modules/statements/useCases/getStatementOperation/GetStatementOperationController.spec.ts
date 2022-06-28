import { Connection } from 'typeorm';
import createConnection from '../../../../database';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { app } from '../../../../app';

let connection: Connection;
let password = 'admin';
const _baseApi = '/api/v1/statements/';
const id = uuidv4();

describe("Get statement controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        const hashedPassword = await hash(password, 8);

        await connection.query(`
            insert into users (id, name, email, password, created_at, updated_at)
            values('${id}', 'admin', 'admin@testschallange.com', '${hashedPassword}', 'now()', 'now()')`);
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("Should be able to get a statement", async () => {
        const authenticateResponse = await request(app)
            .post(`/api/v1/sessions`)
            .send({
                email: "admin@testschallange.com",
                password,
            });

        const { token } = authenticateResponse.body;

        const deposit = await request(app)
            .post(`${_baseApi}deposit`)
            .send({
                amount: 100, 
                description: "first deposit"
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        const statement = await request(app)
            .get(`${_baseApi}${deposit.body.id}`)
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(statement.status).toBe(200);
    });

    it("Should not be able to get unexisting statement", async () => {
        const authenticateResponse = await request(app)
            .post(`/api/v1/sessions`)
            .send({
                email: "admin@testschallange.com",
                password,
            });

        const { token } = authenticateResponse.body;

        const unexistingId = uuidv4();

        const statement = await request(app)
            .get(`${_baseApi}${unexistingId}`)
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(statement.status).toBe(404);
    });

    it("Should not be able to get statement from unexisting user", async () => {
        const authenticateResponse = await request(app)
            .post(`/api/v1/sessions`)
            .send({
                email: "admin@testschallange.com",
                password,
            });

        const { token } = authenticateResponse.body;

        await connection.query(`DELETE FROM users WHERE id=$1`, [id]);

        const statement = await request(app)
            .get(`${_baseApi}${id}`)
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(statement.status).toBe(404);
    });
})