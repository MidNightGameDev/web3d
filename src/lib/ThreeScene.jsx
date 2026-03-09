import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ─────── Geometry by type ─────── */
function ObjectGeometry({ type }) {
  switch (type) {
    case 'sphere':
      return <sphereGeometry args={[0.5, 32, 32]} />;
    case 'cylinder':
      return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
    case 'plane':
      return <planeGeometry args={[2, 2, 1, 1]} />;
    case 'cone':
      return <coneGeometry args={[0.5, 1, 32]} />;
    case 'torus':
      return <torusGeometry args={[0.4, 0.15, 16, 48]} />;
    case 'capsule':
      return <capsuleGeometry args={[0.3, 0.6, 8, 16]} />;
    case 'icosphere':
      return <icosahedronGeometry args={[0.5, 2]} />;
    case 'gridmesh':
      return <planeGeometry args={[2, 2, 10, 10]} />;
    case 'cube':
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}

/* ─────── Single mesh object ─────── */
function SceneObject({
  data,
  isSelected,
  viewMode,
  onSelect,
  transformMode,
  onTransformEnd,
  snapEnabled,
  gridSize,
}) {
  const meshRef = useRef();
  const transformRef = useRef();
  const orbitRef = useThree((state) => state.controls);

  // Apply initial transform
  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.set(...(data.position || [0, 0, 0]));
    meshRef.current.rotation.set(...(data.rotation || [0, 0, 0]));
    meshRef.current.scale.set(...(data.scale || [1, 1, 1]));
  }, [data.position, data.rotation, data.scale]);

  // Transform controls drag handling
  useEffect(() => {
    if (!transformRef.current) return;
    const tc = transformRef.current;
    const onDrag = (event) => {
      if (orbitRef) orbitRef.enabled = !event.value;
      if (!event.value && meshRef.current) {
        let pos = meshRef.current.position.toArray();
        if (snapEnabled && transformMode === 'translate') {
          pos = pos.map((v) => Math.round(v / gridSize) * gridSize);
          meshRef.current.position.set(...pos);
        }
        onTransformEnd(data.id, {
          position: meshRef.current.position.toArray(),
          rotation: [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z],
          scale: meshRef.current.scale.toArray(),
        });
      }
    };
    tc.addEventListener('dragging-changed', onDrag);
    return () => tc.removeEventListener('dragging-changed', onDrag);
  }, [isSelected, orbitRef, data.id, onTransformEnd, snapEnabled, gridSize, transformMode]);

  if (data.visible === false) return null;

  const isWireframe = viewMode === 'wireframe';
  const isXray = viewMode === 'xray';

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data.id, e.nativeEvent.shiftKey);
        }}
      >
        <ObjectGeometry type={data.type} />
        <meshStandardMaterial
          color={data.color || '#FF2FD1'}
          metalness={data.metalness ?? 0.1}
          roughness={data.roughness ?? 0.5}
          wireframe={isWireframe}
          transparent={isXray || isSelected}
          opacity={isXray ? 0.4 : 1}
          emissive={isSelected ? '#FF2FD1' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      {isSelected && meshRef.current && (
        <TransformControls
          ref={transformRef}
          object={meshRef.current}
          mode={transformMode}
          size={0.6}
          translationSnap={snapEnabled ? gridSize : null}
          rotationSnap={snapEnabled ? THREE.MathUtils.degToRad(15) : null}
          scaleSnap={snapEnabled ? 0.1 : null}
        />
      )}
    </>
  );
}

