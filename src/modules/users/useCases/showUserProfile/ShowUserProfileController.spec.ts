import { Connection } from 'typeorm';
import createConnection from '../../../../database';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { app } from '../../../../app';

let connection: Connection;
let password = 'admin';
const _baseApi = '/api/v1/';
const fakeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODFlMzliOGEtOTgxYS00MzNkLWExYTUtMWQ4NGE4OTU5OWUzIiwibmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0c2NoYWxsYW5nZS5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRzSUx1Nm5HNTJncEdUelV1cGJRbmxld1pkdkpXbTNINWdxbE1kYlRpV3ltWTF5Lnh6UXlaaSIsImNyZWF0ZWRfYXQiOiIyMDIyLTA2LTI2VDIzOjI0OjQzLjE2NFoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wNi0yNlQyMzoyNDo0My4xNjRaIn0sImlhdCI6MTY1NjI3NTA4MywiZXhwIjoxNjU2MzYxNDgzLCJzdWIiOiI4MWUzOWI4YS05ODFhLTQzM2QtYTFhNS0xZDg0YTg5NTk5ZTMifQ.F_vdZg6msHCTjmVXGG1EjfrP3zwU43V5z-bOJRnOm8c`;

describe('Show user profile controller', () => {
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

    it('Should be able to get logged user profile', async () => {
        const authenticateResponse = await request(app)
            .post(`${_baseApi}sessions`)
            .send({
                email: "admin@testschallange.com",
                password,
            });

        const { token } = authenticateResponse.body;

        const showProfileResponse = await request(app)
            .get(`${_baseApi}profile`)
            .set({
                Authorization: `Bearer ${token}`,
            });
        
        expect(showProfileResponse.status).toBe(200);
    });

    it('Should not be able to get a user profile if user does not exist', async () => {
        const showProfileResponse = await request(app)
            .get(`${_baseApi}profile`)
            .set({
                Authorization: `Bearer ${fakeToken}`,
            });
        
        expect(showProfileResponse.status).toBe(404);
    });
})