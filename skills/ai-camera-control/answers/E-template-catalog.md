# Template catalog

This file is a catalog, not a list of questions. It was extracted from the source files in `engine/cinematic/src/templates`, which are the source of truth: each template's `TemplateInfo` (`says`, `use`, `numbers`, `avoid`) and its shot labels. Nothing here was typed from memory. The 137 ids in the code are 136 below plus `SHOW01-TheHandoff`, which has no card. The three physics-bake ids in `physics-specs.ts` (SC07-crates, SC09-kegs, SC10-barrier) are not templates.

Durations are the end of the last shot in the source. Shots listed as `start-end label`. FAM and PRD durations were read from the constants in each file. The scene templates also carry a coverage `pattern`.


## Camera moves (CAM01 to CAM48): 48 cards

### CAM01-LockedOff: Locked-off
- Says: Observation. The world moves, the camera does not judge it.
- Use: Entrances and exits, comedy timing, tableaux, any beat where the action should carry the frame.
- Numbers: Tripod, 24–35 mm, eye level. Hold at least 3 s on a wide.
- Avoid: A static frame with nothing moving in it: give it a crossing or a moving layer.
- Duration: 7 s; 1 shot: 0-7 24mm  LOCKED-OFF WIDE

### CAM02-PanWith: Pan with
- Says: We are standing in the world, turning our head to follow someone.
- Use: Following a crossing from one spot; showing where someone goes; a reveal by turning.
- Numbers: Fixed position, 50 mm. A pan that holds the subject may run faster than the frame width ÷ 7 s rule; the background must not judder.
- Avoid: Panning across nothing: always pan with a motivated subject or look.
- Duration: 7 s; 1 shot: 0-7 50mm  PAN WITH

### CAM03-PushIn: Push in
- Says: Something is dawning on them. We lean in with the thought.
- Use: A realisation, a decision, rising tension; the reaction before the reveal (the Spielberg face).
- Numbers: 50 mm, MS to MCU over 4–8 s, about 0.15–0.4 m/s, eased, with a held frame at each end.
- Avoid: Pushing on every shot: save it for the beat that turns.
- Duration: 7 s; 1 shot: 0-7 50mm  PUSH IN · MS TO MCU

### CAM04-PullOutReveal: Pull out (reveal)
- Says: We discover where they are, and how small they are in it.
- Use: Endings, isolation, a reveal of scale or of what surrounds the subject.
- Numbers: 60 mm (a close-up nearer than 1.5 m distorts the face), CU to WS over 5–8 s, eased; let the world enter the frame in layers.
- Avoid: Pulling out to an empty frame: the reveal needs something new at the end.
- Duration: 8 s; 1 shot: 0-8 60mm  PULL OUT · CU TO WS

### CAM05-DollyZoom: Dolly zoom
- Says: The ground shifts under them: dread, vertigo, a realisation that changes everything.
- Use: Once per film at most: the moment the world turns.
- Numbers: Hold the subject's size while the focal length runs 32 → 90 mm and the camera travels back in proportion (distance ∝ focal length).
- Avoid: Keying the lens and the move apart: the subject's size drifts and the effect reads as a mistake.
- Duration: 6 s; 1 shot: 0-6 32>90mm  DOLLY ZOOM

### CAM06-Orbit: Orbit
- Says: Everything turns around this person: a standoff, a decision, a hero moment.
- Use: A character at the centre of a turning point; showing the space around them in one move.
- Numbers: 35 mm, MS, 120° over 7 s (about 17°/s on average, peak near 58°/s), eased, no rise.
- Avoid: Orbiting just for motion: it says this person is the axis of the scene.
- Duration: 7 s; 1 shot: 0-7 35mm  ORBIT 120

### CAM07-CraneUp: Crane up
- Says: Release: we rise above them and see what they are heading into.
- Use: Ends of scenes, the start of a journey, showing the destination.
- Numbers: 28 mm, WS, rise 0 → 7 m over 6–8 s, eased; the head tilts down to keep the subject.
- Avoid: Craning with no destination to reveal at the top.
- Duration: 7 s; 1 shot: 0-7 28mm  CRANE UP

### CAM08-CraneDown: Crane down (arrival)
- Says: We arrive in the world from above and come down to meet the person in it.
- Use: Openings and establishing shots: geography first, then the subject.
- Numbers: 28 mm, from 10 m above to eye level over 6–8 s, eased in to a held medium.
- Avoid: Landing on nothing: the move must end on the subject of the next beat.
- Duration: 7 s; 1 shot: 0-7 28mm  CRANE DOWN

### CAM09-SteadicamFollow: Steadicam follow
- Says: We go with them, into their world, sharing their point of view.
- Use: Walking into a new space, following toward a destination, immersion.
- Numbers: 32 mm, MS from behind, 3–4 m back, lagging the subject by a beat (about 0.5 s).
- Avoid: Following the back of someone's head for too long: cut to their face or the destination.
- Duration: 7 s; 1 shot: 0-7 32mm  STEADICAM FOLLOW

### CAM10-SteadicamLead: Steadicam lead
- Says: They are coming at us: purpose, confrontation, a walk-and-talk.
- Use: Walk-and-talks, a character striding with intent, an approach.
- Numbers: 40 mm, MS from the front, the operator walking backwards at the subject's pace.
- Avoid: Leading with nothing ahead of them in their eyeline: they need somewhere to look.
- Duration: 7 s; 1 shot: 0-7 40mm  STEADICAM LEAD

### CAM11-TrackingSide: Tracking alongside
- Says: We travel with them as an equal; the world streams past behind.
- Use: Journeys, chases, conversations on the move; showing speed with foreground passing.
- Numbers: 50 mm, MS side-on, matched speed, leading the subject by half a metre.
- Avoid: Losing lead room: keep space in front of the subject.
- Duration: 7 s; 1 shot: 0-7 50mm  TRACKING ALONGSIDE

### CAM12-OTSPair: Over the shoulder (pair)
- Says: A conversation: whose turn it is, who holds the power.
- Use: Dialogue coverage: master, then OTS pair, then singles.
- Numbers: 75 mm both ways from about 3.5 m behind the shoulder (a long lens keeps the shoulder to about a quarter of the frame), both cameras on one side of the line, matched distance.
- Avoid: Crossing the line between them, or a shoulder that fills half the frame.
- Duration: 7 s; 2 shots: 0-3.5 75mm  OTS · ALEX ON SAM; 3.5-7 75mm  REVERSE OTS · SAM ON ALEX

### CAM13-WhipPan: Whip pan
- Says: Sudden attention: something pulls our eyes, or one thought snaps to another.
- Use: Joining two people or places with energy; a hidden cut; comedy timing.
- Numbers: 50 mm, a 0.3–0.4 s swing between two held frames; the motion blur carries the join.
- Avoid: Whipping to a frame that is not composed: the landing must be a clean shot.
- Duration: 6 s; 1 shot: 0-6 50mm  WHIP PAN · ALEX TO SAM

### CAM14-Handheld: Handheld
- Says: We are there, unsteady with them: urgency, nerves, documentary truth.
- Use: Panic, intimacy, chaos, found-footage; contrast with a calm locked-off scene.
- Numbers: 40 mm, MCU, rotation shake mostly (0.3–3.5 Hz layered), small amplitude; breathing, not earthquakes.
- Avoid: Shake on a long lens or on every shot of a film: it stops meaning anything.
- Duration: 6 s; 1 shot: 0-6 40mm  HANDHELD MCU

### CAM15-ChaseDrone: Chase drone
- Says: Speed and freedom: we fly with them.
- Use: Flight, vehicles, big landscapes on the move; the geography wide in an action scene.
- Numbers: 28 mm, 18–22 m behind and 5–7 m above, matched speed, banking into turns.
- Avoid: Chasing too far back: the subject becomes a dot and the speed disappears.
- Duration: 8 s; 1 shot: 0-8 28mm  CHASE DRONE

### CAM16-FPV: FPV drone
- Says: Raw speed, danger, a body moving fast through space.
- Use: Chases, runs, flights through tight gaps; one burst inside an action scene.
- Numbers: 16–20 mm, 2–3 m behind, under a metre above the subject, weaving; the rig banks into turns.
- Avoid: FPV for a whole sequence: it tires fast; cut back to a stable wide.
- Duration: 7 s; 1 shot: 0-7 18mm  FPV RUN

### CAM17-SlowZoomIn: Slow zoom in
- Says: Something is closing in on them, and they do not know it.
- Use: Dread, a held thought, a stare that goes on a beat too long (the Kubrick creep).
- Numbers: Locked tripod, 35 to 85 mm over 6 s, MS to MCU, eased at both ends. Nothing in the frame moves but the lens.
- Avoid: A fast zoom (that is a crash zoom) or a zoom while the subject walks at us: it reads as a mistake.
- Duration: 7 s; 1 shot: 0-7 35>85mm  SLOW ZOOM IN

### CAM18-SlowZoomOut: Slow zoom out
- Says: We pull back from the thought and see the room it happens in.
- Use: Isolation, a reveal of who else is there, the end of a scene.
- Numbers: Locked tripod, 100 down to 35 mm over 6 s, CU to MS, eased at both ends.
- Avoid: Stopping half way. The move has to land on a composed wide.
- Duration: 7 s; 1 shot: 0-7 100>35mm  SLOW ZOOM OUT

### CAM19-TiltUp: Tilt up
- Says: We meet them from the ground up: boots, body, then the face.
- Use: A hero introduction, a character entrance, scale.
- Numbers: Fixed low position 2 m out, 24 mm, the head tilts from the boots to the eyes over 4 s, then holds the face for 2 s.
- Avoid: Tilting past the head into empty sky.
- Duration: 7 s; 1 shot: 0-7 24mm  TILT UP · BOOTS TO FACE

### CAM20-TiltDown: Tilt down
- Says: We start on the face and are taken down to what they are standing on, or holding.
- Use: Revealing a weapon, a gift, a body, a clue below the eyeline.
- Numbers: Fixed position 3 m out, 35 mm, the head tilts from the eyes to the boots over 4 s.
- Avoid: Showing the answer at the start: the face has to give nothing away.
- Duration: 7 s; 1 shot: 0-7 35mm  TILT DOWN · FACE TO BOOTS

