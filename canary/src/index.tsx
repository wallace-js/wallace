import { mount, Uses } from "wallace";

interface iGreeting {
  msg: string;
  name: string;
}

const Greeting: Uses<iGreeting> = ({ msg, name }) => (
  <div>
    {name} says {msg}!
  </div>
);

mount("main", Greeting, { msg: "hello", name: "Wallace" });
