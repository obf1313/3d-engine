/**
 * @description: 多细节层次（Levels od Detail）
 * 多细节层次 - 在显示网格时，根据摄像机距离物体的距离，来使用更多或者更少的几何体来对其进行显示。
 * 每一个级别都和一个几何体相关联，且在渲染时，可以根据给定的距离，来在这些级别对应的几何体之间进行切换。
 * 通常情况下，你会创建多个几何体，比如说三个，一个距离很远（低细节），一个距离适中（中等细节），还有一个距离非常近（高质量）。
 * @author: cnn
 * @createTime: 2021/12/23 10:02
 **/
import React, { useEffect, useState } from 'react';
import {
  LOD as TLOD, DirectionalLight, WebGLRenderer, Mesh, Clock,
  Fog, PointLight, IcosahedronBufferGeometry, MeshLambertMaterial, Color
} from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

const clock = new Clock();
let controls: any;

const LOD = () => {
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
      initControls();
      window.addEventListener('resize', onWindowResize, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene({
      background: new Color(0x000000),
      fog: new Fog(0x000000, 1, 15000)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 45,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 15000,
      },
      position: [0, 0, 1000]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initGeometry();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const pointLight = new PointLight(0xff2200);
    pointLight.position.set(0, 0, 0);
    THREE_CONST.scene.add(pointLight);
    const dirLight = new DirectionalLight(0xffffff);
    dirLight.position.set(0, 0, 1).normalize();
    THREE_CONST.scene.add(dirLight);
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
    controls = new FlyControls(THREE_CONST.camera, renderer.domElement);
    controls.movementSpeed = 1000;
    controls.rollSpeed = Math.PI / 10;
    animate();
  };
  // 生成几何体
  const initGeometry = () => {
    const geometry: any = [
      [new IcosahedronBufferGeometry(100, 16), 50],
      [new IcosahedronBufferGeometry(100, 8), 300],
      [new IcosahedronBufferGeometry(100, 4), 1000],
      [new IcosahedronBufferGeometry(100, 2), 2000],
      [new IcosahedronBufferGeometry(100, 1), 8000],
    ];
    const material = new MeshLambertMaterial({
      color: 0xffffff,
      wireframe: true
    });
    for (let i = 0; i < 1000; i++) {
      const lod = new TLOD();
      for (let j = 0; j < geometry.length; j++) {
        const mesh = new Mesh(geometry[j][0], material);
        mesh.scale.set(1.5, 1.5, 1.5);
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        lod.addLevel(mesh, geometry[j][1]);
      }
      lod.position.x = 10000 * (0.5 - Math.random());
      lod.position.y = 7500 * (0.5 - Math.random());
      lod.position.z = 10000 * (0.5 - Math.random());
      lod.updateMatrix();
      lod.matrixAutoUpdate = false;
      THREE_CONST.scene.add(lod);
    }
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    controls.update(clock.getDelta());
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default LOD;
