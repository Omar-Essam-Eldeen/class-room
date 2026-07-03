-- Class Room Supabase schema and Row Level Security policies
-- Run this in the Supabase SQL editor before using the app with real data.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'Student',
  account_type text not null default 'student' check (account_type in ('student', 'couples', 'vip')),
  stars integer not null default 10 check (stars >= 0),
  activity_score integer not null default 10 check (activity_score >= 0),
  public_badge_count integer not null default 1 check (public_badge_count >= 0),
  trial_account_type text check (trial_account_type in ('couples', 'vip')),
  trial_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room_type text not null default 'student' check (room_type in ('student', 'couples', 'vip')),
  design_style text not null default 'Cozy Library',
  max_members integer not null default 15 check (max_members > 0),
  created_by uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles add column if not exists account_type text;
alter table public.profiles add column if not exists stars integer;
alter table public.profiles add column if not exists activity_score integer;
alter table public.profiles add column if not exists public_badge_count integer;
alter table public.profiles add column if not exists trial_account_type text;
alter table public.profiles add column if not exists trial_expires_at timestamptz;
update public.profiles
set account_type = case
  when lower(account_type) in ('student', 'couples', 'vip') then lower(account_type)
  when display_name = 'Magic' then 'vip'
  when display_name = 'Partner' then 'couples'
  when display_name = 'Guest' then 'student'
  else 'student'
end;
alter table public.profiles alter column account_type set default 'student';
alter table public.profiles alter column account_type set not null;
update public.profiles
set stars = coalesce(stars, 10),
    activity_score = coalesce(activity_score, 10),
    public_badge_count = coalesce(public_badge_count, 1);
alter table public.profiles alter column stars set default 10;
alter table public.profiles alter column stars set not null;
alter table public.profiles alter column activity_score set default 10;
alter table public.profiles alter column activity_score set not null;
alter table public.profiles alter column public_badge_count set default 1;
alter table public.profiles alter column public_badge_count set not null;
alter table public.profiles
  add constraint profiles_account_type_check check (account_type in ('student', 'couples', 'vip'));
alter table public.profiles drop constraint if exists profiles_trial_account_type_check;
alter table public.profiles
  add constraint profiles_trial_account_type_check check (trial_account_type in ('couples', 'vip'));
alter table public.profiles drop constraint if exists profiles_stars_check;
alter table public.profiles add constraint profiles_stars_check check (stars >= 0);
alter table public.profiles drop constraint if exists profiles_activity_score_check;
alter table public.profiles add constraint profiles_activity_score_check check (activity_score >= 0);
alter table public.profiles drop constraint if exists profiles_public_badge_count_check;
alter table public.profiles add constraint profiles_public_badge_count_check check (public_badge_count >= 0);

alter table public.rooms drop constraint if exists rooms_room_type_check;
alter table public.rooms add column if not exists room_type text;
alter table public.rooms add column if not exists design_style text;
alter table public.rooms add column if not exists max_members integer;
alter table public.rooms add column if not exists created_by uuid references public.profiles(id) on delete cascade;
alter table public.rooms add column if not exists owner_id uuid references public.profiles(id) on delete cascade;
alter table public.rooms add column if not exists deleted_at timestamptz;
update public.rooms
set room_type = case
  when lower(room_type) in ('student', 'couples', 'vip') then lower(room_type)
  when name ilike '%vip%' then 'vip'
  when name ilike '%student%' then 'student'
  else 'couples'
end;
update public.rooms
set design_style = coalesce(
  design_style,
  case
    when room_type = 'vip' then 'VIP Glass Suite'
    when room_type = 'couples' then 'Soft Couple Room'
    else 'Cozy Library'
  end
);
update public.rooms
set max_members = coalesce(
  max_members,
  case
    when room_type = 'vip' then 5
    when room_type = 'couples' then 2
    else 15
  end
);
update public.rooms
set created_by = coalesce(created_by, owner_id);
update public.rooms
set name = 'Couples Private Study Room'
where name = 'Magic & Partner''s Class Room';
alter table public.rooms alter column room_type set default 'student';
alter table public.rooms alter column room_type set not null;
alter table public.rooms alter column design_style set default 'Cozy Library';
alter table public.rooms alter column design_style set not null;
alter table public.rooms alter column max_members set default 15;
alter table public.rooms alter column max_members set not null;
alter table public.rooms alter column created_by set not null;
alter table public.rooms
  add constraint rooms_room_type_check check (room_type in ('student', 'couples', 'vip'));
