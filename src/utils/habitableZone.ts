<<<<<<< HEAD
/**
 * Habitable Zone Calculation Utilities
 * Calculates the habitable zone (liquid water region) around stars
 */

=======
>>>>>>> advanced-visualization-week1
import { SOLAR_CONSTANTS } from '../constants/physics';
import type { CelestialBody } from '../types/physics';

/**
<<<<<<< HEAD
 * Calculate stellar luminosity from mass using mass-luminosity relation
 * For main sequence stars: L ∝ M^3.5
 * @param starMass Star mass in simulation units
 * @returns Luminosity relative to the Sun
 */
export const calculateLuminosity = (starMass: number): number => {
    const solarMassRatio = starMass / SOLAR_CONSTANTS.SOLAR_MASS;
    return Math.pow(Math.max(solarMassRatio, 0.001), SOLAR_CONSTANTS.MASS_LUMINOSITY_EXPONENT);
};

/**
 * Calculate habitable zone boundaries for a single star
 * @param star The star body
 * @param auScale Scale factor (simulation units per AU)
 * @returns Inner and outer boundary distances in simulation units
=======
 * 恒星の質量から光度を計算（質量-光度関係）
 * @param starMass 恒星質量（シミュレーション単位）
 * @returns 太陽光度比
 */
export const calculateLuminosity = (starMass: number): number => {
    const solarMassRatio = starMass / SOLAR_CONSTANTS.SOLAR_MASS;
    // 主系列星の質量-光度関係: L ∝ M^3.5
    return Math.pow(solarMassRatio, 3.5);
};

/**
 * 単一恒星のハビタブルゾーン境界を計算
 * @param star 恒星オブジェクト
 * @param auScale 1AUのシミュレーション単位長
 * @returns { inner: number, outer: number } 内縁・外縁距離
>>>>>>> advanced-visualization-week1
 */
export const calculateSingleStarHZ = (
    star: CelestialBody,
    auScale: number
): { inner: number; outer: number } => {
    const luminosity = calculateLuminosity(star.mass);
    const sqrtL = Math.sqrt(luminosity);

    return {
        inner: sqrtL * SOLAR_CONSTANTS.HZ_INNER_AU * auScale,
        outer: sqrtL * SOLAR_CONSTANTS.HZ_OUTER_AU * auScale,
    };
};

/**
<<<<<<< HEAD
 * Calculate radiation flux at a specific point from multiple stars
 * @param x X coordinate
 * @param z Z coordinate
 * @param stars Array of star bodies
 * @returns Total radiation flux (arbitrary units, normalized later)
=======
 * 複数恒星系での特定座標における放射フラックスを計算
 * @param x X座標
 * @param z Z座標
 * @param stars 恒星配列
 * @returns 正規化されたフラックス値
>>>>>>> advanced-visualization-week1
 */
export const calculateFluxAt = (
    x: number,
    z: number,
    stars: CelestialBody[]
): number => {
    let totalFlux = 0;

    for (const star of stars) {
        const dx = x - star.position.x;
        const dz = z - star.position.z;
<<<<<<< HEAD
        const distSq = dx * dx + dz * dz + 0.01; // Small epsilon to avoid division by zero

        const luminosity = calculateLuminosity(star.mass);
        // Radiation flux follows inverse square law: F = L / (4πr²)
        // We use L / r² for relative comparison
=======
        const distSq = dx * dx + dz * dz + 0.01; // epsilon避け

        const luminosity = calculateLuminosity(star.mass);
        // 放射フラックス: F = L / (4πr²) → 正規化して L / r²
>>>>>>> advanced-visualization-week1
        totalFlux += luminosity / distSq;
    }

    return totalFlux;
};

/**
<<<<<<< HEAD
 * Classify habitability based on radiation flux
 * @param flux Radiation flux value
 * @param referenceFlux Reference flux at 1 AU from a solar-mass star
 * @returns 0 = too cold, 1 = habitable, 2 = too hot
 */
export const classifyHabitability = (
    flux: number,
    referenceFlux: number = 1.0
): 0 | 1 | 2 => {
    // Normalize flux to solar equivalent at 1 AU
    const normalizedFlux = flux / referenceFlux;

    // HZ boundaries in terms of flux
    // Inner edge (0.95 AU): flux = 1 / 0.95² ≈ 1.11
    // Outer edge (1.4 AU): flux = 1 / 1.4² ≈ 0.51
    const HZ_INNER_FLUX = 1.0 / (SOLAR_CONSTANTS.HZ_INNER_AU ** 2); // ~1.11
    const HZ_OUTER_FLUX = 1.0 / (SOLAR_CONSTANTS.HZ_OUTER_AU ** 2); // ~0.51

    if (normalizedFlux > HZ_INNER_FLUX) return 2; // Too hot
    if (normalizedFlux < HZ_OUTER_FLUX) return 0; // Too cold
    return 1; // Habitable
};

/**
 * Get color for habitability classification
 * @param classification 0 = cold, 1 = habitable, 2 = hot
 * @param alpha Optional alpha value
 * @returns RGB color string
 */
export const getHabitabilityColor = (
    classification: 0 | 1 | 2,
    alpha: number = 1.0
): string => {
    switch (classification) {
        case 0: // Cold - Blue
            return `rgba(0, 68, 170, ${alpha})`;
        case 1: // Habitable - Green
            return `rgba(34, 170, 68, ${alpha})`;
        case 2: // Hot - Red
            return `rgba(170, 34, 34, ${alpha})`;
    }
=======
 * フラックス値がハビタブルゾーン範囲内かを判定
 * 太陽系地球位置（1AU）でのフラックスを1.0として正規化
 * @param flux 放射フラックス
 * @returns 0=寒すぎ, 1=ハビタブル, 2=熱すぎ
 */
export const classifyHabitability = (flux: number): 0 | 1 | 2 => {
    // 1AU での太陽フラックス = 1.0 / 1² = 1.0
    // HZ内縁(0.95AU): flux = 1.0 / 0.95² ≈ 1.11
    // HZ外縁(1.4AU): flux = 1.0 / 1.4² ≈ 0.51
    const HZ_INNER_FLUX = 1.0 / (Math.pow(SOLAR_CONSTANTS.HZ_INNER_AU, 2)); // ~1.11
    const HZ_OUTER_FLUX = 1.0 / (Math.pow(SOLAR_CONSTANTS.HZ_OUTER_AU, 2)); // ~0.51

    if (flux > HZ_INNER_FLUX) return 2; // 熱すぎ
    if (flux < HZ_OUTER_FLUX) return 0; // 寒すぎ
    return 1; // ハビタブル
>>>>>>> advanced-visualization-week1
};
