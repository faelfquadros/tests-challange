import { Connection } from 'typeorm';
import createConnection from '../../../../database';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { app } from '../../../../app';

let connection: Connection;
let password = 'admin';
const _baseApi = '/api/v1/statements/';

describe("Get ballance controlle", () => {
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

    it("Should be able to get balance from logged user", async () => {
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
                amount: 100.50, 
                description: "first deposit"
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        const getUserBalance = await request(app)
            .get(`${_baseApi}balance`)
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(getUserBalance.status).toBe(200);
        expect(getUserBalance.body).toHaveProperty("statement");
    });
})