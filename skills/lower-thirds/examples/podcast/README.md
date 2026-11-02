# Podcast: host and guest

> "I host a YouTube interview podcast called Off the Record. I need lower thirds for me (Maya Chen, Host) and this week's guest (Daniel Ortiz, Founder, Northwind). I edit in Premiere Pro. Clean, modern, a bit editorial."

The agent chose a warm off-white card with a red rule, the show name as a small kicker, the name in Newsreader and the role in italic. The rule draws across, the card unfolds from it, the words rise in; about 1 s in, 6 s still, 0.6 s out. Two cards, one file each; ProRes 4444 for Premiere, WebM as well.

```bash
node ../../scripts/render.mjs index.html maya-chen.mov
node ../../scripts/render.mjs index.html daniel-ortiz.mov --card 1
```
