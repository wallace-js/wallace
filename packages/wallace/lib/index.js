import { mount, watch, protect } from "./utils";
import { Component } from "./component";
import { KeyedRepeater, SequentialRepeater } from "./repeaters";
import {
  extendComponent,
  defineComponent,
  findElement,
  onEvent,
  nestComponent,
  saveRef,
  stashMisc
} from "./initCalls";

export {
  Component,
  defineComponent,
  extendComponent,
  findElement,
  KeyedRepeater,
  mount,
  nestComponent,
  onEvent,
  protect,
  saveRef,
  SequentialRepeater,
  stashMisc,
  watch
};
