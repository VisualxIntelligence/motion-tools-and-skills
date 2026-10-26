import { PROJECT } from './config.js';
import { createStage } from './stage.js';

// studio.html?scene=<name> previews another scene in the browser; render.mjs uses PROJECT.scene.
const name = new URLSearchParams(location.search).get('scene') || PROJECT.scene;
const scene = await import(`../scenes/${name}.js`);
await createStage(scene.default, scene.stage || {});
