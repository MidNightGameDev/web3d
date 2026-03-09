import React from 'react';
import { VIEW_MODES } from '../lib/sceneUtils.js';
import NeonButton from './NeonButton.jsx';

export default function ViewModeSelector({ viewMode, onSetViewMode }) {
  return (
    <div className="view-mode-selector">
      {VIEW_MODES.map((mode) => (
        <NeonButton
          key={mode.key}
          variant="secondary"
          size="small"
          active={viewMode === mode.key}
          onClick={() => onSetViewMode(mode.key)}
          title={mode.label}
        >
          {mode.icon} {mode.label}
        </NeonButton>
      ))}
    </div>
  );
}
