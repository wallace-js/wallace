/*
The Router is a component which mounts other components based on URL hash.

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
  render(model, /* #INCLUDE-IF: allowHub */ hub) {
    if (wallaceConfig.flags.allowBase) {
    } else {
      throw new Error(
        "Flag `allowBase` must be set to true in the config for this feature."
      );
    }
    if (wallaceConfig.flags.allowDismount) {
    } else {
      throw new Error(
        "Flag `allowDismount` must be set to true in the config for this feature."
      );
    }
    this._alive = true;
    this.error =
      model.error ||
      (error => {
        throw error;
      });
    this.current = null;
    this.handlers = events.map(e => {
      const handler = () => this.onHashChange();
      window.addEventListener(e, handler);
      return { e, handler };
    });

    if (model.atts) {
      Object.keys(model.atts).forEach(k => {
        this.el.setAttribute(k, model.atts[k]);
      });
    }
    this.base.render.call(this, model, /* #INCLUDE-IF: allowHub */ hub);
  },
  async onHashChange() {
    const path = location.hash.slice(1) || "",
      routes = this.model.routes,
      len = routes.length;
    let i = 0,
      routeData;
    try {
      while (i < len) {
        let route = routes[i];
        if ((routeData = route.match(path))) {
          const component = await route.getComponent(
            routeData,
            /* #INCLUDE-IF: allowHub */ this.hub
          );
          if (!this._alive) return;
          this.current && this.current.cleanup();
          this.mount(component);
          this.current = route;
          return;
        }
        i++;
      }
      if (!this._alive) return;
      throw new Error(`Router unable to match path "${path}"`);
    } catch (error) {
      this.error(error, this);
    }
  },
  mount(component) {
    this.el.textContent = "";
    this.el.appendChild(component.el);
  },
  /* #INCLUDE-IF: allowDismount */
  dismount() {
    this._alive = false;
    if (this.current) {
      this.current.cleanup();
    }
    this.base.dismount.call(this);
    if (this._handlers) {
      this._handlers.forEach(({ e, handler }) => {
        window.removeEventListener(e, handler);
      });
    }
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
  async getComponent(routeData, /* #INCLUDE-IF: allowHub */ hub) {
    if (!this.component) {
      this.component = new this.def();
    }
    const model = await this._convert(routeData);
    this.component.render(model, /* #INCLUDE-IF: allowHub */ hub);
    return this.component;
  },
  /**
   * Allows user to dismount component or perform other cleanup.
   */
  cleanup() {
    this._cleanup(this.component);
  }
};

function RouteArg(str) {
  let chunks = str.split(":");
  this.name = chunks[0];
  this.convert = converters[chunks[1]] || noMod;
}
