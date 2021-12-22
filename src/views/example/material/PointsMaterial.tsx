/**
 * @description: 点材质
 * Points 使用的默认材质。
 * @author: cnn
 * @createTime: 2021/12/16 9:33
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, HemisphereLight, DirectionalLight, WebGLRenderer,
  FogExp2, BufferGeometry, TextureLoader, Float32BufferAttribute,
  PointsMaterial as TPointsMaterial, Points
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';

let material: any;
let mouseX: number = 0;
let mouseY: number = 0;
let windowHalfX: number = window.innerWidth / 2;
let windowHalfY: number = window.innerHeight / 2;

const PointsMaterial = () => {
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
      material = null;
      mouseX = 0;
      mouseY = 0;
      windowHalfX = 0;
      windowHalfY = 0;
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
      animate();
      window.addEventListener('resize', onWindowResize, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene({
      background: new Color(0x000000),
      fog: new FogExp2(0x000000, 0.001)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 55,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 2,
        far: 2000,
      },
      position: [0, 0, 1000]
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
    THREE_CONST.scene.add(directionalLight);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
    threeContainer.style.touchAction = 'none';
    threeContainer.addEventListener('mousemove', onPointerMove);
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    const geometry = new BufferGeometry();
    const vertices = [];
    const sprite = new TextureLoader().load(staticUrlPrefix + 'textures/disc.png');
    for (let i = 0; i < 10000; i++) {
      const x = 2000 * Math.random() - 1000;
      const y = 2000 * Math.random() - 1000;
      const z = 2000 * Math.random() - 1000;
      vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    material = new TPointsMaterial({
      size: 35,
      sizeAttenuation: true,
      map: sprite,
      alphaTest: 0.5,
      transparent: true
    });
    material.color.setHSL(1.0, 0.3, 0.7);
    const particles = new Points(geometry, material);
    THREE_CONST.scene.add(particles);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    if (THREE_CONST.camera) {
      const time = Date.now() * 0.00005;
      THREE_CONST.camera.position.x += (mouseX - THREE_CONST.camera.position.x) * 0.05;
      THREE_CONST.camera.position.y += (-mouseY - THREE_CONST.camera.position.y) * 0.05;
      THREE_CONST.camera.lookAt(THREE_CONST.scene.position);
      const h = (360 * (1.0 + time) % 360) / 360;
      material.color.setHSL(h, 0.5, 0.5);
      renderer.render(THREE_CONST.scene, THREE_CONST.camera);
    }
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 鼠标移动事件
  const onPointerMove = (event: any) => {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  };
  return <div id="threeContainer" />;
};
export default PointsMaterial;
