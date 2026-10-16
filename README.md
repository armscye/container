# @armscye/container

> Common TypeScript types for dependency injection containers.

## Install

```sh
npm install --save-dev @armscye/container
# or
yarn add --dev @armscye/container
# or
pnpm add -D @armscye/container
```

Import with `import type { … }` so the import is erased from your build.

The package is ESM only. In a CommonJS file compiled with
`"module": "node16"`, add the `resolution-mode` attribute; with
`"module": "nodenext"` (TypeScript 5.8+) the plain form works.

```ts
import type { Container } from '@armscye/container' with {
  'resolution-mode': 'import',
};
```

> [!NOTE]
> Install it as a regular dependency instead if your package publishes
> `.d.ts` files that reference these types, or if you use inline
> `import { type … }` with `verbatimModuleSyntax`, which keeps an
> `import {} from '@armscye/container'` at runtime.

## Usage

```ts
import type {
  ClassProvider,
  Container,
  ExistingProvider,
  Factory,
  FactoryProvider,
  Lifetime,
  Provider,
  ProviderToken,
  ValueProvider,
} from '@armscye/container';
```

| Type               | Describes                                                 |
| ------------------ | --------------------------------------------------------- |
| `ProviderToken`    | A `string` or `symbol` key for a provider                 |
| `Lifetime`         | `'singleton'` (reused) or `'transient'` (new each time)   |
| `Factory<T>`       | `(container: Container) => T`                             |
| `ValueProvider`    | Resolves to `useValue`                                    |
| `ClassProvider`    | Resolves to `new useClass()`, with an optional `lifetime` |
| `FactoryProvider`  | Resolves to `useFactory(container)`, optional `lifetime`  |
| `ExistingProvider` | Resolves to whatever `useExisting` resolves to            |
| `Provider`         | Any of the four providers above                           |
| `Container`        | `get<T>(token)` and `has(token)`                          |

`ClassProvider['useClass']` is
[`NoArgument`](https://github.com/armscye/core#noargumentt) from
`@armscye/core`, so it only accepts classes that can be constructed with no
arguments.

```ts
class Logger {}

const providers: Provider[] = [
  { provide: 'baseUrl', useValue: 'https://example.com' },
  { provide: 'logger', useClass: Logger, lifetime: 'singleton' },
  {
    provide: 'url',
    useFactory: (c) => new URL(c.get<string>('baseUrl')),
    lifetime: 'transient',
  },
  { provide: 'log', useExisting: 'logger' },
];

function getBaseUrl(c: Container): string | undefined {
  return c.has('baseUrl') ? c.get<string>('baseUrl') : undefined;
}
```

`container.get` throws when no provider is registered under the token, or
when resolving the value fails, for example because a constructor, a factory
or a dependency throws. Use `container.has` to check for a token first.

## Migrating from 0.7

0.8 is a rewrite in this repository, with these breaking changes:

- The deprecated `shared` flag is removed from `ClassProvider`,
  `FactoryProvider` and `ExistingProvider`. Use `lifetime: 'singleton'` for
  `shared: true` and `lifetime: 'transient'` for `shared: false`.
- `ExistingProvider` no longer has `lifetime`. An alias always returns
  whatever its target token resolves to.
- The package is ESM only. CommonJS projects need the `resolution-mode`
  import shown in [Install](#install).
- `@armscye/core` is `^0.4.4`, which is also ESM only.

## Contributing

Develop on the Node.js version in `.nvmrc` (`nvm use`, currently 24) and
pnpm via Corepack or a global install matching `packageManager` in
`package.json`. CI also runs every check on Node.js 20.19, the oldest
version the package supports.

```sh
pnpm install     # also installs the Git hooks
pnpm lint        # ESLint (type-checked rules + JSDoc)
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest type tests (src/**/*.test-d.ts)
pnpm build       # emit dist/
pnpm format      # Prettier
```

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `build`             | Cleans and compiles `src/` to `dist/`       |
| `clean`             | Removes `dist/`                             |
| `typecheck`         | Type-checks sources, tests and config files |
| `lint`              | Runs ESLint                                 |
| `lint:fix`          | Runs ESLint and fixes what it can           |
| `format`            | Formats every file with Prettier            |
| `format:check`      | Fails if any file is not formatted          |
| `test`              | Runs the type tests                         |
| `check:package`     | Builds, then runs publint and attw          |
| `release`           | Cuts a release with release-it              |
| `prepack`           | Builds before `npm pack` or `npm publish`   |
| `renovate:validate` | Validates `renovate.json` (Node.js 24+)     |
| `prepare`           | Installs the Husky Git hooks                |

Every exported declaration needs JSDoc with a description; exported
interfaces and type aliases also need an `@example`.

### Commit conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
and are checked by commitlint in the `commit-msg` hook. The `pre-commit` hook
runs ESLint and Prettier on staged files.

```text
feat: add Provider type            → minor release
fix: correct Provider JSDoc        → patch release
feat!: drop Node.js 20 support     → major release
docs: clarify usage                → no version bump on its own
chore(deps): update vitest to v5   → no version bump on its own
```

Until 1.0.0 every bump is one level lower (`preMajor` in
`.release-it.json`): a breaking change is a minor release and a `feat` is a
patch release.

Renovate opens its PRs as `chore(deps): …`, so dependency updates never
appear in the changelog.

## License

This project is licensed under the **MIT license**.

See [LICENSE](./LICENSE) for more information.
