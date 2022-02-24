/**
 * @description: 模型上标记
 * @author: cnn
 * @createTime: 2022/2/24 15:35
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, HemisphereLight, DirectionalLight, WebGLRenderer, LoadingManager, Sprite, Raycaster, SpriteMaterial, Texture
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight, roundRect } from '@utils/CommonFunc';
import {
  CameraType, getIntersectPosition, initCamera, initScene, resetThreeConst,
  THREE_CONST
} from '@utils/ThreeUtils';
import { staticUrlPrefix } from '@utils/CommonVars';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Button, Input, Space, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

let isAddMark: boolean = true;
let transformControl: any;
let currentSprite: any;

const Mark = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  const [loadingProcess, setLoadingProcess] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(true);
  const [labelValue, setLabelValue] = useState<string>('');
  useEffect(() => {
    initMyScene();
    return () => {
      // 重置全局变量
      resetThreeConst();
      transformControl = null;
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
      document.addEventListener('mousedown', onMouseDown);
    }
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [renderer]);
  useEffect(() => {
    if (transformControl && isDone) {
      transformControl.detach();
    }
  }, [isDone]);
  useEffect(() => {
    changeLabelValue();
  }, [labelValue]);
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
    initLight();
    initModel();
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
    transformControl = new TransformControls(THREE_CONST.camera, renderer.domElement);
    transformControl.addEventListener('change', render);
    transformControl.addEventListener('dragging-changed', (event: any) => {
      controls.enabled = !event.value;
    });
    THREE_CONST.scene.add(transformControl);
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    animate();
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
      const ship = object.scene;
      THREE_CONST.scene.add(ship);
    });
  };
  // 生成精灵
  const addSprite = (point: any) => {
    const material = new SpriteMaterial({
      map: initTextCanvas('标签内容')
    });
    const sprite = new Sprite(material);
    sprite.position.copy(point);
    sprite.scale.set(1, 0.5, 0.1);
    THREE_CONST.scene.add(sprite);
    currentSprite = sprite;
    transformControl.attach(sprite);
    isAddMark = true;
  };
  // 鼠标点击
  const onMouseDown = (e: any) => {
    if (!isAddMark) {
      const { x, y } = getIntersectPosition(e, threeContainer);
      THREE_CONST.scene.updateMatrixWorld(true);
      const raycaster = new Raycaster();
      // 通过鼠标点的位置和当前相机的矩阵计算出 raycaster
      raycaster.setFromCamera({ x, y }, THREE_CONST.camera);
      // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
      let intersects = raycaster.intersectObjects(THREE_CONST.scene.children, true);
      // 获取选中最近的 Mesh 对象
      if (intersects.length !== 0) {
        const intersect = intersects[0];
        addSprite(intersect.point);
      }
      render();
    }
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  // 点击添加标注
  const mark = () => {
    isAddMark = false;
    setIsDone(false);
  };
  // 生成文字 canvas
  const initTextCanvas = (message: string) => {
    let borderThickness = 10;
    let fontsize = 40;
    /* 创建画布 */
    let canvas = document.createElement('canvas');
    let context: any = canvas.getContext('2d');
    /* 字体加粗 */
    context.font = 'Bold ' + fontsize + 'px Arial';
    /* 获取文字的大小数据，高度取决于文字的大小 */
    let metrics = context.measureText(message);
    let textWidth = metrics.width;
    /* 背景颜色 */
    context.fillStyle = '#333';
    /* 边框的颜色 */
    context.strokeStyle = 'rgba(0, 0, 0, 0)';
    context.lineWidth = 1;
    /* 绘制圆角矩形 */
    roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    /* 字体颜色 */
    context.fillStyle = '#fff';
    context.fillText(message, borderThickness, fontsize + borderThickness);
    /* 画布内容用于纹理贴图 */
    let texture = new Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  };
  // 改变标签值
  const changeLabelValue = () => {
    if (currentSprite) {
      currentSprite.material.map = initTextCanvas(labelValue);
      render();
    }
  };
  return (
    <Spin spinning={loadingProcess < 100} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ position: 'relative' }}>
      <Space style={{ position: 'absolute', top: 10, left: 10 }}>
        <Button onClick={mark}>
          添加标注
        </Button>
        {!isDone && (
          <Space>
            <Input
              value={labelValue}
              placeholder="请输入标签内容"
              style={{ width: 150 }}
              maxLength={20}
              minLength={1}
              onChange={(e: any) => setLabelValue(e.target.value)}
            />
            <Button onClick={() => {
              setIsDone(true);
              currentSprite = null;
            }} type="primary">
              完成标注
            </Button>
          </Space>
        )}
      </Space>
      <div id="threeContainer" />
    </Spin>
  );
};
export default Mark;
