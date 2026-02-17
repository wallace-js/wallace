export const createComponent = (
  ComponentFunction,
  props,
  /* #INCLUDE-IF: allowCtrl */ ctrl
) => {
  const component = new ComponentFunction();
  component.render(props, /* #INCLUDE-IF: allowCtrl */ ctrl);
  return component;
};
