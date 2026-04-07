import { testMount } from "../utils";

describe("Definition", () => {
  test("recognises model, hub, render, update", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Model {
      clicks: number;
    }
    interface Hub {
      times: number;
    }
    
    const Bar: Uses<{model: Model, hub: Hub}> = () => <div></div>;

    Bar.prototype.render = function (model, hub) {
      const a = model.clicks / 2;
      const b = hub.times / 2;
      const c = this.model.clicks / 2;
      const d = this.hub.times / 2;
      this.update();
    }
    `).toHaveNoTypeErrors();
  });

  test("cannot assign to prototype", () => {
    expect(`
    import { mount, Uses } from "wallace";
    const Bar: Uses = () => <div></div>;

    Bar.prototype = {
      render: function (model, hub) {}
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
