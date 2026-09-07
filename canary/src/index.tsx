import { mount, Takes, Router } from "wallace";

interface iGreeting {
  msg: string;
  name: string;
}

const Greeting: Takes<iGreeting> = ({ msg, name }) => (
  <div>
    {name} says {msg}!
  </div>
);

console.log(Router);
mount("main", Greeting, { msg: "hello", name: "Wallace" });
