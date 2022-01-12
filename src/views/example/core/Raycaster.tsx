/**
 * @description: 光线投射
 * 这个类用于进行 raycasting（光线投射）。
 * 光线投射用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）。
 * @author: cnn
 * @createTime: 2022/1/11 16:52
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, DirectionalLight, WebGLRenderer, BoxGeometry, MeshBasicMaterial,
  Raycaster as TRaycaster, TextureLoader, GridHelper, Vector2,
  PlaneGeometry, Mesh, AmbientLight
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import {
  CameraType, getIntersectPosition, initCamera, initScene, resetThreeConst,
  THREE_CONST
} from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';

let rollOverMaterial: any;
let rollOverMesh: any;
let cubeGeo: any;
let cubeMaterial: any;
let raycaster: any;
let pointer: any;
let plane: any;
let objects: any = [];

const Raycaster = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  useEffect(() => {
    initMyScene();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      // 重置全局变量
      resetThreeConst();
      rollOverMaterial = null;
      rollOverMesh = null;
      cubeGeo = null;
      cubeMaterial = null;
      objects = [];
    };
  }, []);
  useEffect(() => {
    if (threeContainer) {
      initRenderer();
    }
  }, [threeContainer]);
  useEffect(() => {
    if (renderer) {
      window.addEventListener('resize', onWindowResize, false);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mousedown', onMouseDown);
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
        fov: 45,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 10000,
      },
      position: [500, 800, 1300],
      lookPoint: [0, 0, 0]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initCube();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const ambientLight = new AmbientLight(0x606060);
    THREE_CONST.scene.add(ambientLight);
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    THREE_CONST.scene.add(directionalLight);
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
  // 生成一个 cube 放入场景中
  const initCube = () => {
    // roll-over helpers
    const rollOverGeo = new BoxGeometry(50, 50, 50);
    rollOverMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true
    });
    rollOverMesh = new Mesh(rollOverGeo, rollOverMaterial);
    THREE_CONST.scene.add(rollOverMesh);
    // dubes
    cubeGeo = new BoxGeometry(50, 50, 50);
    cubeMaterial = new MeshBasicMaterial({
      color: 0xfeb74c,
      map: new TextureLoader().load(staticUrlPrefix + 'crate.gif')
    });
    // grid
    const gridHelper = new GridHelper(1000, 20);
    THREE_CONST.scene.add(gridHelper);
    //
    raycaster = new TRaycaster();
    pointer = new Vector2();
    const geometry = new PlaneGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
    THREE_CONST.scene.add(plane);
    objects.push(plane);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    render();
  };
  // 鼠标移动
  const onMouseMove = (e: any) => {
    const { x, y } = getIntersectPosition(e, threeContainer);
    pointer.set(x, y);
    raycaster.setFromCamera(pointer, THREE_CONST.camera);
    const intersects = raycaster.intersectObjects(objects, false);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    }
    render();
  };
  // 鼠标点击
  const onMouseDown = (e: any) => {
    const { x, y } = getIntersectPosition(e, threeContainer);
    pointer.set(x, y);
    raycaster.setFromCamera(pointer, THREE_CONST.camera);
    const intersects = raycaster.intersectObjects(objects, false);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      // 按住 shift 键
      if (e.shiftKey) {
        if (intersect.object !== plane) {
          THREE_CONST.scene.remove(intersect.object);
          objects.splice(objects.indexOf(intersect.object), 1);
        }
      } else {
        const voxel = new Mesh(cubeGeo, cubeMaterial);
        voxel.position.copy(intersect.point).add(intersect.face.normal);
        voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        THREE_CONST.scene.add(voxel);
        objects.push(voxel);
      }
      render();
    }

  };
  // render
  const render = () => {
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  return <div id="threeContainer" />;
};
export default Raycaster;
