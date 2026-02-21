declare namespace JSX {
  type ComponentWrapperProps<Props, Controller, Methods> =
    | { props?: Props; if?: boolean }
    | { items: Props[]; key?: keyof Props | ((item: Props) => any) };

  type LibraryManagedAttributes<C, P> =
    C extends ComponentFunction<infer Props, infer Controller, infer Methods>
      ? ComponentWrapperProps<Props, Controller, Methods>
      : P;
}

/**
 * The component constructor function (typed as a class, but isn't).
 */
export class Component<Props = any, Controller = any> {
  /**
   * The base render method looks like this:
   *
   * ```
   * render(props?: Props, ctrl?: Controller) {
   *   this.props = props;
   *   this.ctrl = ctrl;
   *   this.update();
   * }
   * ```
   *
   * You can override like so:
   *
   * ```
   * render(props?: Props, ctrl?: Controller) {
   *   // do your thing
   *   this.base.render.call(this, props, ctrl);
   * }
   * ```
   */
  render(props?: Props, ctrl?: Controller): void;
  /**
   * Updates the DOM.
   *
   * You can override like so:
   *
   * ```
   * update() {
   *   // do your thing
   *   this.base.update.call(this);
   * }
   * ```
   */
  update(): void;
}

/**
 * The type for a component instance.
 */
export type ComponentInstance<
  Props = any,
  Controller = any,
  Methods extends object = {}
> = {
  el: HTMLElement;
  props: Props;
  ctrl: Controller;
  ref: { [key: string]: HTMLElement | ComponentInstance };
  part: { [key: string]: Part };
  base: Component<Props, Controller>;
} & Component<Props, Controller> &
  Methods;

type ComponentMethods<Props, Controller> = {
  render?(props: Props, ctrl: Controller): void;
  update?(): void;
  [key: string]: any;
};

interface ComponentFunction<Props = any, Controller = any, Methods = any> {
  // (props: Props, { ctrl: Ctrl }): JSX.Element;
  (
    props: Props,
    xargs?: {
      ctrl: Controller;
      props: Props;
      self: ComponentInstance<Props, Controller>;
      event: Event;
      element: HTMLElement;
    }
  ): JSX.Element;
  methods?: ComponentMethods<Props, Controller> &
    ThisType<ComponentInstance<Props, Controller>>;
  readonly prototype?: ComponentMethods<Props, Controller> &
    ThisType<ComponentInstance<Props, Controller>>;
  // Methods will not be available on nested component, so omit.
  readonly stubs?: Record<string, ComponentFunction<Props, Controller>>;
}
