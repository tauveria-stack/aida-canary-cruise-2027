# AIDAcosma 2027 family survey

`family.html` uses one participant picker and four fixed profile ids. It calls
the public Supabase RPCs `family_read_profile` and `family_write_profile` from
`supabase/family_profiles.sql`; it does not read invitation tokens or use an
email, password, account, or administrative key.

## Privacy and access

There is no authentication. Anyone who can access the page and its public
Supabase project key can select and change any of the four profiles. Choosing a
name only keeps answers organized; it does not verify who is answering. Do not
put sensitive information in the survey. The public key in the HTML is meant to
be visible and is not an administrative secret.

## Supabase migration

The additive migration `supabase/family_profiles.sql` adds the tokenless RPCs
and inserts a missing fixed profile row only when that row does not already
exist. It does not delete or replace existing answers. The migration has not
been applied to the live project by this code change. Apply it once in the
Supabase SQL Editor only after reviewing it. Until then, this new page cannot
load/save because the two RPCs are not installed.

The prior `supabase/family_invites.sql`, invitation table, and token RPCs are
legacy. Do not run that old setup/rotation script for this flow. They are left
in place for now because the live site and `main` are intentionally untouched.
Removing legacy database objects requires a separate, planned cleanup after
the tokenless page is adopted.

## Drafts, synchronization, and limitations

Interest selections autosave after a short delay. Votes and comments remain
local drafts until the matching save button is pressed. Per-profile local
storage protects drafts during short network failures and participant changes;
successful writes synchronize through Supabase. The open profile checks for
remote edits every 30 seconds and when the page becomes visible again. Revisions
detect stale writes. Non-overlapping edits are merged automatically; edits to the same answer stop
for an explicit confirmation before this device overwrites the competing
value. This is conflict handling, not identity security or a guaranteed backup.

No route or itinerary is changed by survey results. Answers can later be
compared by profile when the family chooses to analyze them.

## Shared access screen — 2026-11-18

The family survey now has a shared four-digit entry code, checked only in the browser. A successful entry is remembered for the current tab through sessionStorage. This is a convenience gate, NOT server-side authentication: the JavaScript and public Supabase RPCs remain accessible. Do not store confidential data. Four participant profiles and the existing synchronization workflow remain unchanged. The change is committed only to the audit branch, not production. Before rollout, verify RPC availability, persistence after reload, and reading on another device. Family acceptance requires a working link and successful repeat access. If short iterations fail, reconsider integration into the main website.

## Gate initialization fix — 2026-11-18

The survey no longer initializes profile state or calls Supabase before the shared code gate is passed. On successful entry, it initializes once and then loads the last selected profile if any. This is a UX improvement, not an access-control boundary. Commit: `773393241fde433424f42d9d7499726bf5581e0f`. Live RPC read/write and cross-device persistence remain unverified; do not claim a working deployment.

## Publication audit — 2026-11-18

The public GitHub Pages URL currently shows the legacy personal-invitation page from `main`. The audit branch contains the new four-profile shared-code survey. An attempted update of only `main/family.html` was blocked by the tool security system and **did not publish**. The local execution environment could not resolve the Supabase host; this is inconclusive about production service health. No successful end-to-end read/write test has been completed. Do not tell family members that the new version is live. Next action: arrange a permitted publication route for this one file and test on a real browser before accepting the rollout.

## Publication verified — 2026-11-18

The user committed only `family.html` to `main` at `3aef7be750d5ccb9bb88a0d319b79065e6942ec8`. The new main file matches the audit branch content (blob SHA `c0cc122a693e65fb5aaf1266fa5608ba591aec4f`). GitHub Pages build/deployment run `44323271441` completed successfully at **2026-11-18 14:21:50 UTC**. A screenshot of the old invitation screen was captured before that completion; it does not establish a deployment failure. The shared-code UI is now in the published build according to GitHub Actions. Live browser rendering and Supabase persistence still need independent verification. Do not send the user through more manual GitHub steps. The user explicitly expects the assistant to handle technical work and ask only for irreducible acceptance checks.

## Family survey: visual decision context requested 2026-11-18

Acceptance feedback: the Gran Canaria radio choices are not understandable without pictures, plain-language summaries and links, especially for a 10-year-old. The whale-watching question has the same issue. Precede voting controls with the decision context; do NOT alter vote keys or existing answers.

**Gran Canaria, 2027-01-09:** both routes start at Vegueta (historic old town, Santa Ana cathedral). Recommend **Vegueta → Maspalomas Dunes** (golden dunes by the Atlantic, simpler road logistics); the family alternative is **Vegueta → Teror → Pico de las Nieves** (traditional wooden balconies and mountain viewpoint, longer winding drive and weather-dependent views). State what is gained/lost, link to Day 4 of the guide. Put the recommended dunes option first in both explanation and radio choices.

**Tenerife, 2027-01-13 to 15:** whale watching is a proposed **2–3-hour** boat excursion, not a booking. Explain pilot whales and dolphins in the wild; sightings are not guaranteed; typical southwest ports include Puerto Colón; prefer licensed Blue Boat operators. Protect existing Loro Parque/Siam Park priorities and the 2027-01-15 18:30 flight.

