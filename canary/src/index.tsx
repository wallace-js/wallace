import { mount, Uses, Router } from "wallace";

interface iGreeting {
  msg: string;
  name: string;
}

const Greeting: Uses<iGreeting> = ({ msg, name }) => (
  <div>
    {name} says {msg}!
  </div>
);

console.log(Router);
mount("main", Greeting, { msg: "hello", name: "Wallace" });
