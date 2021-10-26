/**
 * @description: 工厂模型
 * @author: cnn
 * @createTime: 2021/10/19 10:11
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, DirectionalLight, DoubleSide, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  MeshStandardMaterial, PointLight, RepeatWrapping, Texture, TextureLoader,
  WebGLRenderer, PlaneGeometry, VideoTexture
} from 'three';
import { getClientHeight, getClientWidth, getTreeChildren } from '@utils/CommonFunc';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { CameraType, getIntersects, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

interface IMaterialData {
  name: string,
  material: any
}

let selectObjectList: Array<any> = [];

const Factory = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  const [materialList, setMaterialList] = useState<Array<IMaterialData>>([]);
  const [arrowTexture, setArrowTexture] = useState<Texture>();
  useEffect(() => {
    THREE_CONST.scene = initScene({
      background: new Color(0xcce0ff)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      position: [-45, 30, 50]
    });
    initArrowTexture();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('click', onMouseClick);
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
    if (THREE_CONST.scene && THREE_CONST.camera && arrowTexture) {
      initMyScene();
    }
  }, [THREE_CONST.scene, THREE_CONST.camera, arrowTexture]);
  useEffect(() => {
    if (threeContainer) {
      initRenderer();
    }
  }, [threeContainer]);
  useEffect(() => {
    if (renderer) {
      initControls();
      window.addEventListener('resize', onWindowResize, false);
      window.addEventListener('click', onMouseClick, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initModel();
    setThreeContainer(threeContainer);
  };
  // 初始化光源
  const initLight = () => {
    // 点光源
    // 从一个点向各个方向发射的光源。一个常见的例子是模拟一个灯泡发出的光。
    const pointLight = new PointLight(0xffe7ba, 1, 100);
    pointLight.position.set(-64, 39, 22);
    THREE_CONST.scene.add(pointLight);
    const pointLight1 = new PointLight(0xffe7ba, 1, 100);
    pointLight1.position.set(-38, -59, 22);
    THREE_CONST.scene.add(pointLight1);
    const pointLight2 = new PointLight(0xffe7ba, 1, 100);
    pointLight2.position.set(66, 45, 22);
    THREE_CONST.scene.add(pointLight2);
    const pointLight3 = new PointLight(0xffe7ba, 1, 100);
    pointLight3.position.set(33, 162, 22);
    THREE_CONST.scene.add(pointLight3);
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
    controls.minDistance = 0;
    controls.maxDistance = 150;
    controls.update();
    animate();
  };
  // 初始化模型
  const initModel = () => {
    const url: string = '/modelStatic/three/BiomassFactory.gltf';
    // 加载模型
    const loader = new GLTFLoader();
    // 设置解压库文件路径
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/modelStatic/three/dracos/gltf/');
    loader.setDRACOLoader(dracoLoader);
    loader.load(url, (object: any) => {
      const pipeList = ['Mesh006', 'Mesh007'];
      getTreeChildren(object.scene.children, (item: any) => {
        // 管道半透明
        if (pipeList.indexOf(item.name) !== -1) {
          item.material = new MeshBasicMaterial({
            color: 0X4169E1,
            transparent: true,
            opacity: 0.2
          });
        }
        // 管道内平面加箭头动画
        if (item.name.indexOf('arrowPlane') !== -1) {
          item.material = new MeshStandardMaterial({
            color: new Color(0xffffff),
            map: arrowTexture,
            transparent: true
          });
        }
      });
      THREE_CONST.scene.add(object.scene);
    });
    addPlane();
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
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
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
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
      selectObjectList.push(selectObject);
      onSelectObject(selectObject);
    }
  };
  // 重置材质
  const resetMaterial = () => {
    for (let i = 0; i < selectObjectList.length; i++) {
      if (materialList.filter((item) => item.name === selectObjectList[i].name).length > 0) {
        selectObjectList[i].material = materialList.filter((item) => item.name === selectObjectList[i].name)[0].material;
      }
    }
    selectObjectList = [];
  };
  // 选中某个对象
  const onSelectObject = (tempSelectObject: any) => {
    // 只有生产线可以点击
    if (tempSelectObject.name.indexOf('Proline') !== -1) {
      if (materialList.filter(item => item.name === tempSelectObject.name).length > 0) {
        let oldOneMaterial = materialList.filter(item => item.name === tempSelectObject.name)[0];
        tempSelectObject.material = new MeshPhongMaterial({
          color: 0X4169E1,
          map: oldOneMaterial.material.map
        });
      }
    }
  };
  // 箭头纹理
  const initArrowTexture = () => {
    const texture: Texture = new TextureLoader().load('/modelStatic/three/arrow.png');
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 5);
    setArrowTexture(texture);
  };
  // 添加 echarts 平面 todo 只是为了以后使用，此处并不能使用
  // const addPlane = (chart: any) => {
  //   const lineChart = chart.getDataURL({
  //     pixelRatio: 4,
  //   });
  //   const texture = new TextureLoader().load(lineChart);
  //   const geometry = new PlaneGeometry(3, 4);
  //   const material = new MeshBasicMaterial({
  //     map: texture,
  //     transparent: true,
  //     side: DoubleSide
  //   });
  //   const plane = new Mesh(geometry, material);
  //   // 远， 右， 上
  //   plane.position.set(11.2, -1, 37);
  //   plane.rotateY(80.1);
  //   scene.add(plane);
  // };
  // 添加 视频 平面
  const addPlane = () => {
    const video = document.getElementById('video');
    // @ts-ignore
    const texture = new VideoTexture(video);
    const geometry = new PlaneGeometry(4, 2.25);
    const material = new MeshBasicMaterial({
      map: texture,
      side: DoubleSide
    });
    const plane = new Mesh(geometry, material);
    // 远， 右， 上
    plane.position.set(11.2, -1, 37);
    plane.rotateY(80.1);
    THREE_CONST.scene.add(plane);
  };
  return (
    <>
      <div id="threeContainer" />
      <video id="video" controls width={400} height={300} style={{ display: 'none' }} autoPlay loop>
        <source src="/modelStatic/three/1.mp4" type='video/ogg; codecs="theora, vorbis"' />
      </video>
    </>
  );
};
export default Factory;