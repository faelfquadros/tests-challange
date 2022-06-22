import { Statement } from '../../entities/Statement';
import { User } from '../../../users/entities/User';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { GetStatementOperationError } from './GetStatementOperationError';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
    
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    });
    
    it("Should be able to get statement operation", async () => {
        const newUser: User = await createUserUseCase.execute({
            name: "user test",
            email: "emailteste@gmail.com",
            password: "password"
        });

        const type = "deposit" as OperationType;

        const newStatementOperation: Statement = await createStatementUseCase.execute({
            amount: 1000,
            description: "Salary",
            type,
            user_id: newUser.id as string
        });

        const statementOperation = await getStatementOperationUseCase.execute({
            user_id: newUser.id as string,
            statement_id: newStatementOperation.id as string
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
            await getStatementOperationUseCase.execute({
                user_id: 'user_id',
                statement_id: 'statement_id'
            });
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
    });

    it("Should return error if user does not exists", async () => {
        expect(async () => {
            const newUser: User = await createUserUseCase.execute({
                name: "user test",
                email: "emailteste@gmail.com",
                password: "password"
            });

            await getStatementOperationUseCase.execute({
                user_id: newUser.id as string,
                statement_id: 'statement_id'
            });
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    });
})