### CAM21-PanReveal: Pan reveal
- Says: We look away from the person, and the turn of the camera brings them in.
- Use: Introducing someone who has been there all along; a hidden presence.
- Numbers: Fixed position at 4 m, 40 mm, a 40 degree pan over 3.5 s from an empty wall of the plaza onto the person, then a held MS.
- Avoid: Panning past the subject and coming back: land on them once.
- Duration: 7 s; 1 shot: 0-7 40mm  PAN REVEAL

### CAM22-PedestalUp: Pedestal up
- Says: We rise gently to meet their eyes, or to look down on what they have done.
- Use: A character standing up, a rising mood, finding the eyeline.
- Numbers: 50 mm, MCU, the camera rises from 0.6 m below to 0.9 m above eye level over 6 s at a steady distance.
- Avoid: Letting the distance change: it is a rise, not a push.
- Duration: 7 s; 1 shot: 0-7 50mm  PEDESTAL UP

### CAM23-PedestalDown: Pedestal down
- Says: We drop from above their eyes to meet them, or to sit beneath their weight.
- Use: Someone sitting, losing, lowering, giving in.
- Numbers: 50 mm, MCU, the camera falls from 0.9 m above to 0.6 m below eye level over 6 s at a steady distance.
- Avoid: Ending lower than the chin: the frame turns into a power shot you did not mean.
- Duration: 7 s; 1 shot: 0-7 50mm  PEDESTAL DOWN

### CAM24-ShortArc: Short arc
- Says: We swing a little way round them to see who they really are facing.
- Use: Dialogue emphasis, a character realising, a small turn of perspective.
- Numbers: 35 mm, MS, an arc of 60 degrees over 6 s at a held distance, eyes kept on the upper third.
- Avoid: Going all the way round: that is an orbit, and says something bigger.
- Duration: 7 s; 1 shot: 0-7 35mm  SHORT ARC 60

### CAM25-ArcAndRise: Arc and rise
- Says: We circle them and lift away at once: a moment growing into a landscape.
- Use: The end of a big beat, a character left alone in the world, a hero reveal.
- Numbers: 28 mm, MWS, a 120 degree arc while the arm rises 3 m over 7 s, aim held on the eyes.
- Avoid: Rising first and arcing second: both axes have to start and stop together.
- Duration: 8 s; 1 shot: 0-8 28mm  ARC AND RISE

### CAM26-DutchAngle: Dutch angle
- Says: The world is tilted, and so is whoever is in it.
- Use: Unease, madness, a threat, a drug or a drink gone wrong.
- Numbers: Locked tripod, 28 mm, MS, the horizon rolled 14 degrees for the whole shot.
- Avoid: Using it for a whole scene: it turns into wallpaper. A beat, then back to level.
- Duration: 6 s; 1 shot: 0-6 28mm  DUTCH ANGLE 14

### CAM27-DutchPush: Dutch push-in
- Says: The tilt grows as we close in: something is going wrong in their head.
- Use: A breakdown, a build to violence, a held panic.
- Numbers: 35 mm, MS to MCU over 6 s, the roll builds from 0 to 16 degrees as we push.
- Avoid: Rolling back to level at the end: the room should not recover.
- Duration: 7 s; 1 shot: 0-7 35mm  DUTCH PUSH-IN

### CAM28-BarrelRoll: Barrel roll
- Says: The whole world turns over around them.
- Use: Disorientation, a fall, a crash, a leap into something new.
- Numbers: 28 mm, MS, a full 360 degree roll about the lens axis over 5 s, eased, the subject kept centred.
- Avoid: Doing it fast: a slow roll reads as a dream, a quick one as a stunt.
- Duration: 7 s; 1 shot: 0-7 28mm  BARREL ROLL 360

### CAM29-LowAngleHero: Low angle (power shot)
- Says: They are bigger than the room: strength, threat, a hero.
- Use: A leader, a villain's entrance, anyone who should loom.
- Numbers: Locked tripod 1.1 m below eye level, 24 mm, MS looking up about 25 degrees, the ceiling or sky behind the head.
- Avoid: Going so low the face is all chin: keep the eyes in the frame.
- Duration: 6 s; 1 shot: 0-6 24mm  LOW ANGLE

### CAM30-HighAngle: High angle
- Says: They are small, watched, or about to be caught.
- Use: Vulnerability, surveillance, a character who has lost.
- Numbers: Locked camera 3 m above eye level, 28 mm, FS looking down about 40 degrees, the ground filling the frame.
- Avoid: Going to a full top-down: that is a map, not a power shot.
- Duration: 6 s; 1 shot: 0-6 28mm  HIGH ANGLE

### CAM31-OverheadRise: Overhead rise
- Says: We lift off them and look straight down at where they stand.
- Use: A character left alone, a map of a place, an ending that goes cold.
- Numbers: 28 mm, the camera rises from 0.5 to 14 m over 7 s and swings in until it looks straight down, the figure kept central.
- Avoid: Losing the subject at the top: keep them in the middle of the frame as it climbs.
- Duration: 8 s; 1 shot: 0-8 28mm  OVERHEAD RISE

### CAM32-RunAndGun: Run and gun
- Says: We are running with them, and the camera is not steady either.
- Use: Chases, escapes, war films, anything where the operator should be in danger.
- Numbers: 28 mm, MWS from behind at 3 m, hand-held with a strong shake (amount 3), following a jog at about 2.4 m/s.
- Avoid: Shaking the frame so hard the subject leaves it: the shake is on the camera, the subject stays framed.
- Duration: 7 s; 1 shot: 0-7 28mm  RUN AND GUN

### CAM33-POVWalk: POV walk
- Says: We are them: we see only what they see.
- Use: Horror, a search, a subjective beat, a game-like walk into danger.
- Numbers: 24 mm at their eye height, a step bob of 2 cm, the aim a little below the horizon, walking about 1.7 m/s.
- Avoid: Showing their hands or breath unless it is the point: a clean POV has no body in it.
- Duration: 7 s; 1 shot: 0-7 24mm  POV WALK

### CAM34-POVLookAround: POV look around
- Says: Someone standing still turns their head, and we turn with it.
- Use: Entering a room, checking for danger, a search from one spot.
- Numbers: 24 mm at eye height, a head turn of 100 degrees left to right over 6 s, a small pause at each end.
- Avoid: A whip: heads turn, then stop, then turn again.
- Duration: 7 s; 1 shot: 0-7 24mm  POV LOOK AROUND

### CAM35-OTSPushIn: Over the shoulder push-in
- Says: The listener is shut out, and we move in on the one who speaks.
- Use: A confession, an ultimatum, the line everything turns on.
- Numbers: 75 mm over the shoulder from 4.6 m back, closing by 1.8 m over 6.5 s; the shoulder grows from about a third to 40% of the frame.
- Avoid: Pushing so far the shoulder leaves the frame: it should still be there at the end.
- Duration: 7 s; 1 shot: 0-7 75mm  OTS PUSH-IN

### CAM36-TwoShotTruck: Two-shot truck
- Says: We slide along the space between two people and see who is closer.
- Use: Dialogue in profile, a stand-off, a negotiation.
- Numbers: 35 mm, both in profile, the camera trucks 4 m sideways at 7.5 m distance over 6 s, aim held parallel.
- Avoid: Letting one person leave the frame: both stay in for the whole move.
- Duration: 7 s; 1 shot: 0-7 35mm  TWO-SHOT TRUCK

### CAM37-SliderPortrait: Slider on the face
- Says: A small, slow slide across a face: the thought moving behind the eyes.
- Use: Close-ups that need life without a push: interviews, quiet beats.
- Numbers: 85 mm, MCU, a 0.9 m slide over 6 s, the aim held on the eyes so the background shifts behind them.
- Avoid: A fast slide: it should be felt, not noticed.
- Duration: 7 s; 1 shot: 0-7 85mm  SLIDER

### CAM38-PushToCloseUp: Push to the close-up
- Says: We go in until nothing is left but the face.
- Use: The moment of decision, a lie being told, a tear.
- Numbers: 85 mm, MCU to CU over 6 s, a slow dolly, the eyes kept on the upper third.
- Avoid: Pushing past the face into a detail: stop while both eyes are still in frame.
- Duration: 7 s; 1 shot: 0-7 85mm  PUSH TO THE CLOSE-UP

### CAM39-WhipTilt: Whip tilt
- Says: The eye is dragged up and away: a thought snapping to somewhere else.
- Use: A transition to the sky, a hidden cut up into the next scene.
- Numbers: 35 mm on a locked tripod, a 0.35 s vertical whip from MS up to the sky, then the shot ends in blur.
- Avoid: Slowing down: a whip is a whip only at speed.
- Duration: 4.5 s; 1 shot: 0-4.5 35mm  WHIP TILT UP

### CAM40-ReverseDollyZoom: Reverse dolly zoom
- Says: The room opens up behind them while they stay the same size: the world is leaving.
- Use: Release, shock after the event, someone stepping out of something.
- Numbers: Hold MCU while the lens goes 90 to 32 mm and the camera pulls out to match, over 5 s.
- Avoid: Letting the subject change size: that is the whole trick.
- Duration: 6 s; 1 shot: 0-6 90>32mm  REVERSE DOLLY ZOOM

### CAM41-DroneOrbitHigh: Drone orbit (high)
- Says: We circle above the place and the person is where everything meets.
- Use: Establishing a location, a gathering, an arrival from above.
- Numbers: 24 mm, WS from 9 m up, a 180 degree orbit over 8 s at a steady radius, the subject kept central.
- Avoid: Orbiting too fast: a drone orbit should feel like weather.
- Duration: 9 s; 1 shot: 0-9 24mm  DRONE ORBIT HIGH

### CAM42-DroneDive: Drone dive
- Says: We fall out of the sky onto them.
- Use: A reveal of the hero, an arrival, a rooftop to a face.
- Numbers: From 25 m up and 14 m out, diving to a 3.4 m MWS over 6 s, the lens tightening from 24 to 50 mm, gravity-eased.
- Avoid: Stopping short: the dive ends on the subject, composed.
- Duration: 7 s; 1 shot: 0-7 24>50mm  DRONE DIVE

