// simple pub-sub using window
export const emitUpdate = () => {
  window.dispatchEvent(new Event("DATA_UPDATED"));
};

export const onUpdate = (cb) => {
  window.addEventListener("DATA_UPDATED", cb);
  return () => window.removeEventListener("DATA_UPDATED", cb);
};