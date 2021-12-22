/**
 * @description: 2D数组数据纹理
 * 直接从原始数据、宽度、高度和深度创建纹理数组。
 * 这种类型的纹理只能与 WebGL 2 渲染上下文一起使用。
 * @author: cnn
 * @createTime: 2021/12/21 13:25
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, BoxGeometry, Mesh, DataTexture2DArray as TDataTexture2DArray,
  RGBFormat, UnsignedByteType, MeshBasicMaterial, sRGBEncoding
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

const DataTexture2DArray = () => {
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
    initCube();
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
    renderer.outputEncoding = sRGBEncoding;
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
    // todo 不知道为啥是白色的
    const width = 20;
    const height = 20;
    const depth = 20;
    const size = width * height;
    const data = new Uint8Array(3 * size * depth);
    for (let i = 0; i < depth; i++) {
      const color = new Color(Math.random(), Math.random(), Math.random());
      const r = Math.floor(color.r * 255);
      const g = Math.floor(color.g * 255);
      const b = Math.floor(color.b * 255);
      for (let j = 0; j < size; j++) {
        const stride = (i * size + j) * 3;
        data[stride] = r;
        data[stride + 1] = g;
        data[stride + 2] = b;
      }
    }
    const texture = new TDataTexture2DArray(data, width, height, depth);
    texture.format = RGBFormat;
    texture.type = UnsignedByteType;
    const geometry = new BoxGeometry(width, height, depth);
    const material = new MeshBasicMaterial({
      map: texture
    });
    const cube = new Mesh(geometry, material);
    THREE_CONST.scene.add(cube);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
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
export default DataTexture2DArray;
