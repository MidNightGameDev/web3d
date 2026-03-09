import React from 'react';
import NeonButton from './NeonButton.jsx';

export default function SnapControls({ snapEnabled, gridSize, onToggleSnap, onSetGridSize }) {
  return (
    <div className="snap-controls">
      <NeonButton
        variant="secondary"
        size="small"
        active={snapEnabled}
        onClick={onToggleSnap}
        title="Toggle Snap to Grid"
      >
        🧲 Snap
      </NeonButton>
      {snapEnabled && (
        <div className="snap-grid-size">
          <label>Grid</label>
          <select
            value={gridSize}
            onChange={(e) => onSetGridSize(parseFloat(e.target.value))}
            className="snap-select"
          >
            <option value={0.1}>0.1</option>
            <option value={0.25}>0.25</option>
            <option value={0.5}>0.5</option>
            <option value={1}>1.0</option>
            <option value={2}>2.0</option>
          </select>
        </div>
      )}
    </div>
  );
}
