/**
 * sceneUtils.js — Selection helpers, transform utils, snap logic
 * Pure JS (no JSX) — utility functions for the 3D editor.
 */

/* ─────────── Primitive Defaults ─────────── */
export const PRIMITIVE_TYPES = [
  { type: 'cube',       label: '▣ Cube',       icon: '▣' },
  { type: 'sphere',     label: '● Sphere',     icon: '●' },
  { type: 'cylinder',   label: '▮ Cylinder',   icon: '▮' },
  { type: 'plane',      label: '◻ Plane',      icon: '◻' },
  { type: 'cone',       label: '△ Cone',       icon: '△' },
  { type: 'torus',      label: '◎ Torus',      icon: '◎' },
  { type: 'capsule',    label: '⬮ Capsule',    icon: '⬮' },
  { type: 'icosphere',  label: '◆ Icosphere',  icon: '◆' },
  { type: 'gridmesh',   label: '▦ Grid Mesh',  icon: '▦' },
];

export function createDefaultObject(type, index) {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    type,
    name: `${label}_${index}`,
    position: [0, 0.5, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: '#FF2FD1',
    metalness: 0.1,
    roughness: 0.5,
    visible: true,
    locked: false,
    parentId: null,
  };
}

/* ─────────── Selection Helpers ─────────── */

/** Toggle id in selection set (for shift-click multi-select) */
export function toggleSelection(selectedIds, id) {
  const set = new Set(selectedIds);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  return [...set];
}

/** Select all object ids */
export function selectAll(objects) {
  return objects.filter((o) => !o.locked).map((o) => o.id);
}

/** Deselect all */
export function deselectAll() {
  return [];
}

/** Invert selection */
export function invertSelection(objects, selectedIds) {
  const set = new Set(selectedIds);
  return objects.filter((o) => !o.locked && !set.has(o.id)).map((o) => o.id);
}

/* ─────────── Transform Utilities ─────────── */

/** Snap a value to the nearest grid step */
export function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

/** Snap a [x,y,z] array */
export function snapVectorToGrid(vec, gridSize) {
  return vec.map((v) => snapToGrid(v, gridSize));
}

/** Reset position/rotation/scale to defaults */
export function resetTransform(obj) {
  return {
    ...obj,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };
}

/** Copy transform values from object */
export function copyTransform(obj) {
  return {
    position: [...obj.position],
    rotation: [...obj.rotation],
    scale: [...obj.scale],
  };
}

/** Paste transform values onto object */
export function pasteTransform(obj, transform) {
  return { ...obj, ...transform };
}

/** Freeze transform (keep visual position, reset stored values) */
export function freezeTransform(obj) {
  return {
    ...obj,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };
}

/* ─────────── Scene Management ─────────── */

/** Duplicate objects, returning new copies with unique IDs */
export function duplicateObjects(objects, ids) {
  const copies = [];
  const idMap = {};
  ids.forEach((id) => {
    const original = objects.find((o) => o.id === id);
    if (!original) return;
    const newId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    idMap[id] = newId;
    copies.push({
      ...original,
      id: newId,
      name: `${original.name}_copy`,
      position: [
        original.position[0] + 1,
        original.position[1],
        original.position[2],
      ],
    });
  });
  return { copies, idMap };
}

/** Group objects under a new group node */
export function createGroup(selectedIds, objects, groupIndex) {
  const groupId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const group = {
    id: groupId,
    type: 'group',
    name: `Group_${groupIndex}`,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    locked: false,
    parentId: null,
  };
  const updated = objects.map((o) =>
    selectedIds.includes(o.id) ? { ...o, parentId: groupId } : o
  );
  return [group, ...updated];
}

/** Ungroup: remove parent reference from children */
export function ungroupObjects(groupId, objects) {
  return objects
    .filter((o) => o.id !== groupId || o.type !== 'group')
    .map((o) => (o.parentId === groupId ? { ...o, parentId: null } : o));
}

/** Build hierarchy tree from flat objects list */
export function buildHierarchy(objects) {
  const roots = [];
  const childMap = {};

  objects.forEach((obj) => {
    if (!childMap[obj.id]) childMap[obj.id] = [];
  });

  objects.forEach((obj) => {
    if (obj.parentId && childMap[obj.parentId]) {
      childMap[obj.parentId].push(obj);
    } else {
      roots.push(obj);
    }
  });

  function buildNode(obj) {
    return {
      ...obj,
      children: (childMap[obj.id] || []).map(buildNode),
    };
  }

  return roots.map(buildNode);
}

/* ─────────── View Modes ─────────── */
export const VIEW_MODES = [
  { key: 'solid',    label: 'Solid',    icon: '◼' },
  { key: 'wireframe',label: 'Wireframe',icon: '◻' },
  { key: 'material', label: 'Material', icon: '◉' },
  { key: 'xray',     label: 'X-Ray',   icon: '✦' },
];
