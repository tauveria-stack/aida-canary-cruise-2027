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
