/**
 * @description: 把图片加载为ImageBitmap的加载器
 * 一个把 Image 加载为 ImageBitmap 的加载器。 ImageBitmap 提供了一种异步且有效的资源的途径，用于在 WebGL 中渲染的纹理。
 * 不像 FileLoader, ImageBitmapLoader 无需避免对同一的 URL 进行多次请求。
 * 注意 Texture.flipY 和 Texture.premultiplyAlpha 在 ImageBitemap 中被忽略了。
 * ImageBitmap 在构建 bitmap 时需要这些配置，而不是像常规的图片在上传到 GPU 时需要它们。
 * 你需要通过 ImageBitmapLoader.setOptions 设置等效的选项，详情请参阅WebGL规范。
 * @author: cnn
 * @createTime: 2022/1/23 10:50
 **/
import React, { useEffect, useState } from 'react';
import {
  Color,
  WebGLRenderer,
  ImageBitmapLoader as TImageBitmapLoader,
  Group,
  GridHelper,
  CanvasTexture,
  MeshBasicMaterial,
  Mesh, BoxGeometry, ImageLoader
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';

let group: any;
let cubes: any;

const ImageBitmapLoader = () => {
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
      group = null;
      cubes = null;
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
      background: new Color(0x000000)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 30,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 1500,
      },
      position: [0, 4, 7],
      lookPoint: [0, 0, 0]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    group = new Group();
    THREE_CONST.scene.add(group);
    group.add(new GridHelper(4, 12, 0x888888, 0x444444));
    cubes = new Group();
    group.add(cubes);
    initCube();
    setThreeContainer(threeContainer);
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
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    animate();
  };
  // 添加 cube
  const addCube = (material: any) => {
    const geometry = new BoxGeometry(1, 1, 1);
    const cube = new Mesh(geometry, material);
    cube.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    cube.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
    cubes.add(cube);
  };
  // 添加 ImageBitmap
  const addImageBitmap = () => {
    new TImageBitmapLoader().setOptions({ imageOrientation: 'none' })
      .load(staticUrlPrefix + 'textures/planets/earth_atmos_2048.jpg?' + performance.now(), (imageBitmap: any) => {
        const texture = new CanvasTexture(imageBitmap);
        const material = new MeshBasicMaterial({ map: texture });
        addCube(material);
      });
  };
  // 添加 Image
  const addImage = () => {
    new ImageLoader().setCrossOrigin('*')
      .load(staticUrlPrefix + 'textures/planets/earth_atmos_2048.jpg?' + performance.now(), (image: any) => {
        const texture = new CanvasTexture(image);
        const material = new MeshBasicMaterial({
          color: 0xff8888,
          map: texture
        });
        addCube(material);
      });
  };
  // 生成物体们
  const initCube = () => {
    // 红色的
    setTimeout(addImage, 300);
    setTimeout(addImage, 600);
    setTimeout(addImage, 900);
    // 白色的
    setTimeout(addImageBitmap, 1300);
    setTimeout(addImageBitmap, 1600);
    setTimeout(addImageBitmap, 1900);
  };
  // 更新
  const animate = () => {
    if (group) {
      group.rotation.y = performance.now() / 3000;
    }
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
export default ImageBitmapLoader;