### CAM43-DroneRevealOverTerrace: Drone reveal
- Says: We rise over the edge of something and the place is revealed.
- Use: The first view of a location, a reveal of scale, a journey's end.
- Numbers: 24 mm, a programmed path from low behind a tall stack at the west side up to 14 m over the floor over 8 s, eyes kept on the person.
- Avoid: Revealing the subject first: the place comes before the person.
- Duration: 9 s; 1 shot: 0-9 24mm  DRONE REVEAL

### CAM44-DroneRiseUp: Drone rise up
- Says: We lift straight up off the spot and see how small it all is.
- Use: Endings, a character in a vast place, a long look at the ground.
- Numbers: 24 mm, the camera rises from 1 m to 24 m over 8 s looking down, the subject centred.
- Avoid: Drifting sideways while it rises: the lift is vertical.
- Duration: 9 s; 1 shot: 0-9 24mm  DRONE RISE UP

### CAM45-LowFollow: Low follow
- Says: We follow at the height of their feet: weight, pace, intent.
- Use: A walk to a confrontation, a character defined by how they move.
- Numbers: 24 mm, FS from behind at 3 m, 0.85 m below eye level, a Steadicam low-mode following a walk at 1.3 m/s.
- Avoid: Going so low the ground fills the frame: the body stays in it.
- Duration: 7 s; 1 shot: 0-7 24mm  LOW FOLLOW

### CAM46-RackBetweenPeople: Rack focus (people)
- Says: Who is listening, and who is the one who matters now.
- Use: A reaction behind the speaker, a power shift in a two-shot.
- Numbers: 85 mm at T1.4, a locked two-shot, Alex near and sharp, Sam far and soft; focus pulls to Sam over 0.8 s at 3.2 s.
- Avoid: Moving the camera too: the focus is the move.
- Duration: 7 s; 1 shot: 0-7 85mm  RACK FOCUS · ALEX TO SAM

### CAM47-HandheldPushIn: Handheld push-in
- Says: We lean in with a shaking body: fear, a secret, something we should not see.
- Use: Documentary tension, a confession, a character cornered.
- Numbers: 40 mm, MS to MCU over 6 s, a handheld shake of amount 2, eyes on the upper third.
- Avoid: A shake so big it looks like a fault: it should feel like breath.
- Duration: 7 s; 1 shot: 0-7 40mm  HANDHELD PUSH-IN

### CAM48-OrbitWalk: Orbit a walker
- Says: They walk, and the whole world swings round them as they go.
- Use: A hero walk, a character arriving at a decision while still moving.
- Numbers: 35 mm, MS, the subject walks 6 m at 1 m/s while the camera arcs 130 degrees round them over 7 s.
- Avoid: Orbiting at the walker's speed: the arc has to be slower, or it looks like a turntable.
- Duration: 8 s; 1 shot: 0-8 35mm  ORBIT A WALKER


## Angles and lenses (ANG, 36 ids between ANG01 and ANG40): 36 cards

### ANG01-ExtremeWide: Extreme wide shot
- Says: The place is the subject, and the person is small inside it.
- Use: Opening a scene, loneliness, scale, a journey's end.
- Numbers: 24 mm, EWS from 40 m, locked off. The figure fills about a twentieth of the frame height.
- Avoid: Cutting to it with nothing to read: the figure must still be findable.
- Duration: 6 s; 1 shot: 0-6 24mm  EXTREME WIDE

### ANG02-Wide: Wide shot
- Says: Who they are, and where they are.
- Use: Establishing a person in a place, the first shot after an extreme wide.
- Numbers: 28 mm, WS: the whole body with the set around it, locked at eye height.
- Avoid: Leaving it on screen so long nothing has changed.
- Duration: 6 s; 1 shot: 0-6 28mm  WIDE SHOT

### ANG03-Full: Full shot
- Says: The whole body, head to toe: how they stand, how they carry themselves.
- Use: Costume, posture, a walk, a fight stance.
- Numbers: 35 mm, FS from about 6 m, the feet just inside the bottom edge.
- Avoid: Cutting the feet at the ankle: either show them or go wider.
- Duration: 6 s; 1 shot: 0-6 35mm  FULL SHOT

### ANG04-Cowboy: Cowboy shot (medium wide)
- Says: From the thigh up: the hands and the face are both in play.
- Use: Standoffs, gunslingers, anyone whose hands matter as much as their eyes.
- Numbers: 40 mm, MWS from about 4 m, the frame edge at mid-thigh.
- Avoid: Cutting at the knee: the edge should fall between joints.
- Duration: 6 s; 1 shot: 0-6 40mm  COWBOY SHOT

### ANG05-Medium: Medium shot
- Says: The default: person and surroundings in balance.
- Use: Dialogue, ordinary coverage, anything that should feel natural.
- Numbers: 50 mm, MS from the waist up at about 3 m, eyes on the upper third.
- Avoid: Using it for everything: it needs closer and wider shots around it.
- Duration: 6 s; 1 shot: 0-6 50mm  MEDIUM SHOT

### ANG06-MediumCloseUp: Medium close-up
- Says: Close enough to read the face, far enough to keep the body language.
- Use: Interviews, the heart of a scene, reaction shots.
- Numbers: 65 mm, MCU from the chest up at about 2.5 m.
- Avoid: Letting the shoulders crop awkwardly: the edge falls at the chest.
- Duration: 6 s; 1 shot: 0-6 65mm  MEDIUM CLOSE-UP

### ANG07-CloseUp: Close-up
- Says: Nothing but the face: this is what they feel.
- Use: A reaction, a choice, the line that matters.
- Numbers: 85 mm, CU from about 2 m, shallow focus, the eyes on the upper third.
- Avoid: Using it too early: a close-up has to be earned.
- Duration: 6 s; 1 shot: 0-6 85mm  CLOSE-UP

### ANG08-ExtremeCloseUp: Extreme close-up
- Says: A detail so near it becomes the whole story: the eyes, a lip, a twitch.
- Use: A moment of fear, a lie, a tear, a thing about to happen.
- Numbers: 100 mm, ECU on both eyes from about 1 m, razor-thin focus.
- Avoid: Going beyond the eyes into a single pupil unless the story needs it.
- Duration: 6 s; 1 shot: 0-6 100mm  EXTREME CLOSE-UP

### ANG10-EyeLevel: Eye level
- Says: Neutral: we stand where they stand and judge nothing.
- Use: Honest coverage, conversation, anything that should feel real.
- Numbers: 40 mm, MS, the lens at the subject's eye height, level.
- Avoid: Mistaking it for dull: a still, level frame is a choice.
- Duration: 6 s; 1 shot: 0-6 40mm  EYE LEVEL

### ANG11-BirdsEye: Bird's-eye (straight down)
- Says: We are above it all, looking straight down at someone crossing the ground.
- Use: Detachment, fate, a map of a movement, an overhead insert.
- Numbers: 24 mm from 14 m directly above, locked, a person walking across the frame about 6 m.
- Avoid: Letting it run long without a reason: it gets abstract.
- Duration: 7 s; 1 shot: 0-7 24mm  BIRD'S-EYE

### ANG12-WormsEye: Worm's-eye (ground level)
- Says: The camera lies on the ground and the person towers over it.
- Use: Power, threat, a child's view, a dramatic entrance.
- Numbers: 18 mm at 0.12 m off the ground, 2 m from the feet, the aim 40 degrees up at the face.
- Avoid: Hiding the face: the eyes should still be readable.
- Duration: 6 s; 1 shot: 0-6 18mm  WORM'S-EYE

### ANG13-Profile: Profile
- Says: Seen from the side: a person in thought, in line with something else.
- Use: Two people facing each other, a stern portrait, a figure about to turn.
- Numbers: 70 mm, MCU at 90 degrees to the face, level.
- Avoid: Losing the eye line: leave room in front of the face.
- Duration: 6 s; 1 shot: 0-6 70mm  PROFILE

### ANG14-ThreeQuarter: Three-quarter
- Says: The most flattering view of a face: it has depth and still looks at us.
- Use: Portraits, interviews, a character introduced warmly.
- Numbers: 70 mm, MCU at 40 degrees to the face, slightly above eye level.
- Avoid: Turning past 60 degrees: it becomes a profile.
- Duration: 6 s; 1 shot: 0-6 70mm  THREE-QUARTER

### ANG15-FromBehind: From behind
- Says: We stay behind them, facing what they face.
- Use: A decision about to be made, an entrance into a room, a long look at something we cannot see yet.
- Numbers: 40 mm, MS from behind at 3 m, level, the shoulders filling the lower third.
- Avoid: Showing the face at the end: the choice to withhold it is the point.
- Duration: 6 s; 1 shot: 0-6 40mm  FROM BEHIND

### ANG16-DutchLow: Dutch and low
- Says: The room is crooked and they loom: a threat who is off balance too.
- Use: A villain who has lost control, a hallucination, a hero in trouble.
- Numbers: 20 mm, MS from 1.1 m below eye level, rolled 14 degrees.
- Avoid: Doing it with a calm face: the actor has to carry the unease too.
- Duration: 6 s; 1 shot: 0-6 20mm  DUTCH LOW

### ANG17-UpsideDown: Upside-down
- Says: The world has flipped, and so has the person in it.
- Use: Dreams, falling, a mind turned over, a stunt.
- Numbers: 28 mm, MS, the camera rolled 180 degrees and held, the horizon at the top.
- Avoid: Using it as a gag: it works when the story has flipped too.
- Duration: 6 s; 1 shot: 0-6 28mm  UPSIDE-DOWN

### ANG18-TwoThirdsHigh: High angle (looking down)
- Says: We look down on them: small, watched, caught.
- Use: Vulnerability, defeat, being observed.
- Numbers: 28 mm from 3.5 m above eye level, FS looking down about 40 degrees.
- Avoid: Going full overhead: that is a bird's-eye, and says something else.
- Duration: 6 s; 1 shot: 0-6 28mm  HIGH ANGLE

