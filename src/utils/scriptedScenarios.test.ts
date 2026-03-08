import { describe, expect, it } from 'vitest'
import { getTidalStretchAmount, isLateTidalApproach } from './scriptedScenarios'

describe('scripted scenario helpers', () => {
    it('clamps tidal stretch during approach', () => {
        expect(getTidalStretchAmount('approach', 1.8, 0, 7800)).toBe(0)
        expect(getTidalStretchAmount('approach', 1.65, 0, 7800)).toBe(0)
        expect(getTidalStretchAmount('approach', 1, 0, 7800)).toBe(1)
        expect(getTidalStretchAmount('approach', 0.8, 0, 7800)).toBe(1)
    })

    it('holds then decays tidal stretch during debris capture', () => {
        expect(getTidalStretchAmount('debris-capture', null, 0, 7800)).toBe(1)
        expect(getTidalStretchAmount('debris-capture', null, 3900, 7800)).toBe(1)

        const decayedStretch = getTidalStretchAmount('debris-capture', null, 6200, 7800)
        expect(decayedStretch).toBeGreaterThan(0)
        expect(decayedStretch).toBeLessThan(1)
        expect(getTidalStretchAmount('debris-capture', null, 7800, 7800)).toBe(0)
    })

    it('flags late tidal approach at or below the spaghettification threshold', () => {
        expect(isLateTidalApproach(null)).toBe(false)
        expect(isLateTidalApproach(1.41)).toBe(false)
        expect(isLateTidalApproach(1.4)).toBe(true)
        expect(isLateTidalApproach(0.98)).toBe(true)
    })
})
