/** Reference-counted locks allow a modal to open above the mobile scratchpad. */
const inertLocks = new WeakMap<object, { count: number; previous: boolean }>();
const scrollLocks = new WeakMap<object, { count: number; previous: string }>();

export function acquireInert(elements: { inert: boolean }[]) {
  const unique = [...new Set(elements)];
  for (const element of unique) {
    const lock = inertLocks.get(element) ?? {
      count: 0,
      previous: element.inert,
    };
    lock.count++;
    inertLocks.set(element, lock);
    element.inert = true;
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const element of unique) {
      const lock = inertLocks.get(element)!;
      if (--lock.count === 0) {
        element.inert = lock.previous;
        inertLocks.delete(element);
      }
    }
  };
}
export function acquireScrollLock(element: { style: { overflow: string } }) {
  const lock = scrollLocks.get(element) ?? {
    count: 0,
    previous: element.style.overflow,
  };
  lock.count++;
  scrollLocks.set(element, lock);
  element.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--lock.count === 0) {
      element.style.overflow = lock.previous;
      scrollLocks.delete(element);
    }
  };
}
