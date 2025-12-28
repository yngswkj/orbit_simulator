import { useSyncExternalStore } from 'react';

type Lang = 'en' | 'ja';

const translations = {
    en: {
        // App
        app_title: 'ORBIT SIMULATOR',
        app_subtitle: 'Interactive N-Body Gravity System',

        // Control Panel
        controls_title: 'CONTROLS',
        simulation_title: 'SIMULATION',
        pause: 'PAUSE',
        resume: 'RESUME',
        reset: 'Reset Simulation',
        load_solar: 'Load Solar System',

        // Toggles
        show_prediction: 'Show Orbit Prediction',
        show_grid: 'Show Grid & Axes',
        show_realistic: 'Show Realistic Textures',
        show_habitable: 'Show Habitable Zone',

        // Camera
        camera_follow: 'Camera Follow',
        free_camera: 'Free Camera (None)',
        stop_following: 'Stop Following',
        camera_mode_free: 'Free Look',
        camera_mode_sun: 'Fixed View (Orbit)',
        camera_mode_surface: 'Fixed View (Surface)',

        // Creator
        new_body_title: 'NEW CELESTIAL BODY',
        mass: 'Mass',
        radius: 'Radius',
        velocity: 'Velocity',
        position: 'Position',
        color: 'Color',
        add_body: 'Add Body',
        add_random: 'Add Random Body',

        // Inspector
        distance_sun: 'Distance to Sun',
        orbital_speed: 'Orbital Speed',
        rotation_speed: 'Rotation Speed',

        // Tour
        tour_welcome: 'Welcome to Orbit Simulator!',
        tour_intro: "Experience the beauty of N-Body physics and celestial mechanics. Let's take a quick tour!",
        tour_panel_title: 'Control Panel',
        tour_panel_content: 'Here you can control the simulation speed, toggle visual aids, and manage celestial bodies.',
        tour_sim_title: 'Simulation Controls',
        tour_sim_content: 'Pause, Resume, or Reset the entire simulation from here.',
        tour_cam_title: 'Camera Focus',
        tour_cam_content: 'Select a planet to follow it automatically.',
        tour_scene_title: 'Interactive Scene',
        tour_scene_content: 'Right-click to Pan. Left-click to Rotate. Scroll to Zoom. Click a planet to inspect.',

        // List
        bodies_list: 'BODIES',
        remove: 'Remove',

        // Common
        name: 'Name',
        cancel: 'Cancel',
        create: 'Create',
        // Help
        help_title: 'Help & Information',
        version: 'Version',
        controls_header: 'Controls',
        changelog_header: 'Changelog',

        // Controls Help
        ctrl_pan: 'Pan',
        ctrl_pan_desc: 'Right Click + Drag',
        ctrl_rotate: 'Rotate',
        ctrl_rotate_desc: 'Left Click + Drag',
        ctrl_zoom: 'Zoom',
        ctrl_zoom_desc: 'Mouse Wheel',
        ctrl_select: 'Select Body',
        ctrl_select_desc: 'Click on planet',

        // Changelog Items
        cl_surface_view: 'Surface View Overhaul (FPS Style)',
        cl_orbit_view: 'Renamed to Orbit Fixed View',
        cl_perf: 'Performance Improvements',
        cl_v0_2_1_title: 'v0.2.1 - Physics & View Update',
        cl_item_surface: 'Surface View Refinement (Orbit Locked, Tangent View)',
        cl_item_perf: 'Performance View (FPS, Physics Time, Energy)',
        cl_item_physics: 'Physics Engine (Collision in GPU/Worker)',

        // New Toggles
        show_multithreading: 'Multithreading (Experimental)',
        show_gpu: 'GPU Acceleration (Beta)',
        show_performance: 'Show Performance View',

        // Performance Stats
        perf_stats: 'Simulation Stats',
        perf_fps: 'FPS',
        perf_mode: 'Mode',
        perf_bodies: 'Bodies',
        perf_physics: 'Physics Time',
        perf_energy: 'Total Energy',
        perf_error: 'Error (Drift)',
        perf_kinetic: 'Kinetic',
        perf_potential: 'Potential',
        calculating: 'Calculating...',

        // Changelog v0.3.0
        cl_v0_3_0_title: 'v0.3.0 - Energy & Hybrid Engine',
        cl_item_energy: 'Energy Monitoring (Kinetic, Potential, Drift)',
        cl_item_hybrid: 'Hybrid Engine (Optimized CPU/Worker/GPU switching)',
        cl_item_cleanup: 'Resource Management (Reduced Memory Leaks)',
    },
    ja: {
        // ... (existing lines)
        // Control Panel
        // ...

        // ...

        // Performance Stats
        perf_stats: 'シミュレーション統計',
        perf_fps: 'FPS',
        perf_mode: '計算モード',
        perf_bodies: '天体数',
        perf_physics: '計算時間',
        perf_energy: '総エネルギー',
        perf_error: '保存誤差',
        perf_kinetic: '運動エネルギー',
        perf_potential: '位置エネルギー',
        calculating: '計算中...',

        // Changelog v0.3.0
        cl_v0_3_0_title: 'v0.3.0 - エネルギー監視とハイブリッドエンジン',
        cl_item_energy: 'エネルギー監視 (運動・位置エネルギー、誤差率)',
        cl_item_hybrid: 'ハイブリッドエンジン (CPU/Worker/GPU の最適化と切替)',
        cl_item_cleanup: 'リソース管理の改善 (メモリリーク低減)',
    }
};

let currentLang: Lang = navigator.language.startsWith('ja') ? 'ja' : 'en';
const listeners = new Set<() => void>();

export const t = (key: keyof typeof translations['en']) => {
    return translations[currentLang][key] || key;
};

export const setLanguage = (lang: Lang) => {
    currentLang = lang;
    listeners.forEach(l => l());
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

export const useTranslation = () => {
    useSyncExternalStore(subscribe, () => currentLang);
    return { t, lang: currentLang, setLanguage };
};
