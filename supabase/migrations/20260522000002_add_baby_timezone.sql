-- Migration: add timezone to babies, fix daily_rollup to group by local date

-- 1. Add timezone column (IANA name, defaults to Eastern for existing rows)
alter table babies
  add column if not exists timezone text not null default 'America/New_York';

-- 2. Replace daily_rollup with a timezone-aware version
-- All date grouping now uses (timestamptz AT TIME ZONE b.timezone)::date
-- so feeds logged at 11pm local time appear on the correct calendar day.
create or replace view daily_rollup as
select
  b.id as baby_id,
  d.day::date as day,
  coalesce(sum(case when f.type = 'formula' then f.volume_ml end), 0) as formula_ml,
  coalesce(sum(case when f.type = 'breast_milk' then f.volume_ml end), 0) as breast_milk_ml,
  coalesce(sum(case when f.type = 'colostrum' then f.volume_ml end), 0) as colostrum_ml,
  count(distinct f.id) as feed_count,
  (select count(*) from diapers dx
     where dx.baby_id = b.id
       and (dx.changed_at at time zone b.timezone)::date = d.day
       and dx.pee) as pee_count,
  (select count(*) from diapers dx
     where dx.baby_id = b.id
       and (dx.changed_at at time zone b.timezone)::date = d.day
       and dx.poop) as poop_count,
  (select coalesce(sum(extract(epoch from (coalesce(s.end_at, now()) - s.start_at)) / 3600), 0)
     from sleeps s
     where s.baby_id = b.id
       and (s.start_at at time zone b.timezone)::date = d.day) as sleep_hours,
  (select coalesce(sum(p.volume_ml), 0)
     from pumps p
     where p.baby_id = b.id
       and (p.start_at at time zone b.timezone)::date = d.day) as pump_ml
from babies b
cross join lateral generate_series(
  (select (min(start_at) at time zone b.timezone)::date from feeds where baby_id = b.id),
  (select (max(start_at) at time zone b.timezone)::date from feeds where baby_id = b.id),
  '1 day'::interval
) as d(day)
left join feeds f on f.baby_id = b.id
  and (f.start_at at time zone b.timezone)::date = d.day
group by b.id, b.timezone, d.day;
