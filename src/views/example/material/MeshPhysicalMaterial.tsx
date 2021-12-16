/**
 * @description: 物理网格材质
 * @author: cnn
 * @createTime: 2021/12/16 9:32
 **/
import React, { useEffect, useState } from 'react';
import {
  Color,
  MeshPhysicalMaterial as TMeshPhysicalMaterial,
  WebGLRenderer,
  Mesh,
  BackSide,
  FrontSide,
  LoadingManager,
  Group,
  EquirectangularReflectionMapping,
  PointLight,
  AmbientLight, ACESFilmicToneMapping, sRGBEncoding
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

let objects: any = [];
let gemBackMaterial: any;
let gemFrontMaterial: any;

const MeshPhysicalMaterial = () => {
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
        fov: 40,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 100,
      },
      position: [0, -10, 20 * 3.5]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initCube();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    // 半球光，光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
    THREE_CONST.scene.add(new AmbientLight(0x222222));
    const light1 = new PointLight(0xffffff);
    light1.position.set(150, 10, 0);
    light1.castShadow = false;
    THREE_CONST.scene.add(light1);
    const light2 = new PointLight(0xffffff);
    light2.position.set(-150, 10, 0);
    light2.castShadow = false;
    THREE_CONST.scene.add(light2);
    const light3 = new PointLight(0xffffff);
    light3.position.set(0, -10, -150);
    THREE_CONST.scene.add(light3);
    const light4 = new PointLight(0xffffff);
    light4.position.set(0, 0, 150);
    THREE_CONST.scene.add(light4);
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
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.outputEncoding = sRGBEncoding;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.minDistance = 20;
    controls.maxDistance = 200;
    controls.update();
    animate();
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    gemBackMaterial = new TMeshPhysicalMaterial({
      map: null,
      color: 0x0000ff,
      metalness: 1,
      roughness: 0,
      opacity: 0.5,
      side: BackSide,
      transparent: true,
      envMapIntensity: 5,
      premultipliedAlpha: true
    });
    gemFrontMaterial = new TMeshPhysicalMaterial({
      map: null,
      color: 0x0000ff,
      metalness: 0,
      roughness: 0,
      opacity: 0.25,
      side: FrontSide,
      transparent: true,
      envMapIntensity: 10,
      premultipliedAlpha: true
    });
    const manager = new LoadingManager();
    const loader = new OBJLoader(manager);
    loader.load('/modelStatic/three/emerald.obj', (object: any) => {
      object.traverse((child: any) => {
        if (child instanceof Mesh) {
          child.material = gemBackMaterial;
          const second = child.clone();
          second.material = gemFrontMaterial;
          const parent = new Group();
          parent.add(second);
          parent.add(child);
          THREE_CONST.scene.add(parent);
          objects.push(parent);
        }
      });
    });
    new RGBELoader().setPath('/modelStatic/three/textures/').load('royal_esplanade_1k.hdr', (texture: any) => {
      texture.mapping = EquirectangularReflectionMapping;
      gemFrontMaterial.envMap = gemBackMaterial.envMap = texture;
      gemFrontMaterial.needsUpdate = gemBackMaterial.needsUpdate = true;
    });
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    if (gemBackMaterial !== undefined && gemFrontMaterial !== undefined) {
      gemFrontMaterial.reflectivity = gemBackMaterial.reflectivity = 1;
      gemBackMaterial.color = gemFrontMaterial.color = new Color(0x880000);
    }
    renderer.toneMappingExposure = 1;
    THREE_CONST.camera.lookAt(THREE_CONST.scene.position);
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      object.rotation.y += 0.005;
    }
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
export default MeshPhysicalMaterial;
