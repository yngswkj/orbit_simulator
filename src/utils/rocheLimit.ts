import type { CelestialBody } from '../types/physics';
import { PHYSICS_CONSTANTS } from '../constants/physics';

/**
 * ロシュ限界距離を計算
 * @param primary 主天体（惑星/恒星）
 * @param secondary 衛星/小天体
 * @returns ロシュ限界距離
 */
export const calculateRocheLimit = (
    primary: CelestialBody,
    secondary: CelestialBody
): number => {
    // 密度比を質量・半径から計算
    // ρ = M / (4/3 π R³) → ρ1/ρ2 = (M1/R1³) / (M2/R2³)
    const densityRatio = (primary.mass / Math.pow(primary.radius, 3)) /
        (secondary.mass / Math.pow(secondary.radius, 3));

    return PHYSICS_CONSTANTS.ROCHE_LIMIT_COEFFICIENT * primary.radius * Math.pow(densityRatio, 1 / 3);
};

/**
 * 天体ペアがロシュ限界内かをチェック
 * @param distanceScaleFactor 距離スケール係数（通常モード=1.0、リアルモード=4.0など）
 * @returns ロシュ限界内の場合はイベント情報、そうでなければnull
 */
export const checkRocheLimit = (
    body1: CelestialBody,
    body2: CelestialBody,
    distanceScaleFactor: number = 1.0
): { primary: CelestialBody; secondary: CelestialBody; rocheLimit: number } | null => {
    // 質量が大きい方を主天体とする
    const [primary, secondary] = body1.mass > body2.mass
        ? [body1, body2]
        : [body2, body1];

    // 恒星同士は対象外（とりあえず）
    if (primary.isStar && secondary.isStar) return null;

    // 惑星クラスの天体（半径 >= 0.05）は潮汐破壊されない
    // これにより水星〜海王星などの主要惑星は保護される
    // 小惑星や彗星（半径 < 0.05）のみが破壊対象
    if (secondary.radius >= 0.05) return null;

    const rocheLimit = calculateRocheLimit(primary, secondary);

    const dx = primary.position.x - secondary.position.x;
    const dy = primary.position.y - secondary.position.y;
    const dz = primary.position.z - secondary.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // 距離スケール補正：表示モードに応じてロシュ限界をスケール
    // リアルモード: scaleFactor = 4.0 → ロシュ限界を4倍に拡大（距離も4倍なので）
    // 通常モード: scaleFactor = 1.0 → ロシュ限界はそのまま（距離も圧縮されているので）
    const adjustedRocheLimit = rocheLimit * distanceScaleFactor;

    if (distance < adjustedRocheLimit) {
        return { primary, secondary, rocheLimit };
    }

    return null;
};