alter table public.rooms drop constraint if exists rooms_max_members_check;
alter table public.rooms
  add constraint rooms_max_members_check check (
    (room_type = 'student' and max_members = 15)
    or (room_type = 'couples' and max_members = 2)
    or (room_type = 'vip' and max_members = 5)
  );

create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  owner_label text not null default 'Both',
  title text not null,
  subject text not null,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  due_date date not null,
  status text not null default 'Todo' check (status in ('Todo', 'Doing', 'Done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_label text not null,
  checkin_date date not null,
  studied boolean not null default true,
  hours numeric(5, 2) not null default 0 check (hours >= 0),
  mood text not null default 'Focused',
  topic text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, user_id, checkin_date)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_label text not null,
  subject text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  focus_rating integer not null check (focus_rating between 1 and 10),
  went_well text not null,
  difficult text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  owner_label text not null,
  title text not null,
  content text not null,
  visibility text not null default 'Shared' check (visibility in ('Shared', 'Private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encouragements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  from_label text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  actor_label text not null,
  message text not null,
  type text not null default 'update',
  created_at timestamptz not null default now()
);

update public.tasks
set owner_label = case owner_label
  when 'Magic' then 'VIP'
  when 'Partner' then 'Couples'
  when 'Guest' then 'Student'
  else owner_label
end;

update public.checkins
set member_label = case member_label
  when 'Magic' then 'VIP'
  when 'Partner' then 'Couples'
  when 'Guest' then 'Student'
  else member_label
end;

update public.study_sessions
set member_label = case member_label
  when 'Magic' then 'VIP'
  when 'Partner' then 'Couples'
  when 'Guest' then 'Student'
  else member_label
end;

update public.notes
set owner_label = case owner_label
  when 'Magic' then 'VIP'
  when 'Partner' then 'Couples'
  when 'Guest' then 'Student'
  else owner_label
end;

update public.encouragements
set from_label = case from_label
  when 'Magic' then 'VIP'
  when 'Partner' then 'Couples'
  when 'Guest' then 'Student'
  else from_label
end;

update public.activity
set actor_label = case actor_label
  when 'Magic' then 'VIP'
  when 'Partner' then 'Couples'
  when 'Guest' then 'Student'
  else actor_label
end;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_checkins_updated_at on public.checkins;
create trigger set_checkins_updated_at
before update on public.checkins
for each row execute function public.set_updated_at();

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_account_type text;
begin
  next_account_type := lower(coalesce(new.raw_user_meta_data->>'account_type', 'student'));
  if next_account_type not in ('student', 'couples', 'vip') then
    next_account_type := 'student';
  end if;

  insert into public.profiles (id, email, display_name, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Student'),
    next_account_type
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.profiles.display_name, excluded.display_name),
      account_type = case
        when public.profiles.account_type in ('student', 'couples', 'vip')
          then public.profiles.account_type
        else excluded.account_type
      end,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.room_type_max_members(target_room_type text)
returns integer
language sql
immutable
as $$
  select case target_room_type
    when 'vip' then 5
    when 'couples' then 2
    else 15
  end;
$$;

create or replace function public.account_room_limit(target_account_type text)
returns integer
language sql
immutable
as $$
  select case target_account_type
    when 'vip' then 5
    when 'couples' then 3
    else 1
  end;
$$;

create or replace function public.account_type_priority(target_account_type text)
returns integer
language sql
immutable
as $$
  select case target_account_type
    when 'vip' then 3
    when 'couples' then 2
    else 1
  end;
$$;

create or replace function public.effective_account_type(
  real_account_type text,
  trial_account_type text,
  trial_expires_at timestamptz
)
returns text
language sql
stable
as $$
  select case
    when trial_account_type in ('couples', 'vip')
      and trial_expires_at > now()
      and public.account_type_priority(trial_account_type) > public.account_type_priority(real_account_type)
      then trial_account_type
    else real_account_type
  end;
$$;

create or replace function public.award_profile_points(point_delta integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set stars = greatest(0, stars + greatest(point_delta, 0)),
      activity_score = greatest(0, activity_score + greatest(point_delta, 0)),
      public_badge_count = greatest(public_badge_count, case
        when stars + greatest(point_delta, 0) >= 365 then 5
        when stars + greatest(point_delta, 0) >= 90 then 4
        when stars + greatest(point_delta, 0) >= 30 then 3
        when stars + greatest(point_delta, 0) >= 7 then 2
        else 1
      end),
      trial_account_type = case
        when stars + greatest(point_delta, 0) >= 365 then 'vip'
        when stars + greatest(point_delta, 0) >= 90 then 'couples'
        else trial_account_type
      end,
      trial_expires_at = case
        when stars + greatest(point_delta, 0) >= 365 then now() + interval '1 month'
        when stars + greatest(point_delta, 0) >= 90 then now() + interval '14 days'
        else trial_expires_at
      end,
      updated_at = now()
  where id = auth.uid();
$$;

create or replace function public.is_room_member(target_room_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.room_members
    join public.rooms on rooms.id = room_members.room_id
    join public.profiles on profiles.id = room_members.user_id
    where room_members.room_id = target_room_id
      and room_members.user_id = auth.uid()
      and rooms.deleted_at is null
      and (
        rooms.room_type = 'student'
        or (
          rooms.room_type = 'couples'
          and public.effective_account_type(
            profiles.account_type,
            profiles.trial_account_type,
            profiles.trial_expires_at
          ) in ('couples', 'vip')
        )
        or (
          rooms.room_type = 'vip'
          and public.effective_account_type(
            profiles.account_type,
            profiles.trial_account_type,
            profiles.trial_expires_at
          ) = 'vip'
        )
      )
  );
$$;

create or replace function public.is_room_owner(target_room_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.room_members
    join public.rooms on rooms.id = room_members.room_id
    join public.profiles on profiles.id = room_members.user_id
    where room_members.room_id = target_room_id
      and room_members.user_id = auth.uid()
      and room_members.role = 'owner'
      and rooms.deleted_at is null
      and (
        rooms.room_type = 'student'
        or (
          rooms.room_type = 'couples'
          and public.effective_account_type(
            profiles.account_type,
            profiles.trial_account_type,
            profiles.trial_expires_at
          ) in ('couples', 'vip')
        )
        or (
          rooms.room_type = 'vip'
          and public.effective_account_type(
            profiles.account_type,
            profiles.trial_account_type,
            profiles.trial_expires_at
          ) = 'vip'
        )
      )
  );
$$;

create or replace function public.is_room_record_owner(target_room_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.rooms
    where id = target_room_id
      and created_by = auth.uid()
      and deleted_at is null
  );
$$;

create or replace function public.can_create_room_type(target_room_type text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from (
      select public.effective_account_type(account_type, trial_account_type, trial_expires_at) as effective_type
      from public.profiles
      where id = auth.uid()
    ) profile_access
    where (
        (effective_type = 'student' and target_room_type = 'student')
        or (effective_type = 'couples' and target_room_type in ('student', 'couples'))
        or (effective_type = 'vip' and target_room_type in ('student', 'vip'))
      )
      and (
        select count(*)::integer
        from public.room_members
        join public.rooms on rooms.id = room_members.room_id
        where room_members.user_id = auth.uid()
          and rooms.deleted_at is null
      ) < public.account_room_limit(effective_type)
  );
$$;

create or replace function public.can_join_room(target_room_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  with room_data as (
    select id, room_type, max_members
    from public.rooms
    where id = target_room_id
      and deleted_at is null
  ),
  member_count as (
    select count(*)::integer as current_members
    from public.room_members
    where room_id = target_room_id
  ),
  user_room_count as (
    select count(*)::integer as total_rooms
    from public.room_members
    join public.rooms on rooms.id = room_members.room_id
    where room_members.user_id = auth.uid()
      and rooms.deleted_at is null
  ),
  profile_data as (
    select public.effective_account_type(account_type, trial_account_type, trial_expires_at) as account_type
    from public.profiles
    where id = auth.uid()
  )
  select exists (
    select 1
    from room_data, member_count, profile_data, user_room_count
    where current_members < max_members
      and total_rooms < public.account_room_limit(account_type)
      and (
        (room_type = 'student' and account_type in ('student', 'couples', 'vip'))
        or (room_type = 'couples' and account_type = 'couples')
        or (room_type = 'vip' and account_type = 'vip')
      )
  );
$$;

drop function if exists public.get_room_directory();
create or replace function public.get_room_directory()
returns table (
  id uuid,
  name text,
  room_type text,
  design_style text,
  max_members integer,
  current_members integer,
  member_summaries jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    rooms.id,
    rooms.name,
    rooms.room_type,
    rooms.design_style,
    rooms.max_members,
    count(room_members.id)::integer as current_members,
    coalesce(
      jsonb_agg(
        distinct jsonb_build_object(
          'display_name', profiles.display_name,
          'account_type', profiles.account_type,
          'room_count', (
            select count(*)::integer
            from public.room_members profile_rooms
            join public.rooms profile_room_rows on profile_room_rows.id = profile_rooms.room_id
            where profile_rooms.user_id = profiles.id
              and profile_room_rows.deleted_at is null
          ),
          'activity_score', profiles.activity_score,
          'public_badge_count', profiles.public_badge_count
        )
      ) filter (where profiles.id is not null),
      '[]'::jsonb
    ) as member_summaries,
    rooms.created_at
  from public.rooms
  left join public.room_members on room_members.room_id = rooms.id
  left join public.profiles on profiles.id = room_members.user_id
  where rooms.deleted_at is null
  group by rooms.id, rooms.name, rooms.room_type, rooms.design_style, rooms.max_members, rooms.created_at
  order by rooms.created_at desc;
$$;

grant execute on function public.get_room_directory() to anon, authenticated;
grant execute on function public.award_profile_points(integer) to authenticated;

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.tasks enable row level security;
alter table public.checkins enable row level security;
alter table public.study_sessions enable row level security;
alter table public.notes enable row level security;
alter table public.encouragements enable row level security;
alter table public.activity enable row level security;

drop policy if exists "Profiles are visible to the owner" on public.profiles;
create policy "Profiles are visible to the owner"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Room members can read rooms" on public.rooms;
create policy "Room members can read rooms"
on public.rooms for select
using (deleted_at is null and (created_by = auth.uid() or owner_id = auth.uid() or public.is_room_member(id)));

drop policy if exists "Authenticated users can create owned rooms" on public.rooms;
create policy "Authenticated users can create owned rooms"
on public.rooms for insert
with check (
  created_by = auth.uid()
  and owner_id = auth.uid()
  and public.can_create_room_type(room_type)
  and max_members = public.room_type_max_members(room_type)
);

drop policy if exists "Owners can update rooms" on public.rooms;
create policy "Owners can update rooms"
on public.rooms for update
using (created_by = auth.uid() or owner_id = auth.uid() or public.is_room_owner(id))
with check (created_by = auth.uid() or owner_id = auth.uid() or public.is_room_owner(id));

drop policy if exists "Room members can read memberships" on public.room_members;
create policy "Room members can read memberships"
on public.room_members for select
using (
  (user_id = auth.uid() or public.is_room_member(room_id))
  and exists (
    select 1
    from public.rooms
    where rooms.id = room_id
      and rooms.deleted_at is null
  )
);

drop policy if exists "Users can add themselves to rooms" on public.room_members;
drop policy if exists "Owners can add room memberships" on public.room_members;
drop policy if exists "Owners and allowed users can add room memberships" on public.room_members;
create policy "Owners and allowed users can add room memberships"
on public.room_members for insert
with check (
  user_id = auth.uid()
  and (
    public.is_room_record_owner(room_id)
    or public.is_room_owner(room_id)
    or public.can_join_room(room_id)
  )
);

drop policy if exists "Owners can manage memberships" on public.room_members;
create policy "Owners can manage memberships"
on public.room_members for update
using (public.is_room_owner(room_id))
with check (public.is_room_owner(room_id));

drop policy if exists "Owners can remove memberships" on public.room_members;
create policy "Owners can remove memberships"
on public.room_members for delete
using (public.is_room_owner(room_id) or user_id = auth.uid());

drop policy if exists "Room members can read tasks" on public.tasks;
create policy "Room members can read tasks"
on public.tasks for select
using (public.is_room_member(room_id));

drop policy if exists "Room members can create tasks" on public.tasks;
create policy "Room members can create tasks"
on public.tasks for insert
with check (public.is_room_member(room_id));

drop policy if exists "Room members can update tasks" on public.tasks;
create policy "Room members can update tasks"
on public.tasks for update
using (public.is_room_member(room_id))
with check (public.is_room_member(room_id));

drop policy if exists "Room members can delete tasks" on public.tasks;
create policy "Room members can delete tasks"
on public.tasks for delete
using (public.is_room_member(room_id));

drop policy if exists "Room members can read checkins" on public.checkins;
create policy "Room members can read checkins"
on public.checkins for select
using (public.is_room_member(room_id));

drop policy if exists "Users can create own checkins" on public.checkins;
create policy "Users can create own checkins"
on public.checkins for insert
with check (public.is_room_member(room_id) and user_id = auth.uid());

drop policy if exists "Users can update own checkins" on public.checkins;
create policy "Users can update own checkins"
on public.checkins for update
using (public.is_room_member(room_id) and user_id = auth.uid())
with check (public.is_room_member(room_id) and user_id = auth.uid());

drop policy if exists "Room members can read sessions" on public.study_sessions;
create policy "Room members can read sessions"
on public.study_sessions for select
using (public.is_room_member(room_id));

drop policy if exists "Users can create own sessions" on public.study_sessions;
create policy "Users can create own sessions"
on public.study_sessions for insert
with check (public.is_room_member(room_id) and user_id = auth.uid());

drop policy if exists "Room members can read visible notes" on public.notes;
create policy "Room members can read visible notes"
on public.notes for select
using (
  public.is_room_member(room_id)
  and (visibility = 'Shared' or user_id = auth.uid())
);

drop policy if exists "Users can create own notes" on public.notes;
create policy "Users can create own notes"
on public.notes for insert
with check (public.is_room_member(room_id) and user_id = auth.uid());

drop policy if exists "Users can update own notes" on public.notes;
create policy "Users can update own notes"
on public.notes for update
using (public.is_room_member(room_id) and user_id = auth.uid())
with check (public.is_room_member(room_id) and user_id = auth.uid());

drop policy if exists "Users can delete own notes" on public.notes;
create policy "Users can delete own notes"
on public.notes for delete
using (public.is_room_member(room_id) and user_id = auth.uid());

drop policy if exists "Room members can read encouragements" on public.encouragements;
create policy "Room members can read encouragements"
on public.encouragements for select
using (public.is_room_member(room_id));

drop policy if exists "Room members can create encouragements" on public.encouragements;
create policy "Room members can create encouragements"
on public.encouragements for insert
with check (public.is_room_member(room_id) and user_id = auth.uid());

drop policy if exists "Room members can read activity" on public.activity;
create policy "Room members can read activity"
on public.activity for select
using (public.is_room_member(room_id));

drop policy if exists "Room members can create activity" on public.activity;
create policy "Room members can create activity"
on public.activity for insert
with check (public.is_room_member(room_id));
