/**
 * @description: 基础线条材质
 * 一种用于绘制线框样式几何体的材质。
 * @author: cnn
 * @createTime: 2021/12/10 16:51
 **/
import React, { useEffect, useState } from 'react';
import {
  LineBasicMaterial as TLineBasicMaterial, WebGLRenderer, BufferGeometry, Vector3, Float32BufferAttribute,
  LineSegments, Object3D, sRGBEncoding
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let parentNode: any;

const LineBasicMaterial = () => {
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
      animate();
      window.addEventListener('resize', onWindowResize, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene();
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 27,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 10000,
      },
      position: [0, 0, 9000]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initGeometry();
    setThreeContainer(threeContainer);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer();
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    renderer.outputEncoding = sRGBEncoding;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 添加几何体
  const initGeometry = () => {
    const geometry = new BufferGeometry();
    const material = new TLineBasicMaterial({
      vertexColors: true
    });
    const indices: Array<any> = [];
    const positions: Array<any> = [];
    const colors: Array<any> = [];
    let nextPositionsIndex = 0;
    const iterationCount = 4;
    const rAngle = 60 * Math.PI / 180.0;
    // 添加顶点
    const addVertex = (v: any) => {
      if (nextPositionsIndex === 0xffff) {
        console.log('Too many points.');
      }
      positions.push(v.x, v.y, v.z);
      colors.push(Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1);
      return nextPositionsIndex++;
    };
    // 简单的科赫曲线
    const snowFlakeIteration = (p0: any, p4: any, paramDepth: number) => {
      let depth = paramDepth;
      if (--depth < 0) {
        // p0 在这里
        const i = nextPositionsIndex - 1;
        addVertex(p4);
        indices.push(i, i + 1);
        return;
      }
      const v = p4.clone().sub(p0);
      const vTier = v.clone().multiplyScalar(1 / 3);
      const p1 = p0.clone().add(vTier);
      const angle = Math.atan2(v.y, v.x) + rAngle;
      const length = vTier.length();
      const p2 = p1.clone();
      p2.x += Math.cos(angle) * length;
      p2.y += Math.sin(angle) * length;
      const p3 = p0.clone().add(vTier).add(vTier);
      snowFlakeIteration(p0, p1, depth);
      snowFlakeIteration(p1, p2, depth);
      snowFlakeIteration(p2, p3, depth);
      snowFlakeIteration(p3, p4, depth);
    };
    // 雪花
    const snowflake = (points: any, loop: any, xOffset: any) => {
      for (let iteration = 0; iteration !== iterationCount; iteration++) {
        addVertex(points[0]);
        for (let pIndex = 0, pCount = points.length - 1; pIndex !== pCount; pIndex++) {
          snowFlakeIteration(points[pIndex], points[pIndex + 1], iteration);
        }
        if (loop) {
          snowFlakeIteration(points[points.length - 1], points[0], iteration);
        }
        // 输入曲线作为下一次迭代
        for (let pIndex = 0, pCount = points.length; pIndex !== pCount; pIndex++) {
          points[pIndex].x += xOffset;
        }
      }
    };
    let y = 0;
    // 2 个顶点
    snowflake([
      new Vector3(0, y, 0),
      new Vector3(500, y, 0)
    ], false, 600);
    y += 600;
    // 3 个顶点
    snowflake([
      new Vector3(0, y, 0),
      new Vector3(250, y + 400, 0),
      new Vector3(500, y, 0)
    ], true, 600);
    y += 600;
    // 4 个顶点
    snowflake([
      new Vector3(0, y, 0),
      new Vector3(500, y, 0),
      new Vector3(500, y + 500, 0),
      new Vector3(0, y + 500, 0)
    ], true, 600);
    y += 1000;
    // 9 个顶点
    snowflake([
      new Vector3(250, y, 0),
      new Vector3(500, y, 0),
      new Vector3(250, y, 0),
      new Vector3(250, y + 250, 0),
      new Vector3(250, y, 0),
      new Vector3(0, y, 0),
      new Vector3(250, y, 0),
      new Vector3(250, y - 250, 0),
      new Vector3(250, y, 0)
    ], false, 600);
    geometry.setIndex(indices);
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
    const lineSegments = new LineSegments(geometry, material);
    lineSegments.position.x -= 1200;
    lineSegments.position.y -= 1200;
    parentNode = new Object3D();
    parentNode.add(lineSegments);
    THREE_CONST.scene.add(parentNode);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 渲染
  const render = () => {
    const time = Date.now() * 0.001;
    parentNode.rotation.z = time * 0.5;
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default LineBasicMaterial;
