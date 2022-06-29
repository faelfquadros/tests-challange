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

describe("Get statement controller", () => {
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

  it("Should be able to get a statement", async () => {
    const deposit = await request(app)
      .post(`${baseApi}deposit`)
      .send({
        amount: 100,
        description: "first deposit",
      })
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    const statement = await request(app)
      .get(`${baseApi}${deposit.body.id}`)
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(statement.status).toBe(200);
  });

  it("Should not be able to get unexisting statement", async () => {
    const unexistingId = uuidv4();

    const statement = await request(app)
      .get(`${baseApi}${unexistingId}`)
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(statement.status).toBe(404);
  });

  it("Should not be able to get statement from unexisting user", async () => {
    await connection.query(`DELETE FROM users WHERE id=$1`, [id]);

    const statement = await request(app)
      .get(`${baseApi}${id}`)
      .set({
        Authorization: `Bearer ${routesToken}`,
      });

    expect(statement.status).toBe(404);
  });
});
