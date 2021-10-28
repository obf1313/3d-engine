/**
 * @description: 正交相机 和 透视相机
 * @author: cnn
 * @createTime: 2021/10/27 14:51
 **/
import React, { useEffect, useState } from 'react';
import {
  WebGLRenderer, PerspectiveCamera, CameraHelper, OrthographicCamera,
  BufferGeometry, MathUtils, Float32BufferAttribute, Points,
  PointsMaterial, Mesh, SphereGeometry, MeshBasicMaterial, Group, Color
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let cameraPerspective: any;
let cameraPerspectiveHelper: any;
let cameraOrtho: any;
let cameraOrthoHelper: any;
let activeCamera: any;
let activeCameraHelper: any;
let cameraRig: any;
let mesh: any;
const frustumSize: number = 500;

const Camera = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  useEffect(() => {
    // 我去就是因为我加了背景色导致我的左边一直不出来
    THREE_CONST.scene = initScene();
    initCamera();
    initMyScene();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('keydown', onKeyDown);
      // 重置全局变量
      resetThreeConst();
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
      animate();
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('keydown', onKeyDown);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    const threeContainer = document.getElementById('threeContainer') || document;
    initParticles();
    initStarBackground();
    setThreeContainer(threeContainer);
  };
  // 初始化相机
  const initCamera = () => {
    const aspectRatio = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera = new PerspectiveCamera(50, 0.5 * aspectRatio, 1, 10000);
    THREE_CONST.camera.position.z = 2500;
    cameraPerspective = new PerspectiveCamera(50, 0.5 * aspectRatio, 150, 1000);
    cameraPerspectiveHelper = new CameraHelper(cameraPerspective);
    THREE_CONST.scene.add(cameraPerspectiveHelper);
    cameraOrtho = new OrthographicCamera(
      0.5 * frustumSize * aspectRatio / -2,
      0.5 * frustumSize * aspectRatio / 2,
      frustumSize / 2,
      frustumSize / -2,
      150,
      1000
    );
    cameraOrthoHelper = new CameraHelper(cameraOrtho);
    THREE_CONST.scene.add(cameraOrthoHelper);
    activeCamera = cameraPerspective;
    activeCameraHelper = cameraPerspectiveHelper;
    cameraOrtho.rotation.y = Math.PI;
    cameraPerspective.rotation.y = Math.PI;
    cameraRig = new Group();
    cameraRig.add(cameraPerspective);
    cameraRig.add(cameraOrtho);
    THREE_CONST.scene.add(cameraRig);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true });
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    threeContainer.appendChild(renderer.domElement);
    renderer.autoClear = false;
    setRenderer(renderer);
  };
  // 生成星星背景
  const initStarBackground = () => {
    const geometry = new BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
      vertices.push(MathUtils.randFloatSpread(2000)); // x
      vertices.push(MathUtils.randFloatSpread(2000)); // y
      vertices.push(MathUtils.randFloatSpread(2000)); // z
    }
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    const particles = new Points(geometry, new PointsMaterial({
      color: 0x888888
    }));
    THREE_CONST.scene.add(particles);
  };
  // 生成一个球状物体
  const initParticles = () => {
    // 白球
    mesh = new Mesh(
      new SphereGeometry(100, 16, 8),
      new MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );
    THREE_CONST.scene.add(mesh);
    // 绿球
    const mesh2 = new Mesh(
      new SphereGeometry(50, 16, 8),
      new MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    );
    mesh2.position.y = 150;
    mesh.add(mesh2);
    // 蓝球
    const mesh3 = new Mesh(
      new SphereGeometry(5, 16, 8),
      new MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
    );
    mesh3.position.z = 150;
    cameraRig.add(mesh3);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    const r = Date.now() * 0.0005;
    mesh.position.x = 700 * Math.cos(r);
    mesh.position.z = 700 * Math.sin(r);
    mesh.position.y = 700 * Math.sin(r);
    mesh.children[0].position.x = 70 * Math.cos(2 * r);
    mesh.children[0].position.z = 70 * Math.sin(r);
    if (activeCamera === cameraPerspective) {
      cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r);
      cameraPerspective.far = mesh.position.length();
      cameraPerspective.updateProjectionMatrix();
      cameraPerspectiveHelper.update();
      cameraPerspectiveHelper.visible = true;
      cameraOrthoHelper.visible = false;
    } else {
      cameraOrtho.far = mesh.position.length();
      cameraOrtho.updateProjectionMatrix();
      cameraOrthoHelper.update();
      cameraOrthoHelper.visible = true;
      cameraPerspectiveHelper.visible = false;
    }
    cameraRig.lookAt(mesh.position);
    renderer.clear();
    activeCameraHelper.visible = false;
    renderer.setViewport(0, 0, getClientWidth() / 2, getClientHeight() - 60);
    renderer.render(THREE_CONST.scene, activeCamera);
    activeCameraHelper.visible = true;
    renderer.setViewport(getClientWidth() / 2, 0, getClientWidth() / 2, getClientHeight() - 60);
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    const aspectRatio = getClientWidth() / (getClientHeight() - 60);
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    THREE_CONST.camera.aspect = 0.5 * aspectRatio;
    THREE_CONST.camera.updateProjectionMatrix();
    cameraPerspective.aspect = 0.5 * aspectRatio;
    cameraPerspective.updateProjectionMatrix();
    cameraOrtho.left = -0.5 * frustumSize * aspectRatio / 2;
    cameraOrtho.right = 0.5 * frustumSize * aspectRatio / 2;
    cameraOrtho.top = frustumSize / 2;
    cameraOrtho.bottom = - frustumSize / 2;
    cameraOrtho.updateProjectionMatrix();
  };
  // 切换相机
  const onKeyDown = (event: any) => {
    switch (event.keyCode) {
      case 79:
        activeCamera = cameraOrtho;
        activeCameraHelper = cameraOrthoHelper;
        break;
      case 80:
        activeCamera = cameraPerspective;
        activeCameraHelper = cameraPerspectiveHelper;
        break;
    }
  };
  return (
    <>
      <div id="threeContainer" />
      <div style={{ position: 'absolute', top: 60, left: 10, zIndex: 999, color: 'white' }}>
        按 <span style={{ color: 'green' }}>o</span> 为 正交相机，按 <span style={{ color: 'green' }}>p</span> 为透视相机。
      </div>
    </>
  );
};
export default Camera;