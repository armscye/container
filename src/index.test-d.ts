import { describe, expectTypeOf, test } from 'vitest';
import type { NoArgument } from '@armscye/core';
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
} from './index.js';

declare const container: Container;

class NoArgs {
  readonly value = 'a';
}

abstract class AbstractClass {
  abstract run(): void;
}

class RequiresArgs {
  constructor(readonly value: string) {}
}

describe('ProviderToken', () => {
  test('is a string or a symbol', () => {
    expectTypeOf<ProviderToken>().toEqualTypeOf<string | symbol>();
  });

  test('rejects other values', () => {
    expectTypeOf<number>().not.toExtend<ProviderToken>();
    expectTypeOf<object>().not.toExtend<ProviderToken>();
  });
});

describe('Lifetime', () => {
  test('is singleton or transient', () => {
    expectTypeOf<Lifetime>().toEqualTypeOf<'singleton' | 'transient'>();
  });

  test('rejects other strings', () => {
    expectTypeOf<'scoped'>().not.toExtend<Lifetime>();
  });
});

describe('Factory', () => {
  test('receives the container and returns T', () => {
    expectTypeOf<Factory<URL>>().parameters.toEqualTypeOf<[Container]>();
    expectTypeOf<Factory<URL>>().returns.toEqualTypeOf<URL>();
  });

  test('defaults T to any', () => {
    expectTypeOf<ReturnType<Factory>>().toBeAny();
  });
});

describe('ValueProvider', () => {
  test('accepts any value', () => {
    expectTypeOf({
      provide: 'a',
      useValue: 1,
    }).toExtend<ValueProvider>();
    expectTypeOf({
      provide: Symbol('a'),
      useValue: undefined,
    }).toExtend<ValueProvider>();
  });

  test('requires useValue', () => {
    expectTypeOf({ provide: 'a' }).not.toExtend<ValueProvider>();
  });
});

describe('ClassProvider', () => {
  test('accepts a class with no required arguments', () => {
    expectTypeOf<ClassProvider['useClass']>().toEqualTypeOf<NoArgument<any>>();
    expectTypeOf({ provide: 'a', useClass: NoArgs }).toExtend<ClassProvider>();
    expectTypeOf({
      provide: 'a',
      useClass: NoArgs,
      lifetime: 'transient' as const,
    }).toExtend<ClassProvider>();
  });

  test('rejects a class that requires arguments', () => {
    expectTypeOf({
      provide: 'a',
      useClass: RequiresArgs,
    }).not.toExtend<ClassProvider>();
  });

  test('rejects an abstract class', () => {
    expectTypeOf({
      provide: 'a',
      useClass: AbstractClass,
    }).not.toExtend<ClassProvider>();
  });

  test('has an optional lifetime', () => {
    expectTypeOf<ClassProvider['lifetime']>().toEqualTypeOf<
      Lifetime | undefined
    >();
  });
});

describe('FactoryProvider', () => {
  test('accepts a factory', () => {
    expectTypeOf({
      provide: 'a',
      useFactory: (c: Container) => c.has('b'),
      lifetime: 'singleton' as const,
    }).toExtend<FactoryProvider>();
  });

  test('rejects a non-function', () => {
    expectTypeOf({
      provide: 'a',
      useFactory: 1,
    }).not.toExtend<FactoryProvider>();
  });

  test('has an optional lifetime', () => {
    expectTypeOf<FactoryProvider['lifetime']>().toEqualTypeOf<
      Lifetime | undefined
    >();
  });
});

describe('ExistingProvider', () => {
  test('aliases another token', () => {
    expectTypeOf({
      provide: 'a',
      useExisting: Symbol('b'),
    }).toExtend<ExistingProvider>();
  });

  test('rejects a non-token', () => {
    expectTypeOf({
      provide: 'a',
      useExisting: 1,
    }).not.toExtend<ExistingProvider>();
  });
});

describe('Provider', () => {
  test('is the union of every provider', () => {
    expectTypeOf<Provider>().toEqualTypeOf<
      ValueProvider | ClassProvider | FactoryProvider | ExistingProvider
    >();
  });

  test('rejects an object without a use* key', () => {
    expectTypeOf({ provide: 'a' }).not.toExtend<Provider>();
  });
});

describe('Container', () => {
  test('get returns unknown without a type argument', () => {
    expectTypeOf(container.get('a')).toBeUnknown();
  });

  test('get returns the requested type', () => {
    expectTypeOf(container.get<URL>('a')).toEqualTypeOf<URL>();
    expectTypeOf<Container['get']>()
      .parameter(0)
      .toEqualTypeOf<ProviderToken>();
  });

  test('has returns a boolean', () => {
    expectTypeOf(container.has(Symbol('a'))).toEqualTypeOf<boolean>();
  });
});
