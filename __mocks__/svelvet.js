const Slider = jest.fn();
const generateInput = jest.fn((initialData) => {
  const subscribers = new Set();
  let value = null;

  return {
    value: initialData.value,
    subscribe: (callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    set: (newValue) => {
      value = newValue;
      subscribers.forEach((callback) => callback(value));
    },
  };
});
const generateOutput = jest.fn();
const Anchor = jest.fn();

module.exports = {
  Slider,
  generateInput,
  generateOutput,
  Anchor,
};
