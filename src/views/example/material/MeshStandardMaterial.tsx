/**
 * @description: 标准网格材质
 * 一种基于物理的标准材质，使用 Metallic-Roughness 工作流程。
 * 基于物理的渲染（PBR）最近已成为许多 3D 应用程序的标准，例如 Unity， Unreal 和 3D Studio Max。
 * 这种方法与旧方法的不同之处在于，不使用近似值来表示光与表面的相互作用，而是使用物理上正确的模型。
 * 我们的想法是，不是在特定照明下调整材质以使其看起来很好，而是可以创建一种材质，能够“正确”地应对所有光照场景。
 * 在实践中，该材质提供了比 MeshLambertMaterial 或 MeshPhongMaterial 更精确和逼真的结果，代价是计算成本更高。
 * 计算着色的方式与 MeshPhongMaterial 相同，都使用 Phong 着色模型。
 * 这会计算每个像素的阴影（即在 fragment shader， AKA pixel shader 中）， 与 MeshLambertMaterial 使用的 Gouraud 模型相比，该模型的结果更准确，但代价是牺牲一些性能。
 * 请注意，为获得最佳效果，您在使用此材质时应始终指定 environment map。
 * @author: cnn
 * @createTime: 2021/12/16 9:30
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, TorusKnotGeometry, MeshStandardMaterial as TMeshStandardMaterial, Mesh,
  HemisphereLight, PointLight, CubeRefractionMapping, RGBFormat
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initCubeTexture, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';

let cube: any;

const MeshStandardMaterial = () => {
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
      cube = null;
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
      background: new Color(0x444444)
    });
    // 主要是 near 值的设置
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 70,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 10,
        far: 100
      },
      position: [0, 0, 35]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initCube();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    // 半球光，光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
    const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
    hemisphereLight.position.set(0, 200, 0);
    THREE_CONST.scene.add(hemisphereLight);
    const light1 = new PointLight(0xffffff, 1, 0);
    light1.position.set(0, 200, 0);
    THREE_CONST.scene.add(light1);
    const light2 = new PointLight(0xffffff, 1, 0);
    light2.position.set(100, 200, 100);
    THREE_CONST.scene.add(light2);
    const light3 = new PointLight(0xffffff, 1, 0);
    light3.position.set(-100, -200, -100);
    THREE_CONST.scene.add(light3);
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
  // 获取 envMaps
  const getEnvMaps = () => {
    const format = '.png';
    const urls = [
      'px' + format, 'nx' + format,
      'py' + format, 'ny' + format,
      'pz' + format, 'nz' + format
    ];
    // @ts-ignore
    const texture = initCubeTexture(staticUrlPrefix + 'cube/', urls);
    texture.mapping = CubeRefractionMapping;
    texture.format = RGBFormat;
    return texture;
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    const geometry = new TorusKnotGeometry(10, 3, 200, 32);
    const material = new TMeshStandardMaterial({
      color: 0x049ef4,
      // 材质与金属的相似度。
      // 非金属材质，如木材或石材，使用 0.0，金属使用 1.0，通常没有中间值。 默认值为 0.0。
      // 0.0 到 1.0 之间的值可用于生锈金属的外观。如果还提供了 metalnessMap，则两个值相乘。
      // metalness: 1,
      envMap: getEnvMaps()
    });
    cube = new Mesh(geometry, material);
    THREE_CONST.scene.add(cube);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
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
export default MeshStandardMaterial;
