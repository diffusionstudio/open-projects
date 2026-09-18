// A `ref` receives the element's SceneNode, for HTML content as for
// composition elements; the DOM element gsap animates is its `element`.
export const dom = (node) => node?.element ?? node;
