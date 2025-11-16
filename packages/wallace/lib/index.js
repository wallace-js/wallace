import { createComponent, watch, mount } from "./utils";
import { Component } from "./component";
import { KeyedRepeater, SequentialRepeater } from "./repeaters";
import {
  extendComponent,
  findElement,
  getKeyedRepeater,
  getSequentialRepeater,
  onEvent,
  nestComponent,
  defineComponent,
  extendPrototype,
  stashMisc,
  saveRef,
} from "./initCalls";

export {
  extendComponent,
  Component,
  createComponent,
  watch,
  defineComponent,
  extendPrototype,
  findElement,
  getKeyedRepeater,
  getSequentialRepeater,
  KeyedRepeater,
  mount,
  nestComponent,
  onEvent,
  stashMisc,
  saveRef,
  SequentialRepeater,
};
