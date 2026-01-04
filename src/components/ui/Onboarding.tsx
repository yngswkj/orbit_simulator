import React, { useState } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { Button } from './common/Button';
import './Onboarding.css';

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Orbit Simulatorへようこそ',
    description: '惑星軌道シミュレーターで、重力と天体の動きを体験しましょう。基本的な使い方をご紹介します。',
  },
  {
    title: '天体を追加する',
    description: '画面をクリックして新しい天体を追加できます。ドラッグで初速度を設定し、重力の影響を観察しましょう。',
  },
  {
    title: 'カメラ操作',
    description: 'マウスドラッグで視点を回転、ホイールでズーム。天体をクリックして追跡モードに切り替えられます。',
  },
  {
    title: 'シミュレーション制御',
    description: '左パネルで再生/一時停止、時間スケール調整、表示設定の変更ができます。',
  },
  {
    title: 'モード選択',
    description: '初心者モードでは基本機能のみ表示、上級者モードでは全機能にアクセスできます。いつでも切り替え可能です。',
  },
];

export const Onboarding: React.FC = () => {
  const hasSeenOnboarding = usePhysicsStore(s => s.hasSeenOnboarding);
  const setHasSeenOnboarding = usePhysicsStore(s => s.setHasSeenOnboarding);
  const setUserMode = usePhysicsStore(s => s.setUserMode);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'beginner' | 'advanced'>('beginner');

  if (hasSeenOnboarding) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setUserMode(selectedMode);
      setHasSeenOnboarding(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setUserMode('beginner');
    setHasSeenOnboarding(true);
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-modal">
        {/* ヘッダー */}
        <div className="onboarding-header">
          <div className="onboarding-logo">
            <Sparkles size={24} />
            <span>Orbit Simulator</span>
          </div>
          <button
            className="onboarding-close"
            onClick={handleSkip}
            title="スキップ"
          >
            <X size={20} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="onboarding-content">
          <div className="onboarding-step-indicator">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`onboarding-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>

          <h2 className="onboarding-title">{step.title}</h2>
          <p className="onboarding-description">{step.description}</p>

          {/* 最後のステップでモード選択 */}
          {isLastStep && (
            <div className="onboarding-mode-selection">
              <button
                className={`mode-card ${selectedMode === 'beginner' ? 'selected' : ''}`}
                onClick={() => setSelectedMode('beginner')}
              >
                <div className="mode-card-header">
                  <div className="mode-card-icon">🌱</div>
                  <h3>初心者モード</h3>
                </div>
                <p>基本的な機能のみ表示し、シンプルな操作で始められます</p>
                <div className="mode-card-badge">おすすめ</div>
              </button>

              <button
                className={`mode-card ${selectedMode === 'advanced' ? 'selected' : ''}`}
                onClick={() => setSelectedMode('advanced')}
              >
                <div className="mode-card-header">
                  <div className="mode-card-icon">🚀</div>
                  <h3>上級者モード</h3>
                </div>
                <p>全ての機能と詳細設定にアクセスできます</p>
              </button>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="onboarding-footer">
          <Button
            variant="ghost"
            onClick={handlePrev}
            leftIcon={ChevronLeft}
            disabled={isFirstStep}
          >
            戻る
          </Button>

          <div className="onboarding-progress">
            {currentStep + 1} / {ONBOARDING_STEPS.length}
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            rightIcon={!isLastStep ? ChevronRight : undefined}
          >
            {isLastStep ? '始める' : '次へ'}
          </Button>
        </div>
      </div>
    </div>
  );
};
