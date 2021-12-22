/**
 * @description: 边缘几何体
 * 这可以作为一个辅助对象来查看 geometry 的边缘。
 * @author: cnn
 * @createTime: 2021/10/29 10:08
 **/
import React, { useEffect, useState } from 'react';
import {
  BoxHelper, GridHelper, Group, LineSegments, PointLight,
  PointLightHelper, PolarGridHelper, WebGLRenderer, WireframeGeometry,
  EdgesGeometry as TEdgesGeometry
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { VertexTangentsHelper } from 'three/examples/jsm/helpers/VertexTangentsHelper';
import { staticUrlPrefix } from '@utils/CommonVars';

let light: any;
let vnh: any;
let vth: any;

const EdgesGeometry = () => {
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
    THREE_CONST.scene = initScene();
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 70,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      },
      position: [0, 0, 400]
    });
    initLightAndHelper();
    loadModel();
    const threeContainer = document.getElementById('threeContainer') || document;
    setThreeContainer(threeContainer);
  };
  // 初始化灯光和辅助对象
  const initLightAndHelper = () => {
    light = new PointLight();
    light.position.set(200, 100, 150);
    THREE_CONST.scene.add(light);
    THREE_CONST.scene.add(new PointLightHelper(light, 15));
    // 添加网格辅助对象
    const gridHelper = new GridHelper(400, 40, 0x0000ff, 0x808080);
    gridHelper.position.y = -150;
    gridHelper.position.x = -150;
    THREE_CONST.scene.add(gridHelper);
    // 添加极坐标格辅助对象
    const polarGridHelper = new PolarGridHelper(200, 16, 8, 64, 0x0000ff, 0x808080);
    polarGridHelper.position.y = -150;
    polarGridHelper.position.x = 200;
    THREE_CONST.scene.add(polarGridHelper);
  };
  // 导入模型 todo 要去写物联网引擎了，尴尬
  const loadModel = () => {
    const loader = new GLTFLoader();
    loader.load(staticUrlPrefix + 'LeePerrySmith.glb', (gltf) => {
      const mesh: any = gltf.scene.children[0];
      // 这是在干啥
      mesh.geometry.computeTangents();
      const group = new Group();
      group.scale.multiplyScalar(50);
      THREE_CONST.scene.add(group);
      group.updateMatrixWorld(true);
      group.add(mesh);
      vnh = new VertexNormalsHelper(mesh, 5);
      THREE_CONST.scene.add(vnh);
      vth = new VertexTangentsHelper(mesh, 5);
      THREE_CONST.scene.add(vth);
      THREE_CONST.scene.add(new BoxHelper(mesh));
      // 网格几何体
      const wireframe = new WireframeGeometry(mesh.geometry);
      let line: any = new LineSegments(wireframe);
      // 右边那个人
      line.material.depthTest = false;
      line.material.opacity = 0.25;
      line.material.transparent = true;
      line.position.x = 4;
      group.add(line);
      THREE_CONST.scene.add(new BoxHelper(line));
      // 左边那个人
      // 边缘几何体
      // 网格几何体和边缘几何体得出来的效果差不多
      const edges = new TEdgesGeometry(mesh.geometry);
      line = new LineSegments(edges);
      line.material.depthTest = false;
      line.material.opacity = 0.25;
      line.material.transparent = true;
      line.position.x = -4;
      group.add(line);
      THREE_CONST.scene.add(new BoxHelper(line));
      THREE_CONST.scene.add(new BoxHelper(group));
      THREE_CONST.scene.add(new BoxHelper(THREE_CONST.scene));
    });
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
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
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    animate();
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    const time = - performance.now() * 0.0003;
    if (THREE_CONST.camera) {
      THREE_CONST.camera.position.x = 400 * Math.cos(time);
      THREE_CONST.camera.position.z = 400 * Math.sin(time);
      THREE_CONST.camera.lookAt(THREE_CONST.scene.position);
    }
    if (light) {
      light.position.x = Math.sin(time * 1.7) * 300;
      light.position.x = Math.cos(time * 1.5) * 400;
      light.position.x = Math.cos(time * 1.3) * 300;
    }
    if (vnh) vnh.update();
    if (vth) vth.update();
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
export default EdgesGeometry;
