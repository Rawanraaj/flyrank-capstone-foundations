import "@testing-library/jest-dom";

// JSDOM does not implement scrollIntoView
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
