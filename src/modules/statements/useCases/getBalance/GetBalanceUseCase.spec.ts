import { User } from '../../../users/entities/User';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { GetBalanceError } from './GetBalanceError';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {
    
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    });
    
    it("Should be able to get the user balance", async () => {
        const newUser: User = await createUserUseCase.execute({
            name: "user test",
            email: "emailteste@gmail.com",
            password: "password"
        });

        const type = "deposit" as OperationType;

        await createStatementUseCase.execute({
            amount: 1000,
            description: "Salary",
            type,
            user_id: newUser.id as string
        });

        const balance = await getBalanceUseCase.execute({
            user_id: newUser.id as string
        });

        expect(balance).toHaveProperty("statement");
        expect(balance.statement.length).toBe(1)
        expect(balance).toHaveProperty("balance");
    });

    it("Should return error if user does not exists", async () => {
        expect(async () => {
            await getBalanceUseCase.execute({
                user_id: "user_id"
            });
        }).rejects.toBeInstanceOf(GetBalanceError);
    });
})