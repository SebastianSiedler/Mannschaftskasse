import { useMemo, useState } from 'react';

export class Observable<T> {
  constructor(value: T) {
    this.value = value;
  }
  value: T;
}

/**
 * @example
 * const counter = useRefState(1)
 * ...
 * onClick={() => counter.value += 1 }
 */
const useRefState = <T>(value: T): Observable<T> => {
  const [valueState, setValueState] = useState(value);

  return useMemo(() => {
    // let _proxy: Observable<any>;
    const observable = new Observable(valueState);
    const _proxy: Observable<any> = new Proxy(observable, {
      set(object, prop, newValue, receiver) {
        if (prop === 'value' && receiver === _proxy) {
          object[prop] = newValue;
          setValueState(newValue);
          return true;
        } else {
          return false;
        }
      },
    });
    return _proxy;
  }, []);
};

// src: https://github.com/Mighty683/use-reactive
