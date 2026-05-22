import { describe, it, expect } from 'vitest'
import { computeFlaggedEvents } from '@/lib/export-utils'
import type { FeedRow, DiaperRow } from '@/lib/database.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFeed(partial: Partial<FeedRow> & Pick<FeedRow, 'start_at' | 'type' | 'volume_ml'>): FeedRow {
  return {
    id: Math.random().toString(36).slice(2),
    baby_id: 'test-baby',
    logged_by: null,
    end_at: null,
    formula_brand: null,
    volume_offered_ml: null,
    bottle_type: null,
    spit_up: false,
    spit_up_notes: null,
    diaper_change_during: false,
    fussiness_notes: null,
    linked_feed_id: null,
    voice_note_url: null,
    created_at: partial.start_at,
    updated_at: partial.start_at,
    ...partial,
  }
}

function makeDiaper(partial: Partial<DiaperRow> & Pick<DiaperRow, 'changed_at'>): DiaperRow {
  return {
    id: Math.random().toString(36).slice(2),
    baby_id: 'test-baby',
    logged_by: null,
    pee: true,
    poop: false,
    poop_color: null,
    poop_consistency: null,
    volume_notes: null,
    cream_applied: 'none',
    rash_status: null,
    notes: null,
    voice_note_url: null,
    created_at: partial.changed_at,
    updated_at: partial.changed_at,
    ...partial,
  }
}

// ── Seed data excerpts for integration-style tests ────────────────────────────

const BABY_ID = '00000000-0000-0000-0000-000000000001'

// The refused feed from May 19 04:10 EDT (08:10 UTC)
const refusedFeed = makeFeed({
  baby_id: BABY_ID,
  start_at: '2026-05-19T08:10:00Z',
  end_at: '2026-05-19T09:05:00Z',
  type: 'formula',
  volume_ml: 10,
  volume_offered_ml: 60,
  fussiness_notes: 'refused bottle persistently',
})

// A normal feed
const normalFeed = makeFeed({
  baby_id: BABY_ID,
  start_at: '2026-05-19T09:50:00Z',
  type: 'formula',
  volume_ml: 50,
})

// Spit-up feed
const spitUpFeed = makeFeed({
  baby_id: BABY_ID,
  start_at: '2026-05-19T05:20:00Z',
  type: 'formula',
  volume_ml: 60,
  spit_up: true,
  spit_up_notes: 'spit up a little before finishing',
})

