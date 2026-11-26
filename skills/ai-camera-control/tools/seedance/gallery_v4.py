#!/usr/bin/env python3
"""Gallery-format prompt builder: the long form that followed the pill clip exactly.

The prompts of the 3D gallery followed the clip because they were the long form: a Generation Goal, long Reference Asset Roles,
Subjects and Relationships, a Camera and Event Script that states the camera, the shot size and where the person sits in the frame
(written from the same numbers the clip was rendered from, so the words and the clip agree), and Maintain Consistency.
Here the camera script is REQUIRED and must carry the template's own numbers (lens, size, move, distances). The acting stays short.
Judge it with qa4.py.

Scene fields used: person {name, pronoun, face_traits, photo_ignore, wears}, goal, place, subject_position, camera, camera_numbers,
performance (with {LINE} when the shot speaks), sound, line {text, how}, second_person {name, capsule, description}, mood.

  python3 tools/seedance/gallery_v4.py --template CAM22-PedestalUp --scene tools/seedance/scenes/CAM22-PedestalUp.json
  -> .work/prompts/CAM22-PedestalUp/gallery-t/ and gallery-m/

Writes local files only. Nothing is sent.  Needs: numpy, Pillow, ffmpeg.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prompt_lib import add_builder_args, load_scene, mood_image, out_dir_for, resolve_pill, write_job

ROLE_SHOT = ("@video1 is a coarse-blockout reference: a grey clay set in which the person is replaced by a tall rounded capsule with loud diagonal stripes, as tall as {he} is, standing exactly where {he} stands, with a round white dot on the side {he} faces, at eye height. "
             "Use it for the camera: positions, movements, lens feel, framing, shot size and their timing, and for where {name} stands, how large {he} is in the frame and which way {he} faces. The capsule carries no body or pose, so every pose, gesture and expression comes from this description. "
             "Every other object in it is a simple grey stand-in that only marks where things stand: take every shape, material and look from this description. Never show a capsule: the capsule becomes {name}. Do not adopt its grey clay set or its stand-in shapes.")
ROLE_REBUILD = ("The set in @video1 is only a layout of crude placeholders: rebuild every wall, window, piece of furniture, vehicle and prop as a real, fully detailed object of the same size in the same place, with real materials, textures, wear and dirt. "
                "Plain blocks become real stone, brick, wood, tile or metal. No cone, sphere, plain box or untextured surface appears in the final video.")
ROLE_STRIPES = "The capsule's red and black stripes are only a label for where {name} is: no clothing, skin, prop or surface takes those colours or stripes, and no striped capsule appears at any moment, even far in the background or through a doorway."
ROLE_FACE = "@image1 is used only for {name}'s facial features, {face_traits}; ignore {photo_ignore}."
ROLE_MOOD = "@image2 is used only for the mood of the place: its colour palette, the quality of its light, haze and glow, and its film feel. It is not a layout and not a set to copy: do not reproduce its architecture, objects or composition."
ROLE_VOICE = "@audio1 is {name}'s own voice, a real recording: {he} speaks the line in that voice, with its timbre, pace and accent."
HUMAN = ("Every action is performed with natural, realistic human motion: real weight and balance, momentum carried through each movement, and loose, believable arms and shoulders. The written description of the action decides how it looks. "
         "{name} is a real human being with natural skin, hair and clothing; no mannequin, clay figure, capsule or doll appears anywhere, at any moment.")
LOOK = "The final visuals are live-action and photographic: photoreal cinema shot on an ARRI Alexa 35 with anamorphic lenses, natural film grain, soft diffusion and halation on the lights, shallow depth of field, motivated light and real atmospheric haze."


def build_text(scene, mood):
    roles = "\n".join([scene.fmt(ROLE_SHOT), ROLE_REBUILD, scene.fmt(ROLE_STRIPES),
                       ROLE_FACE.format(name=scene.name, face_traits=scene.face_traits, photo_ignore=scene.photo_ignore)]
                      + ([ROLE_MOOD] if mood else []) + ([scene.fmt(ROLE_VOICE)] if scene.speaks else []))
    dlg = (f'【Dialogue, exact words】\n{scene.name} says exactly, {scene.line.get("how", "quietly")}: "{scene.line["text"]}" The film contains exactly this line and no other words.\n\n') if scene.speaks else ""
    sam = scene.second("The {capsule} striped capsule is {second}.")
    P = scene.p
    return ("【Generation Goal】\nGenerate a live-action shot in one take. " + scene.get("goal") + "\n\n" + dlg + "【Reference Asset Roles】\n" + roles +
            f"\n\n【Subjects and Relationships】\nThe red-and-black striped capsule in @video1 corresponds to {scene.name}, " + scene.get("subject_position").rstrip(".") +
            f". {P['He']} wears " + scene.get("person")["wears"].rstrip(".") + "." + sam + " The place: " + scene.get("place") +
            "\n\n【Camera and Event Script】\n" + scene.get("camera") + "\n" + f"{scene.name}'s performance: " + scene.perform() + "\n" + scene.fmt(HUMAN) +
            "\n" + scene.get("sound") + " There is no music of any kind.\n" + LOOK +
            f"\n\n【Maintain Consistency】\nKeep {scene.name}'s identity and clothing, the place and its light, the camera move, the shot size and {scene.name}'s size and position in the frame consistent with @video1. Keep the lighting and time of day constant from start to end.")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    add_builder_args(ap)
    a = ap.parse_args()
    scene = load_scene(a.scene)
    if "wears" not in scene.d["person"]:
        sys.exit("FAIL the scene needs person.wears")
    pill = resolve_pill(a.template, a.pill)
    for v in (["t", "m"] if a.variant == "both" else [a.variant]):
        out = out_dir_for(a, "gallery", v)
        os.makedirs(out, exist_ok=True)
        mood = mood_image(scene, out) if v == "m" else None
        write_job(out, "gallery", a.template, v, scene, build_text(scene, v == "m"), pill, a.face_name, a.voice_name, mood, a.standin)


if __name__ == "__main__":
    main()
