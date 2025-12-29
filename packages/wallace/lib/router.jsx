/*
How it works:

  http://localhost:8080/#/route1


  mount `Router` with the config as props.
  Router listens to changes to URL, tries match to a Route.
  Matching Route gets to resolve, but maybe it should do it by itself.
*/

/*
 * A route.
 * The path is used for matching and extracting args & params.
 * The path is made of chunks separated by "/" e.g. /todos/detail/{id}
 * Chunks are strings or argument descriptors
 * A url matches a route if all the string chunks match e.g.
 * Route path: /todos/detail/{id}
 * Urls:
 *   /todos/detail/001           (yes)
 *   /todos/detail/001?name=joe  (yes, as everything after ? are params)
 *   /todos/001/detail           (no, as chunk[1] != 'detail')
 *   /todos/detail/001/next      (no, as it has more chunks than expected)
 *
 * Args and params may specify a type, in which case they are converted.
 * resolve gets called with {args, params, url} and returns the props for the component.
 */

const events = ["load", "hashchange"];
const noMod = x => x;
const converters = {
  int: v => parseInt(v),
  float: v => parseFloat(v),
  date: v => new Date(v)
};

export const Router = () => <div></div>;

Router.methods = {
  render(props, ctrl) {
    const defaultError = (error, router) => (router.el.innerHTML = error.message);
    this.error = props.error || defaultError;
    this.current = null;
    this.routes = props.routes.map(c => new Route(c[0], c[1], c[2], c[3]));
    events.forEach(e => window.addEventListener(e, () => this.onHashChange()));
    if (props.atts) {
      Object.keys(props.atts).forEach(k => {
        this.el.setAttribute(k, props.atts[k]);
      });
    }
    // Needed in case user extends Router.
    this.base.render.call(this, props, ctrl);
  },
  async onHashChange() {
    const path = location.hash.slice(1) || "",
      len = this.routes.length;
    let i = 0,
      routeData;
    try {
      while (i < len) {
        let route = this.routes[i];
        if ((routeData = route.match(path))) {
          const component = await route.getComponent(routeData, this.ctrl);
          this.current && this.current.cleanup();
          this.apply(component);
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
  apply(component) {
    this.el.innerHTML = "";
    this.el.appendChild(component.el);
  }
};

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
  async getComponent(routeData, ctrl) {
    if (!this.component) {
      this.component = new this.def();
    }
    const props = await this._convert(routeData);
    this.component.render(props, ctrl);
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
