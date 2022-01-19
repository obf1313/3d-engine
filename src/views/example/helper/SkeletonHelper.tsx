/**
 * @description: 骨骼辅助对象
 * 用来模拟骨骼 Skeleton 的辅助对象. 该辅助对象使用 LineBasicMaterial 材质。
 * @author: cnn
 * @createTime: 2022/1/19 9:37
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, SkeletonHelper as TSkeletonHelper, Group, AnimationMixer,
  GridHelper, Clock
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader';
import { staticUrlPrefix } from '@utils/CommonVars';

let skeletonHelper: any;
let mixer: any;
let clock: any = new Clock();

const SkeletonHelper = () => {
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
      skeletonHelper = null;
      mixer = null;
      clock = null;
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
      background: new Color(0xeeeeee)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 60,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      },
      position: [0, 200, 300]
    });
    THREE_CONST.scene.add(new GridHelper(400, 10));
    const threeContainer = document.getElementById('threeContainer') || document;
    initBVH();
    setThreeContainer(threeContainer);
  };
  // 初始化人体捕获文件
  const initBVH = () => {
    const loader = new BVHLoader();
    loader.load(staticUrlPrefix + 'pirouette.bvh', (result: any) => {
      skeletonHelper = new TSkeletonHelper(result.skeleton.bones[0]);
      skeletonHelper.skeleton = result.skeleton;
      const boneContainer = new Group();
      boneContainer.add(result.skeleton.bones[0]);
      THREE_CONST.scene.add(skeletonHelper);
      THREE_CONST.scene.add(boneContainer);
      mixer = new AnimationMixer(skeletonHelper);
      mixer.clipAction(result.clip).setEffectiveWeight(1).play();
    });
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
    controls.minDistance = 300;
    controls.maxDistance = 700;
    controls.update();
    animate();
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    const delta = clock.getDelta();
    if (mixer) {
      mixer.update(delta);
    }
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
export default SkeletonHelper;
