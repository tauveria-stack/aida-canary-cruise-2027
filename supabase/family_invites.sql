-- Run once in Supabase SQL Editor. Keep invitation secrets OUT of GitHub.
create schema if not exists extensions;
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
revoke all on public.family_answers from public, anon, authenticated;
-- Remove earlier family-account policies: browser clients must only use token RPCs.
drop policy if exists "Family account can read answers" on public.family_answers;
drop policy if exists "Family account can create answers" on public.family_answers;
drop policy if exists "Family account can update answers" on public.family_answers;

-- Each invite is a 32-byte random secret, stored ONLY as a SHA-256 hash.
-- Plaintext tokens are returned ONLY to the SQL Editor operator when created or rotated.
-- Execute this setup and token creation using a trusted SQL Editor admin role.
-- Function execution is explicitly revoked from public/anon/authenticated.
create or replace function public.create_family_invites()
returns table(person_id text, invitation_token text)
language plpgsql security definer set search_path = ''
as $$
declare p text; secret text;
begin
 foreach p in array array['volodymyr','yevheniia','valerii','tymofii'] loop
  if not exists(select 1 from public.family_invites i where i.person_id=p) then
   secret:=encode(extensions.gen_random_bytes(32),'hex');
   insert into public.family_invites(person_id,token_hash)
   values(p,encode(extensions.digest(secret,'sha256'),'hex'));
   person_id:=p; invitation_token:=secret; return next;
  else
   -- Rotate only a revoked row; active tokens are never returned again.
   secret:=encode(extensions.gen_random_bytes(32),'hex');
   update public.family_invites as i
   set token_hash=encode(extensions.digest(secret,'sha256'),'hex'),
       created_at=now(), revoked_at=null
   where i.person_id=p and i.revoked_at is not null;
   if found then
    person_id:=p; invitation_token:=secret; return next;
   end if;
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
 if p_interests is null or p_votes is null
 or jsonb_typeof(p_interests) is distinct from 'object'
 or jsonb_typeof(p_votes) is distinct from 'object'
 or pg_catalog.length(p_interests::text)>5000 or pg_catalog.length(p_votes::text)>9000
 or p_revision is null or p_revision < 1 then raise exception 'Invalid answers'; end if;
 if exists(select 1 from jsonb_each(p_interests) x
  where x.key not in ('nature','panorama','mountains','rural','seascape','beach','animals','whales','waterparks','rides','cable','museums','towns','food','quiet','active','walking','boat')
  or x.value not in ('0'::jsonb,'1'::jsonb,'2'::jsonb)) then raise exception 'Invalid interests'; end if;
 if exists(select 1 from jsonb_each(p_votes) x
  where x.key not in ('gran','whale')
  or jsonb_typeof(x.value) is distinct from 'object'
  or jsonb_typeof(x.value->'choice') is distinct from 'string'
  or jsonb_typeof(x.value->'comment') is distinct from 'string'
  or pg_catalog.length(x.value->>'comment')>1500
  or (x.value - 'choice' - 'comment' - 'updatedAt') <> '{}'::jsonb
  or (x.value ? 'updatedAt' and jsonb_typeof(x.value->'updatedAt') is distinct from 'string')
  or (x.key='gran' and x.value->>'choice' not in ('mountains','dunes','unsure'))
  or (x.key='whale' and x.value->>'choice' not in ('yes','maybe','no'))
 ) then raise exception 'Invalid votes'; end if;
 update public.family_answers set interests=p_interests,votes=p_votes,
 revision=p_revision+1,updated_at=now()
 where person_id=p and coalesce(revision,1)=p_revision returning revision into n;
 if n is null then raise exception 'Conflict: reload your answers'; end if;
 return jsonb_build_object('saved',true,'revision',n);
end $$;
revoke all on function public.family_read(text) from public, anon, authenticated;
revoke all on function public.family_write(text,jsonb,jsonb,integer) from public, anon, authenticated;
grant execute on function public.family_read(text) to anon;
grant execute on function public.family_write(text,jsonb,jsonb,integer) to anon;

-- IMPORTANT: after running the whole setup, run this separately in SQL Editor
-- SELECT * FROM public.create_family_invites();
-- Copy each resulting token into a personal link with #invite=<token>.
-- Active tokens are NOT recoverable after creation. To replace a lost token,
-- revoke that invite first, then run create_family_invites(); revoked rows are rotated.
