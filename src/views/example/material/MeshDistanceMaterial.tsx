/**
 * @description: 深度着色材质
 * MeshDistanceMaterial 在内部用于使用PointLight来实现阴影映射。
 * 也可以用于通过将 MeshDistanceMaterial实例指定给 Object3D.customDistanceMaterial，来自定义物体阴影投射。
 * 下列示例演示了这一方法，以确保物体的透明部分不投射阴影。
 * @author: cnn
 * @createTime: 2021/12/15 11:36
 **/
import React, { useEffect, useState } from 'react';
import {
  AmbientLight, BackSide, BasicShadowMap, BoxGeometry, CanvasTexture, Color, DoubleSide,
  Mesh, MeshBasicMaterial, MeshDistanceMaterial as TMeshDistanceMaterial, MeshPhongMaterial, NearestFilter,
  PointLight, RepeatWrapping, SphereGeometry, WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientHeight, getClientWidth } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let pointLight: any;
let pointLight2: any;

const MeshDistanceMaterial = () => {
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
      background: new Color(0xcce0ff)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 45,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      },
      position: [0, 10, 40]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initCube();
    setThreeContainer(threeContainer);
  };
  // 生成材质
  const generateTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'white';
      context.fillRect(0, 1, 2, 1);
    }
    return canvas;
  };
  // 创建光源
  const createLight = (color: number) => {
    const intensity = 1.5;
    const light = new PointLight(color, intensity, 20);
    light.castShadow = true;
    light.shadow.bias = -0.005;
    let geometry = new SphereGeometry(0.3, 12, 6);
    let material = new MeshBasicMaterial({ color: color });
    material.color.multiplyScalar(intensity);
    let sphere = new Mesh(geometry, material);
    light.add(sphere);
    const texture = new CanvasTexture(generateTexture());
    texture.magFilter = NearestFilter;
    texture.wrapT = RepeatWrapping;
    texture.wrapS = RepeatWrapping;
    texture.repeat.set(1, 4.5);
    geometry = new SphereGeometry(2, 32, 8);
    material = new MeshPhongMaterial({
      side: DoubleSide,
      alphaMap: texture,
      alphaTest: 0.5
    });
    sphere = new Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    light.add(sphere);
    // 确保物体的透明部分不投射阴影，虽然我觉得并没有什么作用
    sphere.customDistanceMaterial = new TMeshDistanceMaterial({
      alphaMap: material.alphaMap,
      alphaTest: material.alphaTest
    });
    return light;
  };
  // 初始化光源
  const initLight = () => {
    const ambientLight = new AmbientLight(0x111122);
    THREE_CONST.scene.add(ambientLight);
    pointLight = createLight(0x0088ff);
    THREE_CONST.scene.add(pointLight);
    pointLight2 = createLight(0xff8888);
    THREE_CONST.scene.add(pointLight2);
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
    renderer.shadowMap.type = BasicShadowMap;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.update();
    animate();
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    const geometry = new BoxGeometry(30, 30, 30);
    const material = new MeshPhongMaterial({
      color: 0xa0adaf,
      shininess: 10,
      specular: 0x111111,
      side: BackSide
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.y = 10;
    mesh.receiveShadow = true;
    THREE_CONST.scene.add(mesh);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // render
  const render = () => {
    let time = performance.now() * 0.001;
    pointLight.position.x = Math.sin(time * 0.6) * 9;
    pointLight.position.y = Math.sin(time * 0.7) * 9 + 6;
    pointLight.position.z = Math.sin(time * 0.8) * 9;
    pointLight.rotation.x = time;
    pointLight.rotation.z = time;
    time += 10000;
    pointLight2.position.x = Math.sin(time * 0.6) * 9;
    pointLight2.position.y = Math.sin(time * 0.7) * 9 + 6;
    pointLight2.position.z = Math.sin(time * 0.8) * 9;
    pointLight2.rotation.x = time;
    pointLight2.rotation.z = time;
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
export default MeshDistanceMaterial;
