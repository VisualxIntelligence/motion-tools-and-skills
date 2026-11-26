# Adds the realism lines to every Seedance prompt (idempotent): the blockout set is rebuilt as real, the capsules' colours never
# reach clothing or props, and the look is photoreal and cinematic. Learned from tests: without them Seedance kept cone pines,
# ball trees and a stray striped capsule, and dressed a person in her capsule's stripes.
#   python3 tools/seedance-realism.py
import json, os, re
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "templates", "seedance-prompts.json")
SET = ("The set in @Video1 is only a layout of crude placeholders: rebuild every tree, wall, building, column, vehicle and prop as a real, fully detailed object "
       "of the same size in the same place, with real materials, textures, wear and dirt. Cone-shaped trees become real trees with bark, branches and needles or leaves; "
       "ball-shaped trees become real broadleaf trees; plain blocks become real stone, brick, wood or metal. No cone, sphere, plain box or untextured surface appears in the final video.")
CAPS = ("The capsules' red, yellow, green, blue, magenta, orange and cyan stripes are only labels for who is who: no clothing, skin, prop or surface takes those colours or stripes, "
        "and no striped capsule appears at any moment, even far in the background or through a doorway.")
LOOK = ("The image is photorealistic and cinematic: a large-format digital cinema camera, natural film grain, shallow depth of field where the lens allows, "
        "real atmospheric haze and depth, motivated light with soft falloff and rich but natural contrast, and real textured materials everywhere.")
d = json.load(open(P))
for k, v in d["prompts"].items():
    p = v["prompt"]
    if SET not in p:
        m = re.search(r"^@Video1 is [^\n]*$", p, flags=re.M); assert m, k
        add = SET + ("\n" + CAPS if "capsule" in m.group(0) else "")
        p = p[:m.end()] + "\n" + add + p[m.end():]
    if LOOK not in p:
        m = re.search(r"^The final visuals are live-action and photographic[^\n]*$", p, flags=re.M); assert m, k
        p = p[:m.end()] + " " + LOOK + p[m.end():]
    v["prompt"] = p
json.dump(d, open(P, "w"), indent=1, ensure_ascii=False)
print(len(d["prompts"]), "prompts carry the realism lines;", sum(CAPS in v["prompt"] for v in d["prompts"].values()), "with people")
