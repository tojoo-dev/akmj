# **AKMJ: API Kit for Modern JavaScript**

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftojoo-dev%2Fakmj.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftojoo-dev%2Fakmj?ref=badge_shield)

> [!WARNING]
> This library is still in experimental stage, API changes may occur without warning.

"AKMJ" is a lightweight and powerful library designed to streamline API integration in modern JavaScript applications. With a focus on simplicity, flexibility, and type safety, "AKMJ" empowers developers to define and interact with RESTful APIs efficiently while maintaining robust code quality.

### Key Features

- **Type-Safe Interactions**: Full TypeScript support with automatic type inference
- **Declarative API Definitions**: Clean, structured format to define your API routes
- **Path Parameter Inference**: Automatically extracts and types path parameters
- **Dynamic Method Calls**: Intuitive syntax (e.g., `client.auth.$login({ email, password })`) based on API definitions
- **Request Lifecycle Hooks**: Built-in support for request/response lifecycle events
- **Small Footprint**: Lightweight core powered by [Ky](https://github.com/sindresorhus/ky)

## Installation

```bash
# npm
npm install akmj

# pnpm
pnpm add akmj

# yarn
yarn add akmj
```

## Usage

### Basic Setup

```typescript
import { createClient, type AkmjDefinition } from "akmj";

const api = {
  auth: {
    $login: {
      method: "post",
      path: "/login",
      types: {
        request: akmj.object({
          email: akmj.string(),
          password: akmj.string(),
        }),
        response: {
          200: akmj.object({
            token: akmj.string(),
          }),
        },
      },
    },
  },
} as const satisfies AkmjDefinition;

const client = createClient({
  baseUrl: "https://api.example.com",
  api,
});

// Use the client
const { token } = await client.auth.$login({
  email: "user@example.com",
  password: "password",
});
```

### Path Parameters

Parameters in the URL path are automatically inferred from `:param` syntax:

```typescript
const api = {
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
} as const satisfies AkmjDefinition;

// Usage
const user = await client.users.$getUser(
  { id: "123" }, // Path parameters
  { include: "profile" } // Query parameters
);
```

### Type Utilities

AKMJ provides several type utilities to define your API schema:

```typescript
// Array types
akmj.string().array(); // string[]
akmj.object({ id: akmj.string() }).array(); // Array<{ id: string }>

// Optional fields
akmj.string().optional(); // string | undefined

// Nullable fields
akmj.string().nullable(); // string | null
```

## Advanced Configuration

For additional options and hooks, refer to [Ky documentation](https://github.com/sindresorhus/ky#options).

## Roadmap

- [x] Automatic path parameter type inference
- [ ] RPC-style client support (`GET /users/1` as `client.users({ id: 1 }).$get()`)
- [ ] Enum, union, and intersection types
- [ ] Comprehensive test suite

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftojoo-dev%2Fakmj.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftojoo-dev%2Fakmj?ref=badge_large)
