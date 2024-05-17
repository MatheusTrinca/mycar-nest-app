import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      findOne(id: number) {
        const user = users.find((user) => user.id === id);
        return Promise.resolve(user);
      },

      find(email: string) {
        const user = users.filter((user) => user.email === email);
        return Promise.resolve(user);
      },

      update(id: number, attrs: Partial<User>) {
        const user = users.find((user) => user.id === id);
        Object.assign(user, attrs);
        return Promise.resolve(user);
      },

      remove(id: number) {
        const user = users.find((user) => user.id === id);
        if (!user) {
          throw new NotFoundException('User not found');
        }
        users.splice(users.indexOf(user), 1);

        return Promise.resolve(user);
      },
    };

    fakeAuthService = {
      signup(email: string, password: string) {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;

        users.push(user);

        return Promise.resolve(user);
      },

      signin(email: string, password: string) {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;

        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should returns a list of users with the given email', async () => {
    const session = { usersId: -10 };
    await controller.createUser(
      { email: 'asdf@test.com', password: 'asdf' },
      session,
    );
    const users = await controller.findAll('asdf@test.com');

    expect(users.length).toEqual(1);
  });

  it('should returns a single user with the given id', async () => {
    const session = { usersId: -10 };
    const user = await controller.createUser(
      { email: 'asdf@test.com', password: 'asdf' },
      session,
    );

    const foundUser = await controller.find(String(user.id));

    expect(foundUser).toEqual(user);
  });

  it('should updates a user with the given id', async () => {
    const session = { usersId: -10 };
    const user = await controller.createUser(
      { email: 'asdf@test.com', password: 'asdf' },
      session,
    );

    const updatedUser = await controller.update(String(user.id), {
      email: 'asdf2@test.com',
    });

    expect(updatedUser.email).toEqual('asdf2@test.com');
  });

  it('should removes a user with the given id', async () => {
    const session = { usersId: -10 };
    const user = await controller.createUser(
      { email: 'asdf@test.com', password: 'asdf' },
      session,
    );

    await expect(controller.remove(String(user.id))).resolves.toEqual(user);
  });

  it('should signin, updates session and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'asdf@test.com', password: 'asdf' },
      session,
    );

    expect(session.userId).toEqual(user.id);
  });

  it('should signout user', async () => {
    const session = { userId: 1 };
    await controller.signin(
      { email: 'asdf@test.com', password: 'asdf' },
      session,
    );

    expect(controller.signout(session)).toBeUndefined();
    expect(session.userId).toBeNull();
  });
});
