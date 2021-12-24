/**
 * @description: 雾-指数
 * 该类所包含的参数定义了指数雾，它可以在相机附近提供清晰的视野，且距离相机越远，雾的浓度随着指数增长越快。
 * @author: cnn
 * @createTime: 2021/12/23 14:34
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, Clock, FogExp2 as TFogExp2, PlaneGeometry,
  DynamicDrawUsage, TextureLoader, RepeatWrapping, MeshBasicMaterial, Mesh
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

let clock: any;
const worldWidth = 128;
const worldDepth = 128;
let geometry: any;
let material: any;
let mesh: any;
let controls: any;

const FogExp2 = () => {
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
      background: new Color(0xaaccff),
      fog: new TFogExp2(0xaaccff, 0.0007)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 60,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 20000,
      },
      position: [0, 200, 0]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    clock = new Clock();
    initGeometry();
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
    controls = new FirstPersonControls(THREE_CONST.camera, renderer.domElement);
    controls.movementSpeed = 500;
    controls.lookSpeed = 0.1;
    animate();
  };
  // 生成几何体
  const initGeometry = () => {
    geometry = new PlaneGeometry(20000, 20000, worldWidth - 1, worldDepth - 1);
    geometry.rotateX(-Math.PI / 2);
    // 产生波浪效果
    const position: any = geometry.attributes.position;
    position.usage = DynamicDrawUsage;
    for (let i = 0; i < position.count; i++) {
      const y = 35 * Math.sin(i / 2);
      position.setY(i, y);
    }
    const texture = new TextureLoader().load(staticUrlPrefix + 'textures/water.png');
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(5, 5);
    material = new MeshBasicMaterial({
      color: 0x0044ff,
      map: texture
    });
    mesh = new Mesh(geometry, material);
    THREE_CONST.scene.add(mesh);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    const delta = clock.getDelta();
    const time = clock.getElapsedTime() * 10;
    // 产生波浪效果
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const y = 35 * Math.sin(i / 5 + (time + i) / 7);
      position.setY(i, y);
    }
    position.needsUpdate = true;
    controls.update(delta);
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    controls.handleResize();
  };
  return <div id="threeContainer" />;
};
export default FogExp2;
