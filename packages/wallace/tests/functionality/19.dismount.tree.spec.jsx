import { testMount } from "../utils";

/**
 * Recursive components draw from the same shared pool at every level, so components
 * released by a dismounted repeater get picked up by other repeaters, and the dismounted
 * repeater may later be reused itself.
 */
if (wallaceConfig.flags.allowDismount) {
  const n = (name, ...children) => ({ name, children });
  const tree = [
    n("apple", n("blue", n("eel"), n("quiet")), n("fig", n("guide"))),
    n("house", n("ice", n("juice")), n("kettle")),
    n("unit", n("vine", n("wren")))
  ];
  const filters = ["", "e", "ui", "e", "", "i", "u", "e", "q", ""];

  const filterTree = (nodes, text) =>
    nodes
      .map(node => ({ ...node, children: filterTree(node.children, text) }))
      .filter(node => node.name.includes(text) || node.children.length > 0);

  const flatten = nodes => nodes.flatMap(node => [node.name, ...flatten(node.children)]);

  const testFiltering = (Node, getNames) => {
    let filter = "";
    const Tree = () => (
      <div>
        <Node.repeat models={filterTree(tree, filter)} />
      </div>
    );
    const component = testMount(Tree);
    for (const text of filters) {
      filter = text;
      component.update();
      expect(getNames(component.el)).toEqual(flatten(filterTree(tree, text)));
    }
  };

  describe("Recursive tree with filtering", () => {
    const getNames = el => Array.from(el.querySelectorAll("[title]")).map(e => e.title);

    test("Sequential", () => {
      const Node = node => (
        <div title={node.name}>
          <Node.repeat models={node.children} />
        </div>
      );
      testFiltering(Node, getNames);
    });

    test("Keyed", () => {
      const Node = node => (
        <div title={node.name}>
          <Node.repeat models={node.children} key="name" />
        </div>
      );
      testFiltering(Node, getNames);
    });
  });

  if (wallaceConfig.flags.allowRepeaterSiblings) {
    describe("Recursive tree with filtering and repeater siblings", () => {
      const getNames = el =>
        Array.from(el.querySelectorAll("span")).map(e => e.textContent);

      test("Sequential", () => {
        const Node = node => (
          <div>
            <span>{node.name}</span>
            <Node.repeat models={node.children} />
            <hr />
          </div>
        );
        testFiltering(Node, getNames);
      });

      test("Keyed", () => {
        const Node = node => (
          <div>
            <span>{node.name}</span>
            <Node.repeat models={node.children} key="name" />
            <hr />
          </div>
        );
        testFiltering(Node, getNames);
      });
    });
  }
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}
