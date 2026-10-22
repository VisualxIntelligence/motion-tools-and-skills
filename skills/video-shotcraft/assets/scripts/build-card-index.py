#!/usr/bin/env python3
"""Build gallery/api/library.json, the card index the skill checks card names and style keys against.

Added in motion-tools-and-skills; it replaces upstream's gallery/sync-from-cards.py, which read the Chinese card keys.
Card text (summary, use_when, duration, energy, intent, category, tags) comes from references/shots/<category>/*.md;
the style variants of each card (key, label, description, use) come from gallery/api/styles.json.
Run from the skill folder after editing a card:  python3 assets/scripts/build-card-index.py
"""
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SHOTS = ROOT / 'references' / 'shots'
STYLES = ROOT / 'gallery' / 'api' / 'styles.json'
OUT = ROOT / 'gallery' / 'api' / 'library.json'
GALLERY = 'https://vincentwei1021.github.io/video-shotcraft/library.html'


def parse_card(path):
    text = path.read_text(encoding='utf-8')
    fm, body = {}, text
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if m:
        body = text[m.end():]
        for line in m.group(1).splitlines():
            if ':' in line and not line.startswith(' '):
                k, v = line.split(':', 1)
                fm[k.strip()] = v.strip()
    intent = ''
    m = re.search(r'^## Intent\s*\n(.*?)(?=^## |\Z)', body, re.S | re.M)
    if m:
        intent = ' '.join(m.group(1).split())
    return fm, intent


def main():
    styles = json.loads(STYLES.read_text(encoding='utf-8'))
    by_card = {}
    for key, st in styles.items():
        by_card.setdefault(st['card'], []).append({
            'key': key,
            'label': f"{key} — {st['label_suffix']}" if st.get('label_suffix') else key,
            'description': st.get('description', ''),
            'use': st.get('use', ''),
        })
    cards, categories = [], []
    for path in sorted(SHOTS.glob('*/*.md')):
        if path.name == 'ATTRIBUTION.md':
            continue
        fm, intent = parse_card(path)
        name = fm.get('name', path.stem)
        cat = path.parent.name
        if cat not in categories:
            categories.append(cat)
        tags = [t.strip() for t in fm.get('tags', cat).split(',') if t.strip()]
        cards.append({
            'name': name,
            'summary': fm.get('summary', ''),
            'use_when': fm.get('use_when', ''),
            'duration': fm.get('duration', ''),
            'energy': fm.get('energy', ''),
            'intent': intent,
            'source': str(path.relative_to(ROOT)).replace('\\', '/'),
            'category': cat,
            'tags': tags,
            'styles': by_card.get(name, [{'key': name, 'label': name, 'description': fm.get('summary', ''), 'use': ''}]),
        })
    missing = sorted(set(by_card) - {c['name'] for c in cards})
    out = {
        'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'previews': GALLERY,
        'stats': {'cardCount': len(cards), 'styleCount': sum(len(c['styles']) for c in cards)},
        'categories': categories,
        'cards': cards,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f"{len(cards)} cards, {out['stats']['styleCount']} styles → {OUT.relative_to(ROOT)}")
    if missing:
        print('styles.json names cards that do not exist:', ', '.join(missing))


if __name__ == '__main__':
    main()
