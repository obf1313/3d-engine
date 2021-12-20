/**
 * @description: 卡通网格材质
 * 一种实现卡通着色的材质。
 * @author: cnn
 * @createTime: 2021/12/16 9:33
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, MeshToonMaterial as TMeshToonMaterial, SphereGeometry, DataTexture,
  LuminanceFormat, NearestFilter, Mesh, MeshBasicMaterial, AmbientLight,
  PointLight, sRGBEncoding
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';

let particleLight: any;
let effect: any;

const MeshToonMaterial = () => {
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
      particleLight = null;
      effect = null;
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
      background: new Color(0x444488)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 40,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 2500,
      },
      position: [0, 400, 400 * 30.5]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initCube();
    setThreeContainer(threeContainer);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true });
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    renderer.outputEncoding = sRGBEncoding;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
    effect = new OutlineEffect(renderer);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.minDistance = 200;
    controls.maxDistance = 2000;
    controls.update();
    animate();
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    const cubeWidth = 400;
    const numberOfSpheresPerSide = 5;
    const sphereRadius = (cubeWidth / numberOfSpheresPerSide) * 0.8 * 0.5;
    const stepSize = 1.0 / numberOfSpheresPerSide;
    const geometry = new SphereGeometry(sphereRadius, 32,16);
    for (let alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex++) {
      const colors = new Uint8Array(alphaIndex + 2);
      for (let c = 0; c <= colors.length; c++) {
        colors[c] = (c / colors.length) * 256;
      }
      const gradientMap = new DataTexture(colors, colors.length, 1, LuminanceFormat);
      gradientMap.minFilter = NearestFilter;
      gradientMap.magFilter = NearestFilter;
      gradientMap.generateMipmaps = false;
      for (let beta = 0; beta <= 1.0; beta += stepSize) {
        for (let gamma = 0; gamma <= 1.0; gamma += stepSize) {
          const diffuseColor = new Color().setHSL(alpha, 0.5, gamma * 0.5 + 0.1).multiplyScalar(1 - beta * 0.2);
          const material = new TMeshToonMaterial({
            color: diffuseColor,
            gradientMap: gradientMap
          });
          const mesh = new Mesh(geometry, material);
          mesh.position.x = alpha * 400 - 200;
          mesh.position.y = beta * 400 - 200;
          mesh.position.z = gamma * 400 - 200;
          THREE_CONST.scene.add(mesh);
        }
      }
    }
    particleLight = new Mesh(
      new SphereGeometry(4, 8, 8),
      new MeshBasicMaterial({
        color: 0xffffff
      })
    );
    THREE_CONST.scene.add(particleLight);
    THREE_CONST.scene.add(new AmbientLight(0x888888));
    const pointLight = new PointLight(0xffffff, 2, 800);
    particleLight.add(pointLight);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    if (effect) {
      const timer = Date.now() * 0.00025;
      particleLight.position.x = Math.sin(timer * 7) * 300;
      particleLight.position.y = Math.cos(timer * 5) * 400;
      particleLight.position.z = Math.cos(timer * 3) * 300;
      effect.render(THREE_CONST.scene, THREE_CONST.camera);
    }
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default MeshToonMaterial;
