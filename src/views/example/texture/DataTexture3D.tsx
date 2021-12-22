/**
 * @description: 三维贴图
 * 创建一个三维的纹理贴图。这种纹理贴图只能被用于 WebGL 2 渲染环境中。
 * @author: cnn
 * @createTime: 2021/12/21 16:31
 **/
import React, { useEffect, useState } from 'react';
import {
  WebGLRenderer, sRGBEncoding, DataTexture3D as TDataTexture3D, RedFormat,
  FloatType, LinearFilter, TextureLoader, UniformsUtils, ShaderMaterial,
  BackSide, BoxGeometry, Mesh
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader';
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader';

let cmtextures;
let material;

const DataTexture3D = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  useEffect(() => {
    initMyScene();
    return () => {
      // 移除 resize 监听
      window.removeEventListener('resize', onWindowResize);
      // 重置全局变量
      resetThreeConst();
      cmtextures = null;
      material = null;
    };
  }, []);
  useEffect(() => {
    if (threeContainer) {
      initRenderer();
    }
  }, [threeContainer]);
  useEffect(() => {
    if (renderer) {
      initModel();
      initControls();
      window.addEventListener('resize', onWindowResize, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene();
    const h = 512;
    const aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.orthographicCamera,
      orthographicParams: {
        left: -h * aspect / 2,
        right: h * aspect / 2,
        top: h / 2,
        bottom: -h / 2,
        near: 1,
        far: 1000
      },
      position: [-64, -64, 128]
    });
    THREE_CONST.camera.up.set(0, 0, 1);
    const threeContainer = document.getElementById('threeContainer') || document;
    setThreeContainer(threeContainer);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    // antialias 执行抗锯齿，alpha canvas 包含 alpha (透明度)
    const renderer = new WebGLRenderer();
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    renderer.outputEncoding = sRGBEncoding;
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    const controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.target.set(64, 64, 128);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controls.update();
  };
  // 加入模型
  const initModel = () => {
    const volconfig = {
      clim1: 0,
      clim2: 1,
      rendersyle: 'iso',
      isothreshold: 0.15,
      colormap: 'viridis'
    };
    new NRRDLoader().load('/modelStatic/three/stent.nrrd', (volume: any) => {
      // 说实话我觉得这个例子没什么参考性
      const texture = new TDataTexture3D(volume.data, volume.xLength, volume.yLength, volume.zLength);
      texture.format = RedFormat;
      texture.type = FloatType;
      texture.minFilter = texture.magFilter = LinearFilter;
      texture.unpackAlignment = 1;
      cmtextures = {
        viridis: new TextureLoader().load('/modelStatic/three/textures/cm_viridis.png', render),
        gray: new TextureLoader().load('/modelStatic/three/textures/cm_gray.png', render)
      };
      const shader = VolumeRenderShader1;
      const uniforms = UniformsUtils.clone(shader.uniforms);
      uniforms['u_data'].value = texture;
      uniforms['u_size'].value.set(volume.xLength, volume.yLength, volume.zLength);
      uniforms['u_clim'].value.set(volconfig.clim1, volconfig.clim2);
      uniforms['u_renderstyle'].value = volconfig.rendersyle === 'mip' ? 0 : 1;
      uniforms['u_renderthreshold'].value = volconfig.isothreshold;
      // @ts-ignore
      uniforms['u_cmdata'].value = cmtextures[volconfig.colormap];
      material = new ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        side: BackSide
      });
      const geometry = new BoxGeometry(volume.xLength, volume.yLength, volume.zLength);
      geometry.translate(volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5);
      const mesh = new Mesh(geometry, material);
      THREE_CONST.scene.add(mesh);
      render();
    });
  };
  // 更新
  const render = () => {
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    const aspect = getClientWidth() / (getClientHeight() - 60);
    const frustumHeight = THREE_CONST.camera.top - THREE_CONST.camera.bottom;
    THREE_CONST.camera.left = -frustumHeight * aspect / 2;
    THREE_CONST.camera.right = frustumHeight * aspect / 2;
    THREE_CONST.camera.updateProjectionMatrix();
    render();
  };
  return <div id="threeContainer" />;
};
export default DataTexture3D;
