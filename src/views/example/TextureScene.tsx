/**
 * @description: 三维模型贴材质，材质使用导入图片作为纹理
 * @author: cnn
 * @createTime: 2021/9/17 10:26
 **/
import React, { useEffect, useState } from 'react';
import { CameraType, useCameraHook, useSceneHook } from '@components/index';
import {
  BoxGeometry, Color, DirectionalLight, HemisphereLight, Mesh,
  MeshBasicMaterial, WebGLRenderer, TextureLoader, RepeatWrapping
} from 'three';
import { getClientHeight, getClientWidth } from '@utils/CommonFunc';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const TextureScene = () => {
  const { scene } = useSceneHook({
    background: new Color(0xcce0ff)
  });
  const { camera } = useCameraHook({
    cameraType: CameraType.perspectiveCamera,
    position: [0, 200, 200]
  });
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  useEffect(() => {
    return () => {
      // 移除 animation
      if (animationId) {
        window.cancelAnimationFrame(animationId);
      }
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);
  useEffect(() => {
    if (scene && camera) {
      initScene();
    }
  }, [scene, camera]);
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
  const initScene = () => {
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
    scene.add(hemisphereLight);
    // 平行光
    // 平行光是沿着特定方向发射的光。
    // 这种光的表现像是无限远，从它发出的光线都是平行的。
    // 常常用平行光来模拟太阳光 的效果; 太阳足够远，因此我们可以认为太阳的位置是无限远，所以我们认为从太阳发出的光线也都是平行的。
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(0, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 180;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.left = -120;
    directionalLight.shadow.camera.right = 120;
    scene.add(directionalLight);
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
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    animate();
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    const geometry = new BoxGeometry(20, 20, 20);
    // 初始化纹理
    const texture = new TextureLoader().load('/modelStatic/three/crate.gif');
    texture.wrapS = texture.wrapT = RepeatWrapping;
    const material = new MeshBasicMaterial({
      map: texture
    });
    const cube = new Mesh(geometry, material);
    scene.add(cube);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    renderer.render(scene, camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    camera.aspect = getClientWidth() / (getClientHeight() - 60);
    camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default TextureScene;