import { testMount } from "../utils";

const permutations = [
  ["Sequential", 0],
  ["Keyed", 1]
];

if (wallaceConfig.flags.allowRepeaterSiblings) {
  if (wallaceConfig.flags.allowDismount) {
    describe.each(permutations)("Shared pool (%s)", (_, keyed) => {
      const Day = keyed
        ? ({ day, tasks }) => (
            <div>
              <h3>{day}</h3>
              <Task.repeat items={tasks.filter(t => t.done)} key="id" />
            </div>
          )
        : ({ day, tasks }) => (
            <div>
              <h3>{day}</h3>
              <Task.repeat items={tasks.filter(t => t.done)} />
            </div>
          );

      const Task = ({ txt }) => <div>{txt}</div>;

      // important that this has both permutations too, as it tests dismount cascade.
      const Week = keyed
        ? days => (
            <div>
              <Day.repeat items={days} key="day" />
            </div>
          )
        : days => (
            <div>
              <Day.repeat items={days} />
            </div>
          );

      const sharedPool = Task.pool;

      test("Components are returned to shared pool", () => {
        const days = [
          {
            day: "Monday",
            tasks: [
              { id: 0, txt: "Clean bathroom", done: true },
              { id: 1, txt: "Dishes", done: true }
            ]
          },
          { day: "Tuesday", tasks: [{ id: 3, txt: "Wash floors", done: true }] },
          {
            day: "Wednesday",
            tasks: [
              { id: 4, txt: "Do laundry", done: true },
              { id: 5, txt: "Clean oven", done: true }
            ]
          }
        ];

        const component = testMount(Week, days);

        expect(component).toRender(`
      <div>
        <div>
          <h3>Monday</h3>
          <div>Clean bathroom</div>
          <div>Dishes</div>
        </div>
        <div>
          <h3>Tuesday</h3>
          <div>Wash floors</div>
        </div>
        <div>
          <h3>Wednesday</h3>
          <div>Do laundry</div>
          <div>Clean oven</div>
        </div>
      </div>
    `);
        expect(sharedPool.length).toEqual(0);

        days[0].tasks[0].done = false;
        days[0].tasks[1].done = false;
        days[1].tasks[0].done = false;
        days[2].tasks[1].done = false;

        component.update();
        expect(component).toRender(`
      <div>
        <div>
          <h3>Monday</h3>
        </div>
        <div>
          <h3>Tuesday</h3>
        </div>
        <div>
          <h3>Wednesday</h3>
          <div>Do laundry</div>
        </div>
      </div>
    `);
        expect(sharedPool.length).toEqual(4);

        days[0].tasks[1].done = true;
        days[1].tasks[0].done = true;
        days[2].tasks.push(days[0].tasks.pop(), days[1].tasks.pop());

        component.update();
        expect(component).toRender(`
      <div>
        <div>
          <h3>Monday</h3>
        </div>
        <div>
          <h3>Tuesday</h3>
        </div>
        <div>
          <h3>Wednesday</h3>
          <div>Do laundry</div>
          <div>Dishes</div>
          <div>Wash floors</div>
        </div>
      </div>
    `);
        expect(sharedPool.length).toEqual(2);

        // Now ensure the Day components dismount their Tasks.
        const wednesday = days.pop();
        component.update();
        expect(component).toRender(`
      <div>
        <div>
          <h3>Monday</h3>
        </div>
        <div>
          <h3>Tuesday</h3>
        </div>
      </div>
    `);
        expect(sharedPool.length).toEqual(5);

        days[0].tasks.push(wednesday.tasks.pop(), wednesday.tasks.pop());
        component.update();
        expect(component).toRender(`
      <div>
        <div>
          <h3>Monday</h3>
          <div>Wash floors</div>
          <div>Dishes</div>
        </div>
        <div>
          <h3>Tuesday</h3>
        </div>
      </div>
    `);

        expect(sharedPool.length).toEqual(3);
      });
    });
  } else {
    test("at least one test", () => {
      expect(true).toBe(true);
    });
  }
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}
