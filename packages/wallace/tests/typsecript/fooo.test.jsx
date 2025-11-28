import {} from "../utils";

test("test", () => {
  let source = `
    import { Uses } from "wallace";
    interface iProps {
      name: string;
    }

    const Foo: Uses<iProps> = (props) => (
      <div>
        <span>{props.age}</span>
      </div>
    )
  `;
  expect(source).toHaveTypeErrors(
    "Property 'age' does not exist on type 'iProps'.",
    "Property 'name' does not exist on type 'iProps'."
  );
});
