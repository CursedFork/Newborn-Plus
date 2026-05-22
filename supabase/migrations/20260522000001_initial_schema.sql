-- Newborn+ Initial Schema
-- Run order: extensions → enums → tables → indexes → RLS policies → triggers → views

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type feed_type as enum ('formula', 'breast_milk', 'colostrum');
create type pump_output_type as enum ('colostrum', 'transitional', 'mature_milk');
create type pump_side as enum ('left', 'right', 'both');
create type poop_color as enum ('black', 'dark_green', 'brown', 'yellow', 'mustard', 'other');
create type poop_consistency as enum ('tarry', 'seedy', 'grainy', 'runny', 'formed', 'other');
create type cream_type as enum ('none', 'vaseline', 'aquaphor', 'desitin', 'zinc_oxide_40');
create type rash_status as enum ('none', 'mild', 'moderate', 'severe', 'improving', 'resolved');
create type sleep_location as enum ('bassinet', 'crib', 'parent_arms', 'pack_and_play', 'car_seat', 'other');
create type sleep_wake_reason as enum ('self', 'parent_for_feed', 'diaper', 'fussy', 'noise', 'other');
create type ped_note_type as enum ('question', 'instruction_received', 'observation_to_share');
create type ped_note_status as enum ('open', 'answered', 'resolved');
create type caregiver_role as enum ('owner', 'caregiver', 'viewer');
create type baby_sex as enum ('male', 'female', 'unspecified');

-- ============================================================
-- CORE TABLES
-- ============================================================

create table babies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  birth_date date not null,
  birth_time time,
  sex baby_sex not null default 'unspecified',
  birth_weight_oz numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table caregivers (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid not null references babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role caregiver_role not null default 'caregiver',
  display_name text,
  created_at timestamptz not null default now(),
  unique (baby_id, user_id)
);

