import { watch } from "wallace";
import { testMount } from "../utils";

/**
 * valueAsDate is an undocumented directive which allows passing a Proxy of Date, as
 * returned by `watch` to the valueAsDate attribute, which would otherwise reject it
 * as not being a Date.
 */
describe("valueAsDate directive", () => {
  const DateInput = ({ day }) => (
    <div>
      <input ref:date type="date" valueAsDate={day} />
    </div>
  );
  const date = new Date("2000-06-05");

  test("valueAsDate works with normal Date", () => {
    const component = testMount(DateInput, { day: date });
    const input = component.ref.date;
    expect(input.valueAsDate).toStrictEqual(date);
    expect(input.value).toBe("2000-06-05");
  });

  test("valueAsDate works with Proxy of Date", () => {
    const component = testMount(
      DateInput,
      watch({ day: date }, () => {})
    );
    const input = component.ref.date;
    expect(input.valueAsDate).toStrictEqual(date);
    expect(input.value).toBe("2000-06-05");
  });
});
