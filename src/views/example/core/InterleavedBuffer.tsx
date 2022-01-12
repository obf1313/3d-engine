/**
 * @description: 交叉存储流
 * "交叉存储" 表明多个类型的 attributes （例如，顶点位置、法向量、UV 和 颜色值）被存储到一个队列中。
 * @author: cnn
 * @createTime: 2022/1/11 15:59
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, InterleavedBuffer as TInterleavedBuffer, Fog, BufferGeometry,
  InterleavedBufferAttribute, PointsMaterial, Points
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let points: any;

const InterleavedBuffer = () => {
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
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene({
      background: new Color(0x050505),
      fog: new Fog(0x050505, 2000, 3500)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 27,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 5,
        far: 3500,
      },
      position: [0, 0, 2750]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initGeometry();
    setThreeContainer(threeContainer);
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
  // 生成一个 几何体 放入场景中
  const initGeometry = () => {
    const particles = 500000;
    const geometry = new BufferGeometry();
    const arrayBuffer = new ArrayBuffer(particles * 16);
    const interleavedFloat32Buffer = new Float32Array(arrayBuffer); // 顶点
    const interleavedUint8Buffer = new Uint8Array(arrayBuffer); // 颜色
    const color = new Color();
    const n = 1000;
    const n2 = n / 2;
    for (let i = 0; i < interleavedFloat32Buffer.length; i += 4) {
      const x = Math.random() * n - n2;
      const y = Math.random() * n - n2;
      const z = Math.random() * n - n2;
      interleavedFloat32Buffer[i] = x;
      interleavedFloat32Buffer[i + 1] = y;
      interleavedFloat32Buffer[i + 2] = z;
      const vx = (x / n) + 0.5;
      const vy = (y / n) + 0.5;
      const vz = (z / n) + 0.5;
      color.setRGB(vx, vy, vz);
      const j = (i + 3) * 4;
      interleavedUint8Buffer[j] = color.r * 255;
      interleavedUint8Buffer[j + 1] = color.g * 255;
      interleavedUint8Buffer[j + 2] = color.b * 255;
      interleavedUint8Buffer[j + 3] = 0;
    }
    // 那也没有全都存到一个队列，无语
    const interleavedBuffer32 = new TInterleavedBuffer(interleavedFloat32Buffer, 4);
    const interleavedBuffer8 = new TInterleavedBuffer(interleavedUint8Buffer, 16);
    geometry.setAttribute('position', new InterleavedBufferAttribute(interleavedBuffer32, 3, 0, false));
    geometry.setAttribute('color', new InterleavedBufferAttribute(interleavedBuffer8, 3, 12, true));
    const material = new PointsMaterial({ size: 15, vertexColors: true });
    points = new Points(geometry, material);
    THREE_CONST.scene.add(points);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    const time = Date.now() * 0.001;
    points.rotation.x = time * 0.25;
    points.rotation.y = time * 0.5;
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
export default InterleavedBuffer;
