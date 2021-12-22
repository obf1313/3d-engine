/**
 * @description: 管道缓冲几何体
 * @author: cnn
 * @createTime: 2021/11/18 9:21
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, TubeGeometry as TTubeGeometry, MeshBasicMaterial, Mesh,
  DoubleSide, Vector3, Curve
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let tubeGeometry: any;

class CustomSinCurve extends Curve<any> {
  private scale: number;
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }
  // 生成曲线上的位置点
  getPoint = (t: number, optionalTarget = new Vector3()) => {
    const tx = t * 3 - 1.5;
    const ty = Math.sin(2 * Math.PI * t);
    const tz = 0;
    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  };
}

const TubeGeometry = () => {
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
      tubeGeometry = null;
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
      background: new Color(0x000000)
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
    initTubeGeometry();
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
  // 生成一个 tubeGeometry 放入场景中
  const initTubeGeometry = () => {
    // Curve - 用于创建包含插值方法的 Curve 对象的抽象基类。 有关 Curve 的数组，请参见 CurvePath。
    // path — Curve - 一个由基类 Curve 继承而来的3D路径。 Default is a quadratic bezier curve.
    // tubularSegments — Integer - 组成这一管道的分段数，默认值为 64。
    // radius — Float - 管道的半径，默认值为 1。
    // radialSegments — Integer - 管道横截面的分段数目，默认值为 8。
    // closed — Boolean 管道的两端是否闭合，默认值为 false。
    const path = new CustomSinCurve(10);
    const geometry = new TTubeGeometry(path, 20, 3, 8, false);
    const material = new MeshBasicMaterial({
      color: 0x22e040,
      side: DoubleSide,
      wireframe: true,
    });
    tubeGeometry = new Mesh(geometry, material);
    THREE_CONST.scene.add(tubeGeometry);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    if (tubeGeometry) {
      tubeGeometry.rotation.x += 0.01;
      tubeGeometry.rotation.y += 0.01;
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
export default TubeGeometry;
