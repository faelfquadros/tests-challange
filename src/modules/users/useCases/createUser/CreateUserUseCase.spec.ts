import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create new User", () => { 
    
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    })
    
    it("Shoud be able to create a new user", async () => { 
        const user = await createUserUseCase.execute({
            name: "user test",
            email: "emailteste@gmail.com",
            password: "password"
        });

        expect(user).toBeInstanceOf(User);
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("password");
    });

    it("Shoud return conflict if user already exists", async () => { 
        await createUserUseCase.execute({
            name: "user test",
            email: "emailteste@gmail.com",
            password: "password"
        });

        expect(async () => {
            await createUserUseCase.execute({
                name: "user test",
                email: "emailteste@gmail.com",
                password: "password"
            });
        }).rejects.toBeInstanceOf(CreateUserError);
    });
})