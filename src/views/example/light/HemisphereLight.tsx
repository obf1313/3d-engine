/**
 * @description: 半球光
 * 光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
 * 半球光不能投射阴影。
 * @author: cnn
 * @createTime: 2021/12/2 10:44
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, BoxGeometry as TBoxGeometry, MeshPhongMaterial,
  Mesh, HemisphereLight as THemisphereLight
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let cube: any;

const HemisphereLight = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  const [currentLight, setCurrentLight] = useState<any>();
  const [skyColor, setSkyColor] = useState<string>('#ff0000');
  const [groundColor, setGroundColor] = useState<string>('#ffff00');
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
      background: new Color(0xffffff)
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
    initLight(0xff0000, 'sky');
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
  // 初始化灯源
  const initLight = (color: any, type: string) => {
    if (currentLight) {
      THREE_CONST.scene.remove(currentLight);
    }
    // 环境光
    let light = new THemisphereLight(color, groundColor);
    if (type === 'ground') {
      light = new THemisphereLight(skyColor, color);
    }
    setCurrentLight(light);
    THREE_CONST.scene.add(light);
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    const geometry = new TBoxGeometry(20, 20, 20);
    const material = new MeshPhongMaterial({ color: 0xffffff });
    cube = new Mesh(geometry, material);
    THREE_CONST.scene.add(cube);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 监听颜色变化
  const onColorChange = (e: any, type: string) => {
    const color = e.target.value;
    if (type === 'sky') {
      setSkyColor(color);
    } else {
      setGroundColor(color);
    }
    initLight(color, type);
  };
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 20,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <input type="color" value={skyColor} onChange={(e: any) => onColorChange(e, 'sky')} />
        <div style={{ marginLeft: 10 }}>点击可修改当前半球光源天空光线颜色</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 20,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <input type="color" value={groundColor} onChange={(e: any) => onColorChange(e, 'ground')} />
        <div style={{ marginLeft: 10 }}>点击可修改当前半球光源地面光线颜色</div>
      </div>
      <div id="threeContainer" />
    </>
  );
};
export default HemisphereLight;