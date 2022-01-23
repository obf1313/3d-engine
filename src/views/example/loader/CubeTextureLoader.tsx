/**
 * @description: CubeTexture 加载器
 * 加载 CubeTexture 的一个类。 内部使用 ImageLoader 来加载文件。
 * @author: cnn
 * @createTime: 2022/1/21 17:09
 **/
import React, { useEffect, useState } from 'react';
import {
  WebGLRenderer, AmbientLight, PointLight, MeshLambertMaterial, CubeRefractionMapping,
  MixOperation
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initCubeTexture, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const CubeTextureLoader = () => {
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
      background: initCubeTexture(staticUrlPrefix + 'textures/SwedishRoyalCastle/', ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 50,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 5000,
      },
      position: [0, 0, 2000]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initObj();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const ambient = new AmbientLight(0xffffff);
    THREE_CONST.scene.add(ambient);
    const pointLight = new PointLight(0xffffff, 2);
    THREE_CONST.scene.add(pointLight);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer();
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
    // 禁止缩放
    controls.enableZoom = false;
    // 禁止平移
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;
    animate();
  };
  // 生成模型放入场景中
  const initObj = () => {
    const reflectionCube = initCubeTexture(staticUrlPrefix + 'textures/SwedishRoyalCastle/', ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    const refractionCube = initCubeTexture(staticUrlPrefix + 'textures/SwedishRoyalCastle/', ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    refractionCube.mapping = CubeRefractionMapping;
    const cubeMaterial3 = new MeshLambertMaterial({
      color: 0xff6600,
      envMap: reflectionCube,
      combine: MixOperation,
      reflectivity: 0.3
    });
    const cubeMaterial2 = new MeshLambertMaterial({
      color: 0xffee00,
      envMap: refractionCube,
      reflectivity: 0.95
    });
    const cubeMaterial1 = new MeshLambertMaterial({
      color: 0xffffff,
      envMap: reflectionCube,
    });
    const objLoader = new OBJLoader();
    objLoader.setPath(staticUrlPrefix);
    objLoader.load('WaltHead.obj', (object: any) => {
      const head = object.children[0];
      head.scale.multiplyScalar(15);
      head.position.y = -500;
      head.material = cubeMaterial1;
      const head2 = head.clone();
      head2.position.x = -900;
      head2.material = cubeMaterial2;
      const head3 = head.clone();
      head3.position.x = 900;
      head3.material = cubeMaterial3;
      THREE_CONST.scene.add(head, head2, head3);
    });
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
export default CubeTextureLoader;
