/**
 * @description: 实例化网格
 * 一种具有实例化渲染支持的特殊版本的 Mesh。
 * 你可以使用 InstancedMesh 来渲染大量具有相同几何体与材质、但具有不同世界变换的物体。
 * 使用 InstancedMesh 将帮助你减少 draw call 的数量，从而提升你应用程序的整体渲染性能。
 * 备注：这个对应的实例都挺有趣的。
 * @author: cnn
 * @createTime: 2021/12/22 15:21
 **/
import React, { useEffect, useState } from 'react';
import {
  HemisphereLight, InstancedMesh as TInstancedMesh, WebGLRenderer,
  IcosahedronGeometry, MeshPhongMaterial, Matrix4,
  Color, Vector2, Raycaster
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import {
  CameraType,
  getIntersectPosition,
  initCamera,
  initScene,
  resetThreeConst,
  THREE_CONST
} from '@utils/ThreeUtils';

let mesh: any;
let amount = parseInt((window.location.search.substr(1) || 10) as string, 10);
const count = Math.pow(amount, 3);
const color = new Color();
const mouse = new Vector2(1, 1);
const raycaster = new Raycaster();

const InstancedMesh = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  useEffect(() => {
    initMyScene();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onMouseMove);
      // 重置全局变量
      resetThreeConst();
      mesh = null;
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
      document.addEventListener('mousemove', onMouseMove, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene();
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 60,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 0.1,
        far: 100,
      },
      position: [amount, amount, amount],
      lookPoint: [0, 0, 0]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initGeometry();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    const light1 = new HemisphereLight(0xffffff, 0x000088);
    light1.position.set(-1, 1.5, 1);
    THREE_CONST.scene.add(light1);
    const light2 = new HemisphereLight(0xffffff, 0x880000, 0.5);
    light2.position.set(-1, -1.5, -1);
    THREE_CONST.scene.add(light2);
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
    controls.update();
    animate();
  };
  // 生成几何体
  const initGeometry = () => {
    const geometry = new IcosahedronGeometry(0.5, 3);
    const material = new MeshPhongMaterial();
    mesh = new TInstancedMesh(geometry, material, count);
    let i = 0;
    const offset = (amount - 1) / 2;
    const matrix = new Matrix4();
    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        for (let z = 0; z < amount; z++) {
          matrix.setPosition(offset - x, offset - y, offset - z);
          mesh.setMatrixAt(i, matrix);
          mesh.setColorAt(i, color);
          i++;
        }
      }
    }
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
    raycaster.setFromCamera(mouse, THREE_CONST.camera);
    const intersection = raycaster.intersectObject(mesh);
    if (intersection.length > 0) {
      const instanceId = intersection[0].instanceId;
      mesh.setColorAt(instanceId, color.setHex(Math.random() * 0xffffff));
      mesh.instanceColor.needsUpdate = true;
    }
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 鼠标移动事件监听
  const onMouseMove = (e: any) => {
    e.preventDefault();
    const { x, y } = getIntersectPosition(e, threeContainer);
    mouse.x = x;
    mouse.y = y;
  };
  return <div id="threeContainer" />;
};
export default InstancedMesh;
