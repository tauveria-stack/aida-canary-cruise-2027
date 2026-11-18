# Archived Railway prototype

This folder is an earlier, unused server prototype. It is not connected to the
current `family.html` survey and should not be deployed or configured for the
family survey.

The current survey is a static page using the public Supabase RPCs documented in
[`SURVEY-NOTES.md`](../SURVEY-NOTES.md) and added by
[`supabase/family_profiles.sql`](../supabase/family_profiles.sql). There is no
participant authentication. Any visitor who can reach the page can potentially
read and change any profile; the participant picker only separates answers.

Do not run `supabase/family_invites.sql` for the new flow. It and its token
functions are legacy database objects retained until a separately planned
cleanup. The current production page and `main` branch have not been switched.