### ANG20-SuperWide: Super wide (14 mm)
- Says: The lens pushes the space away from the centre and makes near things huge.
- Use: Cramped rooms, action that needs to feel close, a hand coming at us.
- Numbers: 14 mm, MS from 1.4 m: the face is big, the background stretches, lines lean at the edges.
- Avoid: Putting a face at the edge of the frame: it stretches.
- Duration: 6 s; 1 shot: 0-6 14mm  SUPER WIDE

### ANG21-UltraWideCloseUp: Ultra wide close-up (10 mm)
- Says: A face that is too close: grotesque, funny, frightening.
- Use: Comedy, paranoia, a character breaking down, a point-of-view from a hole.
- Numbers: 10 mm, CU from 0.5 m, the nose large and the ears falling away.
- Avoid: Holding it past the joke or the fright.
- Duration: 6 s; 1 shot: 0-6 10mm  ULTRA WIDE CLOSE-UP

### ANG22-Fisheye: Fisheye (8 mm)
- Says: The whole world bends round the person at the centre.
- Use: Skate videos, hip-hop videos, panic, a character losing grip.
- Numbers: 8 mm fisheye, MS from 1 m: straight lines curve toward the edges, the centre stays natural.
- Avoid: A fisheye on every shot: it needs a reason to bend the world.
- Duration: 6 s; 1 shot: 0-6 8mm  FISHEYE

### ANG23-FisheyeLow: Fisheye low (skate-cam)
- Says: The ground rushes past and the person walks above it.
- Use: Skating, street culture, a hero walk with attitude.
- Numbers: 8 mm fisheye 0.9 m below eye level, following a walk from behind at 2 m with a little hand shake.
- Avoid: Keeping the horizon level: let it bow.
- Duration: 7 s; 1 shot: 0-7 8mm  FISHEYE LOW FOLLOW

### ANG24-Peephole: Peephole
- Says: We are on the other side of the door, watching someone arrive.
- Use: A thriller, a doorstep, a character who should not open the door.
- Numbers: 5 mm fisheye at 1.5 m height looking out, the visitor walking in from 8 m to 2 m over 6 s.
- Avoid: Showing the visitor's face too soon: let them grow.
- Duration: 7 s; 1 shot: 0-7 5mm  PEEPHOLE

### ANG25-SecurityCam: Security camera
- Says: Nobody is meant to see this: a camera in a corner, a person who thinks they are alone.
- Use: Surveillance, found footage, a crime seen afterwards.
- Numbers: 12 mm half-fisheye from a corner 3.6 m up, looking down 30 degrees, a person crossing the room.
- Avoid: Cutting from it to a clean shot without a reason.
- Duration: 7 s; 1 shot: 0-7 12mm  SECURITY CAMERA

### ANG26-LongLens: Long lens (135 mm)
- Says: Far away, and flattened: the person and the background are glued together.
- Use: Stalking, a crowd, a person lost in a city, a runner who is going nowhere.
- Numbers: 135 mm, MS from 14 m: the depth is compressed and the trees behind sit flat against the head.
- Avoid: Forgetting to leave something sharp: shallow focus does the rest.
- Duration: 6 s; 1 shot: 0-6 135mm  LONG LENS

### ANG27-TelephotoCloseUp: Telephoto close-up (200 mm)
- Says: Watched from a long way off: a stranger who does not know we are there.
- Use: Surveillance, a long wait, a candid portrait.
- Numbers: 200 mm, CU from 30 m, the background a smear of colour.
- Avoid: Shaking: at 200 mm every tremor becomes a swing.
- Duration: 6 s; 1 shot: 0-6 200mm  TELEPHOTO CLOSE-UP

### ANG30-HipLevel: Hip level
- Says: The camera sits where the hands are: something is about to be drawn.
- Use: Gunslingers, a hand on a holster, a fight about to start, a person who looks calm and is not.
- Numbers: 35 mm, MS from 1 m off the ground, 0.65 m below eye level, level.
- Avoid: Losing the face: tilt up a little so the eyes stay in the top third.
- Duration: 6 s; 1 shot: 0-6 35mm  HIP LEVEL

### ANG31-KneeLevel: Knee level
- Says: Low and close to the floor: a creeping, watchful or comic point of view.
- Use: A character sneaking, a pet's or child's view, a person who is bigger than the room.
- Numbers: 28 mm, FS from 0.5 m off the ground, 1.15 m below eye level.
- Avoid: Going so low the face is lost: the head must stay in frame.
- Duration: 6 s; 1 shot: 0-6 28mm  KNEE LEVEL

### ANG32-GroundLevelWalk: Ground level walk
- Says: We see where they are going by their feet, and nothing of their face.
- Use: A mysterious walker, a hit, a delivery, a character we should not know yet.
- Numbers: 24 mm, 0.2 m off the ground, following a walk from behind at 2.5 m, the shoes and legs only.
- Avoid: Cutting to the face right after: keep the withholding going.
- Duration: 7 s; 1 shot: 0-7 24mm  GROUND LEVEL WALK

### ANG33-ShoulderLevel: Shoulder level
- Says: A natural, reportage height: slightly below the eyes, so the person is a little taller than us.
- Use: Everyday coverage, documentary walks, anything that should feel real but a touch heroic.
- Numbers: 40 mm, MS with the lens 0.3 m below eye level.
- Avoid: Mixing it with true eye-level shots in one scene without a reason.
- Duration: 6 s; 1 shot: 0-6 40mm  SHOULDER LEVEL

### ANG34-HighThreeQuarter: High three-quarter
- Says: We look down on them from above and to one side: small, but still a person, not a symbol.
- Use: A character who is being watched, a figure in a courtyard, a quiet defeat with some dignity left.
- Numbers: 28 mm, FS from 3 m above eye level and 45 degrees round, looking down about 35 degrees.
- Avoid: Going to full overhead: the face has to stay readable.
- Duration: 6 s; 1 shot: 0-6 28mm  HIGH 3/4

### ANG35-LowThreeQuarter: Low three-quarter
- Says: They rise above us at an angle, and the sky is behind them.
- Use: A hero against a skyline, a leader on a step, a person who should look larger than life.
- Numbers: 24 mm, MS from 1 m below eye level and 45 degrees round, looking up about 25 degrees.
- Avoid: Letting the chin hide the eyes.
- Duration: 6 s; 1 shot: 0-6 24mm  LOW 3/4

### ANG36-OverTheHead: Over the head
- Says: We are behind and above them, looking down past their head at what they face.
- Use: A person at a table, a look at a map, a reveal that the viewer shares with them.
- Numbers: 28 mm from 2.4 m above eye level, directly behind, looking down about 45 degrees, the head and shoulders in the lower frame.
- Avoid: Hiding what they look at: it has to be in the frame.
- Duration: 6 s; 1 shot: 0-6 28mm  OVER THE HEAD

### ANG37-Symmetrical: Symmetrical shot
- Says: Everything is balanced round the person in the middle: calm, ceremony, a trap.
- Use: A formal portrait, a hallway, a still moment before something breaks the balance.
- Numbers: 28 mm, FS from the middle of the nave, level, the person on the centre line with a column on each side.
- Avoid: Almost symmetrical: it has to be exact or it looks like a mistake.
- Duration: 6 s; 1 shot: 0-6 28mm  SYMMETRICAL

### ANG38-FramedShot: Frame within a frame
- Says: The person is held inside something else: a doorway, a gap, a pair of columns.
- Use: Isolation, being trapped or watched, drawing the eye to one figure.
- Numbers: 35 mm from 10 m, level, the person standing in the gap between two columns of the nave.
- Avoid: A frame that is brighter than the subject: it pulls the eye away.
- Duration: 6 s; 1 shot: 0-6 35mm  FRAME WITHIN A FRAME

### ANG39-LeadingLines: Leading lines
- Says: Every line in the ground runs to one person.
- Use: Directing the eye without a cut, a long approach, a destination.
- Numbers: 24 mm at 0.7 m height, centred on a paving joint, the person 16 m away where the lines meet.
- Avoid: Lines that run past the subject: they must end on them.
- Duration: 6 s; 1 shot: 0-6 24mm  LEADING LINES

### ANG40-SlightLowCloseUp: Slight low-angle close-up
- Says: We look up at a face a little: sure of itself, or looking at something above us.
- Use: Awe, hope, a hero looking at the sky, a gentle sense of power.
- Numbers: 70 mm, CU from 0.35 m below eye level, looking up about 10 degrees.
- Avoid: Going lower: it becomes a power shot and loses the tenderness.
- Duration: 6 s; 1 shot: 0-6 70mm  SLIGHT LOW CU


## Moves on objects (OBJ01 to OBJ16): 16 cards

### OBJ01-PushInObject: Push in on an object
- Says: This thing matters: the clue, the weapon, the letter.
- Use: Plant an object the story will pay off; turn attention from people to a thing.
- Numbers: 50 mm, from a wide that shows where it is to an insert that fills the frame, 5–7 s, eased, looking slightly down.
- Avoid: An insert with no geography first: the audience must know where the object is.
- Duration: 7 s; 1 shot: 0-7 50mm  PUSH IN · WIDE TO INSERT

### OBJ02-OrbitHero: Hero orbit (object)
- Says: Admire it: the reveal of a hero vehicle, a product, a prize.
- Use: Introducing a vehicle, a machine or a product; showing every side in one move.
- Numbers: 35 mm, full shot, 180° over 6–8 s, eased, camera slightly above the roofline.
- Avoid: Orbiting so fast the background smears; keep it under about 30°/s.
- Duration: 8 s; 1 shot: 0-8 35mm  HERO ORBIT 180

### OBJ03-CraneUpStatue: Crane up a monument
- Says: Scale and awe: we rise with it to see how big it is, and what it watches over.
- Use: Monuments, buildings, giant machines; the arrival at a destination.
- Numbers: 28 mm, starting low at the base (a low angle adds weight), rising 6 m over 6–8 s.
- Avoid: Starting high: the rise is the reveal.
- Duration: 7 s; 1 shot: 0-7 28mm  CRANE UP · LOW TO HIGH

