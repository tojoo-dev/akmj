# **AKMJ: API Kit for Modern JavaScript**

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftojoo-dev%2Fakmj.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftojoo-dev%2Fakmj?ref=badge_shield)

**⚠️ This library is still in experimental stage, API changes will be frequently changing without warning.**

AKMJ is a lightweight and powerful library designed to streamline API integration in modern JavaScript applications. With a focus on simplicity, flexibility, and type safety, AKMJ empowers developers to define and interact with RESTful APIs efficiently while maintaining robust code quality.

### Key Features:

- **Declarative API Definitions**: Use a clean, structured format to define your API routes, parameters, and methods.
- **Type-Safe Interactions**: Leverage TypeScript support to ensure request and response data align with your API schema.
- **Dynamic Proxy-based API Calls**: Access endpoints with intuitive syntax, e.g., `client.auth.$login({ email, password })`.
- **Request Lifecycle Management**: Easily manage headers, query parameters, and hooks for request/response lifecycle events.
- **Extensible Design**: Customize behaviors like error handling, retries, etc with ease.
- **Small Footprint**: Lightweight and optimized for modern JavaScript frameworks and libraries.

Inspired by [Tuyau](https://github.com/Julien-R44/tuyau) and powered by [Ky](https://github.com/sindresorhus/ky).

## Usage

### Install

```bash
npm install akmj
```

### Quick Start

You can directly input api route in `createClient` or create separate variable for it, you have to define it as satisfies `AkmjDefinition` type.

```typescript
import type { AkmjDefinition, MakeApiDefinition } from "akmj";

const api: AkmjDefinition = {
  auth: {
    $login: {
      method: "post",
      path: "/login",
      types: {} as MakeApiDefinition<
        {
          email: string;
          password: string;
        },
        {
          token: string;
        }
      >,
    },
  },
} satisfies AkmjDefinition;
```

Pass it to `createClient` function and you're ready to go!

```typescript
import { createClient } from "akmj";

const client = createClient({
  baseUrl: "https://api.example.com",
  api,
  // other options
});

const data = await client.auth.$login({
  email: "user@example.com",
  password: "password",
});

console.log(data);
// { token: "generated token"}
```

#### Type-safe Request and Response

```typescript
const api: AkmjDefinition = {
  users: {
    $getUser: {
      method: "get",
      path: "/users/:id",
      types: {
        request: akmj.object({
          include: akmj.string().optional(),
        }),
        response: {
          200: akmj.object({
            id: akmj.string(),
            name: akmj.string(),
          }),
        },
      },
    },
  },
};

// Usage
const user = await client.users.$getUser(
  { id: "123" }, // Path parameters
  { include: "profile" } // Query parameters
);
```

Currently, only primitive types are supported.

##### Array Type

Make an array type from existing type

```typescript
akmj.string().array();
```

or from object type

```typescript
akmj
  .object({
    key: akmj.string(),
  })
  .array();
```

##### Nullable Type

```typescript
akmj.string().nullable();
```

Some options you can find in [ky](https://github.com/sindresorhus/ky#options) and [ky hooks](https://github.com/sindresorhus/ky#hooks).

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request on the GitHub repository.

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftojoo-dev%2Fakmj.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftojoo-dev%2Fakmj?ref=badge_large)
