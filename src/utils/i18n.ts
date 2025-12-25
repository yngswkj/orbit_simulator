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
        camera_mode_sun: 'Fixed View (Sun)',
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
    },
    ja: {
        // App
        app_title: 'ORBIT SIMULATOR',
        app_subtitle: '多体重力シミュレーター',

        // Control Panel
        controls_title: 'コントロール',
        simulation_title: 'シミュレーション',
        pause: '一時停止',
        resume: '再開',
        reset: 'リセット',
        load_solar: '太陽系をロード',

        // Toggles
        show_prediction: '軌道予測線を表示 (重い)',
        show_grid: 'グリッドと座標軸',
        show_realistic: 'リアルなテクスチャ',
        show_habitable: 'ハビタブルゾーン',

        // Camera
        camera_follow: 'カメラ追従',
        free_camera: 'フリーカメラ (なし)',
        stop_following: '追従を解除',
        camera_mode_free: 'フリールック',
        camera_mode_sun: '視点固定（太陽）',
        camera_mode_surface: '視点固定（地表）',

        // Creator
        new_body_title: '新規天体作成',
        mass: '質量',
        radius: '半径',
        velocity: '速度',
        position: '位置',
        color: '色',
        add_body: '天体を追加',
        add_random: 'ランダムな天体を追加',

        // Inspector
        distance_sun: '太陽からの距離',
        orbital_speed: '公転速度',
        rotation_speed: '自転速度',

        // Tour
        tour_welcome: 'Orbit Simulatorへようこそ！',
        tour_intro: 'N体シミュレーションと天体力学の美しさを体験してください。簡単なツアーにご案内します！',
        tour_panel_title: 'コントロールパネル',
        tour_panel_content: 'ここではシミュレーション速度の調整、グリッド表示の切り替え、天体の管理ができます。',
        tour_sim_title: 'シミュレーション操作',
        tour_sim_content: 'シミュレーションの一時停止、再開、リセットがここから行えます。',
        tour_cam_title: 'カメラフォーカス',
        tour_cam_content: '惑星を選択すると、自動的にカメラが追従します。',
        tour_scene_title: 'インタラクティブな操作',
        tour_scene_content: '右ドラッグで移動、左ドラッグで回転、ホイールでズーム。惑星をクリックで詳細表示。',

        // List
        bodies_list: '天体リスト',
        remove: '削除',

        // Common
        name: '名前',
        cancel: 'キャンセル',
        create: '作成',
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
