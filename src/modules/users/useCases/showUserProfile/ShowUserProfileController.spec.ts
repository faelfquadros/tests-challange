import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
const password = "admin";
const baseApi = "/api/v1/";
const id = uuidv4();

describe("Show user profile controller", () => {
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

  it("Should be able to get logged user profile", async () => {
    const authenticateResponse = await request(app)
      .post(`${baseApi}sessions`)
      .send({
        email: "admin@testschallange.com",
        password,
      });

    const { token } = authenticateResponse.body;

    const showProfileResponse = await request(app)
      .get(`${baseApi}profile`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(showProfileResponse.status).toBe(200);
  });

  it("Should not be able to get a user profile if user does not exist", async () => {
    const authenticateResponse = await request(app)
      .post(`${baseApi}sessions`)
      .send({
        email: "admin@testschallange.com",
        password,
      });

    const { token } = authenticateResponse.body;

    await connection.query(`DELETE FROM users WHERE id=$1`, [id]);

    const showProfileResponse = await request(app)
      .get(`${baseApi}profile`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(showProfileResponse.status).toBe(404);
  });
});
