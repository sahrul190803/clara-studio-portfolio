import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { StageState } from "../stage";
import { TvEye } from "./Icon";

interface ClaraStageProps {
  stateRef: React.RefObject<StageState>;
  onProgress: (value: number) => void;
  onReady: () => void;
}

function makeFaceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const cols = 44;
  const rows = 28;
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  const centerY = canvas.height / 2;
  const eyeOffset = 96;
  const eyeRx = 84;
  const eyeRy = 48;
  const eyes = [canvas.width / 2 - eyeOffset, canvas.width / 2 + eyeOffset];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const eyeX of eyes) {
    const halo = ctx.createRadialGradient(eyeX, centerY, 4, eyeX, centerY, eyeRx * 1.45);
    halo.addColorStop(0, "rgba(255, 232, 194, 0.42)");
    halo.addColorStop(0.45, "rgba(210, 169, 112, 0.18)");
    halo.addColorStop(1, "rgba(200, 162, 110, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(eyeX - eyeRx * 1.5, centerY - eyeRx * 1.5, eyeRx * 3, eyeRx * 3);
  }

  for (const eyeX of eyes) {
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const px = (x + 0.5) * cellW;
        const py = (y + 0.5) * cellH;
        const nx = (px - eyeX) / eyeRx;
        const ny = (py - centerY) / eyeRy;
        if (Math.abs(nx) >= 1) continue;
        const lid = 0.7 * Math.pow(1 - nx * nx, 0.62);
        if (Math.abs(ny) > lid) continue;
        const pupil = (nx * 1.4) ** 2 + (ny * 1.15) ** 2;
        if (pupil < 0.16) continue;
        const distance = Math.sqrt(nx * nx + ny * ny);
        const alpha = 0.5 + 0.5 * Math.min(1, (distance - 0.2) * 2.4);
        const size = cellW * 0.7;
        ctx.fillStyle = `rgba(250, 244, 231, ${alpha.toFixed(3)})`;
        ctx.shadowColor = "rgba(228, 184, 122, 0.95)";
        ctx.shadowBlur = 10;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
    }
  }

  ctx.shadowBlur = 0;

  for (const eyeX of eyes) {
    ctx.fillStyle = "rgba(12, 11, 10, 0.92)";
    ctx.beginPath();
    ctx.ellipse(eyeX, centerY, eyeRy * 0.36, eyeRy * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 248, 234, 0.95)";
    ctx.beginPath();
    ctx.arc(eyeX - 5.5, centerY - 6.5, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  for (let y = 0; y < canvas.height; y += 5) {
    ctx.fillRect(0, y, canvas.width, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeShadowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(0.45, "rgba(0,0,0,0.28)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function ClaraStage({ stateRef, onProgress, onReady }: ClaraStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(onProgress);
  const readyRef = useRef(onReady);
  const [failed, setFailed] = useState(false);

  progressRef.current = onProgress;
  readyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setFailed(true);
      progressRef.current(100);
      readyRef.current();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.className = "stage__canvas";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      32,
      Math.max(0.5, container.clientWidth / Math.max(1, container.clientHeight)),
      0.1,
      60,
    );
    camera.position.set(0, 0.36, 6.1);

    const hemi = new THREE.HemisphereLight(0xf4e8d4, 0x171715, 1.35);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffe6c4, 2.7);
    key.position.set(3, 4, 3.4);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xa2b399, 2.4);
    rim.position.set(-3.2, 2.2, -2.6);
    scene.add(rim);

    const fill = new THREE.PointLight(0xc8a26e, 14, 12, 2);
    fill.position.set(-1.4, 0.4, 2.8);
    scene.add(fill);

    const group = new THREE.Group();
    scene.add(group);

    const shadowTexture = makeShadowTexture();
    let shadowPlane: THREE.Mesh | null = null;
    let shadowMaterial: THREE.MeshBasicMaterial | null = null;
    if (shadowTexture) {
      shadowMaterial = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      });
      shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), shadowMaterial);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.255;
      scene.add(shadowPlane);
    }

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa2b399,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.94, 0.958, 96), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.25;
    scene.add(ring);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xc8a26e,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(1.32, 1.332, 96), ringMat2);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = -1.249;
    scene.add(ring2);

    const particleCount = 70;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = Math.random() * 4 - 1.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.6;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd9c9a8,
      size: 0.017,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const mouse = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onPointerLeave = () => {
      mouse.x = 0;
      mouse.y = 0;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    let mixer: THREE.AnimationMixer | null = null;
    let idleAction: THREE.AnimationAction | null = null;
    let gestures: THREE.AnimationClip[] = [];
    let activeGesture: THREE.AnimationAction | null = null;
    let gestureStartedAt = 0;
    let gestureCooldownUntil = 0;
    let screenMaterial: THREE.MeshStandardMaterial | null = null;
    let eyePlane: THREE.Mesh | null = null;
    let eyeMaterial: THREE.MeshBasicMaterial | null = null;
    let eyeBaseScaleY = 1;
    let baseY = 0;
    const baseScale = 1;
    let visible = true;
    let smoothLevel = 0;

    const onMixerFinished = () => {
      if (!idleAction) return;
      if (activeGesture) activeGesture.fadeOut(0.3);
      activeGesture = null;
      idleAction.reset().fadeIn(0.3).play();
      gestureCooldownUntil = performance.now() + 2600;
    };

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      "/models/clara-rigged.glb",
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        model.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            const mesh = object as THREE.Mesh;
            mesh.frustumCulled = false;
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((material) => {
              const mat = material as THREE.MeshStandardMaterial;
              if (mat.map) mat.map.anisotropy = 4;
              mat.needsUpdate = true;
            });
            if (mesh.name === "Screen") {
              const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as
                | THREE.MeshStandardMaterial
                | undefined;
              if (mat && "emissive" in mat) {
                mat.emissive = new THREE.Color(0xc8a26e);
                mat.emissiveMap = mat.map ?? null;
                mat.emissiveIntensity = 0.32;
                screenMaterial = mat;
              }
            }
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const targetHeight = 2.9;
        const scale = targetHeight / Math.max(0.001, size.y);
        model.scale.setScalar(scale);

        const box2 = new THREE.Box3().setFromObject(model);
        const center2 = box2.getCenter(new THREE.Vector3());
        model.position.x -= center2.x;
        model.position.z -= center2.z;
        model.position.y -= box2.min.y;
        model.position.y += -1.25;

        group.add(model);
        baseY = group.position.y;

        model.updateMatrixWorld(true);
        const headBone = model.getObjectByName("Head");
        const screenMesh = model.getObjectByName("Screen") as THREE.Mesh | undefined;
        if (headBone && screenMesh) {
          const screenBox = new THREE.Box3().setFromObject(screenMesh);
          const screenSize = screenBox.getSize(new THREE.Vector3());
          const screenCenter = screenBox.getCenter(new THREE.Vector3());
          const screenQuat = screenMesh.getWorldQuaternion(new THREE.Quaternion());
          const headQuat = headBone.getWorldQuaternion(new THREE.Quaternion());
          const relativeQuat = headQuat.clone().invert().multiply(screenQuat);
          const front = new THREE.Vector3(0, 0, 1).applyQuaternion(screenQuat);
          const faceWorld = screenCenter
            .clone()
            .addScaledVector(front, screenSize.z / 2 + 0.02);
          const faceLocal = headBone.worldToLocal(faceWorld.clone());
          const headScale = headBone.getWorldScale(new THREE.Vector3());
          const faceTexture = makeFaceTexture();
          if (faceTexture) {
            eyeMaterial = new THREE.MeshBasicMaterial({
              map: faceTexture,
              transparent: true,
              depthWrite: false,
              toneMapped: false,
              side: THREE.DoubleSide,
              opacity: 1,
            });
            eyePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), eyeMaterial);
            eyePlane.position.copy(faceLocal);
            eyePlane.quaternion.copy(relativeQuat);
            eyeBaseScaleY = (screenSize.y * 0.78) / Math.max(headScale.y, 0.0001);
            eyePlane.scale.set(
              (screenSize.x * 0.98) / Math.max(headScale.x, 0.0001),
              eyeBaseScaleY,
              1,
            );
            eyePlane.renderOrder = 3;
            headBone.add(eyePlane);
          }
        }

        mixer = new THREE.AnimationMixer(model);
        mixer.addEventListener("finished", onMixerFinished);

        const clips = gltf.animations ?? [];
        const idleClip =
          clips.find((clip) => /idle/i.test(clip.name)) ??
          clips.find((clip) => /breath/i.test(clip.name)) ??
          clips[0];
        if (idleClip) {
          idleAction = mixer.clipAction(idleClip);
          idleAction.setLoop(THREE.LoopRepeat, Infinity);
          idleAction.play();
        }
        gestures = clips.filter((clip) => {
          if (clip === idleClip) return false;
          return /gesture|nod|think|laugh|shrug|wrist/i.test(clip.name);
        });

        progressRef.current(100);
        readyRef.current();
      },
      (event) => {
        if (disposed) return;
        const total = event.total || 8_000_000;
        const ratio = Math.min(0.96, event.loaded / total);
        progressRef.current(Math.max(4, Math.round(ratio * 100)));
      },
      (error) => {
        if (disposed) return;
        console.error("Clara model failed to load", error);
        setFailed(true);
        progressRef.current(100);
        readyRef.current();
      },
    );

    const layout = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const mobile = width < 760;
      camera.aspect = width / height;
      camera.position.set(0, mobile ? 0.18 : 0.4, mobile ? 7.4 : 7.6);
      camera.lookAt(0, mobile ? 0.05 : 0.2, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      group.position.x = mobile ? 0 : 0.98;
      group.scale.setScalar(mobile ? 0.86 : baseScale);
      ring.scale.setScalar(mobile ? 0.85 : 1);
      ring2.scale.setScalar(mobile ? 0.85 : 1);
    };
    layout();

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      if (disposed) return;
      const delta = Math.min(0.05, clock.getDelta());
      const elapsed = clock.elapsedTime;

      if (!visible || document.hidden) return;

      const state = stateRef.current ?? { level: 0, speaking: false, mode: "idle" };
      const targetLevel = state.speaking ? Math.min(1, Math.pow(state.level * 3.4, 0.75)) : 0;
      smoothLevel += (targetLevel - smoothLevel) * 0.14;

      if (mixer) {
        mixer.update(delta);
        if (
          idleAction &&
          !activeGesture &&
          gestures.length > 0 &&
          state.speaking &&
          smoothLevel > 0.04 &&
          performance.now() > gestureCooldownUntil &&
          performance.now() - gestureStartedAt > 5200
        ) {
          const clip = gestures[Math.floor(Math.random() * gestures.length)];
          const action = mixer.clipAction(clip);
          activeGesture = action;
          idleAction.fadeOut(0.3);
          action.reset();
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.fadeIn(0.3);
          action.play();
          gestureStartedAt = performance.now();
        }
      }

      group.position.y = baseY + Math.sin(elapsed * 1.05) * 0.011 + smoothLevel * 0.02;
      group.rotation.y = mouse.x * 0.2 + Math.sin(elapsed * 0.55) * 0.018;
      group.rotation.x = mouse.y * -0.07;

      if (screenMaterial) {
        screenMaterial.emissiveIntensity =
          0.3 + smoothLevel * 1.8 + Math.sin(elapsed * 2.1) * 0.02;
      }
      if (eyePlane && eyeMaterial) {
        const cycle = elapsed % 7.6;
        const blink = (start: number, length: number) => {
          if (cycle < start || cycle > start + length) return 1;
          return 1 - Math.sin(((cycle - start) / length) * Math.PI) * 0.94;
        };
        const lids = Math.max(0.07, Math.min(blink(6.9, 0.24), blink(7.24, 0.18)));
        const idlePulse = 0.94 + Math.sin(elapsed * 1.7) * 0.04;
        eyePlane.scale.y = eyeBaseScaleY * lids;
        eyeMaterial.opacity = Math.min(1, 0.84 + smoothLevel * 0.16) * idlePulse;
        const glow = 0.96 + smoothLevel * 0.42;
        eyeMaterial.color.setRGB(glow, glow * 0.95, glow * 0.84);
      }
      rim.intensity = 2.2 + smoothLevel * 2.4;
      fill.intensity = 12 + smoothLevel * 9;
      ringMat.opacity = 0.13 + smoothLevel * 0.16;
      ringMat2.opacity = 0.07 + smoothLevel * 0.1;

      const lightTheme = document.documentElement.dataset.theme === "light";
      if (shadowMaterial && shadowPlane) {
        shadowMaterial.opacity = lightTheme ? 0.26 : 0.9;
        shadowPlane.scale.setScalar(lightTheme ? 0.7 : 1);
      }

      particles.rotation.y += delta * 0.025;
      particles.position.y = Math.sin(elapsed * 0.4) * 0.06;

      renderer.render(scene, camera);
    };
    render();

    const onVisibility = () => {
      if (!document.hidden) clock.getDelta();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      mixer?.removeEventListener("finished", onMixerFinished);
      mixer?.stopAllAction();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : mesh.material
            ? [mesh.material]
            : [];
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) value.dispose();
          });
          material.dispose();
        });
      });
      shadowTexture?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [stateRef]);

  return (
    <div className={`stage ${failed ? "stage--fallback" : ""}`} ref={containerRef}>
      <div className="stage__fallback" aria-hidden="true">
        <span className="stage__ring" />
        <span className="stage__ring stage__ring--two" />
        <TvEye className="stage__eye" />
      </div>
      <div className="stage__vignette" aria-hidden="true" />
      <div className="stage__tag">
        <span className="status-dot" />
        Clara · asisten virtual
      </div>
    </div>
  );
}
