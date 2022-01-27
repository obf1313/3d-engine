/**
 * @description: 形状
 * 使用路径以及可选的孔洞来定义一个二维形状平面。
 * 它可以和 ExtrudeGeometry、ShapeGeometry 一起使用，获取点，或者获取三角面。
 * @author: cnn
 * @createTime: 2022/1/27 9:14
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, Shape as TShape, WebGLRenderer,
  AmbientLight, PointLight, CatmullRomCurve3, Vector3, Vector2, ExtrudeGeometry, MeshLambertMaterial, Mesh, MathUtils
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

const Shape = () => {
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
      background: new Color(0x222222)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 45,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      },
      position: [0, 0, 500]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initPath();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    THREE_CONST.scene.add(new AmbientLight(0x222222));
    const light = new PointLight(0xffffff);
    light.position.copy(THREE_CONST.camera.position);
    THREE_CONST.scene.add(light);
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
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.minDistance = 200;
    controls.maxDistance = 500;
    controls.update();
    animate();
  };
  // 生成形状
  const initPath = () => {
    // 红色飘带
    // 使用 Catmull-Rom 算法， 从一系列的点创建一条平滑的三维样条曲线。
    const closedSpline: any = new CatmullRomCurve3([
      new Vector3(-60, -100, 60),
      new Vector3(-60, 20, 60),
      new Vector3(-60, 120, 60),
      new Vector3(60, 20, -60),
      new Vector3(60, -100, -60),
    ]);
    // 曲线类型
    closedSpline.curveType = 'catmullrom';
    closedSpline.closed = true;
    const extrudeSettings1 = {
      steps: 100,
      bevelEnabled: false,
      extrudePath: closedSpline
    };
    const pts1 = [];
    const count = 3;
    for (let i = 0; i < count; i++) {
      const l = 20;
      const a = 2 * i / count * Math.PI;
      pts1.push(new Vector2(Math.cos(a) * l, Math.sin(1) * l));
    }
    const shape1 = new TShape(pts1);
    // 挤压缓冲几何体
    const geometry1 = new ExtrudeGeometry(shape1, extrudeSettings1);
    const material1 = new MeshLambertMaterial({ color: 0xb00000, wireframe: false });
    const mesh1 = new Mesh(geometry1, material1);
    THREE_CONST.scene.add(mesh1);
    // 五角星柱形图
    const randomPoints = [];
    for (let i = 0; i < 10; i++) {
      randomPoints.push(new Vector3(
        (i - 4.5) * 50,
        MathUtils.randFloat(-50, 50),
        MathUtils.randFloat(-50, 50)
      ));
    }
    const randomSpline = new CatmullRomCurve3(randomPoints);
    const extrudeSettings2 = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: randomSpline
    };
    const pts2 = [];
    const numPts = 5;
    for (let i = 0; i < numPts * 2; i++) {
      const l = i % 2 === 1 ? 10 : 20;
      const a = i / numPts * Math.PI;
      pts2.push(new Vector2(Math.cos(a) * l, Math.sin(a) * l));
    }
    const shape2 = new TShape(pts2);
    const geometry2 = new ExtrudeGeometry(shape2, extrudeSettings2);
    const material2 = new MeshLambertMaterial({ color: 0xff8000, wireframe: false });
    const mesh2 = new Mesh(geometry2, material2);
    THREE_CONST.scene.add(mesh2);
    // 立体五角星
    const materials = [material1, material2];
    const extrudeSettings3 = {
      depth: 20,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 4,
      bevelSegments: 1
    };
    const geometry3 = new ExtrudeGeometry(shape2, extrudeSettings3);
    const mesh3 = new Mesh(geometry3, materials);
    mesh3.position.set(50, 100, 50);
    THREE_CONST.scene.add(mesh3);
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
export default Shape;
