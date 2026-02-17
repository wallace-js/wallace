/*
Due to async functions:

 - The worker goes a bit wild when a test fails.
 - You need to mount the Router inside each test.

 There are no checks on duplicate routes or args.
*/
import { Router, route, extendComponent } from "wallace";
import { testMount } from "../utils";

if (wallaceConfig.flags.allowBase) {
  /**
   * Sets the hash and waits for async code to run. Call with `await`.
   */
  async function setHash(hash, event = "hashchange") {
    window.location.hash = hash;
    window.dispatchEvent(new Event(event));
    await Promise.resolve();
  }

  const Page1 = () => <div>Page1</div>;
  const Page2 = () => <div>Page2</div>;

  test("Test setHash helper", () => {
    let calls = 0;
    window.addEventListener("hashchange", () => Promise.resolve(calls++));
    setHash("page1");
    expect(window.location.hash).toBe("#page1");
    expect(calls).toBe(1);
  });

  describe("Routing basics", () => {
    const props = {
      routes: [route("/page1", Page1), route("/page2", Page2)]
    };

    test("Initial render", async () => {
      const component = testMount(Router, props);
      expect(component).toRender("<div></div>");
    });

    test("On page load", async () => {
      const component = testMount(Router, props);
      expect(component).toRender("<div></div>");
      await setHash("/page1", "load");
      expect(component).toRender("<div><div>Page1</div></div>");
    });

    test("Goes to correct page", async () => {
      const component = testMount(Router, props);
      await setHash("/page2");
      expect(component).toRender("<div><div>Page2</div></div>");
      await setHash("/page1");
      expect(component).toRender("<div><div>Page1</div></div>");
      await setHash("/page1");
      expect(component).toRender("<div><div>Page1</div></div>");
      await setHash("/page2?foo=bar");
      expect(component).toRender("<div><div>Page2</div></div>");
    });

    test("Unknown route shows error", async () => {
      const component = testMount(Router, props);
      await setHash("/xyz");
      expect(component).toRender(`<div>Router unable to match path "/xyz"</div>`);
    });
  });

  describe("Router customisation", () => {
    test("Can configure div", async () => {
      const props = {
        atts: { id: "foo", class: "danger" },
        routes: []
      };
      const component = testMount(Router, props);
      expect(component).toRender(`<div id="foo" class="danger"></div>`);
    });

    test("Can provide cleanup", async () => {
      const cleanup = jest.fn();
      const props = {
        routes: [
          route(
            "/page1",
            Page1,
            x => x,
            route => cleanup(route)
          ),
          route("/page2", Page2)
        ]
      };
      const component = testMount(Router, props);
      await setHash("/page1");
      expect(component).toRender("<div><div>Page1</div></div>");
      expect(cleanup).not.toHaveBeenCalled();
      await setHash("/page2");
      expect(component).toRender("<div><div>Page2</div></div>");
      expect(cleanup.mock.calls[0][0].component.el.outerHTML).toBe("<div>Page1</div>");
      await setHash("/page1");
      expect(component).toRender("<div><div>Page1</div></div>");
      expect(cleanup.mock.calls.length).toBe(1);
    });

    test("Can provide custom error handler", async () => {
      const props = {
        error: (error, router) => (router.el.innerHTML = error.message.substring(0, 3)),
        routes: []
      };
      const component = testMount(Router, props);
      await setHash("/xyz");
      expect(component).toRender(`<div>Rou</div>`);
    });

    test("Can extend router", async () => {
      const MyRouter = extendComponent(Router, ({ foo }) => (
        <div class="container">
          <span>{foo}</span>
          <div class="page" ref:div></div>
        </div>
      ));
      MyRouter.prototype.mount = function (component) {
        const div = this.ref.div;
        div.innerHTML = "";
        div.appendChild(component.el);
      };

      const props = {
        foo: "bar",
        routes: [route("/page2", Page2)]
      };

      const component = testMount(MyRouter, props);
      await setHash("/page2");
      expect(component).toRender(`
      <div class="container">
        <span>bar</span>
        <div class="page">
          <div>Page2</div>
        </div>
      </div>
    `);
    });
  });

  describe("Route props conversion", () => {
    const Page = ({ foo }) => <div>{foo}</div>;
    test("Works with promise and normal function", async () => {
      const props = {
        routes: [
          route("/page1/{foo}", Page, ({ args }) => ({ foo: args.foo + 1 })),
          route("/page2/{foo}", Page, ({ args }) =>
            Promise.resolve({ foo: args.foo + 2 })
          )
        ]
      };
      const component = testMount(Router, props);
      await setHash("/page1/a");
      expect(component).toRender("<div><div>a1</div></div>");
      await setHash("/page2/b");
      expect(component).toRender("<div><div>b2</div></div>");
    });

    test("Can read url", async () => {
      const props = {
        routes: [
          route("/page1", Page, ({ url }) => ({
            foo: url
          }))
        ]
      };
      const component = testMount(Router, props);
      await setHash("/page1?name=Jonathan%20Smith&age=18");
      expect(component).toRender(
        "<div><div>/page1?name=Jonathan%20Smith&amp;age=18</div></div>"
      );
    });

    test("Can read params", async () => {
      const props = {
        routes: [
          route("/page1", Page, ({ params }) => ({
            foo: params.get("name")
          }))
        ]
      };
      const component = testMount(Router, props);
      await setHash("/page1?name=Jonathan%20Smith&age=18");
      expect(component).toRender("<div><div>Jonathan Smith</div></div>");
    });
  });

  describe("Route args conversion", () => {
    const Page = () => <div></div>;
    let args;
    const props = {
      routes: [
        route("/page1/{x:int}/{y:float}/{z:date}", Page, path => {
          args = path.args;
        })
      ]
    };

    test("Converts to correct types", async () => {
      testMount(Router, props);
      await setHash("/page1/2/5.2/2021-05-10");
      expect(args).toStrictEqual({ x: 2, y: 5.2, z: new Date("2021-05-10") });
    });
  });
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}
