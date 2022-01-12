/**
 * @description: 阴影材质
 * 此材质可以接收阴影，但在其他方面完全透明。
 * 并没有完成添加几何体移除几何体的操作，有些无用代码
 * @author: cnn
 * @createTime: 2021/12/16 9:35
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, ShadowMaterial as TShadowMaterial, WebGLRenderer, AmbientLight, SpotLight,
  PlaneGeometry, Mesh, GridHelper, Material, BufferGeometry,
  BufferAttribute, CatmullRomCurve3, Line, LineBasicMaterial, Vector3,
  MeshLambertMaterial, BoxGeometry, Vector2, Raycaster
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import {
  CameraType,
  getIntersectPosition,
  initCamera,
  initScene,
  resetThreeConst,
  THREE_CONST
} from '@utils/ThreeUtils';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

let transformControl: any;
let splinePointsLength: number = 4;
let splineHelperObjects: Array<any> = [];
let positions: Array<any> = [];
const ARC_SEGMENTS = 200;
const splines: any = {};
const geometry = new BoxGeometry(20, 20, 20);
const point = new Vector3();
const pointer = new Vector2();
const onDownPosition = new Vector2();
const onUpPosition = new Vector2();
const raycaster = new Raycaster();

const ShadowMaterial = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  useEffect(() => {
    initMyScene();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointermove', onPointerMove);
      // 重置全局变量
      resetThreeConst();
      splineHelperObjects = [];
      positions = [];
      transformControl = null;
    };
  }, []);
  useEffect(() => {
    if (threeContainer) {
      initRenderer();
    }
  }, [threeContainer]);
  useEffect(() => {
    if (renderer) {
      initControls();
      window.addEventListener('resize', onWindowResize, false);
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointermove', onPointerMove);
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
        fov: 70,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 10000,
      },
      position: [0, 250, 1000]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initGeometry();
    initCurves();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    THREE_CONST.scene.add(new AmbientLight(0xf0f0f0));
    const light = new SpotLight(0xffffff, 1.5);
    light.position.set(0, 1500, 200);
    light.angle = Math.PI * 0.2;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = -0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
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
    renderer.shadowMap.enabled = true;
    threeContainer.appendChild(renderer.domElement);
    setRenderer(renderer);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls: any = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.damping = 0.2;
    controls.addEventListener('change', render);
    transformControl = new TransformControls(THREE_CONST.camera, renderer.domElement);
    transformControl.addEventListener('change', render);
    transformControl.addEventListener('dragging-changed', (event: any) => {
      controls.enabled = !event.value;
    });
    THREE_CONST.scene.add(transformControl);
    transformControl.addEventListener('objectChange', () => {
      updateSplineOutLine();
    });
    render();
  };
  // 初始化几何体
  const initGeometry = () => {
    const planeGeometry = new PlaneGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const planeMaterial = new TShadowMaterial({
      color: 0x000000,
      opacity: 0.2
    });
    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.position.y = -200;
    plane.receiveShadow = true;
    THREE_CONST.scene.add(plane);
    const helper = new GridHelper(2000, 100);
    helper.position.y = -199;
    if (helper.material instanceof Material) {
      helper.material.opacity = 0.25;
      helper.material.transparent = true;
    }
    THREE_CONST.scene.add(helper);
  };
  // 初始化曲线
  const initCurves = () => {
    for (let i = 0; i < splinePointsLength; i++) {
      addSplineObject(positions[i]);
    }
    positions.length = 0;
    for (let i = 0; i < splinePointsLength; i++) {
      positions.push(splineHelperObjects[i].position);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));
    let curve: any = new CatmullRomCurve3(positions);
    curve.curveType = 'catmullrom';
    curve.mesh = new Line(geometry.clone(), new LineBasicMaterial({
      color: 0xff00000,
      opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.uniform = curve;
    curve = new CatmullRomCurve3(positions);
    // 向心线
    curve.curveType = 'centripetal';
    curve.mesh = new Line(geometry.clone(), new LineBasicMaterial({
      color: 0x00ff00,
      opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.centripetal = curve;
    curve = new CatmullRomCurve3(positions);
    // 弦线
    curve.curveType = 'chordal';
    curve.mesh = new Line(geometry.clone(), new LineBasicMaterial({
      color: 0x0000ff,
      opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.chordal = curve;
    for (const k in splines) {
      const spline = splines[k];
      THREE_CONST.scene.add(spline.mesh);
    }
    load([
      new Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
      new Vector3(- 53.56300074753207, 171.49711742836848, - 14.495472686253045),
      new Vector3(- 91.40118730204415, 176.4306956436485, - 6.958271935582161),
      new Vector3(- 383.785318791128, 491.1365363371675, 47.869296953772746)
    ]);
  };
  // 渲染
  const render = () => {
    splines.uniform.mesh.visible = true;
    splines.centripetal.mesh.visible = true;
    splines.chordal.mesh.visibile = true;
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 鼠标按下
  const onPointerDown = (e: any) => {
    onDownPosition.x = e.clientX;
    onDownPosition.y = e.clientY;
  };
  // 鼠标抬起
  const onPointerUp = (e: any) => {
    onUpPosition.x = e.clientX;
    onUpPosition.y = e.clientY;
    if (onDownPosition.distanceTo(onUpPosition) === 0) {
      transformControl.detach();
    }
  };
  // 鼠标移动
  const onPointerMove = (e: any) => {
    const { x, y } = getIntersectPosition(e, threeContainer);
    pointer.x = x;
    pointer.y = y;
    raycaster.setFromCamera(pointer, THREE_CONST.camera);
    const intersects = raycaster.intersectObjects(splineHelperObjects, false);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object !== transformControl.object) {
        transformControl.attach(object);
      }
    }
  };
  // 添加曲线
  const addSplineObject = (position?: any) => {
    const material = new MeshLambertMaterial({
      color: Math.random() * 0xffffff
    });
    const object = new Mesh(geometry, material);
    if (position) {
      object.position.copy(position);
    } else {
      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 600;
      object.position.z = Math.random() * 800 - 400;
    }
    object.castShadow = true;
    object.receiveShadow = true;
    THREE_CONST.scene.add(object);
    splineHelperObjects.push(object);
    return object;
  };
  // 更新曲线
  const updateSplineOutLine = () => {
    for (const k in splines) {
      const spline = splines[k];
      const splineMesh = spline.mesh;
      const position = splineMesh.geometry.attributes.position;
      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1);
        spline.getPoint(t, point);
        position.setXYZ(i, point.x, point.y, point.z);
      }
      position.needsUpdate = true;
    }
  };
  // 加载
  const load = (newPositions: any) => {
    while (newPositions.length > positions.length) {
      addPoint();
    }
    while (newPositions.length < positions.length) {
      removePoint();
    }
    for (let i = 0; i < positions.length; i++) {
      positions[i].copy(newPositions[i]);
    }
    updateSplineOutLine();
  };
  // 添加点
  const addPoint = () => {
    splinePointsLength++;
    positions.push(addSplineObject().position);
    updateSplineOutLine();
    render();
  };
  // 移除点
  const removePoint = () => {
    if (splinePointsLength <= 4) {
      return;
    }
    const point = splineHelperObjects.pop();
    splinePointsLength--;
    positions.pop();
    if (transformControl && transformControl.object === point) {
      transformControl.detach();
    }
    THREE_CONST.scene.remove(point);
    updateSplineOutLine();
    render();
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    render();
  };
  return <div id="threeContainer" />;
};
export default ShadowMaterial;
