# Real dialogue for the conversation templates (idempotent): the lines, who says them, when and how, in place of the
# closed-mouths line, and the voices added to the sound. A dialogue scene with no words reads as a silent film.
#   python3 tools/seedance-dialogue.py
import json, os, re
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "templates", "seedance-prompts.json")
LINES = {
 "SC02-InteriorDialogue": [
  "Shot 1, from about 0.5 seconds: Sam, by the window, voice low and tight: \"You said you'd tell me first. Before anyone.\"",
  "Shot 2, from about 4.5 seconds: Sam, pointing at Alex: \"I heard it from your brother, Alex. Your brother.\"",
  "Shot 3, from about 8 seconds: Alex, defensive, voice rising: \"Because nothing was decided. I wasn't going to worry you over nothing.\"",
  "Shot 4, from about 11.5 seconds: Sam, off screen, quietly: \"Then why are your boxes already in the car?\" Alex does not answer; Alex's lips stay closed.",
  "Shot 5: nobody speaks."],
 "SC03-StreetWalkTalk": [
  "Shot 1: their voices are too far away to make out over the street.",
  "Shot 2, from about 4.5 seconds: Alex, turning to Sam, amused: \"You actually went back in there?\" Sam, eyes ahead: \"I had to see if it was still the same.\"",
  "Shot 3, from about 8.5 seconds: Alex: \"And?\" Sam, smiling: \"Smaller. Everything's smaller.\"",
  "Shot 4, from about 11.5 seconds: Alex, laughing: \"You were nine.\" Sam laughs too."],
 "SC04-CarInterior": [
  "Shot 1: nobody speaks; only the road.",
  "Shot 2, from about 4.5 seconds: Alex, eyes on the road, flat: \"Say it.\"",
  "Shot 3, from about 7.5 seconds: Sam, to their own hands, barely above a whisper: \"I never posted the letter. It's still in my bag.\"",
  "Shot 4: nobody speaks."],
 "ONE04-OrbitPushRack": [
  "From about 0.6 seconds: Alex, earnest, explaining: \"I'm not saying no. I'm saying not this year.\"",
  "From about 3.8 seconds: Sam, pressing: \"You said that last year. And the year before. When does it turn into yes?\"",
  "From about 10.6 seconds Alex looks down and says nothing."],
 "CAM12-OTSPair": [
  "Shot 1, from about 1 second: Sam, quiet and level: \"You knew the whole time.\"",
  "Shot 2, from about 4 seconds: Alex, without looking away: \"I knew enough.\""],
}
OLD = "Characters keep their mouths naturally closed; there is no narration, and no subtitles or on-screen text appear."
d = json.load(open(P)); n = 0
for k, lines in LINES.items():
    p = d["prompts"][k]["prompt"]
    if "【Dialogue】" in p: continue
    assert OLD in p, k
    block = ("【Dialogue】\nThey speak in English in natural, unforced voices, each line lip-synced to the person saying it, with real pauses between lines; "
             "anyone not speaking keeps their mouth closed. There is no narration, and no subtitles or on-screen text appear.\n" + "\n".join(lines))
    p = p.replace(OLD + "\n", "")
    p = p.replace("\n【Maintain Consistency】", "\n" + block + "\n\n【Maintain Consistency】", 1)
    p = re.sub(r"The sound includes only ", "The sound includes their voices, and ", p, count=1)
    d["prompts"][k]["prompt"] = p; n += 1
json.dump(d, open(P, "w"), indent=1, ensure_ascii=False); print(n, "prompts given dialogue")