### OBJ04-TruckPastParallax: Truck past (parallax)
- Says: Depth and travel: the world is layered, and we are moving through it.
- Use: Establishing a space with depth; passing foreground that frames the subject; showing speed.
- Numbers: 35 mm, a sideways slide of 10–12 m over 6–8 s, aim held parallel; foreground 1–3 m away, subject 10+ m.
- Avoid: An empty foreground: parallax needs near objects to pass the lens.
- Duration: 7 s; 1 shot: 0-7 35mm  TRUCK RIGHT · PARALLAX

### OBJ05-TrackingCarLow: Low tracking (vehicle)
- Says: Speed and power: low to the ground, matched to it, the road streaming past.
- Use: Car chases, vehicles at speed, a character on a bike or horse.
- Numbers: 35 mm, 0.4 m off the ground, matched speed, side-on and a little ahead.
- Avoid: Matching too exactly with nothing in the background: speed reads from what streams past.
- Duration: 7 s; 1 shot: 0-7 35mm  LOW TRACKING · CAR

### OBJ06-TopDown: Top-down (god's eye)
- Says: Pattern and fate: we look down like a map; the people below are pieces.
- Use: Showing layout and geography, a body or an object on the ground, transitions between scenes.
- Numbers: 35 mm straight down from 10–15 m, a slow rotation of 20–30° over 6 s.
- Avoid: Overhead for emotion: it distances; use it to explain space.
- Duration: 6 s; 1 shot: 0-6 35mm  TOP-DOWN · SLOW ROTATE

### OBJ07-RackFocus: Rack focus
- Says: Look here, now there: the lens moves our attention without the camera moving.
- Use: Linking a clue to a person, revealing who is behind, a shift in what matters.
- Numbers: 50 mm at T1.4, the camera low between a near object and a far one;  hold, then pull focus over 0.6–1 s on a motivated beat.
- Avoid: Racking with deep focus (wide lens, small stop): nothing changes.
- Duration: 6 s; 1 shot: 0-6 50mm  RACK FOCUS · CASE TO ALEX

### OBJ08-WipeReveal: Wipe reveal
- Says: A curtain opens: something near the lens passes and the subject is there.
- Use: Hidden cuts, reveals, transitions between scenes or times.
- Numbers: 35 mm, a lateral move behind a near object (1–2 m from the lens) that fills the frame for a moment.
- Avoid: A wipe object that is too far: it must fill the frame to hide or reveal.
- Duration: 6 s; 1 shot: 0-6 35mm  WIPE REVEAL

### OBJ09-ThroughDoorway: Through a doorway
- Says: Crossing a threshold: we enter their world, their room, their story.
- Use: Entering a space, discovering someone inside, transitions from outside to in.
- Numbers: 28 mm, a dolly through the frame of the door over 5–7 s; the door frame wipes past the edges.
- Avoid: Stopping in the doorway: the move is the crossing.
- Duration: 7 s; 1 shot: 0-7 28mm  DOLLY THROUGH DOORWAY

### OBJ10-CrashZoom: Crash zoom
- Says: Shock or punchline: the lens slams in on the thing that matters.
- Use: Comedy beats, sudden realisations, 70s-style energy; a deliberate stylistic flourish.
- Numbers: Fixed camera, 24 → 150 mm in 0.3–0.4 s, a held frame on both sides.
- Avoid: Using it as a dolly: a zoom flattens space and reads as a style choice.
- Duration: 5 s; 1 shot: 0-5 24>150mm  CRASH ZOOM

### OBJ11-TiltUpTall: Tilt up (height reveal)
- Says: How tall it is: from the base, we look up and up.
- Use: Trees, towers, giants, buildings; the first sight of something huge.
- Numbers: 18 mm from low near the base, tilting up about 45° over 8–9 s, eased (slow enough not to judder at 24 fps).
- Avoid: Tilting past the top into empty sky; land on the top.
- Duration: 9 s; 1 shot: 0-9 18mm  TILT UP · BASE TO TOP

### OBJ12-FlybyPan: Flyby pan
- Says: It roars past us: speed, scale, a near miss.
- Use: Spacecraft, planes, trains or cars passing the camera; a beat of spectacle.
- Numbers: 35 mm on a fixed head, panning with a subject at 20+ m/s that passes within 10–15 m.
- Avoid: Leading the subject off-frame: let it pass through and exit.
- Duration: 6 s; 1 shot: 0-6 35mm  FLYBY PAN

### OBJ13-MacroSlider: Macro slider
- Says: Look closely: a small thing, made precious by the time we take over it.
- Use: Product details, clues, keepsakes; the insert before someone opens or takes it.
- Numbers: 100 mm at T2, the lens 0.25 m above the case top and 4.2 m from it (the case half the frame width), a 0.72 m slide over 7 s (0.08 m/s, a creep) with the aim held parallel, so the case drifts across a third of the frame; bottles 2.7 m from the lens pass through the bottom of the frame as soft shapes.
- Avoid: Sliding past nothing: without foreground or background layers a slider reads as a pan.
- Duration: 7 s; 1 shot: 0-7 100mm  MACRO SLIDER

### OBJ14-FlyThroughWindow: Fly through a window
- Says: We cross from outside to in without a cut: the threshold is the moment.
- Use: Entering a building, a reveal of what is inside, a transition from a public space to a private one.
- Numbers: 24 mm, one keyed drone path of 13.6 m over 6 s, descending 0.6 m; the window frame (2 × 2 m) passes within 0.9 m of the lens at the move's fastest point, then the move settles on the statue.
- Avoid: Slowing in the opening: the frame edge sells the crossing only at speed.
- Duration: 7 s; 1 shot: 0-7 24mm  FLY THROUGH WINDOW

### OBJ15-TopDownSpiral: Top-down spiral
- Says: From a map to a monument: we come down out of the sky and around, and it rises to meet us.
- Use: Arrivals at a landmark, an object of worship or dread; the end of a search.
- Numbers: 24 → 20 mm. From straight down at 16 m, a 270° spiral that descends to 0.3 m and widens to 4.6 m over 6.8 s on an S-curve; the tilt goes from 90° down to about 17° up, ending low under the stone, base to top, against open sky. Held 0.6 s at each end.
- Avoid: Spinning so fast the ground smears: the rotation eases out with the descent.
- Duration: 8 s; 1 shot: 0-8 24>20mm  TOP-DOWN SPIRAL

### OBJ16-ProductSpin: Product spin
- Says: Look at it from every side, fast, then let it settle: this is the one.
- Use: Product and vehicle reveals, the hero object of an ad, the end card before a logo.
- Numbers: 40 mm low (0.9 m, just under the roofline), the turntable arriving at 0.9 rev/s and braking on a cubic to a dead stop at 4.7 s, while the camera creeps 1.2 m in; held 1.8 s on the three-quarter front.
- Avoid: A spin that stops on a side-on or a rear angle: the brake lands on the beauty angle, decided first.
- Duration: 7 s; 1 shot: 0-7 40mm  TURNTABLE SPIN > BEAUTY


## Action (ACT01 to ACT08): 8 cards

### ACT01-BulletTimeOrbit: Bullet-time orbit
- Says: Time stops for this one moment: we walk round it while the world hangs.
- Use: The peak of a leap, a hit or a near miss that the story turns on; once per film.
- Numbers: 28 mm, full shot with the block in it, world clock eased to 0.02 over 0.3 s at the apex, held 3.8 s while the camera orbits 180° (about 47°/s), eased back to real time for the landing.
- Avoid: Freezing a pose that tells nothing: freeze the instant before the outcome, not after it.
- Duration: 8 s; 1 shot: 0-8 28mm  BULLET-TIME ORBIT 180

### ACT02-Snorricam: Snorricam
- Says: We are strapped to them: they hold still and the world lurches; panic, flight, a body out of control.
- Use: Flight in terror, drunkenness, a breakdown; a short burst inside a chase.
- Numbers: 18 mm, 1.4 m arm off the chest, the rig rides the body's own bounce (the run's measured 18 cm) so the figure holds still in frame; lean into turns (v·ω/g).
- Avoid: A long lens or a long arm: the subject must fill the frame so the world, not the body, moves.
- Duration: 7.25 s; 1 shot: 0-7.25 18mm  SNORRICAM · CHEST RIG

### ACT03-CrashZoomFight: Crash zoom and whip (fight)
- Says: That one landed: the zoom slams in on the hit and the whip throws us after the body.
- Use: The decisive blow of a fight, comedy violence, a shock beat; once per sequence.
- Numbers: Handheld 35 mm two-shot; crash zoom 35 → 85 mm in 0.2 s as the cross lands in the chest; hold 1 s on fist and head while the legs go; whip 0.28 s down with the fall, landing on 45 mm; cut to a low 24 mm wide on the same side of the line.
- Avoid: Zooming before the blow lands (it telegraphs), or whipping to a frame that is not composed.
- Duration: 7.5 s; 2 shots: 0-5 35>85mm  CRASH ZOOM · WHIP TO FALL; 5-7.5 24mm  LOW WIDE · STANDING OVER

### ACT04-SprintDollyZoom: Sprint dolly zoom
- Says: They run and the world chases them: the far end looms closer the harder they run.
- Use: A flight from something enormous, a run toward a deadline, the moment a chase turns hopeless.
- Numbers: Camera car leading the runner (5.2 m/s); 24 → 85 mm over 5.6 s while it pulls back from 3.5 to 12 m in proportion, hip high and level, so the runner holds a full shot and the far gate grows 3.5×.
- Avoid: Keying the lens and the distance apart, or a background with no lines: it needs a far shape to loom.
- Duration: 6.5 s; 1 shot: 0-6.5 24>85mm  DOLLY ZOOM · SPRINT

### ACT05-ParkourTrack: Parkour track
- Says: We run with them and see the whole body solve the obstacle: skill, speed, flow.
- Use: Chases on foot, parkour, any action where the body's line through the set is the point.
- Numbers: 35 mm full shot side-on, a real tracking-vehicle move (track_alongside_1, E.T. dataset) scaled to 5 m off; the rig does not hop with the runner (height smoothed over 1.4 s).
- Avoid: Cutting the move into pieces: one side-on take shows that the stunt was real.
- Duration: 7 s; 1 shot: 0-7 35mm  TRACKING · CLIMB, DROP, ROLL

