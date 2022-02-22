/**
 * @description: 漂浮在大海中的梅林号
 * @author: cnn
 * @createTime: 2022/2/17 16:31
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, Vector3, PMREMGenerator, MathUtils,
  PlaneGeometry, TextureLoader, RepeatWrapping, ACESFilmicToneMapping, LoadingManager,
  PointsMaterial, Points, AdditiveBlending, BufferGeometry, Float32BufferAttribute
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
import { Spin, Radio } from 'antd';
import dayjs from 'dayjs';
import { LightningStorm } from 'three/examples/jsm/objects/LightningStorm';

let sun: any;
let water: any;
let ship: any;
let points1: any;
let points2: any;
let sky: any;

const Merry = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  const [loadingProcess, setLoadingProcess] = useState<number>(0);
  const [sunHeight, setSunHeight] = useState<number>(0);
  const [currentWeather, setCurrentWeather] = useState<string>('sun');
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
  useEffect(() => {
    changeWeather();
  }, [currentWeather]);
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
    controls.maxDistance = 100;
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
    sky = new Sky();
    sky.scale.setScalar(100000);
    THREE_CONST.scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    // 不透明度
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    // 平均系数
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    updateSun(sunHeight);
  };
  const updateSun = (elevation: number) => {
    // elevation 越小越接近水平线，最高空 90
    const parameters = {
      elevation,
      azimuth: 180
    };
    const pmremGenerator = new PMREMGenerator(renderer);
    const phi = MathUtils.degToRad(90 - parameters.elevation);
    const theta = MathUtils.degToRad(parameters.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();
    sky.material.uniforms['sunPosition'].value.copy(sun);
    // @ts-ignore
    THREE_CONST.scene.environment = pmremGenerator.fromScene(sky).texture;
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
  // 雪花（雨的）动画
  const pointsRender = () => {
    if (points1) {
      points1.position.y -= 0.2;
      if (points1.position.y < -100) {
        points1.position.y = 100;
      }
    }
    if (points2) {
      points2.position.y -= 0.2;
      if (points2.position.y < -100) {
        points2.position.y = 100;
      }
    }
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
    pointsRender();
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
  // 改变天气
  const changeWeather = () => {
    if (currentWeather === 'lightStorm') {
      const lightingStorm = new LightningStorm({
        size: 20,
        minHeight: 100
      });
      THREE_CONST.scene.add(lightingStorm);
    } else if (currentWeather === 'rain') {
      updateSun(170);
      addPoints('rain');
    } else if (currentWeather === 'snow') {
      updateSun(-10);
      addPoints('snow');
    }
  };
  // 添加雨特效
  const addPoints = (type: 'rain' | 'snow') => {
    if (points1) {
      THREE_CONST.scene.remove(points1);
      points1 = null;
    }
    if (points2) {
      THREE_CONST.scene.remove(points2);
      points2 = null;
    }
    const texture = new TextureLoader().load(staticUrlPrefix + `textures/${type}.png`);
    const material = new PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 0.8,
      map: texture,
      // 在使用此材质显示对象时要使用何种混合。
      blending: AdditiveBlending,
      // 粒子的大小是否会被相机深度衰减，默认为 true（仅限透视相机）。
      sizeAttenuation: true,
      // 是否在渲染此材质时启用深度测试。
      depthTest: false
    });
    const geometry: any = new BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 2000; i++) {
      const x = MathUtils.randFloatSpread(100);
      const y = MathUtils.randFloatSpread(100);
      const z = MathUtils.randFloatSpread(100);
      let vertex: any = new Vector3(x, y, z);
      // 纵向移动速度
      vertex.velocityY = 0.1 + Math.random() / 15;
      // 横向移动速度
      vertex.velocityX = (Math.random() - 0.5) / 3;
      // 将顶点加入几何
      vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    points1 = new Points(geometry, material);
    points2 = new Points(geometry, material);
    points1.position.y = 100;
    points2.position.y = 200;
    THREE_CONST.scene.add(points1);
    THREE_CONST.scene.add(points2);
  };
  // 天气列表
  const weatherList: Array<string> = ['sun', 'lightStorm', 'rain', 'snow'];
  return (
    <Spin spinning={loadingProcess < 100} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <Radio.Group
          options={weatherList.map((item: string) => ({ label: item, value: item }))}
          optionType="button"
          buttonStyle="solid"
          onChange={(e: any) => setCurrentWeather(e.target.value)}
          value={currentWeather}
        />
      </div>
      <div id="threeContainer" />
    </Spin>
  );
};
export default Merry;
