/**
 * @description: CatmullRomCurve3
 * 使用 Catmull-Rom 算法，从一系列的点创建一条平滑的三维样条曲线。
 * @author: cnn
 * @createTime: 2022/1/27 13:11
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, DirectionalLight, WebGLRenderer, Object3D, CameraHelper,
  CatmullRomCurve3 as TCatmullRomCurve3, Vector3, TubeGeometry, Mesh, MeshLambertMaterial,
  MeshBasicMaterial, SphereGeometry
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { Curves } from 'three/examples/jsm/curves/CurveExtras';
// @ts-ignore
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

let mesh: any;
let parent: any;
let tubeGeometry: any;
let splineCamera: any;
let cameraEye: any;
let cameraHelper: any;
const direction = new Vector3();
const binoraml = new Vector3();
const normal = new Vector3();
const position = new Vector3();
const lookAt = new Vector3();
const pipeSpline = new TCatmullRomCurve3([
  new Vector3(0, 10, - 10), new Vector3(10, 0, - 10),
  new Vector3(20, 0, 0), new Vector3(30, 0, 10),
  new Vector3(30, 0, 20), new Vector3(20, 0, 30),
  new Vector3(10, 0, 30), new Vector3(0, 0, 30),
  new Vector3(- 10, 10, 30), new Vector3(- 10, 20, 30),
  new Vector3(0, 30, 30), new Vector3(10, 30, 30),
  new Vector3(20, 30, 15), new Vector3(10, 30, 10),
  new Vector3(0, 30, 10), new Vector3(- 10, 20, 10),
  new Vector3(- 10, 10, 10), new Vector3(0, 0, 10),
  new Vector3(10, - 10, 10), new Vector3(20, - 15, 10),
  new Vector3(30, - 15, 10), new Vector3(40, - 15, 10),
  new Vector3(50, - 15, 10), new Vector3(60, 0, 10),
  new Vector3(70, 0, 0), new Vector3(80, 0, 0),
  new Vector3(90, 0, 0), new Vector3(100, 0, 0)
]);
const sampleClosedSpline = new TCatmullRomCurve3([
  new Vector3(0, - 40, - 40),
  new Vector3(0, 40, - 40),
  new Vector3(0, 140, - 40),
  new Vector3(0, 40, 40),
  new Vector3(0, - 40, 40)
]);
const splines: any = {
  GrannyKnot: new Curves.GrannyKnot(),
  HeartCurve: new Curves.HeartCurve(3.5),
  VivianiCurve: new Curves.VivianiCurve(70),
  KnotCurve: new Curves.KnotCurve(),
  HelixCurve: new Curves.HeartCurve(),
  TrefoilKnot: new Curves.TrefoilKnot(),
  TorusKnot: new Curves.TorusKnot(20),
  CinquefoilKnot: new Curves.CinquefoilKnot(20),
  TrefoilPolynomialKnot: new Curves.TrefoilPolynomialKnot(14),
  DecoratedTorusKnot4a: new Curves.DecoratedTorusKnot4a(),
  DecoratedTorusKnot4b: new Curves.DecoratedTorusKnot4b(),
  DecoratedTorusKnot5a: new Curves.DecoratedTorusKnot5a(),
  DecoratedTorusKnot5c: new Curves.DecoratedTorusKnot5c(),
  PipeSpline: pipeSpline,
  SampleClosedSpline: sampleClosedSpline
};
const params = {
  spline: 'GrannyKnot',
  scale: 4,
  extrusionSegments: 100,
  radiusSegments: 3,
  closed: true,
  animationView: false,
  lookAhead: false,
  cameraHelper: false
};

const CatmullRomCurve3 = () => {
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
      background: new Color(0xf0f0f0)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 50,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 0.01,
        far: 10000,
      },
      position: [0, 50, 500]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initTube();
    setThreeContainer(threeContainer);
    const gui = new GUI({ autoPlace: false });
    // 修改默认位置
    const customContainer = document.getElementById('gui') || document.body;
    customContainer.appendChild(gui.domElement);
    const folderGeometry = gui.addFolder('Geometry');
    folderGeometry.add(params, 'spline', Object.keys(splines)).onChange(function () {
      addTube();
    });
    folderGeometry.add(params, 'scale', 2, 10).step(2).onChange(function () {
      setScale();
    });
    folderGeometry.add(params, 'extrusionSegments', 50, 500).step(50).onChange(function () {
      addTube();
    });
    folderGeometry.add(params, 'radiusSegments', 2, 12).step(1).onChange(function () {
      addTube();
    });
    folderGeometry.add(params, 'closed').onChange(function () {
      addTube();
    });
    folderGeometry.open();
    const folderCamera = gui.addFolder('Camera');
    folderCamera.add(params, 'animationView').onChange(function () {
      animateCamera();
    });
    folderCamera.add(params, 'lookAhead').onChange(function () {
      animateCamera();
    });
    folderCamera.add(params, 'cameraHelper').onChange(function () {
      animateCamera();
    });
    folderCamera.open();
  };
  // 初始化光源
  const initLight = () => {
    const light = new DirectionalLight(0xffffff);
    light.position.set(0, 0, 1);
    THREE_CONST.scene.add(light);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true });
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
    controls.minDistance = 100;
    controls.maxDistance = 2000;
    controls.update();
    animate();
  };
  // 使 camera 动起来
  const animateCamera = () => {
    cameraHelper.visible = params.cameraHelper;
    cameraEye.visible = params.animationView;
  };
  // 设置缩放
  const setScale = () => {
    mesh.scale.set(params.scale, params.scale, params.scale);
  };
  // 添加管道
  const addTube = () => {
    if (mesh !== undefined) {
      parent.remove(mesh);
      mesh.geometry.dispose();
    }
    const extrudePath = splines[params.spline];
    tubeGeometry = new TubeGeometry(
      extrudePath,
      params.extrusionSegments,
      2,
      params.radiusSegments,
      params.closed
    );
    addGeometry(tubeGeometry);
    setScale();
  };
  // 添加几何体
  const addGeometry = (geometry: any) => {
    const material = new MeshLambertMaterial({ color: 0xff00ff });
    const wireframeMaterial = new MeshBasicMaterial({ color: 0x000000, opacity: 0.3, wireframe: true, transparent: true });
    mesh = new Mesh(geometry, material);
    const wireframe = new Mesh(geometry, wireframeMaterial);
    mesh.add(wireframe);
    parent.add(mesh);
  };
  // 生成管道
  const initTube = () => {
    parent = new Object3D();
    THREE_CONST.scene.add(parent);
    splineCamera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 84,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 0.01,
        far: 1000,
      }
    });
    parent.add(splineCamera);
    cameraHelper = new CameraHelper(splineCamera);
    THREE_CONST.scene.add(cameraHelper);
    addTube();
    cameraEye = new Mesh(new SphereGeometry(5), new MeshBasicMaterial({ color: 0xdddddd }));
    parent.add(cameraEye);
    cameraHelper.visible = params.cameraHelper;
    cameraEye.visible = params.cameraHelper;
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    // todo 这一段都没看懂。
    // 相机沿着管道动起来
    const time = Date.now();
    const loopTime = 20 * 1000;
    const t = (time % loopTime) / loopTime;
    tubeGeometry.parameters.path.getPointAt(t, position);
    position.multiplyScalar(params.scale);
    // interpolation
    const segments = tubeGeometry.tangents.length;
    const pickt = t * segments;
    const pick = Math.floor(pickt);
    const pickNext = (pick + 1) % segments;
    binoraml.subVectors(tubeGeometry.binormals[pickNext], tubeGeometry.binormals[pick]);
    binoraml.multiplyScalar(pickt - pick).add(tubeGeometry.binormals[pick]);
    tubeGeometry.parameters.path.getTangentAt(t, direction);
    const offset = 15;
    normal.copy(binoraml).cross(direction);
    // 抵消其副法线
    position.add(normal.clone().multiplyScalar(offset));
    splineCamera.position.copy(position);
    cameraEye.position.copy(position);
    // 使用 arcLength 调节向前稳定性
    tubeGeometry.parameters.path.getPointAt((t + 30 / tubeGeometry.parameters.path.getLength()) % 1, lookAt);
    lookAt.multiplyScalar(params.scale);
    // camera orientation 2 - up orientation via normal
    if (!params.lookAhead) {
      lookAt.copy(position).add(direction);
    }
    splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
    splineCamera.quaternion.setFromRotationMatrix(splineCamera.matrix);
    cameraHelper.update();
    renderer.render(THREE_CONST.scene, params.animationView ? splineCamera : THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return (
    <div style={{ position: 'relative' }}>
      <div id="gui" style={{ position: 'absolute', top: 20, right: 20 }} />
      <div id="threeContainer" />
    </div>
  );
};
export default CatmullRomCurve3;
