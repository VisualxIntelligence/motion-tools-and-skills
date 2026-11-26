# How Seedance 2.5 is billed

Prices are not listed here. To see them:

- [tein.ai/pricing](https://tein.ai/pricing)
- `GET https://api.tein.ai/v1/pricing/models?model=seedance-2-5` (no key needed)

## What you pay for: billed seconds

Each job is billed per second, at the price for its task (text to video, image to video, first and last frame, Omni Reference, edit, extend), whether it has a reference video, and its resolution.

**Without a reference video:** billed seconds = output seconds.

**With a reference video** (edit and extend always count as having one):

1. Round each reference video up to the next 0.1 s, then add them together. This gives the reference seconds.
2. Add the output seconds.
3. Compare that with the **minimum** for the output length: the output seconds plus two thirds of the output seconds, rounded up to a whole second. For example, a 4 s output has a minimum of 7 s, 10 s has 17 s, 15 s has 25 s, and 30 s has 50 s. For an output between whole seconds, such as an edit that keeps its source's length, the minimum is interpolated.
4. Billed seconds = whichever is larger: reference seconds + output seconds, or the minimum.

The minimum is the same at every resolution and every aspect ratio. Reference images and audio do not add billed seconds.

## Auto length (`duration: -1`)

When the job is accepted, Tein holds the cost of the longest output (30 s), using the same reference-video rule. When the job finishes, the charge settles on the seconds actually delivered.

An edit keeps the length of its source video, so its quote is exact from the start.

## Draft and finalize

- The draft and the finalize are two jobs, and each is charged on its own.
- The draft is charged at the draft price for 480p.
- The finalize is charged at the finalize price for its resolution (1080p or 4K). It uses the seconds the draft delivered. If the draft had a reference video, the finalize also charges the draft's reference seconds again, with the minimum.
- `priority` and `creative_mode` are charged at their own published prices. Priority cannot be used on a draft or a finalize.

## What is not charged

- A job that fails, expires, is blocked by moderation (`content_blocked`, `face_detected`, `copyright_blocked`) or is cancelled before it starts. Its `usage.cost` is `0`.
- Any request refused before a job is made: invalid fields, files that break a limit, rate limits, too little balance.
- Requests made with a test key (`sk_test_`).

What a job cost is shown in `usage.cost` on `GET /v1/jobs/{id}` and in the webhook body.
