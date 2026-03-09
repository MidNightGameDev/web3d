import React, { useState } from 'react';
import { buildHierarchy } from '../lib/sceneUtils.js';

function TreeNode({ node, depth, selectedIds, onSelect, onToggleVisibility, onToggleLock, onRename }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const isSelected = selectedIds.includes(node.id);
  const indent = depth * 16;

  const handleDoubleClick = () => {
    if (node.locked) return;
    setEditing(true);
    setEditName(node.name);
  };

  const handleRenameSubmit = () => {
    setEditing(false);
    if (editName.trim() && editName !== node.name) {
      onRename(node.id, editName.trim());
    }
  };

  return (
    <>
      <div
        className={`hierarchy-item ${isSelected ? 'hierarchy-item--selected' : ''} ${node.locked ? 'hierarchy-item--locked' : ''}`}
        style={{ paddingLeft: 8 + indent }}
        onClick={(e) => onSelect(node.id, e.shiftKey)}
        onDoubleClick={handleDoubleClick}
      >
        <span className="hierarchy-item-icon">
          {node.type === 'group' ? '📁' : '◆'}
        </span>

        {editing ? (
          <input
            className="hierarchy-rename-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setEditing(false);
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="hierarchy-item-name">{node.name}</span>
        )}

        <div className="hierarchy-item-actions">
          <button
            className={`hierarchy-action-btn ${node.visible === false ? 'hierarchy-action-btn--off' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(node.id); }}
            title={node.visible === false ? 'Show' : 'Hide'}
          >
            {node.visible === false ? '🚫' : '👁'}
          </button>
          <button
            className={`hierarchy-action-btn ${node.locked ? 'hierarchy-action-btn--on' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleLock(node.id); }}
            title={node.locked ? 'Unlock' : 'Lock'}
          >
            {node.locked ? '🔒' : '🔓'}
          </button>
        </div>
      </div>

      {node.children && node.children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onRename={onRename}
        />
      ))}
    </>
  );
}

export default function HierarchyPanel({
  objects,
  selectedIds,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRename,
  searchQuery,
}) {
  const filtered = searchQuery
    ? objects.filter((o) => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : objects;

  const tree = buildHierarchy(filtered);

  return (
    <div className="hierarchy-panel">
      {tree.length === 0 ? (
        <div className="hierarchy-empty">No objects</div>
      ) : (
        tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onToggleVisibility={onToggleVisibility}
            onToggleLock={onToggleLock}
            onRename={onRename}
          />
        ))
      )}
    </div>
  );
}
