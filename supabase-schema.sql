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
  account_type text not null default 'Student' check (account_type in ('Student', 'Couples', 'VIP')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  room_type text not null default 'Couples' check (room_type in ('Couples', 'VIP')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists account_type text;
update public.profiles
set account_type = case
  when account_type in ('Student', 'Couples', 'VIP') then account_type
  when display_name = 'Magic' then 'VIP'
  when display_name = 'Partner' then 'Couples'
  when display_name = 'Guest' then 'Student'
  else 'Student'
end;
alter table public.profiles alter column account_type set default 'Student';
alter table public.profiles alter column account_type set not null;
alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles
  add constraint profiles_account_type_check check (account_type in ('Student', 'Couples', 'VIP'));

alter table public.rooms add column if not exists room_type text;
update public.rooms
set room_type = case
  when room_type in ('Couples', 'VIP') then room_type
  when name ilike '%vip%' then 'VIP'
  else 'Couples'
end;
update public.rooms
set name = 'Couples Private Study Room'
where name = 'Magic & Partner''s Class Room';
alter table public.rooms alter column room_type set default 'Couples';
alter table public.rooms alter column room_type set not null;
alter table public.rooms drop constraint if exists rooms_room_type_check;
alter table public.rooms
  add constraint rooms_room_type_check check (room_type in ('Couples', 'VIP'));

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
begin
  insert into public.profiles (id, email, display_name, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Student'),
    case
      when new.raw_user_meta_data->>'account_type' in ('Student', 'Couples', 'VIP')
        then new.raw_user_meta_data->>'account_type'
      else 'Student'
    end
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.profiles.display_name, excluded.display_name),
      account_type = case
        when public.profiles.account_type in ('Student', 'Couples', 'VIP')
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
    where room_id = target_room_id
      and user_id = auth.uid()
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
    where room_id = target_room_id
      and user_id = auth.uid()
      and role = 'owner'
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
      and owner_id = auth.uid()
  );
$$;

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
using (owner_id = auth.uid() or public.is_room_member(id));

drop policy if exists "Authenticated users can create owned rooms" on public.rooms;
create policy "Authenticated users can create owned rooms"
on public.rooms for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and account_type = room_type
      and account_type in ('Couples', 'VIP')
  )
);

drop policy if exists "Owners can update rooms" on public.rooms;
create policy "Owners can update rooms"
on public.rooms for update
using (owner_id = auth.uid() or public.is_room_owner(id))
with check (owner_id = auth.uid() or public.is_room_owner(id));

drop policy if exists "Room members can read memberships" on public.room_members;
create policy "Room members can read memberships"
on public.room_members for select
using (user_id = auth.uid() or public.is_room_member(room_id));

drop policy if exists "Users can add themselves to rooms" on public.room_members;
drop policy if exists "Owners can add room memberships" on public.room_members;
create policy "Owners can add room memberships"
on public.room_members for insert
with check (
  (user_id = auth.uid() and public.is_room_record_owner(room_id))
  or public.is_room_owner(room_id)
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
