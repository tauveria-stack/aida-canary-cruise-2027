-- Run once in Supabase SQL Editor. Keep invitation secrets OUT of GitHub.
create extension if not exists pgcrypto with schema extensions;
create table if not exists public.family_invites (
 person_id text primary key references public.family_answers(person_id),
 token_hash text not null unique,
 created_at timestamptz not null default now(),
 revoked_at timestamptz
);
-- PostgreSQL cannot reference an absent answer row: create the four empty profiles first.
insert into public.family_answers(person_id) values
 ('volodymyr'),('yevheniia'),('valerii'),('tymofii')
on conflict (person_id) do nothing;

alter table public.family_invites enable row level security;
revoke all on public.family_invites from public, anon, authenticated;
revoke all on public.family_answers from anon;
-- Remove earlier family-account policies: browser clients must only use token RPCs.
drop policy if exists "Family account can read answers" on public.family_answers;
drop policy if exists "Family account can create answers" on public.family_answers;
drop policy if exists "Family account can update answers" on public.family_answers;
revoke all on public.family_answers from authenticated;

-- Each invite is a 32-byte random secret, stored ONLY as a SHA-256 hash.
-- These tokens are returned ONLY to the SQL Editor operator on initial creation.
create or replace function public.create_family_invites()
returns table(person_id text, invitation_token text)
language plpgsql security definer set search_path = ''
as $$
declare p text; secret text;
begin
 if current_user not in ('postgres','supabase_admin') then
   raise exception 'Admin only';
 end if;
 foreach p in array array['volodymyr','yevheniia','valerii','tymofii'] loop
  if not exists(select 1 from public.family_invites i where i.person_id=p) then
   secret:=encode(extensions.gen_random_bytes(32),'hex');
   insert into public.family_invites(person_id,token_hash)
   values(p,encode(extensions.digest(secret,'sha256'),'hex'));
   person_id:=p; invitation_token:=secret; return next;
  end if;
 end loop;
end $$;
revoke all on function public.create_family_invites() from public, anon, authenticated;

create or replace function public.family_read(p_token text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare p text; a record;
begin
 if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
   raise exception 'Invalid invitation';
 end if;
 select i.person_id into p from public.family_invites i
 where i.token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
 and i.revoked_at is null;
 if p is null then raise exception 'Invalid invitation'; end if;
 select * into a from public.family_answers where person_id=p;
 return jsonb_build_object('person',p,'interests',coalesce(a.interests,'{}'::jsonb),
 'votes',coalesce(a.votes,'{}'::jsonb),'revision',coalesce(a.revision,1));
end $$;

create or replace function public.family_write(p_token text,p_interests jsonb,p_votes jsonb,p_revision integer)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare p text; n integer;
begin
 if p_token is null or p_token !~ '^[0-9a-f]{64}$' then raise exception 'Invalid invitation'; end if;
 select i.person_id into p from public.family_invites i
 where i.token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and i.revoked_at is null;
 if p is null then raise exception 'Invalid invitation'; end if;
 if jsonb_typeof(p_interests) <> 'object' or jsonb_typeof(p_votes) <> 'object'
 or pg_catalog.length(p_interests::text)>5000 or pg_catalog.length(p_votes::text)>9000
 or p_revision is null or p_revision < 1 then raise exception 'Invalid answers'; end if;
 if exists(select 1 from jsonb_each(p_interests) x
  where x.key not in ('nature','panorama','mountains','rural','seascape','beach','animals','whales','waterparks','rides','cable','museums','towns','food','quiet','active','walking','boat')
  or x.value not in ('0'::jsonb,'1'::jsonb,'2'::jsonb)) then raise exception 'Invalid interests'; end if;
 if exists(select 1 from jsonb_each(p_votes) x
  where x.key not in ('gran','whale')
  or jsonb_typeof(x.value)<>'object'
  or pg_catalog.length(coalesce(x.value->>'comment',''))>1500
  or (x.key='gran' and x.value->>'choice' not in ('mountains','dunes','unsure'))
  or (x.key='whale' and x.value->>'choice' not in ('yes','maybe','no'))
 ) then raise exception 'Invalid votes'; end if;
 update public.family_answers set interests=p_interests,votes=p_votes,
 revision=revision+1,updated_at=now()
 where person_id=p and revision=p_revision returning revision into n;
 if n is null then raise exception 'Conflict: reload your answers'; end if;
 return jsonb_build_object('saved',true,'revision',n);
end $$;
revoke all on function public.family_read(text) from public;
revoke all on function public.family_write(text,jsonb,jsonb,integer) from public;
grant execute on function public.family_read(text) to anon;
grant execute on function public.family_write(text,jsonb,jsonb,integer) to anon;

-- IMPORTANT: after running the whole setup, run this separately in SQL Editor
-- SELECT * FROM public.create_family_invites();
-- Copy each resulting token into a personal link with #invite=<token>.
-- Tokens are NOT recoverable after creation; to replace a lost token, revoke
-- the old row and run create_family_invites() again.
