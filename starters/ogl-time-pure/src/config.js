// config.js: the one file you edit to size and name the film.
// render.mjs takes fps from its own --fps flag (default 24); keep the two equal.
export const PROJECT = {
  scene: 'demo',      // file in scenes/ (without .js). Preview another one with studio.html?scene=<name>
  w: 1920,
  h: 1080,
  fps: 24,
  dur: 8,             // seconds; a scene may override with `dur` on the object it returns
  msaa: true,         // hardware antialiasing on the default framebuffer; scenes that render through a post chain set this false and use FXAA
  audio: '',          // e.g. 'assets/score.m4a'; render.mjs muxes it into --clip and --encode
};
