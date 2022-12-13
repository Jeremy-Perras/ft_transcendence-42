import supertest from "supertest";
import { Test } from "@nestjs/testing";
import { ExecutionContext, INestApplication } from "@nestjs/common";
import { UserModule } from "../src/user/user.module";
import { UserService } from "../src/user/user.service";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { DataLoaderInterceptor } from "../src/dataloader";
import { AuthModule } from "../src/auth/auth.module";
import { GqlAuthenticatedGuard } from "../src/auth/authenticated.guard";

describe("User", () => {
  let app: INestApplication;
  const userService = { getUserById: () => ({ id: 1 }) };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: DataLoaderInterceptor,
        },
      ],
      imports: [
        AuthModule,
        UserModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), "test/schema.gql"),
          buildSchemaOptions: {
            dateScalarMode: "timestamp",
          },
        }),
      ],
    })
      .overrideGuard(GqlAuthenticatedGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .overrideProvider(UserService)
      .useValue(userService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`get self`, async () => {
    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query ExampleQuery {
          user {
            id
          }
        }`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toStrictEqual({
      user: userService.getUserById(),
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
