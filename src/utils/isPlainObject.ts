// Borrowed from https://github.com/jonschlinkert/is-plain-object/blob/v5.0.0/is-plain-object.js

const hasObjectPrototype = (o: any): boolean => {
  return Object.prototype.toString.call(o) === '[object Object]';
};

const hasIsPrototypeOf = (prot: any): boolean => {
  return Object.prototype.hasOwnProperty.call(prot, 'isPrototypeOf');
};

export const isPlainObject = (o: any): o is Record<PropertyKey, unknown> => {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor === 'undefined') {
    return true;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }

  // If constructor does not have an Object-specific method
  if (!hasIsPrototypeOf(prot)) {
    return false;
  }

  // Most likely a plain Object
  return true;
};