### ACT06-HeroLowArc: Hero low arc
- Says: Here they come: bigger than life, and time bends round them.
- Use: The hero's entrance, the walk to the fight, the team reveal.
- Numbers: 21 mm, lens 0.45 m off the ground, medium-wide looking up about 30°; an 80° arc round the front at a steady 9°/s; world clock eased to 0.3 for 1.5 s at the middle of the arc.
- Avoid: Speed-ramping a walk with nothing else moving: the dust and the camera must keep real time to sell it.
- Duration: 8 s; 1 shot: 0-8 21mm  LOW ARC · SPEED RAMP

### ACT07-FightCoverage: Fight coverage
- Says: Who hits whom, in order: a wide for the geography, then closer as the fight decides itself.
- Use: Any short exchange of blows: master, the pair of overs, an insert on the blow that matters.
- Numbers: 28 mm handheld master (real operator drift, handheld_drift_1), a 50 mm OTS on Alex, an 85 mm insert on the jab, a 32 mm single on Sam for the knockdown, all from one side of the line; cut on the start of each blow, never during it.
- Avoid: Cutting before a blow completes, or crossing the line: the audience loses who is hitting.
- Duration: 7.25 s; 4 shots: 0-2.25 28mm  WIDE MASTER · HANDHELD; 2.25-3.55 50mm  OTS · SAM ON ALEX; 3.55-4.25 85mm  INSERT · THE JAB LANDS; 4.25-7.25 32mm  SINGLE · SAM GOES DOWN

### ACT08-FallDrop: Fall drop
- Says: We go down with them: the floor comes up, and the one left standing towers.
- Use: A knockout, a death, a collapse; the end of a fight from the loser's level.
- Numbers: 35 → 28 mm; the camera falls 1.45 m to 0.24 m off the floor in 0.75 s with a gravity ease, a beat behind the body, and lands 1.6 m from the head.
- Avoid: Dropping before the body does: the camera follows the fall, it never leads it.
- Duration: 7.5 s; 1 shot: 0-7.5 35>28mm  FALL DROP TO THE FLOOR


## One-take moves (ONE01 to ONE04): 4 cards

### ONE01-CraneToFollowWhip: Crane to follow, whip reveal
- Says: We arrive from above, fall in with them, and turn to see what they are walking toward.
- Use: Openings that hand geography to a character, then the destination: arrivals, discoveries, the first sight of the goal.
- Numbers: 32 mm throughout. Crane from 7 m above and 7.6 m out to eye level 3.1 m in front over 4.3 s, a Steadicam lead at her pace (she builds to 1.75 m/s, a purposeful stride) with a 0.6 s lag, then the operator plants and whips 0.45 s (about 140°) onto the destination, held 4 s while she walks on past the lens into the frame toward it.
- Avoid: A whip onto a frame that is not composed, or a crane that lands on nothing: each stage of the take must end on a frame you could cut on.
- Duration: 13.5 s; 1 shot: 0-13.5 32mm  CRANE DOWN > LEAD > WHIP

### ONE02-DroneDiveChase: Drone dive into a chase
- Says: From far above, the world; then we drop out of the sky and ride with them; then we let them go.
- Use: Car and vehicle openings, the start or end of a chase, any journey that needs scale and speed in one move.
- Numbers: 35 mm. The drone starts 56 m back and 30 m up (the car a tenth of the frame), dives over 5 s (peak 16 m/s closing speed) to 9 m behind and 2.2 m up at the car's 14 m/s, chases 3 s, then climbs and falls back (a real-film dolly-out-and-up path, played at 1.6×) to end high and wide.
- Avoid: Diving with a jolt: the drone must already be matched to the car's speed before it drops, and land on the chase without a bump.
- Duration: 12 s; 1 shot: 0-12 35mm  DRONE DIVE > CHASE > RISE

### ONE03-InteriorOner: Interior oner
- Says: We walk the space with them, in real time: no cuts, so nothing is hidden and nobody can leave.
- Use: Arrivals into a room, a reveal of who is waiting, tension that should not be relieved by a cut.
- Numbers: 35 mm throughout. Lead from 1.9 m in front (a real-film lead path), a 4.5 s swing of 180° round her right side (peak 60°/s, held on her eyes), a Steadicam follow 1.9 m behind through a 1.7 m doorway, settling into an OTS on Sam 1.9 m beyond her. 14 s, 11 m walked at 1.2 m/s.
- Avoid: Losing the subject in the swing, or a camera that fits through the door only because the walls are fake: the rig's path has to clear the frame.
- Duration: 14 s; 1 shot: 0-14 35mm  LEAD > SWING > FOLLOW > OTS

### ONE04-OrbitPushRack: Orbit, push, rack
- Says: We circle a conversation, then close in on her over his shoulder, and when he looks away the focus leaves her for him.
- Use: The turn of a dialogue scene in one take: a confession, a refusal, the moment one person stops looking at the other.
- Numbers: 40 mm at T2. A 0.9 s held two-shot, a real-film orbit of about 115° round the pair over 6 s (steadied, a little above their eyes), a 2 m push to a dirty MCU of Sam over Alex's shoulder in 4 s, a 1.2 s rack focus from her (3.1 m) to him (1.8 m) as he looks down, held 1.8 s.
- Avoid: Racking with nothing behind: the second face must already be in the frame, soft, before the rack starts.
- Duration: 14 s; 1 shot: 0-14 40mm  ORBIT > PUSH > RACK


## Scenes (SC01 to SC10): 10 cards

### SC01-ForestClearing: Forest clearing
- Says: A person arrives somewhere and finds something.
- Use: Openings, discoveries, any scene where a character enters a new place.
- Numbers: Crane down 28 mm, Steadicam follow 32 mm, push-in 50 mm MCU→CU, reverse OTS 50 mm, crane up 24 mm.
- Avoid: Showing the discovery before the reaction: the face comes first (rulebook §5).
- Pattern: Arrival → follow → reaction push → reverse on the discovery → release
- Duration: 22 s; 5 shots: 0-5 28mm  CRANE DOWN · ARRIVAL; 5-10 32mm  STEADICAM FOLLOW; 10-13.5 55mm  PUSH IN · REACTION; 13.5-17.5 50mm  REVERSE OTS · THE STONE; 17.5-22 24mm  CRANE UP · RELEASE

### SC02-InteriorDialogue: Interior dialogue
- Says: Two people talk; the camera tells us whose moment it is.
- Use: Any two-person scene: a confession, an argument, an interview.
- Numbers: Master 28 mm, OTS pair 75 mm matched, close-up 65 mm, every camera on one side of the line between them.
- Avoid: Crossing the line, or cutting in to the close-up before the turn of the scene.
- Pattern: Master two-shot → OTS → reverse OTS → close-up at the turn → master from a new angle
- Duration: 17.5 s; 5 shots: 0-4 24mm  MASTER TWO-SHOT; 4-7.5 75mm  OTS · ALEX ON SAM; 7.5-11 75mm  REVERSE OTS · SAM ON ALEX; 11-14 65mm  CLOSE-UP · THE TURN; 14-17.5 28mm  MASTER · NEW ANGLE

### SC03-StreetWalkTalk: Street walk-and-talk
- Says: Two people on the move, talking; the city carries on around them.
- Use: Walk-and-talks, chases on foot, arrivals in a city.
- Numbers: Establishing 24 mm from 8 m up over the road, lead 32 mm, long-lens tracking 85 mm from across the road (over the parked cars), low wide 20 mm.
- Avoid: Losing screen direction: they keep walking the same way in every shot.
- Pattern: High establishing → Steadicam lead two-shot → tracking single → low-angle wide
- Duration: 14.5 s; 4 shots: 0-4 24mm  HIGH ESTABLISHING; 4-8 32mm  STEADICAM LEAD · TWO-SHOT; 8-11 85mm  LONG-LENS TRACKING; 11-14.5 20mm  LOW-ANGLE WIDE

### SC04-CarInterior: Car interior
- Says: Two people trapped together in motion: intimacy, tension, a confession.
- Use: Dialogue in a moving vehicle; road trips; an escape.
- Numbers: Windshield two-shot 28 mm, singles 32 mm from the windshield corners (both in front: one side of the line), POV 24 mm.
- Avoid: A static world outside: the road must move or the car reads as parked.
- Pattern: Windshield two-shot → driver single → passenger single → POV of the road
- Duration: 13 s; 4 shots: 0-4 28mm  WINDSHIELD TWO-SHOT; 4-7 32mm  DRIVER SINGLE; 7-10 32mm  PASSENGER SINGLE; 10-13 24mm  POV · THE ROAD

### SC05-SpaceFlyby: Space flyby
- Says: Scale and speed: a small ship against an enormous world.
- Use: Openings in space, travel, the arrival at a planet.
- Numbers: Wide 35 mm, chase 28 mm, flyby 35 mm, recede 85 mm.
- Avoid: Losing scale: keep the planet or a near rock in frame to measure the ship by.
- Pattern: Locked wide with the planet → chase drone → flyby pan → long-lens recede
- Duration: 17 s; 4 shots: 0-5 35mm  LOCKED WIDE · THE PLANET; 5-9.5 28mm  CHASE DRONE; 9.5-13 35mm  FLYBY PAN; 13-17 85mm  LONG-LENS RECEDE

