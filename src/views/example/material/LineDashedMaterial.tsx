/**
 * @description: 虚线材质
 * 一种用于绘制虚线样式几何体的材质。
 * @author: cnn
 * @createTime: 2021/12/14 10:25
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, Fog, Vector3, CatmullRomCurve3,
  BufferGeometry, Line, LineDashedMaterial as TLineDashedMaterial, Float32BufferAttribute, LineSegments
} from 'three';
// @ts-ignore
import * as GeometryUtils from 'three/examples/jsm/utils/GeometryUtils.js';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let objects: Array<any> = [];

const LineDashedMaterial = () => {
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
      objects = [];
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
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene({
      background: new Color(0x111111),
      fog: new Fog(0x111111, 150, 200)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 60,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 200,
      },
      position: [0, 0, 150]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initObject();
    setThreeContainer(threeContainer);
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
  // 生成盒模型
  const box = (width: number, height: number, depth: number) => {
    width = width / 2;
    height = height / 2;
    depth = depth / 2;
    const geometry = new BufferGeometry();
    const position = [];
    position.push(
      -width, -height, -depth,
      -width, height, -depth,
      -width, height, -depth,
      width, height, -depth,
      width, height, -depth,
      width, -height, -depth,
      width, -height, -depth,
      -width, -height, -depth,
      -width, -height, depth,
      -width, height, depth,
      -width, height, depth,
      width, height, depth,
      width, height, depth,
      width, -height, depth,
      width, -height, depth,
      -width, -height, depth,
      -width, -height, -depth,
      -width, -height, depth,
      -width, height, -depth,
      -width, height, depth,
      width, height, -depth,
      width, height, depth,
      width, -height, -depth,
      width, -height, depth
    );
    geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
    return geometry;
  };
  // 生成几何体
  const initObject = () => {
    const subdivisions = 6;
    const recursion = 1;
    // @ts-ignore
    const points = GeometryUtils.hilbert3D(new Vector3(0, 0, 0), 25.0, recursion, 0, 1, 2, 3, 4, 5, 6, 7);
    const spline = new CatmullRomCurve3(points);
    const samples = spline.getPoints(points.length * subdivisions);
    const geometrySpline = new BufferGeometry().setFromPoints(samples);
    const line = new Line(geometrySpline, new TLineDashedMaterial({
      color: 0xffffff,
      dashSize: 1,
      gapSize: 0.5
    }));
    line.computeLineDistances();
    objects.push(line);
    THREE_CONST.scene.add(line);
    // 盒模型
    const geometryBox = box(50, 50, 50);
    const lineSegments = new LineSegments(geometryBox, new TLineDashedMaterial({
      color: 0xffaa00,
      dashSize: 3,
      gapSize: 1
    }));
    lineSegments.computeLineDistances();
    objects.push(lineSegments);
    THREE_CONST.scene.add(lineSegments);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    const time = Date.now() * 0.001;
    THREE_CONST.scene.traverse((object: any) => {
      if (object.isLine) {
        object.rotation.x = 0.25 * time;
        object.rotation.y = 0.25 * time;
      }
    });
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
export default LineDashedMaterial;
