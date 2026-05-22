-- Seed data for newborn tracking app
-- Sourced from real parental log, May 19-21 2026
-- All timestamps in America/New_York (adjust if needed)
-- Baby ID is fixed so Claude Code can reference it across migrations/tests
--
-- NOTE: caregiver auth.users row is not seeded here — Supabase auth handles
-- that separately. In dev, create a test user, then update the baby row's
-- caregiver entry to that user_id. logged_by is left null for seed data.

-- ============================================================
-- BABY
-- ============================================================
insert into babies (id, name, birth_date, sex, birth_weight_oz)
values ('00000000-0000-0000-0000-000000000001', 'Baby', '2026-05-17', 'male', null);

-- ============================================================
-- FEEDS — May 19
-- ============================================================
-- 1:20am formula, very sleepy, finished ~2:00am at 60ml total
insert into feeds (baby_id, start_at, end_at, type, volume_ml, spit_up, spit_up_notes, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 01:20:00-04','2026-05-19 02:00:00-04','formula',60,true,'spit up a little before finishing','very sleepy, did not want to go past 40-45ml initially');

-- 1:20am colostrum, two attempts, did not like Philip's bottle, ~5ml
insert into feeds (baby_id, start_at, type, volume_ml, bottle_type, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 01:20:00-04','colostrum',5,'Philips','two attempts, did not like Philips bottle');

-- 4:10am formula, refused, only ate ~10ml — FLAG for pediatrician
insert into feeds (baby_id, start_at, end_at, type, volume_ml, volume_offered_ml, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 04:10:00-04','2026-05-19 05:05:00-04','formula',10,60,'refused bottle persistently across the hour; diaper changed and stripped to diaper to wake him; fussy and refused at 5:05; could not get him to finish before 1hr expiration. TELL PEDIATRICIAN');

-- 5:50am formula, 50ml
insert into feeds (baby_id, start_at, type, volume_ml, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 05:50:00-04','formula',50,'a little sleepy but ready to eat');

-- ~5:50 colostrum 20ml before supplementing with formula
insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-19 05:48:00-04','colostrum',20);

-- 9:45 Enfamil — ate 25ml then threw most of it up
insert into feeds (baby_id, start_at, type, formula_brand, volume_ml, spit_up, spit_up_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 09:45:00-04','formula','Enfamil',25,true,'immediately threw most of it up persistently — switched back to Similac 360');

-- 12:10 formula, 60ml, diaper change mid-feed, small spit-up
insert into feeds (baby_id, start_at, end_at, type, formula_brand, volume_ml, spit_up, spit_up_notes, diaper_change_during) values
('00000000-0000-0000-0000-000000000001','2026-05-19 12:10:00-04','2026-05-19 12:38:00-04','formula','Similac 360',60,true,'small spit-up during diaper change, maybe under-burped',true);

-- 2:00pm formula, 45ml, Dr Browns size 1 slow flow
insert into feeds (baby_id, start_at, type, formula_brand, volume_ml, bottle_type) values
('00000000-0000-0000-0000-000000000001','2026-05-19 14:00:00-04','formula','Similac 360',45,'Dr Browns size 1 slow flow');

-- 2:12pm colostrum 10ml mid-formula feed
insert into feeds (baby_id, start_at, type, volume_ml, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 14:12:00-04','colostrum',10,'taken in the middle of the 2pm formula feed');

-- 4:45pm colostrum 15ml
insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-19 16:45:00-04','colostrum',15);

-- 4:50pm formula 40ml, slow start
insert into feeds (baby_id, start_at, type, formula_brand, volume_ml, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 16:50:00-04','formula','Similac 360',40,'only wanted 5ml initially, ate more after about 30 minutes');

-- 7:23pm colostrum 30ml — refused formula for ~50min after
insert into feeds (baby_id, start_at, type, volume_ml, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 19:23:00-04','colostrum',30,'refused formula for ~50 min after this bottle');

-- 8:10pm formula 40ml, finished ~8:20, small spit-up
insert into feeds (baby_id, start_at, end_at, type, formula_brand, volume_ml, spit_up, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 20:10:00-04','2026-05-19 20:20:00-04','formula','Similac 360',40,true,'did not seem to want to eat, spit up a bit early in the hour window');

-- 11:40pm colostrum 15ml
insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-19 23:40:00-04','colostrum',15);

-- 11:50pm formula 45ml
insert into feeds (baby_id, start_at, type, formula_brand, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-19 23:50:00-04','formula','Similac 360',45);

-- ============================================================
-- FEEDS — May 20
-- ============================================================
insert into feeds (baby_id, start_at, type, formula_brand, volume_ml, spit_up, spit_up_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-20 02:35:00-04','formula','Similac 360',60,true,'small spit-up towards the end, otherwise smooth');

insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 03:00:00-04','colostrum',10);

insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 06:30:00-04','colostrum',15);

insert into feeds (baby_id, start_at, type, formula_brand, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 06:35:00-04','formula','Similac 360',60);

insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 09:20:00-04','breast_milk',60);

insert into feeds (baby_id, start_at, type, formula_brand, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 12:15:00-04','formula','Similac 360',60);

insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 14:30:00-04','breast_milk',30);

insert into feeds (baby_id, start_at, type, formula_brand, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 18:45:00-04','formula','Similac 360',60);

insert into feeds (baby_id, start_at, type, formula_brand, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 20:40:00-04','formula','Similac 360',50);

insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-20 23:20:00-04','breast_milk',45);

-- ============================================================
-- FEEDS — May 21
-- ============================================================
insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-21 01:45:00-04','breast_milk',30);

insert into feeds (baby_id, start_at, end_at, type, formula_brand, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-21 02:00:00-04','2026-05-21 02:30:00-04','formula','Similac 360',60);

-- First Bobbie formula — notable, ped should know
insert into feeds (baby_id, start_at, type, formula_brand, volume_ml, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-21 04:40:00-04','formula','Bobbie',40,'first time trying Bobbie. Followed directions (water first, then scoop) but volume looked larger than the 60ml of water. Handled it well.');

insert into feeds (baby_id, start_at, type, volume_ml, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-21 08:20:00-04','breast_milk',60,'took a while to eat');

insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-21 12:00:00-04','breast_milk',60);

insert into feeds (baby_id, start_at, type, volume_ml, fussiness_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-21 14:20:00-04','breast_milk',45,'cold from fridge; left the rest out aiming to finish within the 2hr breast milk window');

insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-21 15:15:00-04','breast_milk',10);

insert into feeds (baby_id, start_at, type, volume_ml) values
('00000000-0000-0000-0000-000000000001','2026-05-21 18:30:00-04','breast_milk',70);

-- ============================================================
-- PUMPS — May 19 (all colostrum)
-- ============================================================
insert into pumps (baby_id, start_at, volume_ml, output_type, consistency_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 01:20:00-04',3.5,'colostrum','first pump of the day, very little'),
('00000000-0000-0000-0000-000000000001','2026-05-19 03:40:00-04',0,'colostrum','nothing came out — blamed the nipple butter'),
('00000000-0000-0000-0000-000000000001','2026-05-19 06:00:00-04',20,'colostrum',null),
('00000000-0000-0000-0000-000000000001','2026-05-19 08:20:00-04',2,'colostrum',null),
('00000000-0000-0000-0000-000000000001','2026-05-19 12:12:00-04',11,'colostrum',null),
('00000000-0000-0000-0000-000000000001','2026-05-19 14:15:00-04',15,'colostrum',null),
('00000000-0000-0000-0000-000000000001','2026-05-19 16:30:00-04',29,'colostrum',null),
('00000000-0000-0000-0000-000000000001','2026-05-19 20:40:00-04',20,'transitional','noticeably less thick, whiter — probably transition phase'),
('00000000-0000-0000-0000-000000000001','2026-05-19 23:00:00-04',15,'transitional','similar less-thick consistency');

-- ============================================================
-- PUMPS — May 20
-- ============================================================
insert into pumps (baby_id, start_at, volume_ml, output_type, consistency_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-20 03:38:00-04',15,'transitional','waited later to give mom a break; still drowsy; consistency more milk-like but slightly golden'),
('00000000-0000-0000-0000-000000000001','2026-05-20 08:30:00-04',60,'mature_milk','definitely milky'),
('00000000-0000-0000-0000-000000000001','2026-05-20 22:30:00-04',90,'mature_milk',null);

-- ============================================================
-- PUMPS — May 21
-- ============================================================
insert into pumps (baby_id, start_at, volume_ml, output_type) values
('00000000-0000-0000-0000-000000000001','2026-05-21 05:15:00-04',150,'mature_milk'),
('00000000-0000-0000-0000-000000000001','2026-05-21 10:00:00-04',100,'mature_milk'),
('00000000-0000-0000-0000-000000000001','2026-05-21 16:00:00-04',170,'mature_milk');

-- ============================================================
-- DIAPERS — May 19
-- ============================================================
insert into diapers (baby_id, changed_at, pee, poop, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 01:30:00-04',false,true,'no substantial pee noted');

insert into diapers (baby_id, changed_at, pee, poop, poop_color, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 04:00:00-04',true,true,'brown','color browner than previously');

insert into diapers (baby_id, changed_at, pee, poop, poop_color, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 05:00:00-04',true,true,'brown','browner; yellowish when wiped');

insert into diapers (baby_id, changed_at, pee, poop, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 07:45:00-04',true,true,'started pooping again after being wiped');

insert into diapers (baby_id, changed_at, pee, poop) values
('00000000-0000-0000-0000-000000000001','2026-05-19 09:40:00-04',true,true),
('00000000-0000-0000-0000-000000000001','2026-05-19 10:55:00-04',true,true),
('00000000-0000-0000-0000-000000000001','2026-05-19 12:30:00-04',true,true),
('00000000-0000-0000-0000-000000000001','2026-05-19 14:30:00-04',true,true),
('00000000-0000-0000-0000-000000000001','2026-05-19 16:40:00-04',true,true),
('00000000-0000-0000-0000-000000000001','2026-05-19 18:40:00-04',true,true),
('00000000-0000-0000-0000-000000000001','2026-05-19 19:55:00-04',true,false),
('00000000-0000-0000-0000-000000000001','2026-05-19 20:30:00-04',false,true),
('00000000-0000-0000-0000-000000000001','2026-05-19 23:30:00-04',true,true);

-- ============================================================
-- DIAPERS — May 20
-- ============================================================
insert into diapers (baby_id, changed_at, pee, poop, poop_consistency, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-20 00:35:00-04',true,true,'grainy','reminded me of wet sand');

insert into diapers (baby_id, changed_at, pee, poop, poop_color, poop_consistency, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-20 02:30:00-04',true,true,'brown','formed','softer, less wet-sand looking');

insert into diapers (baby_id, changed_at, pee, poop, volume_notes) values
('00000000-0000-0000-0000-000000000001','2026-05-20 06:20:00-04',true,true,'lots of pee');

insert into diapers (baby_id, changed_at, pee, poop) values
('00000000-0000-0000-0000-000000000001','2026-05-20 07:06:00-04',true,true),
('00000000-0000-0000-0000-000000000001','2026-05-20 08:00:00-04',true,true), -- "Pee and poop" with no time in log; estimated
('00000000-0000-0000-0000-000000000001','2026-05-20 09:00:00-04',true,true);

insert into diapers (baby_id, changed_at, pee, poop, poop_color, poop_consistency, volume_notes, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-20 10:30:00-04',true,true,'yellow','grainy','record amount of pee per nurse','in nurses office; nurse said record pee on table; poop yellow and grainy');

insert into diapers (baby_id, changed_at, pee, poop) values
('00000000-0000-0000-0000-000000000001','2026-05-20 13:20:00-04',true,true);

insert into diapers (baby_id, changed_at, pee, poop, poop_color, volume_notes, cream_applied, rash_status) values
('00000000-0000-0000-0000-000000000001','2026-05-20 16:20:00-04',true,true,'yellow','lots and lots','desitin','mild');

insert into diapers (baby_id, changed_at, pee, poop, volume_notes, cream_applied, rash_status) values
('00000000-0000-0000-0000-000000000001','2026-05-20 18:40:00-04',true,true,'much less, hasn''t eaten in a while','desitin','mild');

insert into diapers (baby_id, changed_at, pee, poop, cream_applied) values
('00000000-0000-0000-0000-000000000001','2026-05-20 20:30:00-04',true,true,'desitin');

insert into diapers (baby_id, changed_at, pee, poop, volume_notes, cream_applied) values
('00000000-0000-0000-0000-000000000001','2026-05-20 23:15:00-04',true,true,'very damp pee','vaseline');

-- ============================================================
-- DIAPERS — May 21
-- ============================================================
insert into diapers (baby_id, changed_at, pee, poop, cream_applied) values
('00000000-0000-0000-0000-000000000001','2026-05-21 01:30:00-04',true,true,'desitin');

insert into diapers (baby_id, changed_at, pee, poop, cream_applied, rash_status, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-21 04:30:00-04',true,true,'vaseline','resolved','rash looked about gone');

insert into diapers (baby_id, changed_at, pee, poop, cream_applied, rash_status, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-21 06:25:00-04',true,true,'desitin','resolved','rash almost gone');

insert into diapers (baby_id, changed_at, pee, poop, cream_applied) values
('00000000-0000-0000-0000-000000000001','2026-05-21 08:10:00-04',true,true,'vaseline');

insert into diapers (baby_id, changed_at, pee, poop, volume_notes, cream_applied, rash_status, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-21 10:40:00-04',true,true,'pooped quite a bit','desitin','moderate','smeared up his back; rash flared up a bit worse than before');

insert into diapers (baby_id, changed_at, pee, poop) values
('00000000-0000-0000-0000-000000000001','2026-05-21 12:30:00-04',true,true);

insert into diapers (baby_id, changed_at, pee, poop, cream_applied) values
('00000000-0000-0000-0000-000000000001','2026-05-21 14:30:00-04',true,true,'vaseline'),
('00000000-0000-0000-0000-000000000001','2026-05-21 16:00:00-04',true,true,'vaseline');

-- ============================================================
-- SLEEPS (partial — log is incomplete; reconstruct what's clear)
-- ============================================================
insert into sleeps (baby_id, start_at, end_at, location, woken_by, notes) values
('00000000-0000-0000-0000-000000000001','2026-05-19 02:00:00-04','2026-05-19 04:00:00-04','bassinet','parent_for_feed','prefers edge of bassinet on his side; swaddling tighter to keep him on his back'),
('00000000-0000-0000-0000-000000000001','2026-05-19 05:10:00-04','2026-05-19 05:50:00-04','parent_arms','parent_for_feed','slept in dad''s arms'),
('00000000-0000-0000-0000-000000000001','2026-05-19 06:25:00-04','2026-05-19 09:30:00-04','bassinet','parent_for_feed','bassinet rolls him to the side in one orientation; flipped to balance; Mimi watched in pack-and-play part of the time; not fussy, had to be roused'),
('00000000-0000-0000-0000-000000000001','2026-05-19 12:38:00-04','2026-05-19 14:00:00-04','bassinet','parent_for_feed',null),
('00000000-0000-0000-0000-000000000001','2026-05-19 14:30:00-04','2026-05-19 15:00:00-04','bassinet','fussy','noticed a small spit-up around 3pm, changed bassinet sheet'),
('00000000-0000-0000-0000-000000000001','2026-05-19 17:35:00-04','2026-05-19 19:20:00-04','bassinet','self','woke when parents were taking turns showering'),
('00000000-0000-0000-0000-000000000001','2026-05-19 20:20:00-04','2026-05-19 23:30:00-04','bassinet','parent_for_feed',null),
('00000000-0000-0000-0000-000000000001','2026-05-20 01:45:00-04','2026-05-20 02:35:00-04','bassinet','parent_for_feed','was very awake initially with aunt visiting; held for a bit before bassinet'),
('00000000-0000-0000-0000-000000000001','2026-05-20 03:40:00-04','2026-05-20 06:20:00-04','bassinet','diaper','woke very upset with a full diaper'),
('00000000-0000-0000-0000-000000000001','2026-05-20 08:00:00-04',null,'bassinet',null,'went down without a fuss after eating');

-- ============================================================
-- WEIGHTS
-- ============================================================
-- 6 lb 13 oz = 109 oz
insert into weights (baby_id, measured_at, weight_oz, location) values
('00000000-0000-0000-0000-000000000001','2026-05-20 10:30:00-04',109,'pediatrician');

-- ============================================================
-- PEDIATRICIAN NOTES
-- ============================================================
-- Instructions received
insert into pediatrician_notes (id, baby_id, occurred_at, type, status, content) values
('11111111-1111-1111-1111-000000000001','00000000-0000-0000-0000-000000000001','2026-05-20 10:30:00-04','instruction_received','resolved','Use 40% zinc oxide for diaper rash flare-ups. Thick layer over everywhere poop could reach. If poop is present, take off only the top layer — do not scrub all the zinc off. Use Aquaphor or Vaseline at every diaper change otherwise.'),
('11111111-1111-1111-1111-000000000002','00000000-0000-0000-0000-000000000001','2026-05-20 10:30:00-04','instruction_received','resolved','Use Brita-filtered water for formula. Add formula after water.'),
('11111111-1111-1111-1111-000000000003','00000000-0000-0000-0000-000000000001','2026-05-20 10:30:00-04','instruction_received','resolved','Bathe with a gentle sponge or washcloth. Do not get the umbilical stub wet.'),
('11111111-1111-1111-1111-000000000004','00000000-0000-0000-0000-000000000001','2026-05-20 10:30:00-04','instruction_received','answered','Q: Target volume for colostrum vs formula? A: Breast milk — he tends to want more because it burns faster than formula.'),
('11111111-1111-1111-1111-000000000005','00000000-0000-0000-0000-000000000001','2026-05-20 10:30:00-04','instruction_received','answered','Q: Circumcision? A: Referral given. Scheduled for June 2nd.'),
('11111111-1111-1111-1111-000000000006','00000000-0000-0000-0000-000000000001','2026-05-20 10:30:00-04','instruction_received','answered','Q: Yellow spots in his mouth around 8pm on May 18? A: Non-issue.');

-- Open question, linked to the 4:10am refused feed on May 19
insert into pediatrician_notes (id, baby_id, occurred_at, type, status, content) values
('11111111-1111-1111-1111-000000000007','00000000-0000-0000-0000-000000000001','2026-05-19 05:10:00-04','question','open','Baby refused a full bottle at 4:10am on May 19 — only took 10ml of 60ml across the full hour window. Should we be concerned? Pattern of refusing larger volumes some feeds.');

-- (Link will be inserted below once we know the feed UUID; in dev, link via app UI.
-- For seed completeness, we can join on a known feed by start_at if needed.)

-- ============================================================
-- LINK ped note to the refused-feed event
-- ============================================================
insert into pediatrician_note_links (note_id, event_type, event_id)
select '11111111-1111-1111-1111-000000000007', 'feed', f.id
from feeds f
where f.baby_id = '00000000-0000-0000-0000-000000000001'
  and f.start_at = '2026-05-19 04:10:00-04';
