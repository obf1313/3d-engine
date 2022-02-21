/**
 * @description: 漂浮在大海中的梅林号
 * @author: cnn
 * @createTime: 2022/2/17 16:31
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, Vector3, PMREMGenerator,
  MathUtils, PlaneGeometry, TextureLoader, RepeatWrapping,
  ACESFilmicToneMapping, LoadingManager,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import dayjs from 'dayjs';

let sun: any;
let water: any;
let ship: any;

const Merry = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  const [loadingProcess, setLoadingProcess] = useState<number>(0);
  const [sunHeight, setSunHeight] = useState<number>(0);
  useEffect(() => {
    initMyScene();
    getSunHeight();
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
      renderBackground();
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
        fov: 55,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 20000,
      },
      position: [0, 10, 30]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initModel();
    setThreeContainer(threeContainer);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    // 设置 alpha。合法参数是一个 0.0 到 1.0 之间的浮点数
    renderer.setClearAlpha(0.2);
    // 设置 alpha。合法参数是一个 0.0 到 1.0 之间的浮点数
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    renderer.toneMapping = ACESFilmicToneMapping;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.45;
    controls.minDistance = 0.1;
    controls.maxDistance = 2000;
    controls.update();
    animate();
  };
  // 生成场景
  const renderBackground = () => {
    sun = new Vector3();
    const waterGeometry = new PlaneGeometry(10000, 10000);
    water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new TextureLoader().load(staticUrlPrefix + 'textures/waternormals.jpg', (texture: any) => {
        texture.wrapS = texture.wrapT = RepeatWrapping;
      }),
      sunDirection: new Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 0.5,
      fog: THREE_CONST.scene.fog !== undefined
    });
    water.rotation.x = -Math.PI / 2;
    THREE_CONST.scene.add(water);
    const sky = new Sky();
    sky.scale.setScalar(100000);
    THREE_CONST.scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    // elevation 越小越接近水平线，最高空 90
    const parameters = {
      elevation: sunHeight,
      azimuth: 180
    };
    const pmremGenerator = new PMREMGenerator(renderer);
    const updateSun = () => {
      const phi = MathUtils.degToRad(90 - parameters.elevation);
      const theta = MathUtils.degToRad(parameters.azimuth);
      sun.setFromSphericalCoords(1, phi, theta);
      sky.material.uniforms['sunPosition'].value.copy(sun);
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();
      // @ts-ignore
      THREE_CONST.scene.environment = pmremGenerator.fromScene(sky).texture;
    };
    updateSun();
  };
  // 导入模型
  const initModel = () => {
    // 显示加载进度
    const manager = new LoadingManager();
    manager.onProgress = (url: string, loaded: number, total: number) => {
      setLoadingProcess(Math.floor(loaded / total * 100));
    };
    const url: string = staticUrlPrefix + 'models/ship.gltf';
    // 加载模型
    const loader = new GLTFLoader();
    // 设置解压库文件路径
    const dracoLoader = new DRACOLoader(manager);
    dracoLoader.setDecoderPath(staticUrlPrefix + 'dracos/gltf/');
    loader.setDRACOLoader(dracoLoader);
    loader.load(url, (object: any) => {
      ship = object.scene;
      THREE_CONST.scene.add(ship);
    });
  };
  // 更新
  const animate = () => {
    const time = performance.now() * 0.002;
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    if (ship) {
      ship.position.y = Math.sin(time) * 0.2 - 0.2;
    }
    if (water) {
      water.material.uniforms['time'].value += 0.5 / 60.0;
    }
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 根据当前时间计算太阳位置
  const getSunHeight = () => {
    // 6 点在位置 0, 12点在 位置 90
    const currentHour = dayjs().get('hour');
    const one = 90 / 6;
    const leave6 = currentHour - 6;
    setSunHeight(leave6 * one);
  };
  return (
    <Spin spinning={loadingProcess < 100} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
      <div id="threeContainer" />
    </Spin>
  );
};
export default Merry;
