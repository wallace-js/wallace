export function Nester(componentDefinition) {
  this.d = componentDefinition;
  this.i = null;
  /* #INCLUDE-IF: allowDismount */ this.s = componentDefinition.pool;
}

Nester.prototype = {
  send: function (props, ctrl) {
    this.c().render(props, ctrl);
  },
  get: function () {
    if (!this.i) {
      if (wallaceConfig.flags.allowDismount) {
        this.i = this.s.pop() || new this.d();
      } else {
        this.i = new this.d();
      }
    }
    return this.i;
  },
  /* #INCLUDE-IF: allowDismount */ dismount: function () {
    const i = this.i;
    if (i) {
      i.dismount();
      this.s.push(i);
      this.i = null;
    }
  }
};
