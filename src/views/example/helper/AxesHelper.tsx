/**
 * @description: 坐标轴辅助对象
 * 用于简单模拟 3 个坐标轴的对象。
 * 红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴。
 * @author: cnn
 * @createTime: 2022/1/18 15:44
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, AxesHelper as TAxesHelper, WebGLRenderer, AmbientLight,
  PointLight, TextureLoader, Group, DodecahedronGeometry, Vector3,
  PointsMaterial, BufferGeometry, Points, Mesh, MeshLambertMaterial,
  BackSide, FrontSide
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';

let group: any;

const AxesHelper = () => {
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
      group = null;
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
        fov: 40,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      },
      position: [15, 20, 30]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    THREE_CONST.scene.add(new TAxesHelper(20));
    initCube();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    THREE_CONST.scene.add(new AmbientLight(0x222222));
    const light = new PointLight(0xffffff, 1);
    THREE_CONST.camera.add(light);
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
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 20;
    controls.maxDistance = 50;
    controls.update();
    animate();
  };
  // 生成几何体
  const initCube = () => {
    group = new Group();
    THREE_CONST.scene.add(group);
    let dodecahedronGeometry = new DodecahedronGeometry(10);
    // if normal and uv attributes are not removed, mergeVertices() can't consolidate indentical vertices with different normal/uv data
    dodecahedronGeometry.deleteAttribute('normal');
    dodecahedronGeometry.deleteAttribute('uv');
    // @ts-ignore
    // todo 不知道为什么材质和例子上的对不上
    dodecahedronGeometry = BufferGeometryUtils.mergeVertices(dodecahedronGeometry);
    // 获取十二面缓冲几何体顶点
    const vertices = [];
    const positionAttribute = dodecahedronGeometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new Vector3();
      vertex.fromBufferAttribute(positionAttribute, i);
      vertices.push(vertex);
    }
    // 顶点放置几何体
    const loader = new TextureLoader();
    const texture = loader.load(staticUrlPrefix + 'textures/disc.png');
    const pointsMaterial = new PointsMaterial({
      color: 0x0080ff,
      map: texture,
      size: 1,
      alphaTest: 0.5
    });
    const pointsGeometry = new BufferGeometry().setFromPoints(vertices);
    const points = new Points(pointsGeometry, pointsMaterial);
    group.add(points);
    const meshMaterial = new MeshLambertMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true
    });
    const meshGeometry = new ConvexGeometry(vertices);
    const mesh1 = new Mesh(meshGeometry, meshMaterial);
    mesh1.material.side = BackSide;
    mesh1.renderOrder = 0;
    group.add(mesh1);
    const mesh2 = new Mesh(meshGeometry, meshMaterial.clone());
    mesh2.material.side = FrontSide;
    mesh2.renderOrder = 1;
    group.add(mesh2);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    group.rotation.y += 0.005;
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
export default AxesHelper;
