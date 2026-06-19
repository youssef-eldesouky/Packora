// Polyfill TextEncoder/TextDecoder — required by react-router v7 in jsdom environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
//   expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