### SC06-RooftopChase: Rooftop chase
- Says: One gets away, one is left at the edge: the gap between two roofs is the story.
- Use: Foot chases, escapes, parkour, any pursuit with one obstacle that decides it.
- Numbers: Chase drone 24 mm 9 m back and 4.5 m up, tracking 40 mm full figure at 5.8 m, snorricam 27 mm on a 2 m arm (the pursuer 3.7 m behind in the frame), the jump at 24 mm from a drone hovering off the roof with the world at 0.22× through the flight, OTS 50 mm, rise 24 mm to 4 m. Runners at 5 m/s; the jump 3.9 m across and 1 m down in 0.75 s, landed into a roll.
- Avoid: Flipping screen direction: every camera stays on the near side of the run, so they always run left to right.
- Pattern: Chase drone geography → side tracking → snorricam → speed-ramped gap jump → OTS of the pursuer at the edge → drone rise
- Duration: 17 s; 6 shots: 0-3.6 24mm  CHASE DRONE · GEOGRAPHY; 3.6-5.9 40mm  TRACKING · THE PURSUED; 5.9-6.9 27mm  SNORRICAM · THE GAP CLOSES; 6.9-10.15 24mm  SPEED-RAMPED JUMP; 10.15-13 50mm  OTS · THE PURSUER AT THE EDGE; 13-17 24mm  DRONE RISE · RELEASE

### SC07-AlleyFight: Alley fight
- Says: Who hits whom, and what it costs: the crates behind him are shown before he goes into them.
- Use: Fist fights, brawls, any two-person fight in a tight space.
- Numbers: Master 24 mm from 3 m up, OTS 50 mm 3 m back (the shoulder a third), single 35 mm, crash zoom 32→100 mm in 0.24 s from 3 m, low wide 20 mm handheld at 0.45 m, crane up to 5.4 m on 24 mm. Fighters 0.95 m apart, punches land at their measured reach.
- Avoid: Cutting before the blow completes, or crossing the line between the fighters: every camera is on their left.
- Pattern: Wide master → OTS over the attacker → single on him → crash-zoom insert on the blow → low handheld wide on the knockback → crane up, release
- Duration: 15.625 s; 6 shots: 0-3.3 24mm  WIDE MASTER; 3.3-5.4 50mm  OTS · VIC ON BRICK; 5.4-7.5 35mm  SINGLE · VIC; 7.5-8.25 32→100mm  CRASH ZOOM · THE HIT; 8.25-11.2 20mm  LOW HANDHELD · INTO THE CRATES; 11.2-15.625 24mm  CRANE UP · RELEASE

### SC08-HeistApproach: Heist approach
- Says: Getting in unseen: the wall, the walk, the door, and the one who keeps watch.
- Use: Heists, infiltrations, stealth, any scene where being seen is the threat.
- Numbers: Crane over the wall 28 mm from 5.3 m outside to 2.1 m inside, tracking 40 mm on the crouch-walk (0.72 m/s, paced to the clip), locked 32 mm at the door, POV 32 mm handheld at crouched eye height, the door frame in the frame, lookout hold 85 mm, high wide 40 mm from over the wall.
- Avoid: Showing the guard before the POV: the doorway is where we learn he is there.
- Pattern: Crane over the wall → crouch-walk tracking → locked at the door → POV through the doorway → hold on the lookout → high wide as he slips in
- Duration: 19.25 s; 6 shots: 0-4.5 28mm  CRANE OVER THE WALL; 4.5-7.8 40mm  TRACKING · CROUCH-WALK; 7.8-11 32mm  LOCKED · THE DOOR; 11-14 32mm  POV · THROUGH THE DOORWAY; 14-16.4 85mm  HOLD · THE LOOKOUT; 16.4-19.25 40mm  HIGH WIDE · IN

### SC09-StandoffDebris: Stand-off
- Says: Two people, one street, a wait; it ends in one shot that hits what we were shown at the start.
- Use: Stand-offs, duels, any held tension that breaks into violence.
- Numbers: Wide 24 mm low, matched dolly pushes on 75 mm MS→CU about 50° off the line, ECU 135 mm from 2.2 m, the shot 50 mm MS, impact wide 24 mm with the world at 0.2× for 3 s.
- Avoid: Pushing faster than the tension: the push is the acting, so it creeps. Show the kegs in the first wide.
- Pattern: Profile wide with the kegs in it → slow push on one → matched push on the other → ECU on long lens → the shot → speed-ramped impact
- Duration: 19 s; 6 shots: 0-4.2 24mm  PROFILE WIDE · THE STREET; 4.2-8.4 75mm  SLOW PUSH · COLE; 8.4-12.6 75mm  SLOW PUSH · REYES; 12.6-13.3 135mm  ECU · LONG LENS; 13.3-14.1 50mm  MS · THE SHOT; 14.1-19 24mm  IMPACT · SPEED RAMP

### SC10-CarCrashBarrier: Car through the barrier
- Says: Something unstoppable meets something in its way; someone watches it happen from just far enough away.
- Use: Crashes, breakthroughs, roadblocks, any vehicle impact.
- Numbers: Wide 24 mm, tracking 20 mm at 0.4 m off the road and 16 m/s, MCU 65 mm, impact wide 35 mm from 27 m up the road, replay 24 mm from 9 m off the barrier with the world at 0.2× from 0.25 s before the hit, aftermath 32 mm.
- Avoid: Breaking the car's screen direction: every camera sits on the bystander's side of the road.
- Pattern: Locked wide with the barrier → low tracking on the car → the bystander sees it → locked-off wide on the impact → slow-motion replay angle → aftermath
- Duration: 17.5 s; 6 shots: 0-3.5 24mm  LOCKED WIDE · THE BARRIER; 3.5-6.5 20mm  LOW TRACKING · THE CAR; 6.5-8.3 65mm  MCU · SHE SEES IT; 8.3-10.04 35mm  LOCKED-OFF WIDE · IMPACT; 10.04-14.04 24mm  REPLAY · SLOW MOTION; 14.04-17.5 32mm  AFTERMATH · SHE WATCHES


## Famous shots (FAM01 to FAM06): 6 cards

### FAM01-Booth360: 360 booth spin
- Says: The 360 party booth: the camera swings round them at arm's length, time drops to slow motion while they hang in a jump, then it comes round again and slows on the face.
- Use: Someone showing off for the lens at a party, a wedding or a launch. Put one clear action (a jump, a throw) in the first slow stretch.
- Numbers: 10.5 mm, level, lens 1.6 m from the platform's axis and 1.28 m off the floor. The arm turns 70°/s clockwise seen from above, 426° in 10.7 s. Clock 1 until 0.6 s, 0.16 from 1.1 to 3.5 s (11°/s, a 0.32 m jump hangs), 1 from 4.0 to 7.8 s, 0.18 from 8.3 s (13°/s), ending square on the face.
- Avoid: Slowing the person but not the arm: in a real booth the room slows with them. No tilt, no change of radius; the rig cannot do either.
- Duration: 10.7 s; shots not parsed

### FAM02-ExplosionWalk: Walk away from the explosion
- Says: Nothing behind them is worth a look: the hero walks at us, the world goes up, and they do not turn.
- Use: The exit after the job is done: someone leaving a thing burning behind them. Once per film, as the last beat of a sequence.
- Numbers: 85 mm straight in front, lens 1.0 m rising to 1.3 m, 8.6 m from the walker closing to 4.85 m (the dolly backs away at 15% of the 0.97 m/s walk): knees-up to waist-up. The car goes up 22 m behind the end mark at 2.0 s; clock 1 to 2.4 s, eased to 0.25 by 3.0 s and held to 10 s. No shake.
- Avoid: A look back, a flinch or a quicker step: the calm is the shot. No camera shake, and no debris near the walker.
- Duration: 10 s; shots not parsed

### FAM03-TrunkShot: Trunk shot
- Says: We are the thing in the boot. The lid lifts, daylight comes in, and three people stand over us looking down into the lens.
- Use: A reveal from the point of view of whatever is in the boot: gangsters, a road trip, a find. The lid shutting to black is the cut out, and the clip loops.
- Numbers: 16 mm locked off on the boot floor, lens 10 cm above it, tilted 49° up toward the tail, f/11. Black 0.6 s, the lid swings 36° in 0.75 s, then three people from the chest up with the tops of their heads a third down the frame, the lid across the top 15% and the sill along the bottom 4%. They lean in by 2 s, one reaches toward the lens from 4.3 to 6.7 s, they straighten at 8 s, the lid is pushed shut in 0.45 s from 8.9 s, black from 9.35 to 10 s.
- Avoid: Moving the camera (the real one never does), or standing the people upright behind the bumper: they must lean over the sill or they sink to the bottom of the frame.
- Duration: 10 s; shots not parsed

### FAM04-LeapOfFaith: Leap of faith
- Says: A jump there is no taking back. They dive off a tower and drop at full speed; the camera dives after them and the world turns over. Time stretches only on the frame where the fall becomes a rise: the city hangs from the top of the picture and they float up through it. Then we close on their face, still falling.
- Use: A first leap, a point of no return, any fall the story turns on. Once per film. Let the inverted frame have its moment before the push-in.
- Numbers: 28 to 35 mm, one 13.1 s take. Full shot on a window ledge 205 m up, held 1 s. Toe-off at 1.6 s (2.0 m/s up, 3.6 m/s out), then 3.3 s of real-speed fall: the camera climbs to look 70° down as they drop away to 16.6 m, then dives after them (peak 44 m/s), swinging 75° to their side and rolling 180° (peak 87°/s). At 4.9 s they are doing 30.6 m/s, 47 m down; the clock eases to 0.035 by 5.6 s as the camera lands level on the inverted wide: the figure 19.6% of frame height in the middle, falling 1.2 m/s in playback. The wide sits 1.5 s. From 7.1 to 11.6 s the camera pushes in to 1.5 m from the face (peak 6.8 m/s), arcing 30° to square on; the last 1.5 s hold the close-up.
- Avoid: Slow motion before the inverted frame: the fall has to be a real fall. A roll in steps, or a cut into the inverted frame: it is one turn about the figure. Towers behind the figure in the wide: keep open sky under them. Any tumble once the push-in starts: the face must hold still in frame.
- Duration: 13.1 s; shots not parsed