// May 21 rash flare sequence (EDT → UTC: -04:00)
const rashResolved1 = makeDiaper({
  baby_id: BABY_ID,
  changed_at: '2026-05-21T08:30:00Z',  // 04:30 EDT
  pee: true,
  poop: true,
  rash_status: 'resolved',
})
const rashResolved2 = makeDiaper({
  baby_id: BABY_ID,
  changed_at: '2026-05-21T10:25:00Z',  // 06:25 EDT
  pee: true,
  poop: true,
  rash_status: 'resolved',
})
const rashFlared = makeDiaper({
  baby_id: BABY_ID,
  changed_at: '2026-05-21T14:40:00Z',  // 10:40 EDT — note says "rash flared up"
  pee: true,
  poop: true,
  rash_status: 'moderate',
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('computeFlaggedEvents', () => {
  describe('refused feeds', () => {
    it('flags a feed where volume < 50% of offered', () => {
      const events = computeFlaggedEvents([refusedFeed], [])
      const refused = events.filter((e) => e.type === 'refused_feed')
      expect(refused).toHaveLength(1)
      expect(refused[0].description).toContain('10 ml of 60 ml offered')
      expect(refused[0].description).toContain('17%')
    })

    it('does not flag a feed with no volume_offered_ml', () => {
      const events = computeFlaggedEvents([normalFeed], [])
      expect(events.filter((e) => e.type === 'refused_feed')).toHaveLength(0)
    })

    it('does not flag a feed where volume >= 50% of offered', () => {
      const feed = makeFeed({ start_at: '2026-05-19T10:00:00Z', type: 'formula', volume_ml: 30, volume_offered_ml: 60 })
      const events = computeFlaggedEvents([feed], [])
      expect(events.filter((e) => e.type === 'refused_feed')).toHaveLength(0)
    })

    it('includes the relatedId matching the feed id', () => {
      const events = computeFlaggedEvents([refusedFeed], [])
      const refused = events.find((e) => e.type === 'refused_feed')
      expect(refused?.relatedId).toBe(refusedFeed.id)
    })
  })

  describe('spit-ups', () => {
    it('flags a feed with spit_up = true', () => {
      const events = computeFlaggedEvents([spitUpFeed], [])
      const spitUps = events.filter((e) => e.type === 'spit_up')
      expect(spitUps).toHaveLength(1)
    })

    it('includes spit_up_notes in the description when present', () => {
      const events = computeFlaggedEvents([spitUpFeed], [])
      const ev = events.find((e) => e.type === 'spit_up')
      expect(ev?.description).toContain('spit up a little before finishing')
    })

    it('does not flag a feed with spit_up = false', () => {
      const events = computeFlaggedEvents([normalFeed], [])
      expect(events.filter((e) => e.type === 'spit_up')).toHaveLength(0)
    })
  })

  describe('long feed gaps', () => {
    it('flags a gap > threshold (default 5 h)', () => {
      const f1 = makeFeed({ start_at: '2026-05-19T00:00:00Z', type: 'formula', volume_ml: 60 })
      const f2 = makeFeed({ start_at: '2026-05-19T06:00:00Z', type: 'formula', volume_ml: 60 })
      const events = computeFlaggedEvents([f1, f2], [])
      const gaps = events.filter((e) => e.type === 'long_gap')
      expect(gaps).toHaveLength(1)
      expect(gaps[0].description).toContain('6.0 h')
    })

    it('does not flag a gap <= threshold', () => {
      const f1 = makeFeed({ start_at: '2026-05-19T00:00:00Z', type: 'formula', volume_ml: 60 })
      const f2 = makeFeed({ start_at: '2026-05-19T04:00:00Z', type: 'formula', volume_ml: 60 })
      const events = computeFlaggedEvents([f1, f2], [])
      expect(events.filter((e) => e.type === 'long_gap')).toHaveLength(0)
    })

    it('respects a custom threshold', () => {
      const f1 = makeFeed({ start_at: '2026-05-19T00:00:00Z', type: 'formula', volume_ml: 60 })
      const f2 = makeFeed({ start_at: '2026-05-19T04:00:00Z', type: 'formula', volume_ml: 60 })
      // threshold = 3 h → 4 h gap should flag
      const events = computeFlaggedEvents([f1, f2], [], 3)
      expect(events.filter((e) => e.type === 'long_gap')).toHaveLength(1)
    })
  })

  describe('rash flare-ups', () => {
    it('flags a rash worsening from resolved to moderate (seed data pattern)', () => {
      const events = computeFlaggedEvents([], [rashResolved1, rashResolved2, rashFlared])
      const flares = events.filter((e) => e.type === 'rash_flare')
      expect(flares).toHaveLength(1)
      expect(flares[0].description).toContain('resolved')
      expect(flares[0].description).toContain('moderate')
    })

    it('does not flag improvement (moderate → resolved)', () => {
      const d1 = makeDiaper({ changed_at: '2026-05-21T00:00:00Z', rash_status: 'moderate' })
      const d2 = makeDiaper({ changed_at: '2026-05-21T04:00:00Z', rash_status: 'resolved' })
      const events = computeFlaggedEvents([], [d1, d2])
      expect(events.filter((e) => e.type === 'rash_flare')).toHaveLength(0)
    })

    it('flags mild worsening from none to moderate', () => {
      const d1 = makeDiaper({ changed_at: '2026-05-20T00:00:00Z', rash_status: 'none' })
      const d2 = makeDiaper({ changed_at: '2026-05-20T04:00:00Z', rash_status: 'moderate' })
      const events = computeFlaggedEvents([], [d1, d2])
      expect(events.filter((e) => e.type === 'rash_flare')).toHaveLength(1)
    })
  })

  describe('poop changes', () => {
    it('flags a poop color change', () => {
      const d1 = makeDiaper({ changed_at: '2026-05-19T08:00:00Z', poop: true, poop_color: 'black' })
      const d2 = makeDiaper({ changed_at: '2026-05-19T12:00:00Z', poop: true, poop_color: 'yellow' })
      const events = computeFlaggedEvents([], [d1, d2])
      expect(events.filter((e) => e.type === 'poop_color_change')).toHaveLength(1)
    })

    it('does not flag when poop color stays the same', () => {
      const d1 = makeDiaper({ changed_at: '2026-05-19T08:00:00Z', poop: true, poop_color: 'yellow' })
      const d2 = makeDiaper({ changed_at: '2026-05-19T12:00:00Z', poop: true, poop_color: 'yellow' })
      const events = computeFlaggedEvents([], [d1, d2])
      expect(events.filter((e) => e.type === 'poop_color_change')).toHaveLength(0)
    })

    it('flags a poop consistency change', () => {
      const d1 = makeDiaper({ changed_at: '2026-05-20T00:00:00Z', poop: true, poop_consistency: 'tarry' })
      const d2 = makeDiaper({ changed_at: '2026-05-20T06:00:00Z', poop: true, poop_consistency: 'grainy' })
      const events = computeFlaggedEvents([], [d1, d2])
      expect(events.filter((e) => e.type === 'poop_consistency_change')).toHaveLength(1)
    })
  })

  describe('event ordering', () => {
    it('returns events sorted by time ascending', () => {
      const f1 = makeFeed({ start_at: '2026-05-19T10:00:00Z', type: 'formula', volume_ml: 60, spit_up: true })
      const f2 = makeFeed({ start_at: '2026-05-19T08:00:00Z', type: 'formula', volume_ml: 10, volume_offered_ml: 60 })
      const events = computeFlaggedEvents([f1, f2], [])
      expect(new Date(events[0].at).getTime()).toBeLessThanOrEqual(new Date(events[1].at).getTime())
    })
  })

  describe('combined seed data events', () => {
    it('identifies both refused feed and spit-up from the 04:10 and 05:20 UTC feeds', () => {
      const events = computeFlaggedEvents([refusedFeed, spitUpFeed, normalFeed], [])
      expect(events.some((e) => e.type === 'refused_feed')).toBe(true)
      expect(events.some((e) => e.type === 'spit_up')).toBe(true)
    })
  })
})
