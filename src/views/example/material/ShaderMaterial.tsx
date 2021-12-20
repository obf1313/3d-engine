/**
 * @description: 着色器材质
 * 使用自定义 shader 渲染的材质。 shader 是一个用 GLSL 编写的小程序 ，在 GPU 上运行。 您可能需要使用自定义shader，如果你要：
 * 1. 要实现内置 materials 之外的效果。
 * 2. 将许多对象组合成单个 BufferGeometry 以提高性能。
 * @author: cnn
 * @createTime: 2021/12/16 9:34
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, HemisphereLight, DirectionalLight, WebGLRenderer, Mesh,
  Fog, HemisphereLightHelper, DirectionalLightHelper,
  PlaneGeometry, MeshLambertMaterial, SphereGeometry, ShaderMaterial as TShaderMaterial,
  BackSide, AnimationMixer, sRGBEncoding, Clock
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Button, Space } from 'antd';

let mixers: Array<any> = [];
const clock: any = new Clock();
let hemisphereLight: any;
let hemisphereLightHelper: any;
let dirLight: any;
let dirLightHelper: any;

const ShaderMaterial = () => {
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
      mixers = [];
      hemisphereLight = null;
      hemisphereLightHelper = null;
      dirLight = null;
      dirLightHelper = null;
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
      animate();
      window.addEventListener('resize', onWindowResize, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    const color = new Color().setHSL(0.6, 0, 1);
    THREE_CONST.scene = initScene({
      background: color,
      fog: new Fog(color, 1, 5000)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 30,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 5000,
      },
      position: [0, 0, 250]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initGround();
    initSkyDome();
    initModel();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    // 半球光，光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
    hemisphereLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemisphereLight.color.setHSL(0.6, 1, 0.6);
    hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
    hemisphereLight.position.set(0, 50, 0);
    THREE_CONST.scene.add(hemisphereLight);
    hemisphereLightHelper = new HemisphereLightHelper(hemisphereLight, 10);
    THREE_CONST.scene.add(hemisphereLightHelper);
    dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    THREE_CONST.scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;
    dirLightHelper = new DirectionalLightHelper(dirLight, 10);
    THREE_CONST.scene.add(dirLightHelper);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true });
    // 设置 alpha。合法参数是一个 0.0 到 1.0 之间的浮点数
    renderer.setClearAlpha(0.2);
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化地板
  const initGround = () => {
    const groundGeo = new PlaneGeometry(10000, 10000);
    const groundMat = new MeshLambertMaterial({ color: 0xffffff });
    groundMat.color.setHSL(0.095, 1, 0.75);
    const ground = new Mesh(groundGeo, groundMat);
    ground.position.y = -33;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    THREE_CONST.scene.add(ground);
  };
  // 初始化天空
  const initSkyDome = () => {
    const vertexShader = 'varying vec3 vWorldPosition;\n' +
      '\n' +
      '\t\t\tvoid main() {\n' +
      '\n' +
      '\t\t\t\tvec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n' +
      '\t\t\t\tvWorldPosition = worldPosition.xyz;\n' +
      '\n' +
      '\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
      '\n' +
      '\t\t\t}';
    const fragmentShader = 'uniform vec3 topColor;\n' +
      '\t\t\tuniform vec3 bottomColor;\n' +
      '\t\t\tuniform float offset;\n' +
      '\t\t\tuniform float exponent;\n' +
      '\n' +
      '\t\t\tvarying vec3 vWorldPosition;\n' +
      '\n' +
      '\t\t\tvoid main() {\n' +
      '\n' +
      '\t\t\t\tfloat h = normalize( vWorldPosition + offset ).y;\n' +
      '\t\t\t\tgl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );\n' +
      '\n' +
      '\t\t\t}';
    const uniforms = {
      topColor: { value: new Color(0x0077ff) },
      bottomColor: { value: new Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    uniforms.topColor.value.copy(new Color().setHSL(0.6, 1, 0.6));
    THREE_CONST.scene.fog.color.copy(uniforms.bottomColor.value);
    const skyGeo = new SphereGeometry(4000, 32, 15);
    const skyMat = new TShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: BackSide
    });
    const sky = new Mesh(skyGeo, skyMat);
    THREE_CONST.scene.add(sky);
  };
  // 初始化模型
  const initModel = () => {
    const loader = new GLTFLoader();
    loader.load('/modelStatic/three/Flamingo.glb', (gltf: any) => {
      const mesh = gltf.scene.children[0];
      const s = 0.35;
      mesh.scale.set(s, s, s);
      mesh.position.y = 15;
      mesh.rotation.y = -1;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      THREE_CONST.scene.add(mesh);
      const mixer = new AnimationMixer(mesh);
      mixer.clipAction(gltf.animations[0]).setDuration(1).play();
      mixers.push(mixer);
    });
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 渲染
  const render = () => {
    const delta = clock.getDelta();
    for (let i = 0; i < mixers.length; i++) {
      mixers[i].update(delta);
    }
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 切换半球光
  const toggleHemisphereLight = () => {
    if (hemisphereLight) {
      hemisphereLight.visible = !hemisphereLight.visible;
      hemisphereLightHelper.visible = !hemisphereLightHelper.visible;
    }
  };
  // 切换平行光
  const toggleDirLight = () => {
    if (dirLight) {
      dirLight.visible = !dirLight.visible;
      dirLightHelper.visible = !dirLightHelper.visible;
    }
  };
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        <Space>
          <Button onClick={toggleHemisphereLight}>半球光</Button>
          <Button onClick={toggleDirLight}>平行光</Button>
        </Space>
      </div>
      <div id="threeContainer" />
    </div>
  );
};
export default ShaderMaterial;
