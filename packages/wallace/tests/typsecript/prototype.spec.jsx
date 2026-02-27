import { testMount } from "../utils";

describe("Definition", () => {
  test("recognises props, ctrl, render, update", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    interface Controller {
      times: number;
    }
    
    const Bar: Uses<{props: Props, ctrl: Controller}> = () => <div></div>;

    Bar.prototype.render = function (props, ctrl) {
      const a = props.clicks / 2;
      const b = ctrl.times / 2;
      const c = this.props.clicks / 2;
      const d = this.ctrl.times / 2;
      this.update();
    }
    `).toHaveNoTypeErrors();
  });

  test("cannot assign to prototype", () => {
    expect(`
    import { mount, Uses } from "wallace";
    const Bar: Uses = () => <div></div>;

    Bar.prototype = {
      render: function (props, ctrl) {}
    }
    `).toHaveTypeErrors([
      "Cannot assign to 'prototype' because it is a read-only property."
    ]);
  });

  // TODO: fix this
  // test("recognises parts", () => {
  //   expect(`
  //   import { mount, Uses } from "wallace";
  //   const Bar: Uses = () => (
  //     <div>
  //       <div part="foo">foo</div>
  //     </div>
  //   );

  //   Bar.prototype.render = function () {
  //     this.part.foo.update();
  //     this.part.foo.fail();
  //   }
  //   `).toHaveTypeErrors([`Property 'fail' does not exist on type ...`]);
  // });
});
