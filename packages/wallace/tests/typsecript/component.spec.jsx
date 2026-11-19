import { testMount } from "../utils";

describe("Component definition", () => {
  test("can specify no model", () => {
    expect(`
      import { mount, Takes } from "wallace";

      const Foo: Takes = () => (<div></div>);
      const foo = mount("main", Foo);
    `).toHaveNoTypeErrors();
  });

  test("can specify model", () => {
    expect(`
      import { mount, Takes } from "wallace";

      interface FooModel {
        clicks: number;
      }

      const Foo: Takes<FooModel> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.model.clicks = 1;
      foo.model.clicks = 'a';
    `).toHaveTypeErrors(["Type 'string' is not assignable to type 'number'."]);
  });

  test("can specify hub", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface Hub {
        things: number;
      }

      const Foo: Uses<{hub: Hub}> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.hub.things = 1;
      foo.hub.things = 'a';
    `).toHaveTypeErrors(["Type 'string' is not assignable to type 'number'."]);
  });

  test("can specify model and hub", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface FooModel {
        clicks: number;
      }

      interface Hub {
        things: number;
      }

      const Foo: Uses<{model: FooModel, hub: Hub}> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.hub.things = 1;
      foo.model.clicks = 1;
      foo.model.clicks = 'a';
      foo.hub.things = 'a';
    `).toHaveTypeErrors([
      "Type 'string' is not assignable to type 'number'.",
      "Type 'string' is not assignable to type 'number'."
    ]);
  });
});

// These keep the examples in lib/types.d.ts and AGENTS.md in step with the types.
describe("Documented patterns", () => {
  // This is the standard pattern in lib/types.d.ts and AGENTS.md.
  test("accepts a controller as model and hub", () => {
    expect(`
      import { mount } from "wallace";
      import type { ComponentInstance, Takes } from "wallace";

      interface Ticket {
        title: string;
        closed: boolean;
      }

      class Controller {
        component: ComponentInstance;
        tickets: Ticket[] = [];
        editing = false;
        close(ticket: Ticket) {
          ticket.closed = true;
          this.component.update();
        }
      }

      const TicketRow: Takes<Ticket, Controller> = (ticket, { hub }) => (
        <li>
          {ticket.title}
          <button if={hub.editing} onClick={hub.close(ticket)}>Close</button>
        </li>
      );

      const TicketList: Takes<Controller> = (ctrl) => (
        <ul assign:component>
          <TicketRow.repeat models={ctrl.tickets} />
        </ul>
      );

      mount("main", TicketList, new Controller());
      mount("main", TicketList, new Controller(), new Controller());
    `).toHaveNoTypeErrors();
  });

  // This is the multiple components example in lib/types.d.ts and AGENTS.md.
  test("accepts a controller referencing several components", () => {
    expect(`
      import { mount } from "wallace";
      import type { ComponentInstance, Takes, Uses } from "wallace";

      class Controller {
        page: ComponentInstance;
        filters: ComponentInstance;
      }

      const Filters: Uses<{ hub: Controller }> = (_, { hub }) => (
        <div assign={hub.filters}></div>
      );

      const TicketPage: Takes<Controller> = (ctrl) => (
        <div assign:page>
          <Filters />
        </div>
      );

      mount("main", TicketPage, new Controller());
    `).toHaveNoTypeErrors();
  });
});
