import { testMount } from "../utils";

describe("Pools in keyed repeater", () => {
  test("share pool", () => {
    const Task = ({ txt }) => <div>{txt}</div>;
    const Day = day => (
      <div>
        <h3>{day}</h3>
        <Task.repeat items={tasks[day]} pool={pool} key="id" />
      </div>
    );
    const Week = () => (
      <div>
        <Day.repeat items={["Monday", "Tuesday", "Wednesday"]} />
      </div>
    );

    const tasks = {
      Monday: [
        { id: 0, txt: "Clean bathroom" },
        { id: 1, txt: "Dishes" }
      ],
      Tuesday: [{ id: 3, txt: "Wash floors" }],
      Wednesday: [
        { id: 4, txt: "Do laundry" },
        { id: 5, txt: "Clean oven" }
      ]
    };

    const pool = new Map();
    const component = testMount(Week);
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
    expect(pool.size).toEqual(5);

    tasks.Tuesday.push(tasks.Monday.pop());
    tasks.Tuesday.push({ id: 6, txt: "Clean living room" });
    component.update();
    expect(component).toRender(`
      <div>
       <div>
        <h3>Monday</h3>
        <div>Clean bathroom</div>
      </div>
      <div>
        <h3>Tuesday</h3>
        <div>Wash floors</div>
        <div>Dishes</div> 
        <div>Clean living room</div>
       </div>
       <div>
         <h3>Wednesday</h3>
         <div>Do laundry</div>
         <div>Clean oven</div>
       </div>
      </div>
    `);
    expect(pool.size).toEqual(6);

    const task = tasks.Wednesday[0];
    task.txt = "Ironing";
    pool.get(task.id).update();
    expect(component).toRender(`
      <div>
       <div>
        <h3>Monday</h3>
        <div>Clean bathroom</div>
      </div>
      <div>
        <h3>Tuesday</h3>
        <div>Wash floors</div>
        <div>Dishes</div> 
        <div>Clean living room</div>
       </div>
       <div>
         <h3>Wednesday</h3>
         <div>Ironing</div>
         <div>Clean oven</div>
       </div>
      </div>
    `);
  });
});

test("JSX not allowed in expressions", () => {
  const code = `
    const Day = day => (
      <div>
        <h3>{day}</h3>
        <Task.repeat items={tasks[day]} pool={pool} />
      </div>
    );
  `;
  expect(code).toCompileWithError("Directive `pool' requires `key` to be set too.");
});
