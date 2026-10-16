import type { NoArgument } from '@armscye/core';

/**
 * A key that identifies a provider in a {@link Container}.
 *
 * Use a `symbol` when two libraries could pick the same string.
 *
 * @example
 * ```ts
 * import type { ProviderToken } from '@armscye/container';
 *
 * const LOGGER: ProviderToken = 'logger';
 * const CONFIG: ProviderToken = Symbol('CONFIG');
 * ```
 */
export type ProviderToken = string | symbol;

/**
 * How long a value created by a {@link ClassProvider} or
 * {@link FactoryProvider} lives.
 *
 * - `'singleton'`: created on first resolution, then reused.
 * - `'transient'`: created again on every resolution.
 *
 * Which one applies when `lifetime` is omitted is up to the container.
 *
 * @example
 * ```ts
 * import type { Lifetime } from '@armscye/container';
 *
 * const lifetime: Lifetime = 'singleton';
 * ```
 */
export type Lifetime = 'singleton' | 'transient';

/**
 * A function that creates a value, resolving its dependencies from the
 * {@link Container} it is given.
 *
 * @typeParam T - The type of the created value. Defaults to `any`.
 *
 * @example
 * ```ts
 * import type { Factory } from '@armscye/container';
 *
 * const createUrl: Factory<URL> = (container) =>
 *   new URL(container.get<string>('baseUrl'));
 * ```
 */
export type Factory<T = any> = (container: Container) => T;

/**
 * A provider that resolves to a value that already exists, such as a
 * configuration object or a constant.
 *
 * The value is returned as is, so it is shared by every resolution.
 *
 * @example
 * ```ts
 * import type { ValueProvider } from '@armscye/container';
 *
 * const provider: ValueProvider = {
 *   provide: 'baseUrl',
 *   useValue: 'https://example.com',
 * };
 * ```
 */
export interface ValueProvider {
  /** The token the value is registered under. */
  provide: ProviderToken;

  /** The value to return. */
  useValue: any;
}

/**
 * A provider that resolves to an instance of a class.
 *
 * The class is constructed with no arguments, so it cannot receive
 * dependencies through its constructor. Use a {@link FactoryProvider} for a
 * class that needs them.
 *
 * @example
 * ```ts
 * import type { ClassProvider } from '@armscye/container';
 *
 * class Logger {}
 *
 * const provider: ClassProvider = {
 *   provide: 'logger',
 *   useClass: Logger,
 *   lifetime: 'singleton',
 * };
 * ```
 */
export interface ClassProvider {
  /** The token the instance is registered under. */
  provide: ProviderToken;

  /** The class to construct, with no required constructor arguments. */
  useClass: NoArgument<any>;

  /** Whether one instance is shared or a new one is created each time. */
  lifetime?: Lifetime;
}

/**
 * A provider that resolves to the value returned by a {@link Factory}.
 *
 * The factory receives the container, so it can resolve the dependencies
 * the value needs.
 *
 * @example
 * ```ts
 * import type { FactoryProvider } from '@armscye/container';
 *
 * const provider: FactoryProvider = {
 *   provide: 'url',
 *   useFactory: (container) => new URL(container.get<string>('baseUrl')),
 *   lifetime: 'transient',
 * };
 * ```
 */
export interface FactoryProvider {
  /** The token the created value is registered under. */
  provide: ProviderToken;

  /** The function that creates the value. */
  useFactory: Factory<any>;

  /** Whether one value is shared or the factory runs each time. */
  lifetime?: Lifetime;
}

/**
 * A provider that makes one token an alias for another.
 *
 * Resolving `provide` returns whatever resolving `useExisting` returns, so
 * a singleton behind the alias stays a single instance.
 *
 * @example
 * ```ts
 * import type { ExistingProvider } from '@armscye/container';
 *
 * const provider: ExistingProvider = {
 *   provide: 'log',
 *   useExisting: 'logger',
 * };
 * ```
 */
export interface ExistingProvider {
  /** The alias token. */
  provide: ProviderToken;

  /** The token the alias resolves to. */
  useExisting: ProviderToken;
}

/**
 * Any provider a {@link Container} can be configured with.
 *
 * The `use*` key tells the providers apart: `useValue`, `useClass`,
 * `useFactory` or `useExisting`.
 *
 * @example
 * ```ts
 * import type { Provider } from '@armscye/container';
 *
 * class Logger {}
 *
 * const providers: Provider[] = [
 *   { provide: 'baseUrl', useValue: 'https://example.com' },
 *   { provide: 'logger', useClass: Logger, lifetime: 'singleton' },
 *   {
 *     provide: 'url',
 *     useFactory: (container) => new URL(container.get<string>('baseUrl')),
 *   },
 *   { provide: 'log', useExisting: 'logger' },
 * ];
 * ```
 */
export type Provider =
  ValueProvider | ClassProvider | FactoryProvider | ExistingProvider;

/**
 * Resolves values by {@link ProviderToken}.
 *
 * @example
 * ```ts
 * import type { Container } from '@armscye/container';
 *
 * function getBaseUrl(container: Container): string | undefined {
 *   return container.has('baseUrl')
 *     ? container.get<string>('baseUrl')
 *     : undefined;
 * }
 * ```
 */
export interface Container {
  /**
   * Returns the value registered under `token`.
   *
   * `T` is not checked against the registered value; the caller is
   * trusted to name the right type. Check with {@link Container.has} first
   * when the token may be missing.
   *
   * @typeParam T - The type of the resolved value.
   * @param token - The token to resolve.
   * @returns The resolved value.
   * @throws {Error} When no provider is registered under `token`.
   * @throws {Error} When a constructor, factory or dependency throws.
   */
  get<T>(token: ProviderToken): T;

  /**
   * Reports whether a provider is registered under `token`.
   *
   * @param token - The token to look up.
   * @returns Whether a provider is registered under `token`.
   */
  has(token: ProviderToken): boolean;
}
