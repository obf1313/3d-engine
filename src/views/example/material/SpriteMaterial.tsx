/**
 * @description: 点精灵材质
 * 一种使用 Sprite 的材质。
 * @author: cnn
 * @createTime: 2021/12/16 9:35
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, Group, Sprite, SpriteMaterial as TSpriteMaterial,
  Object3D, Raycaster, Vector2
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let group: any;
let selectedObject: any = null;
let pointer: any = new Vector2();
let raycaster: any = new Raycaster();

const SpriteMaterial = () => {
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
      background: new Color(0xffffff)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 50,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      },
      position: [15, 15, 15]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initCube();
    setThreeContainer(threeContainer);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    // 设置 alpha。合法参数是一个 0.0 到 1.0 之间的浮点数
    renderer.setClearAlpha(0.2);
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
    controls.enableRotate = true;
    animate();
  };
  // 生成一个 cube 放入场景中
  const initCube = () => {
    group = new Group();
    THREE_CONST.scene.add(group);
    const sprite1 = new Sprite(new TSpriteMaterial({ color: '#69f' }));
    sprite1.position.set(6, 5, 5);
    sprite1.scale.set(2, 5, 1);
    group.add(sprite1);
    const sprite2 = new Sprite(new TSpriteMaterial({ color: '#69f', sizeAttenuation: false }));
    sprite2.material.rotation = Math.PI / 3 * 4;
    sprite2.position.set(8, -2, 2);
    sprite2.center.set(0.5, 0);
    sprite2.scale.set(0.1, 0.5, 0.1);
    group.add(sprite2);
    const group2 = new Object3D();
    group2.scale.set(1, 2, 1);
    group2.position.set(-5, 0, 0);
    group2.rotation.set(Math.PI / 2, 0, 0);
    group.add(group2);
    const sprite3 = new Sprite(new TSpriteMaterial({ color: '#69f' }));
    sprite3.position.set(0, 2, 5);
    sprite3.scale.set(10, 2, 3);
    sprite3.center.set(-0.1, 0);
    sprite3.material.rotation = Math.PI / 3;
    group2.add(sprite3);
    document.addEventListener('mousemove', onPointerMove);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 鼠标移动
  const onPointerMove = (e: any) => {
    if (selectedObject) {
      selectedObject.material.color.set('#69f');
      selectedObject = null;
    }
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, THREE_CONST.camera);
    const intersects = raycaster.intersectObject(group, true);
    if (intersects.length > 0) {
      const res = intersects.filter((res: any) => {
        return res && res.object;
      })[0];
      if (res && res.object) {
        selectedObject = res.object;
        selectedObject.material.color.set('#f00');
      }
    }
  };
  return <div id="threeContainer" />;
};
export default SpriteMaterial;
