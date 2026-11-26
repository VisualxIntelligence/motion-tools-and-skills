#!/usr/bin/env python3
"""Prompt builder with the framing MEASURED from the pill clip (the first 24-environment recipe).

The pill clip is @video1. The prompt carries: the goal, the dialogue (when the shot speaks), the reference roles with a size rule,
the measured framing second by second, the subjects, the camera and event script, the sound, the look and what to keep. The framing
block is read from the red pill in the clip, one line per second: where it is, how wide, and where the frame cuts the person off
("the frame shows only the top 45% of his body, down to about his chest"). Without it the model reads "fills 85% of the frame" as a
whole person. The two lean and gallery builders replaced this long form; the framing block is the part worth keeping.

Scene fields used: person {name, pronoun, face_traits, photo_ignore}, goal, subjects, script, sound, look, keep, place (the place and
its feel, written out; the picture is only a mood reference), line {text, how, at}, mood {environment, panel | image}.
For a speaking shot a script line "says the line" becomes the exact quoted line, and statue wording ("very still", "motionless" ...)
is rewritten.

  python3 tools/seedance/build_env24.py --template CAM25-ArcAndRise --scene my-scene.json
  python3 tools/seedance/build_env24.py --template CAM25-ArcAndRise --scene my-scene.json --framing-only     (print only the framing block)
  -> .work/prompts/<ID>/env24-t/ and env24-m/ (prompt.txt, request.json, job.json, pill.mp4)

Writes local files only. Nothing is sent. There is no gate for this long form in tools/seedance (qa3.py and qa4.py gate the lean and
gallery forms); read the prompt and the job.json yourself.  Needs: numpy, Pillow, ffmpeg.
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import fail
from prompt_lib import add_builder_args, framing_text, load_scene, mood_image, out_dir_for, resolve_pill, write_job

ROLES = ("@video1 is a coarse-blockout reference: a grey clay set in which the person is replaced by a tall rounded capsule with loud diagonal stripes, as tall as {he} is, "
         "standing exactly where {he} stands, with a round white dot on the side {he} faces, at eye height. Use it for the camera: positions, movements, lens feel, framing and their timing, "
         "and for where the person stands, how tall {he} is in frame and which way {he} faces. The capsule carries no body or pose, so every pose, gesture and expression comes from this description. "
         "Every other object in it is a simple grey stand-in that only marks where something stands: take every shape, material and look from @image2 and this description. "
         "Never show a capsule: the capsule becomes the person it stands for. Do not adopt its grey clay set or its stand-in shapes.")
ENVT = ("There is no reference picture of the place: it is described completely in words, and the words decide its architecture, materials, colour, light and film feel, never the framing, the camera position or where anyone stands, which come only from @video1. "
        "The place and its feel: {t}")
ENVM = ("The place is described completely in words below, and the words decide its architecture, materials, colour, light and film feel; the camera, framing and where anyone stands come only from @video1. "
        "@image2 is a mood reference only: one photograph that shows the colour palette, the quality of the light, the haze, glow, softness and film feel. It is not a map and not a set to copy: do not reproduce its architecture, objects, furniture, layout or composition. "
        "The place and its feel: {t}")
SIZE = ("The capsule is {name}'s exact silhouette: {name} fills the same area of the frame as the capsule does at every moment, at the same height, in the same place and at the same size; where the frame edge cuts the capsule off, it cuts {name} off at the same place. "
        "Do not make the shot wider or looser than @video1, and do not move {name} to another part of the set: if {he} is large in @video1 {he} is large in the video, and if {he} is out of frame in @video1 {he} is out of frame in the video.")
SET = ("The set in @video1 is only a layout of crude placeholders: rebuild every wall, building, vehicle, light, piece of furniture and prop as a real, fully detailed object of the same size in the same place, "
       "with real materials, textures, wear and dirt. Plain blocks become real stone, brick, wood, fabric or metal. No cone, sphere, plain box or untextured surface appears in the final video.")
CAPS = ("The capsule's red and black stripes are only a label for where the person is: no clothing, skin, prop or surface takes those colours or stripes, "
        "and no striped capsule appears at any moment, even far in the background.")
VOICE = ("@audio1 is {name}'s own voice, a real recording. {His} line is spoken in that voice: take the timbre, pitch, pace, accent and warmth from @audio1, in a quiet, low register that fits the scene. "
         "Do not reuse the words of @audio1, only its voice; {he} says only the line in the dialogue block.")
FACE = ("@image1 is used only for {name}'s identity: {his} facial features, {face_traits}. Ignore everything else about that photograph: {photo_ignore}. "
        "{His} skin, hair and clothes take their light, colour, contrast, haze, grain and sharpness from the scene {he} stands in, and from nothing else.")
HUMAN = ("Every action is performed with natural, realistic human motion: real weight and balance, momentum carried through each movement, and loose, believable arms and shoulders. "
         "The written description of the action decides how it looks.\n"
         "{name} is a real human being with natural skin, hair and clothing. No mannequin, clay figure, capsule, faceless figure or doll appears anywhere, at any moment.\n")
INTEGRATE = ("{name} is part of the frame and not a figure placed on top of it. {He} is lit only by this scene's own light: the same direction, colour and hardness as everything around {him}, with the same colour cast on {his} skin and clothes, "
             "deep shadow on {his} shadow side that matches the shadows of the set, and a rim of the scene's light from behind. {He} is in the same air as the set: the haze, dust, mist or rain of the place falls between the lens and {him}, "
             "softens {him} a little more as {he} gets further from the lens, settles on {his} hair, shoulders and clothes, and is stirred by {his} movement. {His} edges are soft and slightly bloomed by the lens like every other edge in the frame, "
             "{his} sharpness and depth of field follow the lens and {his} distance like the rest of the image, and the film grain is the same on {him} as on the set. "
             "{He} is firmly in contact with the ground: {his} feet press into it, {he} casts a soft shadow on it that matches the other shadows, and the ground, dust and puddles around {his} feet react to {his} weight and steps. "
             "Wind, draughts and {his} own motion move {his} hair and clothes the way they move everything else in the place. {His} scale against the buildings, furniture and doors is exactly what the blockout shows.\n")
SILENT = "{name} keeps {his} mouth naturally closed and says nothing; there is no narration, and no subtitles or on-screen text appear."
SPEAKS = "{name} says only the line listed in the dialogue block and no other words; there is no narration, no other voice, and no subtitles or on-screen text appear."
LOOK = ("The picture is photoreal live-action cinema: shot on an ARRI Alexa 35 with vintage anamorphic prime lenses, 2.39:1, natural 35mm film grain, a soft 1/4 Black Pro-Mist diffusion on the lights, "
        "gentle halation round every bright light source, shallow depth of field with oval anamorphic bokeh, real atmospheric haze and depth, motivated practical light with soft falloff, "
        "rich but natural contrast with colour kept in the shadows, and real textured materials everywhere. It must look like a still pulled from a feature film, never like a render, a game or a video effect.")
STATUE_FIX = [("stands very still, looking out", "stands at the window, looking out"), ("stands very still", "stands quietly"), ("he stands still and looks", "he stands in the room and looks"),
              ("he stands motionless under", "he stands under"), ("completely still", "quiet"), ("does not move", "does not leave his spot"), ("very still", "quiet"),
              ("stands still", "stands quietly"), ("motionless", "quiet"), ("frozen", "caught")]


def fmt(scene, text):
    """Fill the pronoun and name tokens, including {His}."""
    return scene.fmt(text.replace("{His}", scene.p["his"].capitalize()))


def fix_script(scene):
    """The script, with 'says the line' replaced by the exact quote, and statue wording rewritten, for a speaking shot."""
    sc = scene.get("script")
    if scene.speaks:
        sc = re.sub(r"says the line", lambda m: 'says "' + scene.line["text"] + '"', sc)
        for a, b in STATUE_FIX:
            sc = sc.replace(a, b)
    return sc


def build_text(scene, clip, mood, standin="pin"):
    P = scene.p
    dlg = ""
    if scene.speaks:
        at = scene.line.get("at")
        when = f"Shot 1, from about {at} seconds, " if at is not None else ""
        dlg = (f"【Dialogue, exact words】\n{when}{scene.name} says exactly, {scene.line.get('how', 'quietly')}: \"{scene.line['text']}\"\n"
               "The film contains exactly this line and no other words.\n\n")
    envtext = scene.get("place")
    env = (ENVM if mood else ENVT).format(t=envtext)
    roles = fmt(scene, ROLES) + "\n" + fmt(scene, SIZE) + "\n" + env + "\n" + SET + "\n" + CAPS + "\n" + \
        fmt(scene, FACE.replace("{face_traits}", scene.face_traits).replace("{photo_ignore}", scene.photo_ignore)) + (("\n" + fmt(scene, VOICE)) if scene.speaks else "")
    p = ("【Generation Goal】\n" + scene.get("goal") + "\n\n" + dlg + "【Reference Asset Roles】\n" + roles +
         "\n\n【Subjects and Relationships】\n" + scene.get("subjects") + "\n\n【Camera and Event Script】\n" + framing_text(clip, scene, standin) + fix_script(scene) + "\n" +
         fmt(scene, HUMAN) + fmt(scene, INTEGRATE) + fmt(scene, SPEAKS if scene.speaks else SILENT) + "\n" + scene.get("sound") +
         "\nThe final visuals are live-action and photographic: " + scene.get("look") + " " + LOOK + "\n\n【Maintain Consistency】\n" + scene.get("keep"))
    if not mood:   # words only: the picture does not exist
        p = p.replace("@video1 and @image2", "@video1 and the written description of the place").replace("@image2", "the written description of the place")
    return p


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    add_builder_args(ap)
    ap.add_argument("--framing-only", action="store_true", help="print the measured framing block and stop")
    a = ap.parse_args()
    scene = load_scene(a.scene)
    pill = resolve_pill(a.template, a.pill)
    if a.framing_only:
        print(framing_text(pill, scene, a.standin))
        return
    for v in (["t", "m"] if a.variant == "both" else [a.variant]):
        out = out_dir_for(a, "env24", v)
        os.makedirs(out, exist_ok=True)
        mood = mood_image(scene, out) if v == "m" else None
        write_job(out, "env24", a.template, v, scene, build_text(scene, pill, v == "m", a.standin), pill, a.face_name, a.voice_name, mood, a.standin)


if __name__ == "__main__":
    main()
