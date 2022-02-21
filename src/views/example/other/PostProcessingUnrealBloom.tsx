/**
 * @description: 后期处理
 * @author: cnn
 * @createTime: 2022/2/21 15:06
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, ReinhardToneMapping, AmbientLight, PointLight,
  Vector2, AnimationMixer, Clock
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { staticUrlPrefix } from '@utils/CommonVars';

let composer: any;
let mixer: any;
const clock = new Clock();

const PostProcessingUnrealBloom = () => {
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
      initModel();
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
        far: 100,
      },
      position: [-5, 2.5, -3.5]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    // 添加环境光
    THREE_CONST.scene.add(new AmbientLight(0x404040));
    const pointLight = new PointLight(0xffffff, 1);
    THREE_CONST.camera.add(pointLight);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true });
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    // 色调映射
    renderer.toneMapping = ReinhardToneMapping;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    // 渲染通道
    const renderScene = new RenderPass(THREE_CONST.scene, THREE_CONST.camera);
    // 泛光效果
    const bloomPass = new UnrealBloomPass(new Vector2(getClientWidth(), getClientHeight() - 60), 1.5, 0.4, 0.85);
    const params = {
      exposure: 1.5,
      bloomStrength: 1.5,
      bloomThreshold: 0,
      bloomRadius: 0
    };
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
    renderer.toneMappingExposure = Math.pow(params.exposure, 4.0);
    // EffectComposer 后期处理
    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
  };
  // 生成一个 cube 放入场景中
  const initModel = () => {
    const loader = new GLTFLoader();
    loader.load(staticUrlPrefix + 'models/PrimaryIonDrive.glb', gltf => {
      const model = gltf.scene;
      THREE_CONST.scene.add(model);
      mixer = new AnimationMixer(model);
      const clip: any = gltf.animations[0];
      mixer.clipAction(clip.optimize()).play();
      animate();
    });
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    mixer.update(delta);
    setAnimationId(animationId);
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
    composer.render();
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default PostProcessingUnrealBloom;
