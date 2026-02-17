/*
The Router is a component which mounts other components based on hash (URL bit after #).

It currently expects the route to be made of chunks separated by / which are either
text or placeholders:

  /todos/detail/{id:int}/notes

It performs no validation yet, and may change to use regex in future.
*/

const events = ["load", "hashchange"];
const noMod = x => x;
const converters = {
  int: v => parseInt(v),
  float: v => parseFloat(v),
  date: v => new Date(v)
};

export const route = (path, componentDef, converter, cleanup) =>
  new Route(path, componentDef, converter, cleanup);

export const Router = () => <div></div>;

Object.assign(Router.prototype, {
  render(props, /* #INCLUDE-IF: allowCtrl */ ctrl) {
    const defaultError = (error, router) => (router.el.innerHTML = error.message);
    this.error = props.error || defaultError;
    this.current = null;
    events.forEach(e => window.addEventListener(e, () => this.onHashChange()));
    if (props.atts) {
      Object.keys(props.atts).forEach(k => {
        this.el.setAttribute(k, props.atts[k]);
      });
    }
    this.base.render.call(this, props, /* #INCLUDE-IF: allowCtrl */ ctrl);
  },
  async onHashChange() {
    const path = location.hash.slice(1) || "",
      routes = this.props.routes,
      len = routes.length;
    let i = 0,
      routeData;
    try {
      while (i < len) {
        let route = routes[i];
        if ((routeData = route.match(path))) {
          const component = await route.getComponent(
            routeData,
            /* #INCLUDE-IF: allowCtrl */ this.ctrl
          );
          this.current && this.current.cleanup();
          this.mount(component);
          this.current = route;
          return;
        }
        i++;
      }
      throw new Error(`Router unable to match path "${path}"`);
    } catch (error) {
      this.error(error, this);
    }
  },
  mount(component) {
    this.el.textContent = "";
    this.el.appendChild(component.el);
  }
});

export function Route(path, def, convert, cleanup) {
  this.chunks = path
    .split("/")
    .map(s => (s.startsWith("{") ? new RouteArg(s.slice(1, -1)) : s));
  this.def = def;
  this._convert = convert || noMod;
  this._cleanup = cleanup || noMod;
  this.component = null;
}

Route.prototype = {
  match(url) {
    const parts = url.split("?", 2),
      hash = parts[0],
      query = parts[1],
      args = {},
      definedChunksCount = this.chunks.length,
      foundChunks = hash.split("/");
    if (definedChunksCount !== foundChunks.length) return;
    let i = 0;
    while (i < definedChunksCount) {
      let definedChunk = this.chunks[i];
      let foundChunk = foundChunks[i];
      if (definedChunk instanceof RouteArg) {
        args[definedChunk.name] = definedChunk.convert(foundChunk);
      } else if (definedChunk != foundChunk) {
        return;
      }
      i++;
    }
    return { args, params: new URLSearchParams(query), url };
  },
  async getComponent(routeData, /* #INCLUDE-IF: allowCtrl */ ctrl) {
    if (!this.component) {
      this.component = new this.def();
    }
    const props = await this._convert(routeData);
    this.component.render(props, /* #INCLUDE-IF: allowCtrl */ ctrl);
    return this.component;
  },
  /**
   * Allows user to delete component or perform other cleanup.
   */
  cleanup() {
    this._cleanup(this);
  }
};

function RouteArg(str) {
  let chunks = str.split(":");
  this.name = chunks[0];
  this.convert = converters[chunks[1]] || noMod;
}
