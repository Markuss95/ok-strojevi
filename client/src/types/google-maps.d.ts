// Minimal ambient typing for the Google Maps JS API. We load it dynamically
// (see src/lib/googleMaps.ts) rather than via @types/google.maps, so the
// objects are typed loosely as `any`. All access goes through `window.google`.
export {};

declare global {
  interface Window {
    google?: any;
    [key: string]: any;
  }
}
