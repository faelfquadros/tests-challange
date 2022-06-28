import { Statement } from '../../entities/Statement';
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

describe("Statement controller", () => {
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

    it("Should be able to create a deposit statement", async () => {
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

        expect(deposit.status).toBe(201);
    });

    it("Should be able to create a withdraw statement", async () => {
        const authenticateResponse = await request(app)
            .post(`/api/v1/sessions`)
            .send({
                email: "admin@testschallange.com",
                password,
            });

        const { token } = authenticateResponse.body;

        await request(app)
            .post(`${_baseApi}deposit`)
            .send({
                amount: 100, 
                description: "first deposit"
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        const withdraw = await request(app)
            .post(`${_baseApi}withdraw`)
            .send({
                amount: 50, 
                description: "first deposit"
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(withdraw.status).toBe(201);
    });

    it("Should not be able to create a withdraw statement if balance is less than the amount", async () => {
        const authenticateResponse = await request(app)
            .post(`/api/v1/sessions`)
            .send({
                email: "admin@testschallange.com",
                password,
            });

        const { token } = authenticateResponse.body;

        const withdraw = await request(app)
            .post(`${_baseApi}withdraw`)
            .send({
                amount: 500, 
                description: "first deposit"
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(withdraw.status).toBe(400);
    });

    it("Should not be able to create a deposit or withdraw statement if user does not exist", async () => {
        const authenticateResponse = await request(app)
            .post(`/api/v1/sessions`)
            .send({
                email: "admin@testschallange.com",
                password,
            });

        const { token } = authenticateResponse.body;

        await connection.query(`DELETE FROM users WHERE id=$1`, [id]);

        const deposit = await request(app)
            .post(`${_baseApi}deposit`)
            .send({
                amount: 100.50, 
                description: "first deposit"
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(deposit.status).toBe(404);
    });
})