### FAM05-Bay360: Bay 360
- Says: They get up and the world turns round them: the heroes rise in slow motion against the sky while a low lens wheels from their backs to their faces.
- Use: The beat after the blast or the chase, when the heroes stand to face what comes next; once per film.
- Numbers: 85 mm, lens 0.3 m off the ground looking up 19 to 27°, on a 4.9 m circle of track passing 2.7 m from the heroes. 136° round them, from behind the right shoulder to front right, at a steady 17°/s for 8 s with no stop at either end. World clock 0.3 throughout: the near hero is up at 1.6 s, the far one at 3 s. The far hero stands 0.75 m ahead and left of the near one. The background crosses the frame at 0.6 widths a second.
- Avoid: A wide lens or a lens at eye height: the heads must sit against sky with the background streaking behind them.
- Duration: 8 s; shots not parsed

### FAM06-PeterPanFlight: Peter Pan flight
- Says: Flying, and the joy of it. They cross the city above the rooftops and the camera cannot keep still either: it circles them the whole way, behind, in front, over the top, while the roofs stream past.
- Use: A character who can fly, a dream, an arrival over a city, the high point of a fantasy. One take: do not cut between the angles, and let the last two seconds on the face play out.
- Numbers: 24 mm, one 16 s take at real speed. The flyer covers 243 m at 13.7 to 17.2 m/s: climbs from 26.5 to 38 m, weaves between two towers 5.5 and 6.8 m off, banks 45° round a clock tower on a 24 m radius, dips to 27.5 m (4.4 m over the roofs) and rises. The camera travels with them and goes round them one and a half times (531°), never faster than 51°/s: a chase from 4.3 m behind, side-on at 3 s, face to lens from 3.2 m at 5 s, 64° overhead from 6 m at 7.3 s, wide outside the bank from 8.5 to 9 m at 9 to 10 s with the clock face in frame, side-on again through the dip at 13 s, then ahead and low at 3.5 m for the last 1.5 s. The horizon tilts with the bank only, up to 11°.
- Avoid: A flyer who hovers: the roofs must keep passing, or it reads as a wire rig. Stopping the orbit to hold an angle: the angles are passed through, not cut between.
- Duration: 16 s; shots not parsed


## Product and showpiece moves (PRD01 to PRD06): 6 cards

### PRD01-FrozenSplashOrbit: Frozen splash orbit
- Says: A bottle or can drops onto a wet table, time stops on the splash, the camera circles it 270 degrees at its own height, then time resumes.
- Use: A drink or splash shot that needs a bullet-time hero frame. The bullet-time orbit for liquids.
- Numbers: 270 degree orbit at the object's own height; the splash is held about 3.8 s at 0.6% of real speed; the move ends on its front.
- Avoid: Never sent to the model: the first render hid the pill behind the splash. Check the frame at the freeze before you send it.
- Duration: 8 s; shots not parsed

### PRD02-RobotArmSnap: Robot-arm snap
- Says: Three angles on three beats: the camera crosses the studio in under a second, stops dead on the product, then snaps twice more.
- Use: Launch films cut to music (sneakers, phones, drinks): any product that should feel fast and exact. The stops land at 2.0, 4.0 and 6.0 s, so a 120 bpm track drops straight under it.
- Numbers: Held wide for 1.28 s: 24 mm, 6.0 m from the pill, lens 2.4 m up. Move 1: 5.7 m in 0.70 s on a descending curve, peak 11.0 m/s, 24 to 50 mm, dead still from 1.98 s on a macro of the dot, 0.40 m off its face. Move 2: 45° round and up in 0.50 s (view turns 57°, peak 159°/s) to 35 mm, 1.25 m out, looking down 39°. Move 3: 0.60 s (66°, peak 157°/s) down to 3 cm above the plinth top, 24 mm, 0.63 m out, looking up 11°, held 2.0 s. Inside the Bolt's 12 m/s and 180°/s.
- Avoid: A soft landing or a settle after the stop: the frame on the beat is already still. Three stops that look alike: change distance, height and lens every time.
- Duration: 8 s; 1 shot: 0-8 24>50>35>24mm  ROBOT-ARM SNAP x3

### PRD03-ExplodedBuild: Exploded build
- Says: It is made of parts and every part has its place: we go through the middle of it, and it closes into one thing behind us.
- Use: A product whose build is the selling point (layers, ingredients, components). The reveal after the features, ending on the pack shot.
- Numbers: 21 mm probe lens on a motion-control arm, T8. Built 5 times real size so the lens clears the parts; real-scale figures: opens 1.2 m out and holds 0.6 s, pushes 0.23 m in 1.8 s, then accelerates to 1.2 m/s and crosses the pill's axis at 3.4 s through a 10.4 cm gap, 4.6 cm from each cut face. A 180° whip in 0.75 s (peak 474°/s) as it brakes, then a 67° arc out to 0.6 m while the five slices land 0.18 s apart (4.75 to 5.47 s, each closing in 0.42 s to a dead stop). Still from 5.9 s, 12° above the pill, held 2.1 s. Path 2.07 m.
- Avoid: A tight gap or a slow pass: the fly-through reads only when both cut faces streak past the lens. Never end on a side the front is not facing.
- Duration: 8 s; 1 shot: 0-8 21mm  THROUGH THE GAP > WHIP ROUND > BEAUTY

### PRD04-ProbeFlyThrough: Probe fly-through
- Says: We are small enough to fly through what it is made of: the ingredients are a landscape, and the product is where it leads.
- Use: Food, drink, supplement and beauty spots where the ingredients are the story; an opening that travels through them and lands on the pack.
- Numbers: Built 5 times life size (the pill is 1.2 m); real figures in brackets. 16 mm at T22, the lens 0.15 m (3 cm) over the table. Held 0.6 s, then a 5.5 m (1.1 m) S-curve at 1.47 m/s (0.29 m/s), banking 11° into each bend, nearest pass 0.14 m (2.8 cm); level again and fastest, 2.0 m/s (0.4 m/s), under the arch at 4.65 s with the pill standing in its opening. In the open it rises to 0.38 m (7.6 cm), swings across the pill's front 2.04 m (41 cm) from it and backs away 1.06 m (21 cm) while the lens lengthens to 24 mm. Dead still from 7.4 s, 3.1 m (62 cm) out, the pill 61% of the frame height; held 1.6 s.
- Avoid: Flying over an empty table: without things a few centimetres from the lens on both sides it is only a low dolly. Keep the product in the arch's opening, never behind one of its legs.
- Duration: 9 s; shots not parsed

### PRD05-SkylineDive: Skyline dive
- Says: The whole city narrows to one object: from the skyline to a table in one breath, and the product is where it lands.
- Use: Launches and reveals where the product is a destination: a venue, a shop, a table worth crossing a city for.
- Numbers: One 134 m FPV path in 11.7 s, 19 mm tightening to 26 mm indoors. Holds 0.7 s, 3.5 m over the edge of an 80 m roof, looking down 62°. Dives 3.8 m off the face for 2.35 s at up to 25 m/s, nose 85° down. Pulls out to 2.4 m over the street, runs level for a second, banks 23° through a 90° turn, crosses a 2 × 2 m window square at 7 m/s with 0.9 m clear all round. Brakes over 4.2 m and stops 0.62 m from the pill at 10.1 s; the pill stands in the low sun that comes in through the same window. Still for 1.6 s.
- Avoid: Slowing for the window, or cutting anywhere: the frame edge sells the crossing only at speed, and the take only counts unbroken. No drift in the last frame.
- Duration: 11.7 s; shots not parsed

### PRD06-Glambot: Glambot
- Says: The red-carpet robot shot: the lens drops in on a pose and time falls into slow motion as it arrives, so the move never stops.
- Use: A person arriving or being revealed at an event, a fashion or beauty moment, a presenter with a product: one gesture, one take.
- Numbers: 20 mm throughout, 15 s. The arm travels 5.5 m in 2.8 s of real time, peaking at 3.8 m/s. It starts 5.5 m up and 2.8 m out, looking down 60° (carpet, rope and the star at 23% of frame height, no horizon), drops first and closes in last so the tilt eases to 32° down at 1.0 s and 10° down at 1.5 s (the horizon enters at 1.2 s), and lands on a hips-up frame at eye height 1.3 m off by 1.9 s. Then 47° round the star to a chest-up frame 1.05 m off. Camera and world share one clock: normal speed to 1.3 s, eased to 0.08 by 2.1 s, so the rest is a steady 0.084 m/s creep, still moving on the last frame. The star turns 50° with the lens from 0.9 s.
- Avoid: A hold at either end, a level start (it reads as a plain push in) or a second gesture: the arm never stops, and the slow motion has room for one move of the body.
- Duration: 15 s; shots not parsed


## Stories (STORY02, STORY03): 2 cards

### STORY02-DiveToShutter: Dive to the shutter
- Says: From the sky onto a man who can barely walk, across a dead place, to one spot where he turns a key.
- Use: A silent 30 s scene with a want, an obstacle and a release.
- Numbers: 7 shots, 30 s: CAM42 drone dive, 50 mm lead, 32 mm boots, CAM25 arc and rise, 40 mm follow, 85 mm face, 85 mm key.
- Avoid: Rushing the kneel or the silence after the bolt.
- Duration: 30 s; 7 shots: 0-6.5 24>50mm  DRONE DIVE (CAM42); 6.5-10.5 50mm  LEADING TRACK; 10.5-13 35mm  LOW TRACK ON THE FEET; 13-19 28mm  ARC AND RISE (CAM25); 19-25.3 40mm  FOLLOW TO THE SHUTTER (from behind and to the side, so the lock stays visible); 25.3-27.4 85mm  FACE; 27.4-30 85mm  KEY AND LOCK

### STORY03-TheGap: Come in
- Says: The shutter lifts and his mother is behind it: she will not make it easy.
- Use: A 30 s conversation scene, one mouth on camera per shot.
- Numbers: 6 shots, 30 s, slow moves: 50 mm over the shoulder, 50 mm reverse, 50 mm on the hands, 70 mm close, 24 mm wide.
- Avoid: Two speaking mouths in one shot.
- Duration: 30 s; 6 shots: 0-4 50mm  THE SHUTTER LIFTS; 4-11 50mm  OVER HIS SHOULDER: HER; 11-16 50mm  REVERSE: HIM; 16-20 50mm  THE KEY GOES ACROSS; 20-28.5 70mm  HER, CLOSE; 28.5-30 24mm  WIDE FROM OUTSIDE
