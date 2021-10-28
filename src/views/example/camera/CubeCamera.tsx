/**
 * @description: 立方相机
 * @author: cnn
 * @createTime: 2021/10/27 11:29
 **/
import React, { useEffect, useState } from 'react';
import {
  WebGLRenderer, CubeCamera as TCubeCamera, TextureLoader, sRGBEncoding,
  EquirectangularReflectionMapping, WebGLCubeRenderTarget, RGBFormat, LinearMipmapLinearFilter,
  MeshBasicMaterial, MultiplyOperation, Mesh, IcosahedronGeometry, BoxGeometry,
  TorusKnotGeometry, MathUtils
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let onPointerDownPointerX: number;
let onPointerDownPointerY: number;
let onPointerDownLon: number;
let onPointerDownLat: number;
let lon = 0;
let lat = 0;
let phi = 0;
let theta = 0;
let count = 0;
let cube: any;
let sphere: any;
let torus: any;
let cubeCamera1: any;
let cubeCamera2: any;
let cubeRenderTarget1: any;
let cubeRenderTarget2: any;
let material: any;

const CubeCamera = () => {
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
      animate();
      window.addEventListener('resize', onWindowResize, false);
      threeContainer.addEventListener('pointerdown', onPointerDown);
      threeContainer.addEventListener('whheel', onWheel);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load('/modelStatic/three/home.jpg');
    texture.encoding = sRGBEncoding;
    texture.mapping = EquirectangularReflectionMapping;
    THREE_CONST.scene = initScene({
      background: texture
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 60,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      }
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initCubeCamera();
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
    threeContainer.appendChild(renderer.domElement);
    setRenderer(renderer);
  };
  // 生成立方相机
  const initCubeCamera = () => {
    cubeRenderTarget1 = new WebGLCubeRenderTarget(256, {
      format: RGBFormat,
      generateMipmaps: true,
      minFilter: LinearMipmapLinearFilter,
      encoding: sRGBEncoding
    });
    cubeCamera1 = new TCubeCamera(1, 1000, cubeRenderTarget1);
    cubeRenderTarget2 = new WebGLCubeRenderTarget(256, {
      format: RGBFormat,
      generateMipmaps: true,
      minFilter: LinearMipmapLinearFilter,
      encoding: sRGBEncoding
    });
    cubeCamera2 = new TCubeCamera(1, 1000, cubeRenderTarget2);
    material = new MeshBasicMaterial({
      envMap: cubeRenderTarget2.texture,
      combine: MultiplyOperation,
      reflectivity: 1
    });
    // IcosahedronGeometry： 二十面缓冲几何体
    sphere = new Mesh(new IcosahedronGeometry(20, 8), material);
    THREE_CONST.scene.add(sphere);
    cube = new Mesh(new BoxGeometry(20, 20, 20), material);
    THREE_CONST.scene.add(cube);
    // 圆环缓冲扭结几何体
    torus = new Mesh(new TorusKnotGeometry(10, 5, 128, 16), material);
    THREE_CONST.scene.add(torus);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // render
  const render = () => {
    const time = Date.now();
    lon += 0.15;
    lat = Math.max(-85, Math.min(85, lat));
    phi = MathUtils.degToRad(90 - lat);
    theta = MathUtils.degToRad(lon);
    cube.position.x = Math.cos(time * 0.001) * 30;
    cube.position.y = Math.sin(time * 0.001) * 30;
    cube.position.z = Math.sin(time * 0.001) * 30;
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.03;
    torus.position.x = Math.cos(time * 0.001 + 10) * 30;
    torus.position.y = Math.sin(time * 0.001 + 10) * 30;
    torus.position.z = Math.sin(time * 0.001 + 10) * 30;
    torus.rotation.x += 0.02;
    torus.rotation.y += 0.03;
    THREE_CONST.camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
    THREE_CONST.camera.position.y = 100 * Math.cos(phi);
    THREE_CONST.camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);
    THREE_CONST.camera.lookAt(THREE_CONST.scene.position);
    if (count % 2 === 0) {
      cubeCamera1.update(renderer, THREE_CONST.scene);
      material.envMap = cubeRenderTarget1.texture;
    } else {
      cubeCamera2.update(renderer, THREE_CONST.scene);
      material.envMap = cubeRenderTarget2.texture;
    }
    count++;
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听事件
  const onPointerDown = (event: any) => {
    event.preventDefault();
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    threeContainer.addEventListener('pointermove', onPointerMove);
    threeContainer.addEventListener('pointerup', onPointerUp);
  };
  const onPointerMove = (event: any) => {
    lon = (event.clientX - onPointerDownPointerX) * 0.1 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
  };
  const onPointerUp = () => {
    threeContainer.removeEventListener('pointermove', onPointerMove);
    threeContainer.removeEventListener('pointerup', onPointerUp);
  };
  // 滚轮事件
  const onWheel = (event: any) => {
    const fov = THREE_CONST.camera.fov + event.deltaY * 0.05;
    THREE_CONST.camera.fov = MathUtils.clamp(fov, 10, 75);
    THREE_CONST.camera.updateProjectionMatrix();
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default CubeCamera;