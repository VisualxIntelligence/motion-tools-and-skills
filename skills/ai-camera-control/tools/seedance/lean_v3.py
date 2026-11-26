#!/usr/bin/env python3
"""Lean prompt builder: the pill clip decides the camera, framing and timing, so the text stays short.

Keep the prompt short: the blockout is there so the model follows the camera movement.
The text carries only the story and feeling, a short place, the person, a few flowing sentences of performance (motive, how the
feeling changes, the key micro-expressions) and the sound. No beat lists, no time stamps, no camera words outside the one
references paragraph. Judge it with qa3.py.

Scene fields used: person {name, pronoun, face_traits, wears}, goal, place, performance (with {LINE} when the shot speaks),
sound, line {text, how}, second_person {name, capsule, description}, mood {environment, panel | image}.

  python3 tools/seedance/lean_v3.py --template CAM22-PedestalUp --scene tools/seedance/scenes/CAM22-PedestalUp.json
  -> .work/prompts/CAM22-PedestalUp/lean-t/ and lean-m/   (prompt.txt, request.json, job.json, pill.mp4, + the mood picture in -m)

Writes local files only. Nothing is sent.  Needs: numpy, Pillow, ffmpeg.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prompt_lib import add_builder_args, load_scene, mood_image, out_dir_for, resolve_pill, write_job

R_SHOT = ("@video1 is the shot. The camera and every movement of it, the framing, how large {name} is in the frame and where {he} stands, and the timing all come exactly from @video1 and never from this text. "
          "In it the grey set and the striped capsule are only placeholders. The capsule is {name}. Every grey stand-in only marks where something stands: rebuild each as a real, fully detailed object of the same size in the same place, with real materials, textures, wear and dirt; no cone, sphere, plain box or untextured surface appears in the final video, and the grey clay set is not adopted. "
          "The capsule's red and black stripes are only a label: no clothing, skin, prop or surface takes those colours or stripes, and no striped capsule appears at any moment. Never show a capsule.")
R_FACE = "@image1 is only for {name}'s face, {face_traits}; ignore {photo_ignore}."
R_MOOD = "@image2 is a mood reference only (palette, light, haze, film feel). It is not a layout to copy."
R_VOICE = "@audio1 is {name}'s own voice: {he} speaks the line in that voice."
LOOK = "Photoreal live-action cinema shot on an ARRI Alexa 35, anamorphic look, soft diffusion and halation on the lights, natural film grain."


def build_text(scene, mood):
    roles = scene.fmt(R_SHOT) + " " + R_FACE.format(name=scene.name, face_traits=scene.face_traits, photo_ignore=scene.photo_ignore) \
        + (" " + R_MOOD if mood else "") + (" " + scene.fmt(R_VOICE) if scene.speaks else "")
    dlg = (f'【Dialogue】\n{scene.name} says exactly, {scene.line.get("how", "quietly")}: "{scene.line["text"]}" The film contains this line and no other words.\n\n') if scene.speaks else ""
    sam = scene.second("The {capsule} capsule is {second}.")
    return ("【Goal】\n" + scene.get("goal") + "\n\n" + dlg + "【References】\n" + roles + "\n\n【Place】\n" + scene.get("place") +
            f"\n\n【{scene.name}】\nThe red-and-black capsule is {scene.name}, who wears " + scene.get("person")["wears"].rstrip(".") + "." + sam +
            "\n\n【Performance】\n" + scene.perform() + "\n\n【Sound and look】\n" + scene.get("sound") + " No music. " + LOOK)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    add_builder_args(ap)
    a = ap.parse_args()
    scene = load_scene(a.scene)
    if "wears" not in scene.d["person"]:
        sys.exit("FAIL the scene needs person.wears")
    pill = resolve_pill(a.template, a.pill)
    for v in (["t", "m"] if a.variant == "both" else [a.variant]):
        out = out_dir_for(a, "lean", v)
        os.makedirs(out, exist_ok=True)
        mood = mood_image(scene, out) if v == "m" else None
        write_job(out, "lean", a.template, v, scene, build_text(scene, v == "m"), pill, a.face_name, a.voice_name, mood, a.standin)


if __name__ == "__main__":
    main()
