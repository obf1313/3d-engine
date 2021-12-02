/**
 * @description: 点光源
 * 从一个点向各个方向发射的光源。一个常见的例子是模拟一个灯泡发出的光。
 * 该光源可以投射阴影。
 * @author: cnn
 * @createTime: 2021/12/2 10:59
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, SphereGeometry, WebGLRenderer, PointLight as TPointLight,
  Mesh, MeshBasicMaterial, Clock
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

let object: any;
let light1: any;
let light2: any;
let light3: any;
let light4: any;
const clock = new Clock();

const PointLight = () => {
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
      background: new Color(0x000000)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 45,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 100,
      },
      position: [0, 200, 200]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initModel();
    setThreeContainer(threeContainer);
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
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    animate();
  };
  // 初始化灯源
  const initLight = () => {
    const sphere = new SphereGeometry(0.5, 16, 8);
    light1 = new TPointLight(0xff0040, 2, 50);
    light1.add(new Mesh(sphere, new MeshBasicMaterial({ color: 0xff0040 })));
    THREE_CONST.scene.add(light1);
    light2 = new TPointLight(0x0040ff, 2, 50);
    light2.add(new Mesh(sphere, new MeshBasicMaterial({ color: 0x0040ff })));
    THREE_CONST.scene.add(light2);
    light3 = new TPointLight(0x80ff80, 2, 50);
    light3.add(new Mesh(sphere, new MeshBasicMaterial({ color: 0x80ff80 })));
    THREE_CONST.scene.add(light3);
    light4 = new TPointLight(0xffaa00, 2, 50);
    light4.add(new Mesh(sphere, new MeshBasicMaterial({ color: 0xffaa00 })));
    THREE_CONST.scene.add(light4);
  };
  // 加载模型
  const initModel = () => {
    const url: string = '/modelStatic/three/WaltHead.obj';
    const loader = new OBJLoader();
    loader.load(url, (obj: any) => {
      object = obj;
      object.scale.multiplyScalar(0.8);
      object.position.y = -30;
      THREE_CONST.scene.add(object);
    });
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    const time = Date.now() * 0.0005;
    const delta = clock.getDelta();
    if (object) object.rotation.y -= 0.5 * delta;
    light1.position.x = Math.sin(time * 0.7) * 30;
    light1.position.y = Math.cos(time * 0.5) * 40;
    light1.position.z = Math.cos(time * 0.6) * 30;
    light2.position.x = Math.cos(time * 0.3) * 30;
    light2.position.y = Math.sin(time * 0.5) * 40;
    light2.position.z = Math.sin(time * 0.7) * 30;
    light3.position.x = Math.sin(time * 0.7) * 30;
    light3.position.y = Math.cos(time * 0.3) * 40;
    light3.position.z = Math.sin(time * 0.4) * 30;
    light4.position.x = Math.sin(time * 0.3) * 30;
    light4.position.y = Math.cos(time * 0.7) * 40;
    light4.position.z = Math.sin(time * 0.5) * 30;
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return (
    <div id="threeContainer" />
  );
};
export default PointLight;