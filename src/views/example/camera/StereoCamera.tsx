/**
 * @description: 立体相机
 * 双透视摄像机（立体相机）常被用于创建 3D Anaglyph（3D立体影像） 或者 Parallax Barrier（视差屏障）。
 * @author: cnn
 * @createTime: 2021/10/28 13:19
 **/
import React, { useEffect, useState } from 'react';
import {
  WebGLRenderer, MeshBasicMaterial, Mesh, CubeTextureLoader, SphereGeometry
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect';
import { staticUrlPrefix } from '@utils/CommonVars';

let textureCube: any;
let spheres: Array<any> = [];
let effect: any;
let windowHalfX: number = getClientWidth() / 2;
let windowHalfY: number = (getClientHeight() - 60) / 2;
let mouseX: number = 0;
let mouseY: number = 0;

// 虽然但是其实我并不理解这个例子和 StereoCamera 有什么联系，其实是 AnaglyphEffect 这个里面用了
const StereoCamera = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  useEffect(() => {
    initMyScene();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onDocumentMouseMove);
      // 重置全局变量
      resetThreeConst();
      spheres = [];
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
      const width = getClientWidth() || 2;
      const height = (getClientHeight() - 60) || 2;
      effect = new AnaglyphEffect(renderer);
      effect.setSize(width, height);
      animate();
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('mousemove', onDocumentMouseMove);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    const path = staticUrlPrefix + 'cube/';
    const format = '.png';
    const urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 60,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 0.01,
        far: 100,
      },
      position: [0, 0, 3]
    });
    THREE_CONST.camera.focalLength = 3;
    textureCube = new CubeTextureLoader().load(urls);
    THREE_CONST.scene = initScene({
      background: textureCube
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initSphereGeometry();
    setThreeContainer(threeContainer);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    const renderer = new WebGLRenderer();
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    threeContainer.appendChild(renderer.domElement);
    setRenderer(renderer);
  };
  // 生成一堆球球
  const initSphereGeometry = () => {
    const geometry = new SphereGeometry(0.1, 32, 16);
    const material = new MeshBasicMaterial({ color: 0xffffff, envMap: textureCube });
    for (let i = 0; i < 500; i++) {
      const mesh = new Mesh(geometry, material);
      mesh.position.x = Math.random() * 10 - 5;
      mesh.position.y = Math.random() * 10 - 5;
      mesh.position.z = Math.random() * 10 - 5;
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
      THREE_CONST.scene.add(mesh);
      spheres.push(mesh);
    }
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    windowHalfX = getClientWidth() / 2;
    windowHalfY = (getClientHeight() - 60) / 2;
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 鼠标移动事件
  const onDocumentMouseMove = (event: MouseEvent) => {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
  };
  // render
  const render = () => {
    const timer = 0.0001 * Date.now();
    THREE_CONST.camera.position.x += (mouseX - THREE_CONST.camera.position.x) * 0.05;
    THREE_CONST.camera.position.y += (-mouseY - THREE_CONST.camera.position.y) * 0.05;
    THREE_CONST.camera.lookAt(THREE_CONST.scene.position);
    for (let i = 0, il = spheres.length; i < il; i++) {
      const sphere = spheres[i];
      sphere.position.x = 5 * Math.cos(timer + i);
      sphere.position.y = 5 * Math.sin(timer + i * 1.1);
    }
    effect.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  return <div id="threeContainer" />;
};
export default StereoCamera;
