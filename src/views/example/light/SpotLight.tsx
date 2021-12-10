/**
 * @description: 聚光灯
 * 光线从一个点沿一个方向射出，随着光线照射的变远，光线圆锥体的尺寸也逐渐增大。
 * 该光源可以投射阴影。
 * @author: cnn
 * @createTime: 2021/12/2 15:15
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, MeshPhongMaterial, Mesh,
  SpotLight as TSpotLight, PlaneGeometry, BoxGeometry, AmbientLight, SpotLightHelper, PCFSoftShadowMap, sRGBEncoding
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let spotlight1: any;
let spotlight2: any;
let spotlight3: any;
let lightHelper1: any;
let lightHelper2: any;
let lightHelper3: any;

const SpotLight = () => {
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
      position: [46, 22, -21]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initGeometry();
    setThreeContainer(threeContainer);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.outputEncoding = sRGBEncoding;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.target.set(0, 7, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    animateRender();
    animate();
  };
  // 初始化灯源
  const initLight = () => {
    const ambient = new AmbientLight(0x111111);
    const createSpotlight = (color: number) => {
      const newObj = new TSpotLight(color, 2);
      newObj.castShadow = true;
      newObj.angle = 0.3;
      newObj.penumbra = 0.2;
      newObj.decay = 2;
      newObj.distance = 50;
      return newObj;
    };
    spotlight1 = createSpotlight(0xff7f00);
    spotlight2 = createSpotlight(0x00ff7f);
    spotlight3 = createSpotlight(0x7f00ff);
    spotlight1.position.set(15, 40, 45);
    spotlight2.position.set(0, 40, 35);
    spotlight3.position.set(-15, 40, 45);
    lightHelper1 = new SpotLightHelper(spotlight1);
    lightHelper2 = new SpotLightHelper(spotlight2);
    lightHelper3 = new SpotLightHelper(spotlight3);
    THREE_CONST.scene.add(ambient);
    THREE_CONST.scene.add(spotlight1, spotlight2, spotlight3);
    THREE_CONST.scene.add(lightHelper1, lightHelper2, lightHelper3);
  };
  // 生成几何体放入场景中
  const initGeometry = () => {
    const matFloor = new MeshPhongMaterial({ color: 0x808080 });
    const geoFloor = new PlaneGeometry(2000, 2000);
    const mshFloor = new Mesh(geoFloor, matFloor);
    mshFloor.rotation.x = -Math.PI * 0.5;
    mshFloor.receiveShadow = true;
    mshFloor.position.set(0, -0.05, 0);
    const matBox = new MeshPhongMaterial({ color: 0xaaaaaa });
    const geoBox = new BoxGeometry(3, 1, 2);
    const mshBox = new Mesh(geoBox, matBox);
    mshBox.castShadow = true;
    mshBox.receiveShadow = true;
    mshBox.position.set(0, 5, 0);
    THREE_CONST.scene.add(mshFloor);
    THREE_CONST.scene.add(mshBox);
  };
  // 更新
  const animateRender = () => {
    TWEEN.update();
    if (lightHelper1) lightHelper1.update();
    if (lightHelper2) lightHelper2.update();
    if (lightHelper3) lightHelper3.update();
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
    const animationId = requestAnimationFrame(animateRender);
    setAnimationId(animationId);
  };
  // 更新
  const animate = () => {
    tween(spotlight1);
    tween(spotlight2);
    tween(spotlight3);
    setTimeout(animate, 5000);
  };
  // 平滑移动
  const tween = (light: any) => {
    new TWEEN.Tween(light).to({
      angle: (Math.random() * 0.7) + 0.1,
      penumbra: Math.random() + 1
    }, Math.random() * 3000 + 2000).easing(TWEEN.Easing.Quadratic.Out).start();
    new TWEEN.Tween(light.position).to({
      x: (Math.random() * 30) - 15,
      y: (Math.random() * 10) + 15,
      z: (Math.random() * 30) - 15
    }, Math.random() * 3000 + 2000).easing(TWEEN.Easing.Quadratic.Out).start();
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
export default SpotLight;