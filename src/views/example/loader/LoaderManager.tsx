/**
 * @description: 加载器管理器
 * @author: cnn
 * @createTime: 2022/2/9 9:16
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, HemisphereLight, DirectionalLight, WebGLRenderer, Vector3,
  PMREMGenerator, MathUtils, ACESFilmicToneMapping, MeshBasicMaterial, MeshStandardMaterial,
  TextureLoader, RepeatWrapping, Mesh, TextGeometry, Font, MeshPhongMaterial, Group, LoadingManager
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight, getTreeChildren } from '@utils/CommonFunc';
import {
  CameraType, getIntersects, initCamera, initScene,
  resetThreeConst, THREE_CONST
} from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

let sun: any;
let group: any;
let arrowTexture: any;
let selectObjectList: Array<any> = [];
let materialList: any = [];
let textMesh: any;
let textMesh1: any;

const LoaderManager = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  const [loadingProcess, setLoadingProcess] = useState<number>(0);
  useEffect(() => {
    initMyScene();
    return () => {
      // 重置全局变量
      resetThreeConst();
      group = null;
      sun = null;
      selectObjectList = [];
      materialList = [];
      arrowTexture = null;
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
      initModel();
      initControls();
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('click', onMouseClick);
    }
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('click', onMouseClick);
    };
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene({
      background: new Color(0x000000)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 50,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 0.1,
        far: 1000,
      },
      position: [0, 0, 80]
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
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    // 设置 alpha。合法参数是一个 0.0 到 1.0 之间的浮点数
    renderer.setClearAlpha(0.2);
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), (getClientHeight() - 60));
    renderer.toneMapping = ACESFilmicToneMapping;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 0.1;
    controls.maxDistance = 70;
    // controls.enablePan = false;
    // controls.enableZoom = false;
    controls.update();
    animate();
  };
  // 初始化模型
  const initModel = () => {
    sun = new Vector3();
    const sky = new Sky();
    sky.scale.setScalar(10000);
    THREE_CONST.scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    const parameters = {
      elevation: 10,
      azimuth: 180
    };
    const pmremGenerator = new PMREMGenerator(renderer);
    const updateSun = () => {
      const phi = MathUtils.degToRad(90 - parameters.elevation);
      const theta = MathUtils.degToRad(parameters.azimuth);
      sun.setFromSphericalCoords(1, phi, theta);
      sky.material.uniforms['sunPosition'].value.copy(sun);
      // @ts-ignore
      THREE_CONST.scene.environment = pmremGenerator.fromScene(sky).texture;
    };
    updateSun();
    // 显示加载进度
    const manager = new LoadingManager();
    manager.onProgress = (url: string, loaded: number, total: number) => {
      setLoadingProcess(Math.floor(loaded / total * 100));
    };
    // 加载模型
    const url: string = staticUrlPrefix + 'BiomassFactory.gltf';
    const loader = new GLTFLoader();
    // 设置解压库文件路径
    const dracoLoader = new DRACOLoader(manager);
    dracoLoader.setDecoderPath(staticUrlPrefix + 'dracos/gltf/');
    loader.setDRACOLoader(dracoLoader);
    arrowTexture = new TextureLoader().load(staticUrlPrefix + 'arrow.png');
    arrowTexture.wrapS = arrowTexture.wrapT = RepeatWrapping;
    arrowTexture.repeat.set(1, 5);
    loader.load(url, (object: any) => {
      object.scene.position.set(-12, 0, 0);
      const pipeList = ['Mesh006', 'Mesh007'];
      getTreeChildren(object.scene.children, (item: any) => {
        // 管道半透明
        if (pipeList.indexOf(item.name) !== -1) {
          item.material = new MeshBasicMaterial({
            color: 0X4169E1,
            transparent: true,
            opacity: 0.2,
            name: item.name
          });
          materialList.push(item.material);
        }
        // 管道内平面加箭头动画
        if (item.name.indexOf('arrowPlane') !== -1) {
          item.material = new MeshStandardMaterial({
            color: new Color(0x0000ff),
            map: arrowTexture,
            transparent: true
          });
        }
      });
      group = new Group();
      group.add(object.scene);
      THREE_CONST.scene.add(group);
      addText();
    });
  };
  // 添加文字
  const addText = () => {
    const height = 0.2;
    const size = 0.5;
    const curveSegments = 4;
    const loader = new TTFLoader();
    loader.load(staticUrlPrefix + 'fonts/HYLiangPinXianJ.ttf', (json: any) => {
      const font = new Font(json);
      const textGeo = new TextGeometry('当前流速：1000ml/s', {
        font,
        size,
        height,
        curveSegments
      });
      const material = new MeshPhongMaterial({
        color: 0x8fb5fb,
        flatShading: true
      });
      textMesh = new Mesh(textGeo, material);
      textMesh.position.set(-0.6, -2, 35);
      textMesh.rotation.set(0, Math.PI / 2 * 3, 0);
      textMesh.visible = false;
      textMesh1 = new Mesh(textGeo, material);
      textMesh1.position.set(4.9, -2, 35);
      textMesh1.rotation.set(0, Math.PI / 2 * 3, 0);
      textMesh1.visible = false;
      group.add(textMesh);
      group.add(textMesh1);
    });
  };
  // 监听鼠标单击事件
  const onMouseClick = (event: MouseEvent) => {
    // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
    const intersects = getIntersects(event, threeContainer, THREE_CONST.camera, THREE_CONST.scene);
    // 清空所有高亮材质
    resetMaterial();
    // 获取选中最近的 Mesh 对象
    if (intersects.length !== 0 && intersects[0].object instanceof Mesh) {
      const selectObject = intersects[0].object;
      onSelectObject(selectObject);
    }
  };
  // 选中某个对象
  const onSelectObject = (tempSelectObject: any) => {
    // 只有生产线可以点击
    if (tempSelectObject.name.indexOf('Mesh006') !== -1 || tempSelectObject.name.indexOf('Mesh007') !== -1) {
      if (tempSelectObject.name === 'Mesh006') {
        textMesh1.visible = true;
      } else {
        textMesh.visible = true;
      }
      selectObjectList.push(tempSelectObject);
      tempSelectObject.material = new MeshBasicMaterial({
        color: 0xFAAD14,
        transparent: true,
        opacity: 0.2
      });
    }
  };
  // 重置材质
  const resetMaterial = () => {
    for (let i = 0; i < selectObjectList.length; i++) {
      if (materialList.filter((item: any) => item.name === selectObjectList[i].name).length > 0) {
        selectObjectList[i].material = materialList.filter((item: any) => item.name === selectObjectList[i].name)[0];
      }
    }
    selectObjectList = [];
    textMesh.visible = false;
    textMesh1.visible = false;
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    if (group) {
      group.rotation.y += 0.0005;
    }
    // 通过设置纹理的位移达到箭头流动的效果
    if (arrowTexture) {
      arrowTexture.offset.y -= 0.01;
    }
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), (getClientHeight() - 60));
  };
  return (
    <Spin spinning={loadingProcess < 100} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
      <div id="threeContainer" />
    </Spin>
  );
};
export default LoaderManager;
