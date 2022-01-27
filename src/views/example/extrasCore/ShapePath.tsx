/**
 * @description: 形状路径
 * 该类用于转换一系列的形状为一个 Path 数组，例如转换 SVG 中的 Path 为 three.js 中的 Path（请参阅下方的 example）。
 * 创建一个新的 ShapePath。和 Path 不同，因为 ShapePath 被设计为在创建之后生成，所以没有点被传入到构造函数中。
 * @author: cnn
 * @createTime: 2022/1/27 9:14
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, DirectionalLight, WebGLRenderer, Group,
  AmbientLight, GridHelper, MeshLambertMaterial, ExtrudeGeometry, Mesh
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, d3threeD, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

let $d3g: any = {};

const ShapePath = () => {
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
    d3threeD($d3g);
    THREE_CONST.scene = initScene({
      background: new Color(0xb0b0b0)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 50,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1000,
      },
      position: [0, 0, 200]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initObj();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const directionalLight = new DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0.75, 0.75, 1.0).normalize();
    THREE_CONST.scene.add(directionalLight);
    const ambientLight = new AmbientLight(0xcccccc, 0.2);
    THREE_CONST.scene.add(ambientLight);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
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
    controls.minDistance = 100;
    controls.maxDistance = 1000;
    controls.update();
    animate();
  };
  // 生成 svg 物体
  const initSvgObject = () => {
    const obj: any = {};
    obj.paths = [
      // Taipei City
      'M366.2182,108.9780 L368.0329,110.3682 L367.5922,112.4411 L369.9258,116.0311 L368.9827,117.3543 ' +
      'L371.5686,119.8491 L370.5599,121.7206 L372.9314,124.8009 L368.8889,126.7603 L369.2695,130.7622 ' +
      'L366.1499,130.3388 L363.4698,128.1161 L362.9256,125.6018 L360.8153,126.4025 L360.2968,124.3588 ' +
      'L361.9519,121.1623 L360.4475,118.7162 L358.1163,117.8678 L358.7094,115.7577 L361.6243,112.4576 Z',
      // Keelung City
      'M380.2689,113.3850 L383.5604,114.2370 L383.7404,114.2386 L385.4082,115.6247 L384.9725,117.4631 ' +
      'L381.6681,117.9439 L383.0209,121.0914 L379.4649,122.7061 L373.4987,118.8487 L372.0980,114.7589 ' +
      'L377.9716,112.0707 Z',
      // Taipei County
      'M359.4486,155.6690 L357.0422,152.7420 L355.1688,148.0173 L357.1186,145.8045 L354.1323,141.2242 ' +
      'L351.1807,141.6609 L348.9387,140.5372 L349.5415,137.8396 L347.5174,136.1694 L347.6299,129.2327 ' +
      'L351.4192,128.8067 L354.2518,125.3113 L352.5805,121.8038 L349.3190,120.9429 L344.3277,116.7676 ' +
      'L350.9772,115.1221 L354.5759,112.5371 L354.5667,110.6949 L357.4098,105.7489 L362.3963,101.8443 ' +
      'L364.4415,101.0819 L364.5314,101.0828 L364.6209,101.1230 L364.7698,101.2029 L368.1221,101.5115 ' +
      'L371.7216,104.1338 L372.2958,106.7261 L375.5949,109.6971 L377.0415,108.8875 L377.0737,108.6526 ' +
      'L377.4037,108.6165 L376.8840,109.7091 L376.7323,109.9037 L377.9416,112.0705 L371.7970,114.8736 ' +
      'L374.0935,119.4031 L380.7848,122.7963 L382.6529,121.9897 L381.5792,117.8256 L385.0339,117.3069 ' +
      'L385.4082,115.6247 L388.7014,116.3969 L389.8697,116.6024 L390.0206,116.4860 L391.0396,116.6118 ' +
      'L394.6665,116.9929 L394.4694,119.2255 L394.3172,119.4987 L395.3792,121.8977 L395.2728,124.0526 ' +
      'L397.2123,125.6350 L401.1709,126.2516 L401.2612,126.2130 L401.4086,126.6060 L400.1992,127.7733 ' +
      'L399.7769,128.0446 L399.6247,128.3179 L398.1779,129.0521 L394.2418,129.2969 L388.7324,130.9385 ' +
      'L389.2782,134.0003 L383.7237,137.0111 L381.7445,139.9336 L379.7001,139.9546 L376.1539,143.0580 ' +
      'L371.3022,144.1094 L368.6009,146.5914 L368.7361,151.1399 L363.6153,154.4980 ' +
      // Taipei County hole.
      'M363.4600,128.3904 L366.6300,130.3829 L369.3732,129.3913 L369.5603,125.6695 L374.3989,125.1677 ' +
      'L370.8412,123.6440 L371.0684,118.8252 L369.0431,117.3157 L369.6882,115.7936 L367.8578,112.8749 ' +
      'L368.1217,110.4867 L366.5152,109.2554 L361.9554,112.3435 L358.1163,117.8678 L361.7218,120.2192 ' +
      'L360.7261,126.3232 L362.8064,125.5221 Z'];
    obj.depths = [19, 20, 21];
    obj.colors = [0xc07000, 0xc08000, 0xc0a000];
    obj.center = { x: 365, y: 125 };
    return obj;
  };
  // 添加几何体
  const addGeoObject = (group: any, svgObject: any) => {
    const paths = svgObject.paths;
    const depths = svgObject.depths;
    const colors = svgObject.colors;
    const center = svgObject.center;
    for (let i = 0; i < paths.length; i++) {
      const path = $d3g.transformSVGPath(paths[i]);
      const color = new Color(colors[i]);
      const material = new MeshLambertMaterial({
        color,
        emissive: color
      });
      const depth = depths[i];
      const simpleShapes = path.toShapes(true);
      for (let j = 0; j < simpleShapes.length; j++) {
        const simpleShape = simpleShapes[j];
        const shape3d = new ExtrudeGeometry(simpleShape, {
          depth,
          bevelEnabled: false
        });
        const mesh = new Mesh(shape3d, material);
        mesh.rotation.x = Math.PI;
        mesh.translateZ(-depth - 1);
        mesh.translateX(-center.x);
        mesh.translateY(-center.y);
        group.add(mesh);
      }
    }
  };
  // 生成一个物体
  const initObj = () => {
    const group = new Group();
    THREE_CONST.scene.add(group);
    const helper = new GridHelper(160, 10);
    helper.rotation.x = Math.PI / 2;
    group.add(helper);
    const obj = initSvgObject();
    addGeoObject(group, obj);
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
  return <div id="threeContainer" />;
};
export default ShapePath;
