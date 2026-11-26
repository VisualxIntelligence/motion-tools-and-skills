// Every template piece: camera moves (one named move each) and scene templates (a set with a short coverage pattern).
import type { Piece } from "../piece";
import { CAMERA_TEMPLATES } from "./cameras";
import { CAMERA2_TEMPLATES } from "./cameras2";
import { STORY_TEMPLATES } from "./story";
import { ANGLE_TEMPLATES, PREVIEW_TEMPLATES } from "./angles";
import { SCENE_TEMPLATES } from "./scenes";
import { OBJECT_TEMPLATES } from "./objects";
import { ACTION_TEMPLATES } from "./action";
import { ONER_TEMPLATES } from "./oners";
import { SCENE2_TEMPLATES } from "./scenes2";
import { PRODUCT_TEMPLATES } from "./products";
import { FAMOUS_TEMPLATES } from "./famous";

export const TEMPLATE_PIECES: Record<string, Piece> = Object.fromEntries([...CAMERA_TEMPLATES, ...CAMERA2_TEMPLATES, ...ANGLE_TEMPLATES, ...PREVIEW_TEMPLATES, ...OBJECT_TEMPLATES, ...SCENE_TEMPLATES, ...ACTION_TEMPLATES, ...ONER_TEMPLATES, ...SCENE2_TEMPLATES, ...PRODUCT_TEMPLATES, ...FAMOUS_TEMPLATES, ...STORY_TEMPLATES].map((p) => [p.id, p]));

// showcase films: whole scenes built from the templates' moves, rendered by id, kept out of the template gallery
import { showcasePiece } from "./showcase";
export const SHOW_TEMPLATES: Piece[] = [showcasePiece()];
export const SHOW_PIECES: Record<string, Piece> = Object.fromEntries(SHOW_TEMPLATES.map((p) => [p.id, p]));
