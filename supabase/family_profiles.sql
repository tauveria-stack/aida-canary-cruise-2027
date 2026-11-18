-- AIDAcosma 2027 family survey: tokenless profile RPCs.
-- Apply once in Supabase SQL Editor after reviewing this file.
-- This is additive: it does not drop tables, policies, functions, or answers.
-- IMPORTANT: there is no authentication. Anyone who can call these public RPCs
-- can read and change any of the four profiles. Names are organizational only.

-- Ensure the four fixed profile rows exist without replacing existing answers.
insert into public.family_answers (person_id)
values ('volodymyr'), ('yevheniia'), ('valerii'), ('tymofii')
on conflict (person_id) do nothing;

create or replace function public.family_read_profile(p_person_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  answer_row record;
begin
  if p_person_id is null or p_person_id not in ('volodymyr', 'yevheniia', 'valerii', 'tymofii') then
    raise exception 'Invalid participant' using errcode = '22023';
  end if;

  select fa.interests, fa.votes, fa.revision
    into answer_row
    from public.family_answers as fa
   where fa.person_id = p_person_id;

  if not found then
    raise exception 'Profile is not initialized' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'person', p_person_id,
    'interests', coalesce(answer_row.interests, '{}'::jsonb),
    'votes', coalesce(answer_row.votes, '{}'::jsonb),
    'revision', coalesce(answer_row.revision, 1)
  );
end;
$function$;

create or replace function public.family_write_profile(
  p_person_id text,
  p_interests jsonb,
  p_votes jsonb,
  p_revision integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  new_revision integer;
begin
  if p_person_id is null or p_person_id not in ('volodymyr', 'yevheniia', 'valerii', 'tymofii') then
    raise exception 'Invalid participant' using errcode = '22023';
  end if;

  if p_interests is null
     or p_votes is null
     or pg_catalog.jsonb_typeof(p_interests) is distinct from 'object'
     or pg_catalog.jsonb_typeof(p_votes) is distinct from 'object'
     or pg_catalog.length(p_interests::text) > 5000
     or pg_catalog.length(p_votes::text) > 9000
     or p_revision is null
     or p_revision < 1 then
    raise exception 'Invalid answers' using errcode = '22023';
  end if;

  if exists (
    select 1
      from pg_catalog.jsonb_each(p_interests) as item(key, value)
     where item.key not in (
       'nature', 'panorama', 'mountains', 'rural', 'seascape', 'beach',
       'animals', 'whales', 'waterparks', 'rides', 'cable', 'museums',
       'towns', 'food', 'quiet', 'active', 'walking', 'boat'
     )
        or item.value not in ('0'::jsonb, '1'::jsonb, '2'::jsonb)
  ) then
    raise exception 'Invalid interests' using errcode = '22023';
  end if;

  if exists (
    select 1
      from pg_catalog.jsonb_each(p_votes) as item(key, value)
     where item.key not in ('gran', 'whale')
        or pg_catalog.jsonb_typeof(item.value) is distinct from 'object'
        or pg_catalog.jsonb_typeof(item.value -> 'choice') is distinct from 'string'
        or pg_catalog.jsonb_typeof(item.value -> 'comment') is distinct from 'string'
        or pg_catalog.length(item.value ->> 'comment') > 1500
        or (item.value - 'choice' - 'comment' - 'updatedAt') <> '{}'::jsonb
        or (item.value ? 'updatedAt' and pg_catalog.jsonb_typeof(item.value -> 'updatedAt') is distinct from 'string')
        or (item.value ? 'updatedAt' and pg_catalog.length(item.value ->> 'updatedAt') > 80)
        or (item.key = 'gran' and item.value ->> 'choice' not in ('mountains', 'dunes', 'unsure'))
        or (item.key = 'whale' and item.value ->> 'choice' not in ('yes', 'maybe', 'no'))
  ) then
    raise exception 'Invalid votes' using errcode = '22023';
  end if;

  -- Compare-and-swap revision makes simultaneous writes detectable. PostgreSQL
  -- rechecks the predicate after waiting on a concurrent row update.
  update public.family_answers as fa
     set interests = p_interests,
         votes = p_votes,
         revision = p_revision + 1,
         updated_at = pg_catalog.now()
   where fa.person_id = p_person_id
     and coalesce(fa.revision, 1) = p_revision
  returning fa.revision into new_revision;

  if new_revision is null then
    raise exception 'Conflict: reload your answers' using errcode = '40001';
  end if;

  return jsonb_build_object('saved', true, 'revision', new_revision);
end;
$function$;

-- Direct table access stays unavailable; only these narrow RPCs are exposed.
revoke all on function public.family_read_profile(text) from public, anon, authenticated;
revoke all on function public.family_write_profile(text, jsonb, jsonb, integer) from public, anon, authenticated;
grant execute on function public.family_read_profile(text) to anon;
grant execute on function public.family_write_profile(text, jsonb, jsonb, integer) to anon;
