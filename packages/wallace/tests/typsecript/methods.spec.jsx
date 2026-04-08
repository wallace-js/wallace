import { testMount } from "../utils";

describe("Definition", () => {
  test("is a proxy for prototype", () => {
    expect(`
    import { mount, Takes } from "wallace";
    interface Model {
      clicks: number;
    }
    interface Hub {
      times: number;
    }
    
    const Bar: Takes<Model, Hub> = () => <div></div>;

    Bar.methods.render = function (model, hub) {
      const a = model.clicks / 2;
      const b = hub.times / 2;
      const c = this.model.clicks / 2;
      const d = this.hub.times / 2;
      this.update();
    }
    
    Bar.methods = { 
      render (model, hub) {
        const a = model.clicks / 2;
        const b = hub.times / 2;
        const c = this.model.clicks / 2;
        const d = this.hub.times / 2;
        this.update();
      }
    }
    `).toHaveNoTypeErrors();
  });

  test("Recognises methods in render", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Model {
      clicks: number;
    }
    interface Methods {
      getName: () => string;
    }

    const Bar: Uses<{model: Model, methods: Methods}> = () => <div></div>;

    Bar.methods.render = function (model, hub) {
      this.getName().toUpperCase();
    }
    
    Bar.methods = { 
      render (model, hub) {
        this.getName().toUpperCase();
        this.foo();
      }
    }
    `).toHaveTypeErrors([
      `Property 'foo' does not exist on type 'ComponentInstance<Model, unknown, Methods>'.`
    ]);
  });

  test("Recognises component in methods", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Model {
      clicks: number;
    }
    interface Methods {
      getName: () => string;
    }
    interface Hub {
      times: number;
    }
    
    const Bar: Uses<{model: Model, hub: Hub, methods: Methods}> = () => <div></div>;

    Bar.methods.getName = function () {
      const c = this.model.clicks / 2;
      const d = this.hub.times / 2;
      this.update();
    }
    
    Bar.methods = { 
      getName () {
        const c = this.model.clicks / 2;
        const d = this.hub.times / 2;
        this.update();
      }
    }
    `).toHaveNoTypeErrors();
  });

  test("Recognises methods in self", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Model {
      clicks: number;
    }
    interface Methods {
      getName: () => string;
    }

    const Bar: Uses<{model: Model, methods: Methods}> = ({clicks}, {self}) => (
      <div>
        {self.getName()}
        {clicks}
        {self.nope()}
      </div>
    );
    `).toHaveTypeErrors([
      `Property 'nope' does not exist on type 'ComponentInstance<Model, unknown, Methods>'.`
    ]);
  });
});
