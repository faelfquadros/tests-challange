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

describe("Statement controller", () => {
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

  it("Should be able to create a deposit statement", async () => {
    const deposit = await request(app)
      .post(`${baseApi}deposit`)
      .send({
        amount: 100,
        description: "first deposit",
      })
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(deposit.status).toBe(201);
  });

  it("Should be able to create a withdraw statement", async () => {
    await request(app)
      .post(`${baseApi}deposit`)
      .send({
        amount: 100,
        description: "first deposit",
      })
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    const withdraw = await request(app)
      .post(`${baseApi}withdraw`)
      .send({
        amount: 50,
        description: "first deposit",
      })
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(withdraw.status).toBe(201);
  });

  it("Should not be able to create a withdraw statement if balance is less than the amount", async () => {
    const withdraw = await request(app)
      .post(`${baseApi}withdraw`)
      .send({
        amount: 500,
        description: "first deposit",
      })
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(withdraw.status).toBe(400);
  });

  it("Should not be able to create a deposit or withdraw statement if user does not exist", async () => {
    await connection.query(`DELETE FROM users WHERE id=$1`, [id]);

    const deposit = await request(app)
      .post(`${baseApi}deposit`)
      .send({
        amount: 100.5,
        description: "first deposit",
      })
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(deposit.status).toBe(404);
  });
});
