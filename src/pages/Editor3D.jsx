import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import Topbar from '../components/Topbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Inspector from '../components/Inspector.jsx';
import ThreeScene from '../lib/ThreeScene.jsx';
import {
  createDefaultObject,
  toggleSelection,
  selectAll,
  deselectAll,
  invertSelection,
  resetTransform,
  copyTransform,
  pasteTransform,
  duplicateObjects,
  createGroup,
  ungroupObjects,
} from '../lib/sceneUtils.js';
import { updateScene, getProject } from '../lib/store.js';

/* ─── Count User Meshes (exclude groups) ─── */
function countUserMeshes(objects) {
  return objects.filter((obj) => obj.type !== 'group').length;
}

/* ─── Undo / Redo hook ─── */
function useHistory(initial) {
  const [history, setHistory] = useState([initial]);
  const [pointer, setPointer] = useState(0);
  const current = history[pointer];

  const pushState = useCallback(
    (newState) => {
      setHistory((prev) => [...prev.slice(0, pointer + 1), newState]);
      setPointer((p) => p + 1);
    },
    [pointer]
  );
  const undo = useCallback(() => setPointer((p) => Math.max(0, p - 1)), []);
  const redo = useCallback(() => setPointer((p) => Math.min(history.length - 1, p + 1)), [history.length]);

  return { current, pushState, undo, redo, canUndo: pointer > 0, canRedo: pointer < history.length - 1 };
}

/* ─── Counter for naming ─── */
let objectCounter = 1;

