import "../utils";

describe("Mounting", () => {
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

  test("accepts a model when the hub is not typed", () => {
    expect(`
      import { mount, Takes } from "wallace";

      const Foo: Takes<{ clicks: number }> = () => <div></div>;
      mount("main", Foo, { clicks: 1 });
    `).toHaveNoTypeErrors();
  });

  test("checks the model when the hub is any", () => {
    expect(`
      import { mount, ComponentFunction } from "wallace";

      const Foo: ComponentFunction<{ clicks: number }, any> = () => <div></div>;
      mount("main", Foo, { clicks: 1 });
      mount("main", Foo, { clicks: 'a' });
    `).toHaveTypeErrors(["Type 'string' is not assignable to type 'number'."]);
  });

  test("rejects a model which is not the hub if hub is omitted", () => {
    expect(`
      import { mount, Takes } from "wallace";

      class Controller {
        mode: string = "view";
      }

      const Page: Takes<string[], Controller> = () => <div></div>;
      mount("main", Page, ["a"], new Controller());
      mount("main", Page, ["a"]);
    `).toHaveTypeErrors([
      "Argument of type 'string[]' is not assignable to parameter of type 'string[] & Controller'. Property 'mode' is missing in type 'string[]' but required in type 'Controller'."
    ]);
  });

  test("checks the hub when passed explicitly", () => {
    expect(`
      import { mount, Takes } from "wallace";

      class Controller {
        mode: string = "view";
      }

      const Page: Takes<null, Controller> = () => <div></div>;
      mount("main", Page, null, new Controller());
      mount("main", Page, null, { mode: 1 });
    `).toHaveTypeErrors(["Type 'number' is not assignable to type 'string'."]);
  });
});