/* ─────── GLTF imported model ─────── */
function GLTFObject({ data, isSelected, onSelect, transformMode, onTransformEnd, snapEnabled, gridSize }) {
  const groupRef = useRef();
  const transformRef = useRef();
  const [scene, setScene] = useState(null);
  const orbitRef = useThree((state) => state.controls);

  useEffect(() => {
    if (data.gltfUrl) {
      const loader = new GLTFLoader();
      loader.load(data.gltfUrl, (gltf) => setScene(gltf.scene.clone()));
    }
  }, [data.gltfUrl]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(...(data.position || [0, 0, 0]));
    groupRef.current.rotation.set(...(data.rotation || [0, 0, 0]));
    groupRef.current.scale.set(...(data.scale || [1, 1, 1]));
  }, [data.position, data.rotation, data.scale]);

  useEffect(() => {
    if (!transformRef.current) return;
    const tc = transformRef.current;
    const onDrag = (event) => {
      if (orbitRef) orbitRef.enabled = !event.value;
      if (!event.value && groupRef.current) {
        onTransformEnd(data.id, {
          position: groupRef.current.position.toArray(),
          rotation: [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z],
          scale: groupRef.current.scale.toArray(),
        });
      }
    };
    tc.addEventListener('dragging-changed', onDrag);
    return () => tc.removeEventListener('dragging-changed', onDrag);
  }, [isSelected, orbitRef, data.id, onTransformEnd]);

  if (!scene || data.visible === false) return null;

  return (
    <>
      <primitive
        ref={groupRef}
        object={scene}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data.id, e.nativeEvent.shiftKey);
        }}
      />
      {isSelected && groupRef.current && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
          mode={transformMode}
          size={0.6}
        />
      )}
    </>
  );
}

/* ─────── Focus-on-selected helper ─────── */
function FocusHelper({ selectedIds, objects }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!controls || selectedIds.length === 0) return;
    // Listen for 'F' key to focus
    const handleFocus = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const obj = objects.find((o) => o.id === selectedIds[0]);
        if (obj) {
          const pos = new THREE.Vector3(...(obj.position || [0, 0, 0]));
          controls.target.copy(pos);
          controls.update();
        }
      }
    };
    window.addEventListener('keydown', handleFocus);
    return () => window.removeEventListener('keydown', handleFocus);
  }, [selectedIds, objects, camera, controls]);

  return null;
}

/* ─────── Main ThreeScene ─────── */
export default function ThreeScene({
  objects,
  selectedIds,
  transformMode,
  viewMode,
  snapEnabled,
  gridSize,
  onSelectObject,
  onDeselectAll,
  onTransformEnd,
}) {
  // Only show transform controls on the first selected object
  const primarySelectedId = selectedIds.length > 0 ? selectedIds[0] : null;

  return (
    <Canvas
      camera={{ position: [5, 4, 5], fov: 50 }}
      gl={{ antialias: true }}
      onPointerMissed={onDeselectAll}
    >
      {/* Scene background */}
      <color attach="background" args={['#13131f']} />
      <fog attach="fog" args={['#13131f', 25, 65]} />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.6} />
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#FF2FD1" />

      {/* Grid */}
      <Grid
        infiniteGrid
        cellSize={snapEnabled ? gridSize : 1}
        sectionSize={5}
        cellColor="#3a3a5e"
        sectionColor="#6a5acd"
        fadeDistance={35}
        cellThickness={0.8}
        sectionThickness={1.5}
      />

      {/* Orbit controls */}
      <OrbitControls makeDefault enableDamping dampingFactor={0.12} />

      {/* Gizmo */}
      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport labelColor="white" axisHeadScale={0.8} />
      </GizmoHelper>

      {/* Focus helper */}
      <FocusHelper selectedIds={selectedIds} objects={objects} />

      {/* Scene objects */}
      {objects.map((obj) =>
        obj.type === 'group' ? null :
        obj.type === 'gltf' ? (
          <GLTFObject
            key={obj.id}
            data={obj}
            isSelected={selectedIds.includes(obj.id)}
            onSelect={onSelectObject}
            transformMode={transformMode}
            onTransformEnd={onTransformEnd}
            snapEnabled={snapEnabled}
            gridSize={gridSize}
          />
        ) : (
          <SceneObject
            key={obj.id}
            data={obj}
            isSelected={obj.id === primarySelectedId}
            viewMode={viewMode}
            onSelect={onSelectObject}
            transformMode={transformMode}
            onTransformEnd={onTransformEnd}
            snapEnabled={snapEnabled}
            gridSize={gridSize}
          />
        )
      )}
    </Canvas>
  );
}
