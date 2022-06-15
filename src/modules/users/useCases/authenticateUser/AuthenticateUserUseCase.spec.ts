import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository;
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    })

    it("Shoud be able to authenticate a user", async () => { 
        await createUserUseCase.execute({
            name: "User test",
            email: "usertest@gmail.com",
            password: "userpasstest"
        });

        const response = await authenticateUserUseCase.execute({
            email: "usertest@gmail.com", 
            password: "userpasstest"
        });

        expect(response).toHaveProperty("user");
        expect(response).toHaveProperty("token");
    })
})