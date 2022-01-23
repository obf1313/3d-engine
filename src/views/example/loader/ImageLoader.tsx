/**
 * @description: 图片加载器
 * 用来加载一个 Image 的加载器。 内部使用 FileLoader 来加载文件
 * 并被 CubeTextureLoader、ObjectLoader、TextureLoader 所使用。
 * @author: cnn
 * @createTime: 2022/1/23 13:13
 **/
import React, { useEffect, useState } from 'react';
import {
  HemisphereLight, DirectionalLight, WebGLRenderer, ACESFilmicToneMapping, Vector3,
  PlaneGeometry, TextureLoader, RepeatWrapping, PMREMGenerator, MathUtils,
  BoxGeometry, MeshStandardMaterial, Mesh
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { Water } from 'three/examples/jsm/objects/Water';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { staticUrlPrefix } from '@utils/CommonVars';

let sun: any;
let water: any;
let mesh: any;

const ImageLoader = () => {
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
      initGeometry();
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
        fov: 55,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 20000,
      },
      position: [30, 30, 100]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
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
    const renderer = new WebGLRenderer();
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
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40;
    controls.maxDistance = 200;
    controls.update();
    animate();
  };
  // 生成几何体
  const initGeometry = () => {
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
      distortionScale: 3.7,
      fog: THREE_CONST.scene.fog !== undefined
    });
    water.rotation.x = -Math.PI / 2;
    THREE_CONST.scene.add(water);
    // skybox
    const sky = new Sky();
    sky.scale.setScalar(10000);
    THREE_CONST.scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    const parameters = {
      elevation: 0,
      azimuth: 180
    };
    const pmremGenerator = new PMREMGenerator(renderer);
    const updateSun = () => {
      const phi = MathUtils.degToRad(90 - parameters.elevation);
      const theta = MathUtils.degToRad(parameters.azimuth);
      sun.setFromSphericalCoords(1, phi, theta);
      sky.material.uniforms['sunPosition'].value.copy(sun);
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();
      // todo 此处有问题 不知道是不是此处导致物体不投射光线
      // @ts-ignore
      THREE_CONST.scene.environment = pmremGenerator.fromScene(sky).texture;
    };
    updateSun();
    const geometry = new BoxGeometry(30, 30, 30);
    const material = new MeshStandardMaterial({ roughness: 0 });
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
    const time = performance.now() * 0.001;
    mesh.position.y = Math.sin(time) * 20 + 5;
    mesh.rotation.x = time * 0.5;
    mesh.rotation.z = time * 0.51;
    water.material.uniforms['time'].value += 1.0 / 60.0;
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
export default ImageLoader;
