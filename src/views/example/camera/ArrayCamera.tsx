/**
 * @description: 摄像机阵列
 * ArrayCamera 用于更加高效地使用一组已经预定义的摄像机来渲染一个场景。这将能够更好地提升 VR 场景的渲染性能。
 * 一个 ArrayCamera 的实例中总是包含着一组子摄像机，应当为每一个子摄像机定义 viewport（视口）这个属性，这一属性决定了由该子摄像机所渲染的视口区域的大小。
 * @author: cnn
 * @createTime: 2021/10/27 9:29
 **/
import React, { useEffect, useState } from 'react';
import {
  DirectionalLight, WebGLRenderer, Mesh, PlaneGeometry,
  MeshPhongMaterial, CylinderGeometry, PerspectiveCamera, Vector4,
  ArrayCamera as TArrayCamera, AmbientLight
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let mesh: any;

const ArrayCamera = () => {
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
      window.addEventListener('resize', onWindowResize);
      animate();
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    initCamera();
    THREE_CONST.scene = initScene();
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initCube();
    setThreeContainer(threeContainer);
  };
  // 初始化相机
  const initCamera = () => {
    const aspectRatio = getClientWidth() / (getClientHeight() - 60);
    const amount = 6;
    const width = (getClientWidth() / amount) * window.devicePixelRatio;
    const height = ((getClientHeight() - 60) / amount) * window.devicePixelRatio;
    const cameras = [];
    for (let y = 0; y < amount; y++) {
      for (let x = 0; x < amount; x++) {
        const subCamera = new PerspectiveCamera(40, aspectRatio, 0.1, 10);
        // 无语了找了半天问题结果是大小写问题
        // @ts-ignore
        subCamera.viewport = new Vector4(Math.floor(x * width), Math.floor(y * height), Math.ceil(width), Math.ceil(height));
        subCamera.position.x = (x / amount) - 0.5;
        subCamera.position.y = 0.5 - (y / amount);
        subCamera.position.z = 1.5;
        subCamera.position.multiplyScalar(2);
        subCamera.lookAt(0, 0, 0);
        subCamera.updateMatrixWorld();
        cameras.push(subCamera);
      }
    }
    const camera = new TArrayCamera(cameras);
    camera.position.z = 3;
    THREE_CONST.camera = camera;
  };
  // 初始化光源
  const initLight = () => {
    THREE_CONST.scene.add(new AmbientLight(0x222244));
    const light = new DirectionalLight();
    light.position.set(0.5, 0.5, 1);
    light.castShadow = true;
    light.shadow.camera.zoom = 4;
    THREE_CONST.scene.add(light);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    const renderer = new WebGLRenderer();
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    renderer.shadowMap.enabled = true;
    threeContainer.appendChild(renderer.domElement);
    setRenderer(renderer);
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    const geometryBackground = new PlaneGeometry(100, 100);
    const materialBackground = new MeshPhongMaterial({ color: 0x000066 });
    const background = new Mesh(geometryBackground, materialBackground);
    background.receiveShadow = true;
    background.position.set(0, 0, - 1);
    THREE_CONST.scene.add(background);
    const geometryCylinder = new CylinderGeometry(0.5, 0.5, 1, 32);
    const materialCylinder = new MeshPhongMaterial({ color: 0xff0000 });
    mesh = new Mesh(geometryCylinder, materialCylinder);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    THREE_CONST.scene.add(mesh);
  };
  // 更新
  const animate = () => {
    mesh.rotation.x += 0.005;
    mesh.rotation.z += 0.01;
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    const aspectRatio = getClientWidth() / (getClientHeight() - 60);
    const amount = 6;
    const width = (getClientWidth() / amount) * window.devicePixelRatio;
    const height = ((getClientHeight() - 60) / amount) * window.devicePixelRatio;
    THREE_CONST.camera.aspect = aspectRatio;
    THREE_CONST.camera.updateProjectionMatrix();
    for (let y = 0; y < amount; y++) {
      for (let x = 0; x < amount; x++) {
        const subCamera = THREE_CONST.camera.cameras[amount * y + x];
        subCamera.viewPort.set(
          Math.floor(x * width),
          Math.floor(y * height),
          Math.ceil(width),
          Math.ceil(height)
        );
        subCamera.aspect = aspectRatio;
        subCamera.updateProjectionMatrix();
      }
    }
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default ArrayCamera;