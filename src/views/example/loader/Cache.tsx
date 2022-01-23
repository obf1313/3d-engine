/**
 * @description: 简单缓存系统
 * 一个简单的缓存系统，内部使用 FileLoader。
 * @author: cnn
 * @createTime: 2022/1/19 17:28
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, DirectionalLight, WebGLRenderer, Fog, PointLight,
  MeshPhongMaterial, Group, Font, TextGeometry, Mesh, PlaneGeometry, MeshBasicMaterial, Vector3
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import { staticUrlPrefix } from '@utils/CommonVars';

let font: any = null;
let group: any;
let mirror: boolean = true;
let pointerX = 0;
let pointerXOnPointerDown: number = 0;
let windowHalfX = window.innerWidth / 2;
let targetRotation = 0;
let targetRotationOnPointerDown = 0;

const Cache = () => {
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
      font = null;
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
      animate();
      window.addEventListener('resize', onWindowResize, false);
      if ('style' in threeContainer) {
        threeContainer.style.touchAction = 'none';
      }
      threeContainer.addEventListener('pointerdown', onPointerDown);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene({
      background: new Color(0x000000),
      fog: new Fog(0x000000, 250, 1400)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 30,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1500,
      },
      position: [0, 400, 700]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initText();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const dirLight = new DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    THREE_CONST.scene.add(dirLight);
    const pointLight = new PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 100, 90);
    pointLight.color.setHSL(Math.random(), 1, 0.5);
    THREE_CONST.scene.add(pointLight);
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
  // 生成文字放入场景中
  const initText = () => {
    group = new Group();
    group.position.y = 100;
    THREE_CONST.scene.add(group);
    const loader = new TTFLoader();
    loader.load(staticUrlPrefix + 'fonts/kenpixel.ttf', (json: any) => {
      font = new Font(json);
      createText();
    });
    const plane = new Mesh(
      new PlaneGeometry(10000, 10000),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
      })
    );
    plane.position.y = 100;
    plane.rotation.x = -Math.PI / 2;
    THREE_CONST.scene.add(plane);
  };
  // 创建字体
  const createText = () => {
    const height = 20;
    const size = 70;
    const hover = 30;
    const curveSegments = 4;
    const bevelThickness = 2;
    const bevelSize = 1.5;
    const textGeo = new TextGeometry('misaka', {
      font,
      size,
      height,
      curveSegments,
      bevelThickness,
      bevelSize,
      bevelEnabled: true
    });
    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();
    // @ts-ignore
    const centerOffset = -0.5 * (textGeo.boundingBox?.max.x - textGeo.boundingBox?.min.x);
    const material = new MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true
    });
    const textMesh1 = new Mesh(textGeo, material);
    textMesh1.position.set(centerOffset, hover, 0);
    textMesh1.rotation.set(0, Math.PI * 2, 0);
    group.add(textMesh1);
    if (mirror) {
      const textMesh2 = new Mesh(textGeo, material);
      textMesh2.position.set(centerOffset, -hover, height);
      textMesh2.rotation.set(Math.PI, Math.PI * 2, 0);
      group.add(textMesh2);
    }
  };
  // 监听鼠标点击事件
  const onPointerDown = (e: any) => {
    if (!e.isPrimary) return;
    pointerXOnPointerDown = e.clientX - windowHalfX;
    targetRotationOnPointerDown = targetRotation;
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };
  // 监听鼠标移动事件
  const onPointerMove = (e: any) => {
    if (!e.isPrimary) return;
    pointerX = e.clientX - windowHalfX;
    targetRotation = targetRotationOnPointerDown + (pointerX - pointerXOnPointerDown) * 0.02;
  };
  // 监听鼠标抬起事件
  const onPointerUp = (e: any) => {
    if (!e.isPrimary) return;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
    THREE_CONST.camera.lookAt(new Vector3(0, 150, 0));
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
export default Cache;
