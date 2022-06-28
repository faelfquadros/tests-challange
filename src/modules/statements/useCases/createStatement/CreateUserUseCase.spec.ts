import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to make a deposit", async () => {
    const newUser: User = await createUserUseCase.execute({
      name: "user test",
      email: "emailteste@gmail.com",
      password: "password",
    });

    const type = "deposit" as OperationType;

    const statementOperation = await createStatementUseCase.execute({
      amount: 1000,
      description: "Salary",
      type,
      user_id: newUser.id as string,
    });

    expect(statementOperation).toBeInstanceOf(Statement);
    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toHaveProperty("user_id");
    expect(statementOperation).toHaveProperty("type");
    expect(statementOperation).toHaveProperty("amount");
    expect(statementOperation).toHaveProperty("description");
  });

  it("Should be able to make a deposit", async () => {
    const newUser: User = await createUserUseCase.execute({
      name: "user test",
      email: "emailteste@gmail.com",
      password: "password",
    });

    const typeAsDeposit = "deposit" as OperationType;

    await createStatementUseCase.execute({
      amount: 1000,
      description: "Salary",
      type: typeAsDeposit,
      user_id: newUser.id as string,
    });

    const typeAsWithdraw = "withdraw" as OperationType;

    const statementOperation = await createStatementUseCase.execute({
      amount: 500,
      description: "Salary",
      type: typeAsWithdraw,
      user_id: newUser.id as string,
    });

    expect(statementOperation).toBeInstanceOf(Statement);
    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toHaveProperty("user_id");
    expect(statementOperation).toHaveProperty("type");
    expect(statementOperation).toHaveProperty("amount");
    expect(statementOperation).toHaveProperty("description");
  });

  it("Should return error if user does not exists", async () => {
    expect(async () => {
      const typeAsDeposit = "deposit" as OperationType;

      await createStatementUseCase.execute({
        amount: 1000,
        description: "Salary",
        type: typeAsDeposit,
        user_id: "user_id",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should return error it trying withdraw with not enough funds", async () => {
    expect(async () => {
      const newUser: User = await createUserUseCase.execute({
        name: "user test",
        email: "emailteste@gmail.com",
        password: "password",
      });

      const typeAsWithdraw = "withdraw" as OperationType;

      await createStatementUseCase.execute({
        amount: 200,
        description: "Salary",
        type: typeAsWithdraw,
        user_id: newUser.id as string,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
