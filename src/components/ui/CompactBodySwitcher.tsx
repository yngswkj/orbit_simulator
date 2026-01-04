import React, { useState } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { ChevronDown } from 'lucide-react';
import './CompactBodySwitcher.css';

/**
 * コンパクトな天体切り替えUI
 * パネルが閉じていても常に表示され、スマホでも使いやすい
 */
export const CompactBodySwitcher: React.FC = () => {
  const bodies = usePhysicsStore(s => s.bodies);
  const followingBodyId = usePhysicsStore(s => s.followingBodyId);
  const setFollowingBody = usePhysicsStore(s => s.setFollowingBody);
  const zenMode = usePhysicsStore(s => s.zenMode);
  const [isExpanded, setIsExpanded] = useState(false);

  if (zenMode) return null;

  const followedBody = bodies.find(b => b.id === followingBodyId);

  return (
    <div className="compact-body-switcher">
      {/* トグルボタン */}
      <button
        className="compact-switcher-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={followedBody ? `Following: ${followedBody.name}` : 'Select a body to follow'}
      >
        {followedBody ? (
          <>
            <span
              className="body-indicator"
              style={{
                background: followedBody.color,
                boxShadow: `0 0 8px ${followedBody.color}`,
              }}
            />
            <span className="body-name">{followedBody.name}</span>
          </>
        ) : (
          <span className="body-name">天体を選択</span>
        )}
        <ChevronDown
          size={16}
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* ドロップダウンリスト */}
      {isExpanded && (
        <>
          <div className="compact-switcher-backdrop" onClick={() => setIsExpanded(false)} />
          <div className="compact-switcher-dropdown">
            <button
              className={`compact-switcher-item ${!followingBodyId ? 'active' : ''}`}
              onClick={() => {
                setFollowingBody(null);
                setIsExpanded(false);
              }}
            >
              <span className="body-indicator" style={{ background: '#666' }} />
              <span>フリーカメラ</span>
            </button>
            {bodies.map(body => (
              <button
                key={body.id}
                className={`compact-switcher-item ${followingBodyId === body.id ? 'active' : ''}`}
                onClick={() => {
                  setFollowingBody(body.id);
                  setIsExpanded(false);
                }}
              >
                <span
                  className="body-indicator"
                  style={{
                    background: body.color,
                    boxShadow: `0 0 6px ${body.color}`,
                  }}
                />
                <span>{body.name}</span>
                {followingBodyId === body.id && (
                  <span className="active-badge">ON</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
