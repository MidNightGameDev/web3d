import React from 'react';

export default function Inspector({ object, onUpdate }) {
  if (!object) {
    return (
      <div className="editor-inspector">
        <div className="no-selection">
          <p>Select an object to view properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (field, value) => {
    onUpdate(object.id, { [field]: value });
  };

  const handleVectorChange = (field, index, value) => {
    const arr = [...(object[field] || [0, 0, 0])];
    arr[index] = parseFloat(value) || 0;
    onUpdate(object.id, { [field]: arr });
  };

  return (
    <div className="editor-inspector">
      <div className="inspector-section">
        <h4>Object</h4>
        <div className="inspector-row">
          <label>Name</label>
          <span className="inspector-value">{object.name}</span>
        </div>
        <div className="inspector-row">
          <label>Type</label>
          <span className="inspector-value inspector-value--capitalize">{object.type}</span>
        </div>
      </div>

      {/* Position */}
      <div className="inspector-section">
        <h4>Position</h4>
        <div className="inspector-label-row">
          <span>X</span><span>Y</span><span>Z</span>
        </div>
        <div className="inspector-transform-inputs">
          {(object.position || [0, 0, 0]).map((v, i) => (
            <input
              key={`pos-${i}`}
              type="number"
              step="0.1"
              value={Number(v).toFixed(2)}
              onChange={(e) => handleVectorChange('position', i, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div className="inspector-section">
        <h4>Rotation (rad)</h4>
        <div className="inspector-label-row">
          <span>X</span><span>Y</span><span>Z</span>
        </div>
        <div className="inspector-transform-inputs">
          {(object.rotation || [0, 0, 0]).map((v, i) => (
            <input
              key={`rot-${i}`}
              type="number"
              step="0.1"
              value={Number(v).toFixed(2)}
              onChange={(e) => handleVectorChange('rotation', i, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* Scale */}
      <div className="inspector-section">
        <h4>Scale</h4>
        <div className="inspector-label-row">
          <span>X</span><span>Y</span><span>Z</span>
        </div>
        <div className="inspector-transform-inputs">
          {(object.scale || [1, 1, 1]).map((v, i) => (
            <input
              key={`scl-${i}`}
              type="number"
              step="0.1"
              value={Number(v).toFixed(2)}
              onChange={(e) => handleVectorChange('scale', i, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* Material */}
      {object.type !== 'gltf' && (
        <div className="inspector-section">
          <h4>Material</h4>
          <div className="inspector-row">
            <label>Color</label>
            <input
              type="color"
              value={object.color || '#FF2FD1'}
              onChange={(e) => handleChange('color', e.target.value)}
            />
          </div>
          <div className="inspector-row">
            <label>Metalness</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={object.metalness ?? 0.1}
              onChange={(e) => handleChange('metalness', parseFloat(e.target.value))}
            />
            <span className="value-label">{(object.metalness ?? 0.1).toFixed(2)}</span>
          </div>
          <div className="inspector-row">
            <label>Roughness</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={object.roughness ?? 0.5}
              onChange={(e) => handleChange('roughness', parseFloat(e.target.value))}
            />
            <span className="value-label">{(object.roughness ?? 0.5).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
