/**
 * @description: 光照探针
 * 光照探针是一种在 3D 场景中添加光源的另一种方法。
 * 与经典光源（平行光、点光、聚光）不同， 光照探针不发光。
 * 相反，光照探针存储着有关穿过 3D 空间的光线的信息。
 * 渲染过程中，通过使用来自光照探针的数据，来逼近打到 3D 物体上的光线。
 * 光照探针通常从（辐射）环境贴图中创建。
 * LightProbeGenerator 类可以根据 CubeTexture 或 WebGLCubeRenderTarget 的实例来创建光照探针。
 * 但是，光照估算数据同样可以以其他形式提供，例如，通过 WebXR。
 * 这将能够渲染可对真实世界的光照做出反应的增强现实内容。
 * three.js 中，当前的探针实现支持所谓的漫反射光照探针。
 * 这种类型的光照探针功能上等效于辐照环境贴图。
 * @author: cnn
 * @createTime: 2021/12/2 16:46
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, NoToneMapping, sRGBEncoding, WebGLRenderer, LightProbe as TLightProbe,
  DirectionalLight, SphereGeometry, MeshStandardMaterial, Mesh, CubeTexture
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initCubeTexture, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator';
import { staticUrlPrefix } from '@utils/CommonVars';

let lightProbe: any;

const LightProbe = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
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
      background: new Color(0xcce0ff)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 40,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      },
      position: [0, 0, 30]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
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
    renderer.toneMapping = NoToneMapping;
    renderer.outputEncoding = sRGBEncoding;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.enablePan = false;
    controls.update();
    initLight();
    initCube();
  };
  // 初始化光源
  const initLight = () => {
    lightProbe = new TLightProbe();
    THREE_CONST.scene.add(lightProbe);
    const directionLight = new DirectionalLight(0xffffff, 0.2);
    directionLight.position.set(10, 10, 10);
    THREE_CONST.scene.add(directionLight);
  };
  // 初始化天空盒
  const initCube = () => {
    const genCubeUrls = (postfix: string) => {
      return [
        'px' + postfix, 'nx' + postfix,
        'py' + postfix, 'ny' + postfix,
        'pz' + postfix, 'nz' + postfix,
      ];
    };
    // @ts-ignore
    initCubeTexture(staticUrlPrefix + 'cube/', genCubeUrls('.png'), (texture: CubeTexture) => {
      texture.encoding = sRGBEncoding;
      THREE_CONST.scene.background = texture;
      lightProbe.copy(LightProbeGenerator.fromCubeTexture(texture));
      const geometry = new SphereGeometry(5, 64, 32);
      const material = new MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        envMap: texture,
        envMapIntensity: 1
      });
      const mesh = new Mesh(geometry, material);
      THREE_CONST.scene.add(mesh);
      render();
    });
  };
  // 更新
  const render = () => {
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    render();
  };
  return <div id="threeContainer" />;
};
export default LightProbe;
