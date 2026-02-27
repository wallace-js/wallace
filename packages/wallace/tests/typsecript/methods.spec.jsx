import { testMount } from "../utils";

describe("Definition", () => {
  test("is a proxy for prototype", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    interface Controller {
      times: number;
    }
    
    const Bar: Uses<{props: Props, ctrl: Controller}> = () => <div></div>;

    Bar.methods.render = function (props, ctrl) {
      const a = props.clicks / 2;
      const b = ctrl.times / 2;
      const c = this.props.clicks / 2;
      const d = this.ctrl.times / 2;
      this.update();
    }
    
    Bar.methods = { 
      render (props, ctrl) {
        const a = props.clicks / 2;
        const b = ctrl.times / 2;
        const c = this.props.clicks / 2;
        const d = this.ctrl.times / 2;
        this.update();
      }
    }
    `).toHaveNoTypeErrors();
  });

  test("Recognises methods in render", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    interface Methods {
      getName: () => string;
    }

    const Bar: Uses<{props: Props, methods: Methods}> = () => <div></div>;

    Bar.methods.render = function (props, ctrl) {
      this.getName().toUpperCase();
    }
    
    Bar.methods = { 
      render (props, ctrl) {
        this.getName().toUpperCase();
        this.foo();
      }
    }
    `).toHaveTypeErrors([
      `Property 'foo' does not exist on type 'ComponentInstance<Props, unknown, Methods>'.`
    ]);
  });

  test("Recognises component in methods", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    interface Methods {
      getName: () => string;
    }
    interface Controller {
      times: number;
    }
    
    const Bar: Uses<{props: Props, ctrl: Controller, methods: Methods}> = () => <div></div>;

    Bar.methods.getName = function () {
      const c = this.props.clicks / 2;
      const d = this.ctrl.times / 2;
      this.update();
    }
    
    Bar.methods = { 
      getName () {
        const c = this.props.clicks / 2;
        const d = this.ctrl.times / 2;
        this.update();
      }
    }
    `).toHaveNoTypeErrors();
  });

  test("Recognises methods in self", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    interface Methods {
      getName: () => string;
    }

    const Bar: Uses<{props: Props, methods: Methods}> = ({clicks}, {self}) => (
      <div>
        {self.getName()}
        {clicks}
        {self.nope()}
      </div>
    );
    `).toHaveTypeErrors([
      `Property 'nope' does not exist on type 'ComponentInstance<Props, unknown, Methods>'.`
    ]);
  });
});
