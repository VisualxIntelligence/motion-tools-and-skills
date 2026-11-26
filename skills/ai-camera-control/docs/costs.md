# Costs

What the pipeline cost in credits, and how to price a clip before sending it. Credits are the unit the video API bills. On the earlier hosted API used in the original tests, 1,000 credits = $1; that provider's public plans ranged from $0.83 to $1.00 per 1,000 credits, so a dollar figure here can be 17 percent off. The test runs behind this repo used about 730,000 credits across 331 completed requests.

Every figure is **observed** (read from a receipt, a result log or a sent record) or **computed** (rate times seconds). Rates, plans and prices change: Tein's current prices are at [tein.ai/pricing](https://tein.ai/pricing) and from the free call `GET /v1/pricing/models?model=seedance-2-5` ([tein-endpoint.md](tein-endpoint.md)). Read the price from there before you send.

## The rates

Rates of the earlier hosted API, in credits, read from its bills.

| Resolution | No video input: per output second | With video input: per (input + output) second |
|---|---|---|
| 480p draft | 122.2 | 72.9 |
| 720p | 269.3 | 165.5 |
| 1080p | 675.4 | 406.1 |
| 4K | 1085.3 | 673 |

- A draft bills the 480p rate. Its final bills the 1080p rate. The saving of a draft is the lower resolution, not a lower rate ([definition](tein-endpoint.md#what-a-draft-is)).
- With a video reference the billed seconds are input plus output, and never fewer than the output plus two thirds of the output, rounded up (a 30 s output bills at least 50 s).
- Images and audio add nothing.
- The minimum explains the extend bills: a 30 s extension from a 12 s tail (STORY03) billed 50 s x 72.9 = 3,645 credits (observed), and 50 s x 406.1 = 20,305 at 1080p (observed).
- Failed jobs are refunded.
- The provider's own rate table of 11 Oct listed 487.3 and 292.8 for 1080p. The bills matched 675.4 and 406.1, so that table was out of date.

Why the rates fit: a 7 s pill clip as a draft is 14 s x 72.9 = 1,020.6 credits (observed for CAM06, CAM01, CAM02 and others). A 29 s sheet draft is 29 s x 122.2 = 3,543.8 (observed). A 29 s sheet final is 29 x 675.4 = 19,586.6 (observed). A 30 s text-only 4K clip is 30 x 1,085.3 = 32,559 (observed).

## One template, by route and length

| Length | Pill-video draft (computed) | Sheet or text draft (computed) | Final from a sheet draft (computed) | Final from a video draft (computed) | Fresh 4K with video input (computed) |
|---|---|---|---|---|---|
| 7 s | 1,020.6 | 855.4 | 4,727.8 | 5,685.4 | 9,422 |
| 8 s | 1,166.4 | 977.6 | 5,403.2 | 6,497.6 | 10,768 |
| 15 s | 2,187 | 1,833 | 10,131 | 12,183 | 20,190 |
| 29 s | 4,228.2 | 3,543.8 | 19,586.6 | 23,553.8 | 39,034 |
| 30 s | 4,374 | 3,666 | 20,262 | 24,366 | 40,380 |

Observed matches: 7 s video draft 1,020.6; 8 s video draft 1,166.4 (CAM04) and the sketch draft 977.6 (ACT01); 15 s video draft 2,187 and sketch 1,833 (PRD06); 29 s video draft 4,228.2 and sheet draft 3,543.8 (SHOW01); 29 s sheet final 19,586.6; 30 s text-only draft 3,666; 7 s video upgrade 5,685 (a short arc); 30 s upgrade of a text-only draft 20,262; 30 s upgrade of an extension 20,305 (50 billable seconds x 406.1); a 4K 7 s with blockout "about 9,400".

A final costs about 5.5 times its draft (5,685.4 against 1,020.6 for 7 s from a video draft; 4,727.8 against 855.4 from a sheet draft). The pill-video route costs more than the sheet route because the video bills twice, once as input and once as output: a 7 s draft costs about 1,020 credits from video and about 855 from a sheet.

## How the provider counts tokens (as read 7 Nov 2026)

Estimated tokens = (input video seconds + output video seconds) x output width x output height x output frame rate / 1024. Price = the token unit price x the tokens. A failed or moderation-blocked generation is not charged. A draft is a fixed 480p video at the normal 480p token rate. With a video input there is a minimum token consumption (it depends on the resolution, the aspect ratio and the output length; the minimum table has not been read, so the minimum for a 7 s 480p output is UNPROVEN). The real consumption is `usage.completion_tokens` in the API response: the formula is an estimate. The credit numbers earlier on this page were measured from bills on the earlier hosted API; the rates on Tein are on tein.ai/pricing. Neither is a token price.

On Tein the same idea is stated as: billed seconds = input + output, and never fewer than the output x 1.67.
