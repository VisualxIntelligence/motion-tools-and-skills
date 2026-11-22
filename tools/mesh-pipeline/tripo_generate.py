#!/usr/bin/env python3
"""Text or image to a 3D model with the Tripo API (SDK 1.x, API v3), saved as a GLB.

    python tripo_generate.py --prompt "a worn leather armchair" out/
    python tripo_generate.py --image ref.png out/ [--faces 20000] [--quad] [--model v3.1-20260211]
    python tripo_generate.py --balance

Needs TRIPO_API_KEY in the environment (an account at platform.tripo3d.ai) and
pip install "tripo3d>=1.0,<2" (MIT). Every generation spends credits: the script prints the
balance before and after. It waits for the task, downloads the model and writes a JSON report
next to it (task id, settings, file, credits). Then run mesh_clean.py and lods.mjs on the GLB.

Tripo shut its v2 API on 31 Oct 2026; SDK 0.x and the official Blender add-on (which pins a
2025 SDK) stop working. Use SDK 1.x as here, or Blender MCP's Tripo integration.
"""
import argparse
import asyncio
import json
import os
import pathlib
import sys


async def run(a) -> int:
    from tripo3d import TripoClient  # imported late so --help works without the SDK

    async with TripoClient() as client:
        before = await client.get_balance()
        if a.balance:
            print(json.dumps({"balance": before.balance, "frozen": before.frozen}))
            return 0
        kw = dict(model_version=a.model, face_limit=a.faces or None, texture=not a.no_texture,
                  pbr=not a.no_texture, quad=a.quad)
        if a.prompt:
            task_id = await client.text_to_model(prompt=a.prompt, negative_prompt=a.negative, **kw)
        else:
            task_id = await client.image_to_model(image=a.image, **kw)
        print(f"task {task_id} submitted; waiting", file=sys.stderr)
        task = await client.wait_for_task(task_id, timeout=a.timeout, verbose=True)
        out = pathlib.Path(a.outdir)
        out.mkdir(parents=True, exist_ok=True)
        files = await client.download_task_models(task, str(out))
        after = await client.get_balance()
        report = {
            "task_id": task_id,
            "status": str(task.status),
            "source": {"prompt": a.prompt} if a.prompt else {"image": a.image},
            "settings": {k: v for k, v in kw.items() if v is not None},
            "files": {k: v for k, v in files.items() if v},
            "credits_used": round(before.balance - after.balance, 2),
            "balance_after": after.balance,
        }
        (out / f"tripo_{task_id}.json").write_text(json.dumps(report, indent=2))
        print(json.dumps(report, indent=2))
        return 0 if report["files"] else 1


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument("--prompt", help="describe the object")
    src.add_argument("--image", help="a reference image (one object, plain background works best)")
    src.add_argument("--balance", action="store_true", help="print the credit balance and stop")
    p.add_argument("outdir", nargs="?", default="tripo_out")
    p.add_argument("--negative", help="negative prompt (text only)")
    p.add_argument("--model", default="v3.1-20260211", help="model_version (see the SDK's docs/API.md)")
    p.add_argument("--faces", type=int, default=0, help="face limit (0 = the model's default)")
    p.add_argument("--quad", action="store_true", help="ask for quad topology")
    p.add_argument("--no-texture", action="store_true", help="geometry only (cheaper)")
    p.add_argument("--timeout", type=float, default=900, help="seconds to wait for the task")
    a = p.parse_args(argv)
    if not os.environ.get("TRIPO_API_KEY"):
        p.error("set TRIPO_API_KEY first")
    return asyncio.run(run(a))


if __name__ == "__main__":
    sys.exit(main())
