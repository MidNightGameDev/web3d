import React, { useState } from 'react';
import NeonButton from './NeonButton.jsx';
import HierarchyPanel from './HierarchyPanel.jsx';
import { PRIMITIVE_TYPES } from '../lib/sceneUtils.js';

export default function Sidebar({
  onAddObject,
  objects,
  selectedIds,
  onSelectObject,
  onDeleteSelected,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDuplicate,
  onGroup,
  onUngroup,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [primitivesExpanded, setPrimitivesExpanded] = useState(true);

  return (
    <aside className="editor-sidebar">
      {/* Add Objects */}
      <div className="sidebar-section">
        <h4
          className="sidebar-section-toggle"
          onClick={() => setPrimitivesExpanded((v) => !v)}
        >
          {primitivesExpanded ? '▾' : '▸'} Add Object
        </h4>
        {primitivesExpanded && (
          <div className="sidebar-add-btns">
            {PRIMITIVE_TYPES.map((p) => (
              <NeonButton
                key={p.type}
                variant="secondary"
                size="small"
                onClick={() => onAddObject(p.type)}
              >
                {p.label}
              </NeonButton>
            ))}
          </div>
        )}
      </div>

      {/* Scene Actions */}
      <div className="sidebar-section">
        <h4>Actions</h4>
        <div className="sidebar-add-btns">
          <NeonButton
            variant="secondary"
            size="small"
            onClick={onDuplicate}
            disabled={selectedIds.length === 0}
          >
            📋 Duplicate
          </NeonButton>
          <NeonButton
            variant="secondary"
            size="small"
            onClick={onGroup}
            disabled={selectedIds.length < 2}
          >
            📁 Group
          </NeonButton>
          <NeonButton
            variant="secondary"
            size="small"
            onClick={onUngroup}
            disabled={selectedIds.length === 0}
          >
            📂 Ungroup
          </NeonButton>
          <NeonButton
            variant="danger"
            size="small"
            onClick={onDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            🗑 Delete Selected
          </NeonButton>
        </div>
      </div>

      {/* Object Hierarchy */}
      <div className="sidebar-section sidebar-section--grow">
        <h4>Hierarchy ({objects.length})</h4>
        <input
          className="sidebar-search"
          placeholder="Search objects…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <HierarchyPanel
          objects={objects}
          selectedIds={selectedIds}
          onSelect={onSelectObject}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onRename={onRename}
          searchQuery={searchQuery}
        />
      </div>
    </aside>
  );
}
