/**
 * @description: 流几何体
 * 是面片、线或点几何体的有效表述。
 * 包括顶点位置，面片索引、法相量、颜色值、UV 坐标和自定义缓存属性值。
 * 使用 BufferGeometry 可以有效减少向 GPU 传输上述数据所需的开销。
 * @author: cnn
 * @createTime: 2022/1/11 14:09
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, HemisphereLight, WebGLRenderer, BufferGeometry as TBufferGeometry, Float32BufferAttribute,
  MeshPhongMaterial, DoubleSide, Mesh
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let mesh: any;

const BufferGeometry = () => {
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
      mesh = null;
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
      background: new Color(0x050505)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 27,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 3500,
      },
      position: [0, 0, 64]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initGeometry();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const light = new HemisphereLight();
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
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    animate();
  };
  // 生成一个 几何体 放入场景中
  const initGeometry = () => {
    const geometry = new TBufferGeometry();
    const indices = []; // 已索引的三角面片的三个顶点的索引
    const vertices = []; // 顶点
    const normals = [];
    const colors = [];
    const size = 20;
    const segments = 10; // 线段
    const halfSize = size / 2;
    const segmentSize = size / segments;
    // 初始化顶点
    for (let i = 0; i <= segments; i++) {
      const y = (i * segmentSize) - halfSize;
      for (let j = 0; j <= segments; j++) {
        const x = (j * segmentSize) - halfSize;
        vertices.push(x, -y, 0);
        normals.push(0, 0, 1);
        const r = (x / size) + 0.5;
        const g = (y / size) + 0.5;
        colors.push(r, g, 1);
      }
    }
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + (j + 1);
        const b = i * (segments + 1) + j;
        const c = (i + 1) * (segments + 1) + j;
        const d = (i + 1) * (segments + 1) + (j + 1);
        indices.push(a, b, d); // face one
        indices.push(b, c, d); // face two
      }
    }
    // 设置缓存的 .index
    // 允许顶点在多个三角面片间可以重用。
    // 这样的顶点被称为"已索引的三角面片（indexed triangles)。
    // 每个三角面片都和三个顶点的索引相关。
    // 该 attribute 因此所存储的是每个三角面片的三个顶点的索引。
    // 如果该 attribute 没有设置过，则 renderer 假设每三个连续的位置代表一个三角面片。
    // 默认值是 null。
    geometry.setIndex(indices);
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    const material = new MeshPhongMaterial({
      side: DoubleSide,
      vertexColors: true
    });
    mesh = new Mesh(geometry, material);
    THREE_CONST.scene.add(mesh);
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
    mesh.rotation.x = time * 0.25;
    mesh.rotation.y = time * 0.5;
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
export default BufferGeometry;
