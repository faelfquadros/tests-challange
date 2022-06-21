import { User } from './../../entities/User';
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ShowUserProfileError } from './ShowUserProfileError';

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    })

    it("Shoud be able to get a user profile by id", async () => {
        const newUser: User = await createUserUseCase.execute({
            name: "user test",
            email: "emailteste@gmail.com",
            password: "password"
        });

        const user = await showUserProfileUseCase.execute(newUser.id as string);

        expect(user).toBeInstanceOf(User);
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("password");
    });

    it("Shoud return error if user does not exists", async () => {
        expect(async () => {
            await showUserProfileUseCase.execute('user_id');
        }).rejects.toBeInstanceOf(ShowUserProfileError);
    });

})