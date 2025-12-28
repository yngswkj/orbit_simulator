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
        perf_energy: 'Energy',
        calculating: 'Calculating...',
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
        load_solar: '太陽系に移動',

        // Toggles
        show_prediction: '軌道予測線を表示',
        show_grid: 'グリッドを表示',
        show_realistic: 'リアルな表示 (スケール調整)',
        show_habitable: 'ハビタブルゾーンを表示',

        // Camera
        camera_follow: 'カメラ追従',
        free_camera: '追従なし',
        stop_following: '追従を解除',
        camera_mode_free: 'フリー視点',
        camera_mode_sun: '公転固定視点',
        camera_mode_surface: '地表視点',

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

        // Help
        help_title: 'ヘルプと情報',
        version: 'バージョン',
        controls_header: '操作方法',
        changelog_header: '更新履歴',

        // Controls Help
        ctrl_pan: '視点移動 (Pan)',
        ctrl_pan_desc: '右クリック + ドラッグ',
        ctrl_rotate: '回転 (Rotate)',
        ctrl_rotate_desc: '左クリック + ドラッグ',
        ctrl_zoom: 'ズーム (Zoom)',
        ctrl_zoom_desc: 'マウスホイール',
        ctrl_select: '天体選択',
        ctrl_select_desc: '惑星をクリック',

        // Changelog Items
        cl_surface_view: '地表視点の刷新 (FPSスタイル)',
        cl_orbit_view: '公転固定視点への名称変更',
        cl_perf: 'パフォーマンス改善',
        cl_v0_2_1_title: 'v0.2.1 - 物理演算と視点の強化',
        cl_item_surface: '地表視点の改善 (公転固定、進行方向への整列、UX向上)',
        cl_item_perf: 'パフォーマンスビュー (FPS, 計算時間, 総エネルギー)',
        cl_item_physics: '物理エンジンの強化 (GPU/Workerでの衝突判定)',

        // New Toggles
        show_multithreading: 'マルチスレッド計算 (実験的)',
        show_gpu: 'GPUアクセラレーション (ベータ)',
        show_performance: 'パフォーマンス情報を表示',

        // Performance Stats
        perf_stats: 'シミュレーション統計',
        perf_fps: 'FPS',
        perf_mode: '計算モード',
        perf_bodies: '天体数',
        perf_physics: '計算時間',
        perf_energy: '総エネルギー',
        calculating: '計算中...',
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