**Approved reference images (Wikimedia Commons; use file page + author/license attribution):**
- Vegueta: `Catedral Santa Ana.jpg` (Alejandroclemente, CC BY-SA 3.0).
- Teror: `Teror, Gran Canaria, house near the Basilica, with wooden balconies.jpg` (Gerda Arendt, CC BY-SA 4.0).
- Pico: `Gran Canaria, view from Pico de Las Nieves towards Roque Nublo and Teide on Tenerife.jpg` (Tamara k, CC BY-SA 4.0).
- Maspalomas: `Maspalomas Dunes at Gran Canaria.jpg` (Daria Schneider, CC BY-SA 4.0).
- Pilot whale: `Globicephala macrorhynchus Tenerife 2012.jpg` (Cayambe, CC BY-SA 3.0).

Useful official links:
- https://www.grancanaria.com/turismo/serviciosmultimedia/audioguias/las-palmas-de-gran-canaria/ruta-vegueta/
- https://www.grancanaria.com/turismo/en/nature/mirador-lookout-network/mirador-pozonieves/
- https://www.grancanaria.com/turismo/en/10-reasons-to-return-to-gran-canaria/dunes-by-the-lighthouse/
- https://www.webtenerife.com/que-hacer/naturaleza/avistamiento-cetaceos/
- https://www.hellocanaryislands.com/cruise-excursions/tenerife/whale-and-dolphin-watching-excursion/

**Implementation state:** drafted but NOT committed: GitHub content-update action was blocked while replacing `family.html`. The published survey remains unchanged. Do not claim the explanations are live or ask the user to manually edit GitHub; resume via a permitted publication capability. Keep images lazy-loaded and mobile-responsive.

## Published visual companion page — 2026-11-18

A standalone accessible guide was published to `main/family-choices-guide.html` without replacing the survey. It explains the 2027-01-09 Gran Canaria alternatives (Vegueta in both cases, recommended Maspalomas dunes vs. Teror / Pico de las Nieves), using Wikimedia Commons images and official tourism links. It also explains 2–3-hour Tenerife whale watching, its tentative status, and shows a documented pilot-whale photo (Cayambe, CC BY-SA 3.0). Commits `d161020aebe51ea565a84916dcb896d7f6185f78` and `306981a7d858a71c49f5134ec2d0cc9319b3778e`. Direct URL: https://tauveria-stack.github.io/aida-canary-cruise-2027/family-choices-guide.html

**Gap:** no inline card/link was added to `family.html`; attempts to update the existing survey HTML were rejected by the GitHub write gateway. The guide does contain links back to `family.html`. A successful Pages action is necessary before claiming the update is live. Next priority is seamless inline integration, not asking the user to copy/paste the survey source.

## Main-site integration — 2026-11-20

**User-approved behavior:** Send family members only the main guide URL (index.html). Every visit can suggest the questionnaire when it is not completed, with a prominent **Complete / Continue** action and **Do not suggest** option; the top header always contains a discreet survey link. If complete, the page replaces the invitation with a discreet **View/change answers** link. No blocking modal. Keep the questionnaire in family.html; it is reached internally and returns to index.html.

**Published code:**
- `main/family-entry.js` (`bb388c08`): reads *same-origin localStorage* survey state `aida-family-survey-v2`, last selected profile and its answers. A profile is **complete** only when all 18 interest categories have values 0/1/2 and both `gran` and `whale` votes have valid choices. Partial profile → continue. Unknown profile/new browser → invitation. Only one last-selected participant is evaluated on shared devices. Do not claim server-side cross-device identity detection.
- `main/index.html` (`7e596a56`): includes `family-entry.js` and displays a persistent, discreet header link. Dismissal `aida-family-invite-declined-v1` is local to the browser / selected profile, and **does not** disable the persistent entry link.
- `main/family-context.js` (`3d68951f`): loads explanations/images from the existing `family-choices-guide.html` on the same origin and inserts them **inside family.html**, directly before Gran Canaria and Tenerife whale votes; it also moves recommended dunes ahead of mountains in the existing dynamically rendered options. Fallback link when content does not load.
- `main/family.html` (`2d6fd704`): includes `family-context.js`; preserved the existing shared-code gate and Supabase read/write logic. No database migration or data rewrite from these changes. The older standalone explanation page remains only as a content source/fallback, **not** a second URL to share with the family.

**Acceptance checks:** existing JavaScript in index.html and family.html and the two new JavaScript assets passed syntax parsing in the connector environment; GitHub Pages build still requires a completed Success run. Visual rendering in an actual phone browser and end-to-end Supabase read/write **have not been independently verified**. Do not claim full acceptance until confirmed.

**Privacy and limitations:** Completion and dismissal use localStorage on the current browser, not authenticated identity or a server completion flag. When someone uses a new device, the main site can offer the survey again even if their answers exist in Supabase; the user can select their name in family.html and retrieve those responses. This is expected under the shared code model, not a sync bug. Never infer another household member's completion merely because one person completed theirs.
