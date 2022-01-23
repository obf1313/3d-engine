/**
 * @description: JSON 资源加载器
 * 一种加载 JSON 资源的加载器，使用 JSON Object/Scene format。
 * 此加载器内部使用 FileLoader 进行加载文件。
 * @author: cnn
 * @createTime: 2022/1/23 14:13
 **/
import React, { useEffect, useState } from 'react';
import {
  ObjectLoader as TObjectLoader, DirectionalLight, WebGLRenderer, sRGBEncoding
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';

const ObjectLoader = () => {
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
    THREE_CONST.scene = initScene();
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 40,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 10000,
      },
      position: [700, 200, -500]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initModel();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const light = new DirectionalLight(0xaabbff, 0.3);
    light.position.x = 300;
    light.position.y = 250;
    light.position.z = -500;
    THREE_CONST.scene.add(light);
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
    renderer.outputEncoding = sRGBEncoding;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.maxPolarAngle = 0.9 * Math.PI / 2;
    controls.enableZoom = false;
    controls.update();
    animate();
  };
  // 生成模型
  const initModel = async () => {
    const loader = new TObjectLoader();
    const object = await loader.loadAsync(staticUrlPrefix + 'models/json/lightmap.json');
    THREE_CONST.scene.add(object);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
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
export default ObjectLoader;
