/**
 * @description: 挤压缓冲几何体
 * 该对象将一个二维形状挤出为一个三维几何体。
 * @author: cnn
 * @createTime: 2021/11/17 15:17
 **/
import React, { useEffect, useState } from 'react';
import { Color, WebGLRenderer, ExtrudeGeometry as TExtrudeGeometry, MeshBasicMaterial, Mesh, Shape } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let extrudeGeometry: any;

const ExtrudeGeometry = () => {
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
      background: new Color(0xcce0ff)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 45,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 100,
      },
      position: [0, 200, 200]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initExtrudeGeometry();
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
  // 生成一个 extrudeGeometry 放入场景中
  const initExtrudeGeometry = () => {
    const height = 12;
    const width = 8;
    const shape = new Shape();
    // 长方形
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(height, width);
    shape.lineTo(height, 0);
    shape.lineTo(0, 0);
    const extrudeSettings = {
      steps: 2, // 用于沿着挤出样条的深度细分的点的数量，默认值为 1。
      depth: 16, // 挤出的形状的深度，默认值为 1。
      bevelEnabled: true, // 对挤出的形状应用是否斜角，默认值为 true。
      bevelThickness: 1, // 设置原始形状上斜角的厚度。默认值为 0.2。
      bevelSize: 1, // 斜角与原始形状轮廓之间的延伸距离，默认值为 bevelThickness-0.1 什么意思？。
      bevelOffset: 0, // 斜角开始到原始形状轮廓的距离，默认值 0。
      bevelSegments: 1, // 斜角的分段层数，默认值为3。
    };
    const geometry = new TExtrudeGeometry(shape, extrudeSettings);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    extrudeGeometry = new Mesh(geometry, material);
    THREE_CONST.scene.add(extrudeGeometry);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    if (extrudeGeometry) {
      extrudeGeometry.rotation.x += 0.01;
      extrudeGeometry.rotation.y += 0.01;
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
export default ExtrudeGeometry;