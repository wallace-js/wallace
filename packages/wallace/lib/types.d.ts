// This module lies about several definitions in order to make TypeScript work with JSX.
// Note that docstrings will appear in most IDE tooltips, but only the latest overload.

declare module "wallace" {
  interface ComponentFunction<Type> extends Function {
    (props: Type, ...rest: Array<any>): JSX.Element;
    nest?({ props, showIf }: { props?: Type; showIf?: boolean }): JSX.Element;
    repeat?({
      props,
      showIf,
    }: {
      props: Array<Type>;
      showIf?: boolean;
    }): JSX.Element;
  }

  export type Accepts<Type> = ComponentFunction<Type>;

  export interface Component<T> {
    update(): void;
    render(props: T): void;
    el: HTMLElement;
  }

  // TODO: add more to this, maybe overload for each case.
  export function mount<T>(
    element: string | HTMLElement,
    component: Accepts<T>,
    props?: T,
    ctrl?: any,
  ): Component<T>;

  export function watch<T>(obj: T, callback: CallableFunction): T;

  export function extendPrototype<T>(
    base: Accepts<T>,
    extras?: { [key: string]: any },
  ): Accepts<T>;
}

// TODO: beef these up.
declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {}
  interface ElementClass {}
  interface IntrinsicAttributes {}
  interface ElementAttributesProperty {}
}

// This is necessary for weird TypeScript reasons.
export {};
