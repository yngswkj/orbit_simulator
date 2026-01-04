import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { MoreHorizontal } from 'lucide-react';
import './CompactBodySwitcher.css';

interface CompactBodySwitcherProps {
  isOpen: boolean;
  onOpenPanel: () => void;
  onSwitchToBodiesTab: () => void;
}

/**
 * コンパクトな天体切り替えUI
 * パネルが閉じているときのみ表示され、最大10個の天体をアイコンで表示
 */
export const CompactBodySwitcher: React.FC<CompactBodySwitcherProps> = ({
  isOpen,
  onOpenPanel,
  onSwitchToBodiesTab,
}) => {
  const bodies = usePhysicsStore(s => s.bodies);
  const followingBodyId = usePhysicsStore(s => s.followingBodyId);
  const setFollowingBody = usePhysicsStore(s => s.setFollowingBody);
  const zenMode = usePhysicsStore(s => s.zenMode);

  // パネルが開いているかzenModeの場合は非表示
  if (isOpen || zenMode) return null;

  const MAX_VISIBLE_BODIES = 10;
  const visibleBodies = bodies.slice(0, MAX_VISIBLE_BODIES);
  const hasMore = bodies.length > MAX_VISIBLE_BODIES;

  const handleMoreClick = () => {
    onSwitchToBodiesTab();
    onOpenPanel();
  };

  return (
    <div className="compact-body-switcher">
      <div className="compact-body-list">
        {/* フリーカメラボタン */}
        <button
          className={`body-icon ${!followingBodyId ? 'active' : ''}`}
          onClick={() => setFollowingBody(null)}
          title="フリーカメラ"
          aria-label="フリーカメラ"
        >
          <span className="body-indicator" style={{ background: '#666' }}>
            <span className="body-name-short">Fr</span>
          </span>
          <span className="body-label">Free</span>
        </button>

        {/* 天体アイコン（最大10個） */}
        {visibleBodies.map(body => {
          // 天体名の先頭2文字を取得（先頭のみ大文字、2文字目は小文字）
          const shortName = body.name.length >= 2
            ? body.name.charAt(0).toUpperCase() + body.name.charAt(1).toLowerCase()
            : body.name.toUpperCase();

          return (
            <button
              key={body.id}
              className={`body-icon ${followingBodyId === body.id ? 'active' : ''}`}
              onClick={() => setFollowingBody(body.id)}
              title={body.name}
              aria-label={`Follow ${body.name}`}
            >
              <span
                className="body-indicator"
                style={{
                  background: body.color,
                  boxShadow: `0 0 8px ${body.color}`,
                }}
              >
                <span className="body-name-short">{shortName}</span>
              </span>
              <span className="body-label">{body.name}</span>
            </button>
          );
        })}

        {/* More...ボタン（11個以上の場合） */}
        {hasMore && (
          <button
            className="body-icon more-button"
            onClick={handleMoreClick}
            title={`${bodies.length - MAX_VISIBLE_BODIES}個の天体を表示`}
            aria-label="Show more bodies"
          >
            <MoreHorizontal size={16} />
            <span className="body-label">More</span>
          </button>
        )}
      </div>
    </div>
  );
};
