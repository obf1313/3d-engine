/**
 * @description: 多个模型同时加载，制作动画
 * @author: cnn
 * @createTime: 2021/9/17 13:17
 **/
import React, { useEffect, useState } from 'react';
import { getClientHeight, getClientWidth, getTreeChildren } from '@utils/CommonFunc';
import {
  Color, DirectionalLight, HemisphereLight, MeshBasicMaterial, MeshLambertMaterial,
  MeshPhongMaterial, MeshStandardMaterial, RepeatWrapping, sRGBEncoding, Texture,
  TextureLoader, WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

// 是否停止相机移动
let stopCamera: boolean = false;
// 是否返回
let isBack: boolean = false;

const MultipleModel = () => {
  const [modelList, setModelList] = useState<Array<string>>([]);
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [controls, setControls] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  const [cube, setCube] = useState<any>();
  const [arrowTexture, setArrowTexture] = useState<Texture>();
  const [trackTexture, setTrackTexture] = useState<Texture>();
  useEffect(() => {
    THREE_CONST.scene = initScene({
      background: new Color(0xcce0ff)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 45,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 100,
      },
      position: [0, 5, 10],
      lookPoint: [20, 10, 10]
    });
    initMyScene();
    initArrowTexture();
    initTrackTexture();
    getModelList();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      stopCamera = false;
      isBack = false;
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
  useEffect(() => {
    if (controls) {
      animate();
    }
    return () => {
      // 移除 animation
      if (animationId) {
        window.cancelAnimationFrame(animationId);
      }
    };
  }, [controls, cube]);
  // 获取模型列表
  const getModelList = () => {
    const modelList: Array<string> = [
      '/modelStatic/three/animation.glb',
      '/modelStatic/three/background.glb',
      '/modelStatic/three/arrow.glb'
    ];
    setModelList(modelList);
  };
  // 初始化场景
  const initMyScene = () => {
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initModalList();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    // 半球光，光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
    const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
    hemisphereLight.position.set(0, 200, 0);
    THREE_CONST.scene.add(hemisphereLight);
    // 平行光
    // 平行光是沿着特定方向发射的光。
    // 这种光的表现像是无限远，从它发出的光线都是平行的。
    // 常常用平行光来模拟太阳光 的效果; 太阳足够远，因此我们可以认为太阳的位置是无限远，所以我们认为从太阳发出的光线也都是平行的。
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(0, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 180;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.left = -120;
    directionalLight.shadow.camera.right = 120;
    THREE_CONST.scene.add(directionalLight);
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
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    setControls(controls);
  };
  // 初始化模型
  const initModalList = () => {
    // 加载模型
    for (let i = 0; i < modelList.length; i++) {
      const loader = new GLTFLoader();
      loader.load(modelList[i], (object: any) => {
        getTreeChildren(object.scene.children, (item: any) => {
          // 底面
          if (item.name.indexOf('background') !== -1) {
            const groundTexture = new TextureLoader().load('/modelStatic/three/grasslight-big.jpg');
            groundTexture.wrapS = groundTexture.wrapT = RepeatWrapping;
            groundTexture.repeat.set(25, 25);
            groundTexture.anisotropy = 16;
            groundTexture.encoding = sRGBEncoding;
            item.material = new MeshLambertMaterial({ map: groundTexture });
          }
          // 如果是箭头平面
          if (item.name.indexOf('arrowPlane') !== -1) {
            item.material = new MeshStandardMaterial({
              color: new Color(0x00ff00),
              map: arrowTexture,
              transparent: true
            });
          }
          // 箭头管道
          if (item.name.indexOf('pipe') !== -1) {
            item.material = new MeshBasicMaterial({
              color: 0XFA8C16,
              transparent: true,
              opacity: 0.5,
            });
          }
          // 动画底部
          if (item.name.indexOf('animationGround') !== -1) {
            item.material = new MeshLambertMaterial({
              map: trackTexture
            });
          }
          // 立方体
          if (item.name.indexOf('立方体') !== -1) {
            const cubeTexture: any = new TextureLoader().load('/modelStatic/three/crate.gif');
            cubeTexture.wrapS = RepeatWrapping;
            cubeTexture.wrapT = RepeatWrapping;
            item.material = new MeshPhongMaterial({ map: cubeTexture });
            setCube(item);
          }
        });
        THREE_CONST.scene.add(object.scene);
      });
    }
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
    controls.update();
    if (THREE_CONST.camera.position.z < 3 || THREE_CONST.camera.position.z === 3) {
      stopCamera = true;
    }
    if (!stopCamera) {
      THREE_CONST.camera.position.set(0, 0.5, THREE_CONST.camera.position.z - 0.05);
    }
    // 设置纹理偏移
    if (arrowTexture) {
      arrowTexture.offset.x -= 0.01;
    }
    if (trackTexture && cube) {
      trackTexture.offset.y += 0.0005;
      if (cube.position.z < -10) {
        isBack = true;
      }
      if (cube.position.z > -1) {
        isBack = false;
      }
      if (isBack) {
        cube.position.z += 0.01;
      } else {
        cube.position.z -= 0.01;
      }
    }
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 箭头纹理
  const initArrowTexture = () => {
    const texture: Texture = new TextureLoader().load('/modelStatic/three/arrow-right.png');
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(10, 1);
    setArrowTexture(texture);
  };
  // 轨道纹理
  const initTrackTexture = () => {
    const texture: Texture = new TextureLoader().load('/modelStatic/three/track.png');
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.encoding = sRGBEncoding;
    setTrackTexture(texture);
  };
  return <div id="threeContainer" />;
};
export default MultipleModel;