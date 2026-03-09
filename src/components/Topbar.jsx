import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import NeonButton from './NeonButton.jsx';
import ViewModeSelector from './ViewModeSelector.jsx';
import SnapControls from './SnapControls.jsx';

export default function Topbar({
  onBack,
  saveFlash,
  transformMode,
  onSetTransformMode,
  onUndo,
  onRedo,
  onSave,
  onImportGLB,
  onExportJSON,
  onExportGLB,
  canUndo,
  canRedo,
  sceneName,
  isSaved,
  sidebarOpen,
  inspectorOpen,
  onToggleSidebar,
  onToggleInspector,
  viewMode,
  onSetViewMode,
  snapEnabled,
  gridSize,
  onToggleSnap,
  onSetGridSize,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onResetTransform,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImportGLB(file);
      e.target.value = '';
    }
  };

  return (
    <div className="editor-topbar">
      <Link to="/market" className="btn" style={{ marginLeft: 8, marginRight: 8 }}>
        Market
      </Link>
      <span className="header-logo topbar-logo">⬡ Neon3D</span>

      {/* Saved/Unsaved indicator with flash support */}
      <span className={`save-status ${isSaved ? 'save-status--saved' : 'save-status--unsaved'}`}>
        {saveFlash ? '✓ Saved!' : isSaved ? '● Saved' : '○ Unsaved'}
      </span>

      <div className="divider" />

      {/* Panel toggles */}
      <NeonButton variant="secondary" size="small" active={sidebarOpen} onClick={onToggleSidebar} title="Toggle Sidebar">
        ☰
      </NeonButton>
      <NeonButton variant="secondary" size="small" active={inspectorOpen} onClick={onToggleInspector} title="Toggle Inspector">
        ⚙
      </NeonButton>

      <div className="divider" />

      {/* Transform modes */}
      <NeonButton variant="secondary" size="small" active={transformMode === 'translate'} onClick={() => onSetTransformMode('translate')} title="Move (W)">
        ↔ Move
      </NeonButton>
      <NeonButton variant="secondary" size="small" active={transformMode === 'rotate'} onClick={() => onSetTransformMode('rotate')} title="Rotate (E)">
        ⟳ Rotate
      </NeonButton>
      <NeonButton variant="secondary" size="small" active={transformMode === 'scale'} onClick={() => onSetTransformMode('scale')} title="Scale (R)">
        ⤡ Scale
      </NeonButton>

      <div className="divider" />

      {/* Snap */}
      <SnapControls
        snapEnabled={snapEnabled}
        gridSize={gridSize}
        onToggleSnap={onToggleSnap}
        onSetGridSize={onSetGridSize}
      />

      <div className="divider" />

      {/* View modes */}
      <ViewModeSelector viewMode={viewMode} onSetViewMode={onSetViewMode} />

      <div className="divider" />

      {/* Selection tools */}
      <NeonButton variant="secondary" size="small" onClick={onSelectAll} title="Select All (Ctrl+A)">
        ☑ All
      </NeonButton>
      <NeonButton variant="secondary" size="small" onClick={onDeselectAll} title="Deselect (Esc)">
        ☐ None
      </NeonButton>
      <NeonButton variant="secondary" size="small" onClick={onInvertSelection} title="Invert">
        ⇔
      </NeonButton>
      <NeonButton variant="secondary" size="small" onClick={onResetTransform} title="Reset Transform">
        ⊙
      </NeonButton>

      <div className="divider" />

      {/* Undo / Redo */}
      <NeonButton variant="secondary" size="small" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        ↩ Undo
      </NeonButton>
      <NeonButton variant="secondary" size="small" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        ↪ Redo
      </NeonButton>

      <div className="divider" />

      {/* Import */}
      <NeonButton variant="secondary" size="small" onClick={() => fileInputRef.current?.click()} title="Import GLB/GLTF">
        📥 Import
      </NeonButton>
      <input ref={fileInputRef} type="file" accept=".glb,.gltf" hidden onChange={handleFileChange} />

      {/* Export */}
      <NeonButton variant="secondary" size="small" onClick={onExportJSON} title="Export as JSON">
        📤 JSON
      </NeonButton>
      <NeonButton variant="secondary" size="small" onClick={onExportGLB} title="Export as GLB">
        📦 GLB
      </NeonButton>

      {/* Save */}
      <NeonButton variant="primary" size="small" onClick={onSave}>
        💾 Save
      </NeonButton>
    </div>
  );
}
