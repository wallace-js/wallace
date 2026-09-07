export const createComponent = (
  ComponentFunction,
  model,
  /* #INCLUDE-IF: allowHub */ hub
) => {
  const component = new ComponentFunction();
  component.render(model, /* #INCLUDE-IF: allowHub */ hub);
  return component;
};