create table feeds (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  start_at timestamptz not null,
  end_at timestamptz,
  type feed_type not null,
  formula_brand text,
  volume_ml numeric(6,2) not null,
  volume_offered_ml numeric(6,2),
  bottle_type text,
  spit_up boolean not null default false,
  spit_up_notes text,
  diaper_change_during boolean not null default false,
  fussiness_notes text,
  linked_feed_id uuid references feeds(id) on delete set null,
  voice_note_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pumps (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  start_at timestamptz not null,
  duration_min numeric(5,2),
  volume_ml numeric(6,2) not null,
  output_type pump_output_type not null,
  consistency_notes text,
  side pump_side,
  voice_note_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table diapers (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  changed_at timestamptz not null,
  pee boolean not null default false,
  poop boolean not null default false,
  poop_color poop_color,
  poop_consistency poop_consistency,
  volume_notes text,
  cream_applied cream_type not null default 'none',
  rash_status rash_status,
  notes text,
  voice_note_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (pee or poop)
);

create table sleeps (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  start_at timestamptz not null,
  end_at timestamptz,
  location sleep_location not null default 'bassinet',
  woken_by sleep_wake_reason,
  notes text,
  voice_note_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at is null or end_at > start_at)
);

create table weights (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  measured_at timestamptz not null,
  weight_oz numeric(6,2) not null,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pediatrician_notes (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  occurred_at timestamptz not null default now(),
  type ped_note_type not null,
  status ped_note_status not null default 'open',
  content text not null,
  answer text,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pediatrician_note_links (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid not null references pediatrician_notes(id) on delete cascade,
  event_type text not null check (event_type in ('feed','pump','diaper','sleep','weight')),
  event_id uuid not null,
  created_at timestamptz not null default now(),
  unique (note_id, event_type, event_id)
);

create table share_links (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid not null references babies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  date_range_start date,
  date_range_end date,
  expires_at timestamptz,
  revoked_at timestamptz,
  last_viewed_at timestamptz,
  view_count integer not null default 0,
  label text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index feeds_baby_start_idx on feeds (baby_id, start_at desc);
create index pumps_baby_start_idx on pumps (baby_id, start_at desc);
create index diapers_baby_changed_idx on diapers (baby_id, changed_at desc);
create index sleeps_baby_start_idx on sleeps (baby_id, start_at desc);
create index weights_baby_measured_idx on weights (baby_id, measured_at desc);
create index ped_notes_baby_status_idx on pediatrician_notes (baby_id, status, occurred_at desc);
create index ped_note_links_event_idx on pediatrician_note_links (event_type, event_id);
create index share_links_token_idx on share_links (token);
create index caregivers_user_idx on caregivers (user_id);

-- ============================================================
-- updated_at TRIGGER
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_babies_updated before update on babies
  for each row execute function set_updated_at();
create trigger trg_feeds_updated before update on feeds
  for each row execute function set_updated_at();
create trigger trg_pumps_updated before update on pumps
  for each row execute function set_updated_at();
create trigger trg_diapers_updated before update on diapers
  for each row execute function set_updated_at();
create trigger trg_sleeps_updated before update on sleeps
  for each row execute function set_updated_at();
create trigger trg_weights_updated before update on weights
  for each row execute function set_updated_at();
create trigger trg_ped_notes_updated before update on pediatrician_notes
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
create or replace function is_caregiver_for(target_baby_id uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from caregivers c
    where c.baby_id = target_baby_id
      and c.user_id = auth.uid()
  );
$$;

alter table babies enable row level security;
alter table caregivers enable row level security;
alter table feeds enable row level security;
alter table pumps enable row level security;
alter table diapers enable row level security;
alter table sleeps enable row level security;
alter table weights enable row level security;
alter table pediatrician_notes enable row level security;
alter table pediatrician_note_links enable row level security;
alter table share_links enable row level security;

create policy babies_select on babies for select
  using (is_caregiver_for(id));
create policy babies_insert on babies for insert
  with check (true);
create policy babies_update on babies for update
  using (exists (
    select 1 from caregivers c
    where c.baby_id = babies.id and c.user_id = auth.uid() and c.role = 'owner'
  ));

create policy caregivers_select on caregivers for select
  using (is_caregiver_for(baby_id) or user_id = auth.uid());
create policy caregivers_insert on caregivers for insert
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from caregivers c
      where c.baby_id = caregivers.baby_id and c.user_id = auth.uid() and c.role = 'owner'
    )
  );
create policy caregivers_delete on caregivers for delete
  using (exists (
    select 1 from caregivers c
    where c.baby_id = caregivers.baby_id and c.user_id = auth.uid() and c.role = 'owner'
  ));

create policy feeds_select on feeds for select using (is_caregiver_for(baby_id));
create policy feeds_modify on feeds for all using (
  exists (select 1 from caregivers c where c.baby_id = feeds.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
) with check (
  exists (select 1 from caregivers c where c.baby_id = feeds.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
);

create policy pumps_select on pumps for select using (is_caregiver_for(baby_id));
create policy pumps_modify on pumps for all using (
  exists (select 1 from caregivers c where c.baby_id = pumps.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
) with check (
  exists (select 1 from caregivers c where c.baby_id = pumps.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
);

create policy diapers_select on diapers for select using (is_caregiver_for(baby_id));
create policy diapers_modify on diapers for all using (
  exists (select 1 from caregivers c where c.baby_id = diapers.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
) with check (
  exists (select 1 from caregivers c where c.baby_id = diapers.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
);

create policy sleeps_select on sleeps for select using (is_caregiver_for(baby_id));
create policy sleeps_modify on sleeps for all using (
  exists (select 1 from caregivers c where c.baby_id = sleeps.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
) with check (
  exists (select 1 from caregivers c where c.baby_id = sleeps.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
);

create policy weights_select on weights for select using (is_caregiver_for(baby_id));
create policy weights_modify on weights for all using (
  exists (select 1 from caregivers c where c.baby_id = weights.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
) with check (
  exists (select 1 from caregivers c where c.baby_id = weights.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
);

create policy ped_notes_select on pediatrician_notes for select using (is_caregiver_for(baby_id));
create policy ped_notes_modify on pediatrician_notes for all using (
  exists (select 1 from caregivers c where c.baby_id = pediatrician_notes.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
) with check (
  exists (select 1 from caregivers c where c.baby_id = pediatrician_notes.baby_id and c.user_id = auth.uid() and c.role in ('owner','caregiver'))
);

create policy ped_note_links_select on pediatrician_note_links for select
  using (exists (select 1 from pediatrician_notes n where n.id = note_id and is_caregiver_for(n.baby_id)));
create policy ped_note_links_modify on pediatrician_note_links for all
  using (exists (select 1 from pediatrician_notes n join caregivers c on c.baby_id = n.baby_id where n.id = note_id and c.user_id = auth.uid() and c.role in ('owner','caregiver')))
  with check (exists (select 1 from pediatrician_notes n join caregivers c on c.baby_id = n.baby_id where n.id = note_id and c.user_id = auth.uid() and c.role in ('owner','caregiver')));

create policy share_links_select on share_links for select using (is_caregiver_for(baby_id));
create policy share_links_modify on share_links for all using (
  exists (select 1 from caregivers c where c.baby_id = share_links.baby_id and c.user_id = auth.uid() and c.role = 'owner')
) with check (
  exists (select 1 from caregivers c where c.baby_id = share_links.baby_id and c.user_id = auth.uid() and c.role = 'owner')
);

-- ============================================================
-- SHARE LINK PUBLIC READ FUNCTION
-- Bypasses RLS for the share link read path only.
-- Validates token, checks expiry/revocation, returns baby_id.
-- ============================================================
create or replace function resolve_share_link(p_token text)
returns table(
  baby_id uuid,
  date_range_start date,
  date_range_end date
)
language sql stable security definer
as $$
  select sl.baby_id, sl.date_range_start, sl.date_range_end
  from share_links sl
  where sl.token = p_token
    and sl.revoked_at is null
    and (sl.expires_at is null or sl.expires_at > now());
$$;

-- ============================================================
-- DAILY ROLLUP VIEW
-- Groups by UTC date. Client buckets by local timezone for display.
-- Weight: most recent measurement on that calendar day (UTC).
-- ============================================================
create or replace view daily_rollup as
select
  b.id as baby_id,
  d.day::date as day,
  coalesce(sum(case when f.type = 'formula' then f.volume_ml end), 0) as formula_ml,
  coalesce(sum(case when f.type = 'breast_milk' then f.volume_ml end), 0) as breast_milk_ml,
  coalesce(sum(case when f.type = 'colostrum' then f.volume_ml end), 0) as colostrum_ml,
  count(distinct f.id) as feed_count,
  (select count(*) from diapers dx where dx.baby_id = b.id and dx.changed_at::date = d.day and dx.pee) as pee_count,
  (select count(*) from diapers dx where dx.baby_id = b.id and dx.changed_at::date = d.day and dx.poop) as poop_count,
  (select coalesce(sum(extract(epoch from (coalesce(s.end_at, now()) - s.start_at))/3600), 0)
     from sleeps s where s.baby_id = b.id and s.start_at::date = d.day) as sleep_hours,
  (select coalesce(sum(p.volume_ml), 0) from pumps p where p.baby_id = b.id and p.start_at::date = d.day) as pump_ml,
  (select w.weight_oz from weights w where w.baby_id = b.id and w.measured_at::date = d.day
     order by w.measured_at desc limit 1) as weight_oz
from babies b
cross join lateral generate_series(
  (select min(start_at)::date from feeds where baby_id = b.id),
  (select max(start_at)::date from feeds where baby_id = b.id),
  '1 day'::interval
) as d(day)
left join feeds f on f.baby_id = b.id and f.start_at::date = d.day
group by b.id, d.day;
