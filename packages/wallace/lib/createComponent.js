export const createComponent = (ComponentFunction, props, ctrl) => {
  const component = new ComponentFunction();
  component.render(props, ctrl);
  return component;
};
