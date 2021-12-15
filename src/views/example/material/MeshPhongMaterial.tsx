/**
 * @description: Phong 网格材质
 * 一种用于具有镜面高光的光泽表面的材质。
 * 该材质使用非物理的 Blinn-Phong 模型来计算反射率。
 * 与 MeshLambertMaterial 中使用的 Lambertian 模型不同，该材质可以模拟具有镜面高光的光泽表面（例如涂漆木材）。
 * 使用 Phong 着色模型计算着色时，会计算每个像素的阴影（在 fragment shader， AKA pixel shader 中），与 MeshLambertMaterial 使用的 Gouraud 模型相比，该模型的结果更准确，但代价是牺牲一些性能。
 * MeshStandardMaterial 和 MeshPhysicalMaterial 也使用这个着色模型。
 * 在 MeshStandardMaterial 或 MeshPhysicalMaterial 上使用此材质时，性能通常会更高 ，但会牺牲一些图形精度。
 * @author: cnn
 * @createTime: 2021/12/15 14:51
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, TorusKnotGeometry, MeshPhongMaterial as TMeshPhongMaterial, Mesh,
  HemisphereLight, PointLight
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let cube: any;

const MeshPhongMaterial = () => {
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
      cube = null;
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
      background: new Color(0x444444)
    });
    // 主要是 near 值的设置
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 70,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 10,
        far: 100
      },
      position: [0, 0, 35]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initCube();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    // 半球光，光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
    const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
    hemisphereLight.position.set(0, 200, 0);
    THREE_CONST.scene.add(hemisphereLight);
    const light1 = new PointLight(0xffffff, 1, 0);
    light1.position.set(0, 200, 0);
    THREE_CONST.scene.add(light1);
    const light2 = new PointLight(0xffffff, 1, 0);
    light2.position.set(100, 200, 100);
    THREE_CONST.scene.add(light2);
    const light3 = new PointLight(0xffffff, 1, 0);
    light3.position.set(-100, -200, -100);
    THREE_CONST.scene.add(light3);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true });
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
  // 生成一个 cube 放入场景中
  const initCube = () => {
    const geometry = new TorusKnotGeometry(10, 3, 200, 32);
    const material = new TMeshPhongMaterial({
      color: 0x049ef4,
      specular: 0xf20202, // 高光颜色
      shininess: 100
    });
    cube = new Mesh(geometry, material);
    THREE_CONST.scene.add(cube);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
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
export default MeshPhongMaterial;
