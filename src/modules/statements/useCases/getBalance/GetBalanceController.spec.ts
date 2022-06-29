import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
const password = "admin";
const baseApi = "/api/v1/statements/";
const id = uuidv4();
let routesToken: string;

describe("Get ballance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const hashedPassword = await hash(password, 8);

    await connection.query(`
            insert into users (id, name, email, password, created_at, updated_at)
            values('${id}', 'admin', 'admin@testschallange.com', '${hashedPassword}', 'now()', 'now()')`);

    const authenticateResponse = await request(app)
      .post(`/api/v1/sessions`)
      .send({
        email: "admin@testschallange.com",
        password,
      });

    routesToken = authenticateResponse.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get balance from logged user", async () => {
    await request(app)
      .post(`${baseApi}deposit`)
      .send({
        amount: 100,
        description: "first deposit",
      })
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    const getUserBalance = await request(app)
      .get(`${baseApi}balance`)
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(getUserBalance.status).toBe(200);
    expect(getUserBalance.body).toHaveProperty("statement");
  });

  it("Should not be able to return balance if user does not exist", async () => {
    await connection.query(`DELETE FROM users WHERE id=$1`, [id]);

    const getUserBalance = await request(app)
      .get(`${baseApi}balance`)
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(getUserBalance.status).toBe(404);
  });
});
