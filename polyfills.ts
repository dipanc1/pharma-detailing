// This file must be imported FIRST before any other modules
// It patches missing globals that JSC on older Android devices doesn't provide

declare global {
  interface Global {
    FormData?: any;
  }
}

// Polyfill FormData for JSC on Android 9
if (typeof global.FormData === 'undefined') {
  (global as any).FormData = class FormData {
    private _fields: Array<[string, any]> = [];

    constructor() {
      this._fields = [];
    }

    append(name: string, value: any) {
      this._fields.push([name, value]);
    }

    entries() {
      return this._fields.entries();
    }

    // Additional methods for fetch compatibility
    get(name: string) {
      return this._fields.find(([key]) => key === name)?.[1];
    }

    getAll(name: string) {
      return this._fields.filter(([key]) => key === name).map(([, val]) => val);
    }

    has(name: string) {
      return this._fields.some(([key]) => key === name);
    }

    delete(name: string) {
      const idx = this._fields.findIndex(([key]) => key === name);
      if (idx !== -1) {
        this._fields.splice(idx, 1);
      }
    }

    forEach(callback: (value: any, name: string) => void) {
      this._fields.forEach(([name, value]) => {
        callback(value, name);
      });
    }

    [Symbol.iterator]() {
      return this._fields.entries();
    }
  };
}

// Polyfill fetch's FormData support if needed
if (typeof global.fetch !== 'undefined' && !global.FormData) {
  console.warn('[Polyfills] FormData polyfill loaded');
}
