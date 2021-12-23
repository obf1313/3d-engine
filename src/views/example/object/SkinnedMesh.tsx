/**
 * @description: 蒙皮网格
 * 具有 Skeleton（骨架） 和 bones（骨骼）的网格，可用于给几何体上的顶点添加动画。
 * @author: cnn
 * @createTime: 2021/12/23 11:08
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, PointLight, CylinderGeometry, Vector3,
  Uint16BufferAttribute, Float32BufferAttribute, Bone, MeshPhongMaterial, DoubleSide,
  SkinnedMesh as TSkinnedMesh, Skeleton, SkeletonHelper
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let mesh: any;
let bones: any;
const state = {
  animateBones: false
};
let gui: any;

const SkinnedMesh = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  useEffect(() => {
    initMyScene();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      // 重置全局变量
      resetThreeConst();
      mesh = null;
      bones = null;
      gui = null;
    };
  }, []);
  useEffect(() => {
    return () => {
      // 移除 animation
      if (animationId) {
        window.cancelAnimationFrame(animationId);
      }
    };
  }, [animationId]);
  useEffect(() => {
    if (threeContainer) {
      initRenderer();
    }
  }, [threeContainer]);
  useEffect(() => {
    if (renderer) {
      initControls();
      window.addEventListener('resize', onWindowResize, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    gui = new GUI({ autoPlace: false });
    // 修改默认位置
    const customContainer = document.getElementById('gui') || document.body;
    customContainer.appendChild(gui.domElement);
    THREE_CONST.scene = initScene({
      background: new Color(0x444444)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 75,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 0.1,
        far: 200,
      },
      position: [0, 30, 30]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initBones();
    setupDatGui();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const lights = [];
    lights[0] = new PointLight(0xffffff, 1, 0);
    lights[1] = new PointLight(0xffffff, 1, 0);
    lights[2] = new PointLight(0xffffff, 1, 0);
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);
    THREE_CONST.scene.add(lights[0]);
    THREE_CONST.scene.add(lights[1]);
    THREE_CONST.scene.add(lights[2]);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    // 设置 alpha。合法参数是一个 0.0 到 1.0 之间的浮点数
    renderer.setClearAlpha(0.2);
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.enableZoom = false;
    animate();
  };
  // 添加骨架
  const initBones = () => {
    const segmentHeight = 8;
    const segmentCount = 4;
    const height = segmentHeight * segmentCount;
    const halfHeight = height / 2;
    const sizing = {
      segmentHeight,
      segmentCount,
      height,
      halfHeight
    };
    const geometry = createGeometry(sizing);
    const bones = createBones(sizing);
    mesh = createMesh(geometry, bones);
    mesh.scale.multiplyScalar(1);
    THREE_CONST.scene.add(mesh);
  };
  // 创建几何体
  const createGeometry = (sizing: any) => {
    const geometry = new CylinderGeometry(
      5,
      5,
      sizing.height,
      8,
      sizing.segmentCount * 3,
      true
    );
    // 获取所有顶点
    const position = geometry.attributes.position;
    const vertex = new Vector3();
    // 这两个是啥玩意
    const skinIndices = [];
    const skinWeights = [];
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      const y = (vertex.y + sizing.halfHeight);
      const skinIndex = Math.floor(y / sizing.segmentHeight);
      const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;
      skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
      skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
    }
    geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
    return geometry;
  };
  // 创建骨骼
  const createBones = (sizing: any) => {
    bones = [];
    // 中间那条竖线
    let prevBone = new Bone();
    bones.push(prevBone);
    prevBone.position.y = -sizing.halfHeight;
    for (let i = 0; i < sizing.segmentCount; i++) {
      const bone = new Bone();
      bone.position.y = sizing.segmentHeight;
      bones.push(bone);
      prevBone.add(bone);
      prevBone = bone;
    }
    return bones;
  };
  // 创建网格
  const createMesh = (geometry: any, bones: any) => {
    const material = new MeshPhongMaterial({
      color: 0x156289,
      emissive: 0x072534,
      side: DoubleSide,
      flatShading: true
    });
    const mesh = new TSkinnedMesh(geometry, material);
    const skeleton = new Skeleton(bones);
    // 本体加进去
    mesh.add(bones[0]);
    mesh.bind(skeleton);
    // 显示骨架
    const skeletonHelper: any = new SkeletonHelper(mesh);
    skeletonHelper.material.lineWidth = 2;
    THREE_CONST.scene.add(skeletonHelper);
    return mesh;
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    const time = Date.now() * 0.001;
    if (state.animateBones) {
      for (let i = 0; i < mesh.skeleton.bones.length; i++) {
        mesh.skeleton.bones[i].rotation.z = Math.sin(time) * 2 / mesh.skeleton.bones.length;
      }
    }
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 初始化 GUI
  const setupDatGui = () => {
    let folder = gui.addFolder('General Options');
    folder.add(state, 'animateBones');
    folder.__controllers[0].name('Animate Bones');
    const bones = mesh.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i];
      folder = gui.addFolder('Bone ' + i);
      folder.add(bone.position, 'x', -10 + bone.position.x, 10 + bone.position.x);
      folder.add(bone.position, 'y', -10 + bone.position.y, 10 + bone.position.y);
      folder.add(bone.position, 'z', -10 + bone.position.z, 10 + bone.position.z);
      folder.add(bone.rotation, 'x', -Math.PI * 0.5, Math.PI * 0.5);
      folder.add(bone.rotation, 'y', -Math.PI * 0.5, Math.PI * 0.5);
      folder.add(bone.rotation, 'z', -Math.PI * 0.5, Math.PI * 0.5);
      folder.add(bone.scale, 'x', 0, 2);
      folder.add(bone.scale, 'y', 0, 2);
      folder.add(bone.scale, 'z', 0, 2);
      folder.__controllers[0].name('position.x');
      folder.__controllers[1].name('position.y');
      folder.__controllers[2].name('position.z');
      folder.__controllers[3].name('rotation.x');
      folder.__controllers[4].name('rotation.y');
      folder.__controllers[5].name('rotation.z');
      folder.__controllers[6].name('scale.x');
      folder.__controllers[7].name('scale.y');
      folder.__controllers[8].name('scale.z');
    }
  };
  return (
    <div style={{ position: 'relative' }}>
      <div id="gui" style={{ position: 'absolute', top: 20, right: 20 }} />
      <div id="threeContainer" />
    </div>
  );
};
export default SkinnedMesh;
