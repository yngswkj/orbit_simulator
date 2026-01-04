/**
 * Device Detection and Performance Utilities
 * Detects device type and capabilities for performance optimization
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type QualityLevel = 'low' | 'medium' | 'high' | 'auto';

export interface DeviceCapabilities {
    type: DeviceType;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    pixelRatio: number;
    maxTextureSize: number;
    hardwareConcurrency: number;
    supportsWebGPU: boolean;
    screenWidth: number;
    screenHeight: number;
}

/**
 * Detect device type based on user agent and screen size
 */
export const detectDeviceType = (): DeviceType => {
    if (typeof window === 'undefined') return 'desktop';

    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    // Check for mobile devices
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
        return 'mobile';
    }

    // Check for tablets
    if (/tablet|ipad|playbook|silk/i.test(ua) || (width >= 768 && width < 1024)) {
        return 'tablet';
    }

    // Mobile-sized screen even if not detected as mobile
    if (width < 768) {
        return 'mobile';
    }

    return 'desktop';
};

/**
 * Get device capabilities for performance tuning
 */
export const getDeviceCapabilities = (): DeviceCapabilities => {
    if (typeof window === 'undefined') {
        return {
            type: 'desktop',
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            pixelRatio: 1,
            maxTextureSize: 4096,
            hardwareConcurrency: 4,
            supportsWebGPU: false,
            screenWidth: 1920,
            screenHeight: 1080
        };
    }

    const type = detectDeviceType();

    return {
        type,
        isMobile: type === 'mobile',
        isTablet: type === 'tablet',
        isDesktop: type === 'desktop',
        pixelRatio: window.devicePixelRatio || 1,
        maxTextureSize: getMaxTextureSize(),
        hardwareConcurrency: navigator.hardwareConcurrency || 4,
        supportsWebGPU: 'gpu' in navigator,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
    };
};

/**
 * Get maximum texture size supported by WebGL
 */
const getMaxTextureSize = (): number => {
    if (typeof window === 'undefined') return 4096;

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 4096;
        return (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE) as number;
    } catch {
        return 4096;
    }
};

/**
 * Estimate device performance tier (0-1, higher is better)
 */
export const estimatePerformanceTier = (): number => {
    const caps = getDeviceCapabilities();

    let score = 0;

    // Device type (mobile: 0.3, tablet: 0.5, desktop: 0.7)
    switch (caps.type) {
        case 'mobile':
            score += 0.25;
            break;
        case 'tablet':
            score += 0.45;
            break;
        case 'desktop':
            score += 0.7;
            break;
    }

    // Hardware concurrency
    if (caps.hardwareConcurrency >= 8) {
        score += 0.15;
    } else if (caps.hardwareConcurrency >= 4) {
        score += 0.1;
    } else {
        score += 0.05;
    }

    // Max texture size
    if (caps.maxTextureSize >= 8192) {
        score += 0.1;
    } else if (caps.maxTextureSize >= 4096) {
        score += 0.05;
    }

    // WebGPU support
    if (caps.supportsWebGPU) {
        score += 0.05;
    }

    return Math.min(1, score);
};

/**
 * Recommend quality level based on device capabilities
 */
export const recommendQualityLevel = (): QualityLevel => {
    const tier = estimatePerformanceTier();

    if (tier >= 0.7) {
        return 'high';
    } else if (tier >= 0.45) {
        return 'medium';
    } else {
        return 'low';
    }
};

/**
 * Check if device is running on battery (mobile detection)
 */
export const isRunningOnBattery = (): boolean => {
    if (typeof window === 'undefined') return false;

    const caps = getDeviceCapabilities();
    return caps.isMobile || caps.isTablet;
};
