/**
 * @description: 音频
 * Audio：创建一个（ 全局 ) audio 对象。
 * AudioAnalyser：创建 AudioAnalyser 对象, 使用 AnalyserNode 去分析音频数据。
 * AudioContext：包含用来设置 AudioContext 的方法。
 * AudioListener：AudioListener 用一个虚拟的 listener 表示在场景中所有的位置和非位置相关的音效
 * @author: cnn
 * @createTime: 2022/1/25 16:48
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, DirectionalLight, WebGLRenderer, FogExp2, SphereGeometry,
  MeshPhongMaterial, Mesh, PositionalAudio, AudioListener, AudioAnalyser,
  Audio as TAudio, GridHelper, Clock
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { Button } from 'antd';
import { staticUrlPrefix } from '@utils/CommonVars';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

// todo 有耳机了，找时间重新看看
let light: any;
let material1: any;
let material2: any;
let material3: any;
let analyser1: any;
let analyser2: any;
let analyser3: any;
let controls: any;
const clock = new Clock();

const Audio = () => {
  const [threeContainer, setThreeContainer] = useState<any>();
  const [renderer, setRenderer] = useState<any>();
  const [animationId, setAnimationId] = useState<number>();
  const [overlayVisible, setOverlayVisible] = useState<boolean>(true);
  useEffect(() => {
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
    THREE_CONST.scene = initScene({
      background: new Color(0x000000),
      fog: new FogExp2(0x000000, 0.0025)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 50,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 10000,
      },
      position: [0, 25, 0]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initLight();
    initSphere();
    setThreeContainer(threeContainer);
    setOverlayVisible(false);
  };
  // 初始化光源
  const initLight = () => {
    light = new DirectionalLight(0xffffff);
    light.position.set(0, 0.5, 1).normalize();
    THREE_CONST.scene.add(light);
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
    controls = new FirstPersonControls(THREE_CONST.camera, renderer.domElement);
    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = true;
    controls.lookVertical = false;
    animate();
  };
  // 生成球
  const initSphere = () => {
    const listener = new AudioListener();
    THREE_CONST.camera.add(listener);
    const sphere = new SphereGeometry(20, 32, 16);
    material1 = new MeshPhongMaterial({ color: 0xffaa00, flatShading: true, shininess: 0 });
    material2 = new MeshPhongMaterial({ color: 0xff2200, flatShading: true, shininess: 0 });
    material3 = new MeshPhongMaterial({ color: 0x6622aa, flatShading: true, shininess: 0 });
    // 音频1
    const mesh1 = new Mesh(sphere, material1);
    mesh1.position.set(-250, 30, 0);
    THREE_CONST.scene.add(mesh1);
    const sound1 = new PositionalAudio(listener);
    const songElement: any = document.getElementById('song');
    sound1.setMediaElementSource(songElement);
    sound1.setRefDistance(20);
    songElement.play();
    mesh1.add(sound1);
    // 音频2
    const mesh2 = new Mesh(sphere, material2);
    mesh2.position.set(250, 30, 0);
    THREE_CONST.scene.add(mesh2);
    const sound2 = new PositionalAudio(listener);
    const skullbeatzElement: any = document.getElementById('skullbeatz');
    sound2.setMediaElementSource(skullbeatzElement);
    sound2.setRefDistance(20);
    skullbeatzElement.play();
    mesh2.add(sound2);
    // 这是啥
    const mesh3 = new Mesh(sphere, material3);
    mesh3.position.set(0, 30, -250);
    THREE_CONST.scene.add(mesh3);
    const sound3 = new PositionalAudio(listener);
    const oscillator = listener.context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(144, sound3.context.currentTime);
    oscillator.start(0);
    // @ts-ignore
    sound3.setNodeSource(oscillator);
    sound3.setRefDistance(20);
    sound3.setVolume(0.5);
    mesh3.add(sound3);
    analyser1 = new AudioAnalyser(sound1, 32);
    analyser2 = new AudioAnalyser(sound2, 32);
    analyser3 = new AudioAnalyser(sound3, 32);
    // 音频 3
    const sound4 = new TAudio(listener);
    const utopiaElement: any = document.getElementById('utopia');
    sound4.setMediaElementSource(utopiaElement);
    sound4.setVolume(0.5);
    utopiaElement.play();
    // 广场
    const helper = new GridHelper(1000, 10, 0x444444, 0x444444);
    helper.position.y = 0.1;
    THREE_CONST.scene.add(helper);
  };
  // 更新
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    render();
  };
  // 渲染
  const render = () => {
    const delta = clock.getDelta();
    controls.update(delta);
    material1.emissive.b = analyser1.getAverageFrequency() / 256;
    material2.emissive.b = analyser2.getAverageFrequency() / 256;
    material3.emissive.b = analyser3.getAverageFrequency() / 256;
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    controls.handleResize();
  };
  return (
    <>
      <audio id="song" preload="auto" src={staticUrlPrefix + 'sounds/358232_j_s_song.ogg'} style={{ display: 'none' }} />
      <audio id="skullbeatz" preload="auto" src={staticUrlPrefix + 'sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg'} style={{ display: 'none' }} />
      <audio id="utopia" preload="auto" src={staticUrlPrefix + 'sounds/Project_Utopia.ogg'} style={{ display: 'none' }} />
      <Button onClick={initMyScene} style={{ display: overlayVisible ? 'block' : 'none', position: 'absolute', top: 80, left: 20 }}>播放</Button>
      <div id="threeContainer" />
    </>
  );
};
export default Audio;
