import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository;
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    })

    it("Should be able to authenticate a user", async () => { 
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
    });

    it("Should emit unauthorized error if email is invalid", async () => { 
        await createUserUseCase.execute({
            name: "User test",
            email: "usertest@gmail.com",
            password: "userpasstest"
        });

        expect(async () => {
            await authenticateUserUseCase.execute({
                email: "usertest1@gmail.com", 
                password: "userpasstest"
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

    it("Should emit unauthorized error if password is invalid", async () => { 
        await createUserUseCase.execute({
            name: "User test",
            email: "usertest@gmail.com",
            password: "userpasstest"
        });

        expect(async () => {
            await authenticateUserUseCase.execute({
                email: "usertest@gmail.com", 
                password: "userpasstestts"
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    })
})