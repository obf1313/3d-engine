/**
 * @description: 平面光光源
 * 平面光光源从一个矩形平面上均匀地发射光线。
 * 这种光源可以用来模拟像明亮的窗户或者条状灯光光源。
 * 注意事项:
 * 不支持阴影。
 * 只支持 MeshStandardMaterial 和 MeshPhysicalMaterial 两种材质。
 * 你必须在你的场景中加入 RectAreaLightUniformsLib ，并调用 init()。
 * @author: cnn
 * @createTime: 2021/12/2 14:41
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, BoxGeometry as TBoxGeometry, MeshPhongMaterial,
  Mesh, RectAreaLight as TRectAreaLight, BoxGeometry, MeshStandardMaterial, TorusKnotGeometry
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';

const RectAreaLight = () => {
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
      position: [0, 5, -30]
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
    animate(0);
  };
  // 初始化灯源
  const initLight = () => {
    RectAreaLightUniformsLib.init();
    const rectLight1 = new TRectAreaLight(0xff0000, 5, 4, 10);
    rectLight1.position.set(-5, 5, 5);
    THREE_CONST.scene.add(rectLight1);
    const rectLight2 = new TRectAreaLight(0x00ff00, 5, 4, 10);
    rectLight2.position.set(0, 5, 5);
    THREE_CONST.scene.add(rectLight2);
    const rectLight3 = new TRectAreaLight(0x0000ff, 5, 4, 10);
    rectLight3.position.set(5, 5, 5);
    THREE_CONST.scene.add(rectLight3);
    THREE_CONST.scene.add(new RectAreaLightHelper(rectLight1));
    THREE_CONST.scene.add(new RectAreaLightHelper(rectLight2));
    THREE_CONST.scene.add(new RectAreaLightHelper(rectLight3));
  };
  // 生成一个几何体放入场景中
  const initGeometry = () => {
    const geoFloor = new BoxGeometry(200, 0.1, 2000);
    const matStdFloor = new MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.1,
      metalness: 0
    });
    const mshStdFloor = new Mesh(geoFloor, matStdFloor);
    THREE_CONST.scene.add(mshStdFloor);
    const geoKnot = new TorusKnotGeometry(1.5, 0.5, 200, 16);
    const matKnot = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0,
      metalness: 0
    });
    const meshKnot = new Mesh(geoKnot, matKnot);
    meshKnot.name = 'meshKnot';
    meshKnot.position.set(0, 5, 0);
    THREE_CONST.scene.add(meshKnot);
  };
  // 更新
  const animate = (time: any) => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    const mesh = THREE_CONST.scene.getObjectByName('meshKnot');
    mesh.rotation.y = time / 1000;
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
export default RectAreaLight;