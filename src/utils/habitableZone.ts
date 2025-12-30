import { SOLAR_CONSTANTS } from '../constants/physics';
import type { CelestialBody } from '../types/physics';

/**
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
 * 複数恒星系での特定座標における放射フラックスを計算
 * @param x X座標
 * @param z Z座標
 * @param stars 恒星配列
 * @returns 正規化されたフラックス値
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
        const distSq = dx * dx + dz * dz + 0.01; // epsilon避け

        const luminosity = calculateLuminosity(star.mass);
        // 放射フラックス: F = L / (4πr²) → 正規化して L / r²
        totalFlux += luminosity / distSq;
    }

    return totalFlux;
};

/**
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
};