/* ═══════════════ EDITOR3D ═══════════════ */
export default function Editor3D({ readOnly = false }) {
  const { projectId, sceneId } = useParams();
  const navigate = useNavigate();

  const { current: objects, pushState, undo, redo, canUndo, canRedo } = useHistory([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!projectId || !sceneId) return;
      const project = await getProject(projectId);
      if (project) {
        const scene = project.scenes?.find(s => s.id === sceneId);
        if (scene && scene.data && scene.data.objects) {
          pushState(scene.data.objects);
        }
      }
      setIsLoaded(true);
    }
    loadData();
  }, [projectId, sceneId, pushState]);

  // Selection (array of IDs for multi-select)
  const [selectedIds, setSelectedIds] = useState([]);
  // Transform
  const [transformMode, setTransformMode] = useState('translate');
  // View
  const [viewMode, setViewMode] = useState('solid');
  // Panels
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  // Snap
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(1);
  // Save tracking
  const [isSaved, setIsSaved] = useState(true);
  const [saveFlash, setSaveFlash] = useState(false);
  const lastSavedRef = useRef(JSON.stringify([]));
  // Clipboard for copy/paste transform
  const [clipboard, setClipboard] = useState(null);

  const selectedObjects = useMemo(
    () => objects.filter((o) => selectedIds.includes(o.id)),
    [objects, selectedIds]
  );
  const primarySelected = selectedObjects[0] || null;

  /* ─── Scene name ─── */
  const sceneName = useMemo(() => {
    try {
      const projects = JSON.parse(localStorage.getItem('projects')) || [];
      const proj = projects.find((p) => p.id === projectId);
      return proj?.scenes?.find((s) => s.id === sceneId)?.name || 'Untitled';
    } catch {
      return 'Untitled';
    }
  }, [projectId, sceneId]);

  /* ─── Track saved/unsaved ─── */
  useEffect(() => {
    const current = JSON.stringify(objects);
    setIsSaved(current === lastSavedRef.current);
  }, [objects]);

  /* ─────── Object CRUD ─────── */
  const handleAddObject = useCallback(
    (type) => {
      if (readOnly) return;
      objectCounter++;
      const obj = createDefaultObject(type, objectCounter);
      pushState([...objects, obj]);
      setSelectedIds([obj.id]);
    },
    [objects, pushState, readOnly]
  );

  const handleDeleteSelected = useCallback(() => {
    if (readOnly || selectedIds.length === 0) return;
    const set = new Set(selectedIds);
    pushState(objects.filter((o) => !set.has(o.id)));
    setSelectedIds([]);
  }, [objects, selectedIds, pushState, readOnly]);

  /* ─────── Selection ─────── */
  const handleSelectObject = useCallback(
    (id, isShift) => {
      const obj = objects.find((o) => o.id === id);
      if (obj && obj.locked) return;
      if (isShift) {
        setSelectedIds((prev) => toggleSelection(prev, id));
      } else {
        setSelectedIds([id]);
      }
    },
    [objects]
  );

  const handleDeselectAll = useCallback(() => setSelectedIds([]), []);
  const handleSelectAll = useCallback(() => setSelectedIds(selectAll(objects)), [objects]);
  const handleInvertSelection = useCallback(
    () => setSelectedIds(invertSelection(objects, selectedIds)),
    [objects, selectedIds]
  );

  /* ─────── Update / Transform ─────── */
  const handleUpdateObject = useCallback(
    (id, updates) => {
      pushState(objects.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    },
    [objects, pushState]
  );

  const handleTransformEnd = useCallback(
    (id, transforms) => {
      if (readOnly) return;
      pushState(objects.map((o) => (o.id === id ? { ...o, ...transforms } : o)));
    },
    [objects, pushState, readOnly]
  );

  const handleResetTransform = useCallback(() => {
    if (selectedIds.length === 0) return;
    const set = new Set(selectedIds);
    pushState(objects.map((o) => (set.has(o.id) ? resetTransform(o) : o)));
  }, [objects, selectedIds, pushState]);

  /* ─────── Scene Management ─────── */
  const handleToggleVisibility = useCallback(
    (id) => {
      pushState(objects.map((o) =>
        o.id === id ? { ...o, visible: o.visible === false ? true : false } : o
      ));
    },
    [objects, pushState]
  );

  const handleToggleLock = useCallback(
    (id) => {
      pushState(objects.map((o) => (o.id === id ? { ...o, locked: !o.locked } : o)));
    },
    [objects, pushState]
  );

  const handleRename = useCallback(
    (id, newName) => {
      pushState(objects.map((o) => (o.id === id ? { ...o, name: newName } : o)));
    },
    [objects, pushState]
  );

  const handleDuplicate = useCallback(() => {
    if (selectedIds.length === 0) return;
    const { copies } = duplicateObjects(objects, selectedIds);
    pushState([...objects, ...copies]);
    setSelectedIds(copies.map((c) => c.id));
  }, [objects, selectedIds, pushState]);

  const handleGroup = useCallback(() => {
    if (selectedIds.length < 2) return;
    objectCounter++;
    const newObjects = createGroup(selectedIds, objects, objectCounter);
    pushState(newObjects);
  }, [objects, selectedIds, pushState]);

  const handleUngroup = useCallback(() => {
    selectedIds.forEach((id) => {
      const obj = objects.find((o) => o.id === id);
      if (obj && obj.type === 'group') {
        const newObjects = ungroupObjects(id, objects);
        pushState(newObjects);
      }
    });
  }, [objects, selectedIds, pushState]);

  /* ─────── Import GLB ─────── */
  const handleImportGLB = useCallback(
    (file) => {
      objectCounter++;
      const url = URL.createObjectURL(file);
      const obj = {
        ...createDefaultObject('gltf', objectCounter),
        name: file.name.replace(/\.(glb|gltf)$/i, ''),
        position: [0, 0, 0],
        gltfUrl: url,
      };
      pushState([...objects, obj]);
      setSelectedIds([obj.id]);
    },
    [objects, pushState]
  );

  /* ─────── Save ─────── */

  // utility to count scene objects (could inspect three scene too if needed)
  // here our `objects` state already holds user-added meshes
  const countSceneObjects = (objs) => objs.length;

  const handleBack = useCallback(() => {
    if (!isSaved) {
      const ok = window.confirm("คุณยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?");
      if (!ok) return;
    }
    navigate(readOnly ? "/market" : `/projects/${projectId}`);
  }, [isSaved, navigate, projectId, readOnly]);

  // warn when closing/refreshing with unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (isSaved) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isSaved]);
  const handleSave = useCallback(async () => {
    if (readOnly) return;
    const saveable = objects.map((o) => {
      if (o.type === 'gltf') {
        const { gltfUrl, ...rest } = o;
        return rest;
      }
      return o;
    });

    const count = countUserMeshes(objects);

    try {
      await updateScene(projectId, sceneId, {
        objectCount: count,
        data: { objects: saveable }
      });
      lastSavedRef.current = JSON.stringify(objects);
      setIsSaved(true);
      setSaveFlash(true);
      window.setTimeout(() => setSaveFlash(false), 1200);
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed!");
    }
  }, [objects, projectId, sceneId, readOnly]);

  /* ─────── Export JSON ─────── */
  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify(objects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sceneName || 'scene'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [objects, sceneName]);

  /* ─────── Export GLB ─────── */
  const handleExportGLB = useCallback(async () => {
    try {
      const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
      const scene = new THREE.Scene();
      objects.forEach((obj) => {
        if (obj.type === 'group' || obj.type === 'gltf') return;
        let geom;
        switch (obj.type) {
          case 'sphere': geom = new THREE.SphereGeometry(0.5, 32, 32); break;
          case 'cylinder': geom = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); break;
          case 'plane': geom = new THREE.PlaneGeometry(2, 2); break;
          case 'cone': geom = new THREE.ConeGeometry(0.5, 1, 32); break;
          case 'torus': geom = new THREE.TorusGeometry(0.4, 0.15, 16, 48); break;
          case 'capsule': geom = new THREE.CapsuleGeometry(0.3, 0.6, 8, 16); break;
          case 'icosphere': geom = new THREE.IcosahedronGeometry(0.5, 2); break;
          default: geom = new THREE.BoxGeometry(1, 1, 1); break;
        }
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obj.color || '#FF2FD1'),
          metalness: obj.metalness ?? 0.1,
          roughness: obj.roughness ?? 0.5,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.name = obj.name;
        mesh.position.set(...(obj.position || [0, 0, 0]));
        mesh.rotation.set(...(obj.rotation || [0, 0, 0]));
        mesh.scale.set(...(obj.scale || [1, 1, 1]));
        scene.add(mesh);
      });
      const exporter = new GLTFExporter();
      exporter.parse(scene, (result) => {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sceneName || 'scene'}.glb`;
        a.click();
        URL.revokeObjectURL(url);
      }, (error) => { console.error('GLB export error:', error); }, { binary: true });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed — see console.');
    }
  }, [objects, sceneName]);

  /* ─────── Keyboard shortcuts ─────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      const key = e.key.toLowerCase();

      // Transform modes
      if (key === 'w') setTransformMode('translate');
      else if (key === 'e') setTransformMode('rotate');
      else if (key === 'r') setTransformMode('scale');

      // Delete
      else if (e.key === 'Delete' && selectedIds.length > 0) handleDeleteSelected();

      // Undo / Redo
      else if (e.ctrlKey && key === 'z') { e.preventDefault(); undo(); }
      else if (e.ctrlKey && key === 'y') { e.preventDefault(); redo(); }

      // Select all
      else if (e.ctrlKey && key === 'a') { e.preventDefault(); handleSelectAll(); }

      // Duplicate
      else if (e.ctrlKey && key === 'd') { e.preventDefault(); handleDuplicate(); }

      // Deselect
      else if (key === 'escape') handleDeselectAll();

      // Hide
      else if (key === 'h' && selectedIds.length > 0) {
        selectedIds.forEach((id) => handleToggleVisibility(id));
      }

      // Copy/Paste transform
      else if (e.ctrlKey && key === 'c' && primarySelected) {
        setClipboard(copyTransform(primarySelected));
      }
      else if (e.ctrlKey && key === 'v' && clipboard && primarySelected) {
        handleUpdateObject(primarySelected.id, clipboard);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    selectedIds, primarySelected, clipboard,
    handleDeleteSelected, handleSelectAll, handleDeselectAll,
    handleDuplicate, handleToggleVisibility, handleUpdateObject,
    undo, redo,
  ]);

  /* ─────── Render ─────── */
  return (
    <div className="editor-layout">
      <Topbar
        onBack={handleBack}
        saveFlash={saveFlash}
        transformMode={transformMode}
        onSetTransformMode={setTransformMode}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onImportGLB={handleImportGLB}
        onExportJSON={handleExportJSON}
        onExportGLB={handleExportGLB}
        canUndo={canUndo}
        canRedo={canRedo}
        sceneName={sceneName}
        isSaved={isSaved}
        sidebarOpen={sidebarOpen}
        inspectorOpen={inspectorOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onToggleInspector={() => setInspectorOpen((v) => !v)}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        snapEnabled={snapEnabled}
        gridSize={gridSize}
        onToggleSnap={() => setSnapEnabled((v) => !v)}
        onSetGridSize={setGridSize}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onInvertSelection={handleInvertSelection}
        onResetTransform={handleResetTransform}
      />

      <div className="editor-body">
        {!isLoaded && <div className="p-loader" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 1000, color: '#fff' }}>Loading Scene...</div>}
        {!readOnly && sidebarOpen && (
          <Sidebar
            onAddObject={handleAddObject}
            objects={objects}
            selectedIds={selectedIds}
            onSelectObject={handleSelectObject}
            onDeleteSelected={handleDeleteSelected}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onGroup={handleGroup}
            onUngroup={handleUngroup}
          />
        )}

        <div className="editor-viewport">
          <ThreeScene
            objects={objects}
            selectedIds={selectedIds}
            transformMode={transformMode}
            viewMode={viewMode}
            snapEnabled={snapEnabled}
            gridSize={gridSize}
            onSelectObject={handleSelectObject}
            onDeselectAll={handleDeselectAll}
            onTransformEnd={handleTransformEnd}
          />
        </div>

        {!readOnly && inspectorOpen && (
          <Inspector object={primarySelected} onUpdate={handleUpdateObject} />
        )}
      </div>
    </div>
  );
}
