/**
 * @description: 深度纹理
 * 此类可用于自动将渲染的深度信息保存到纹理中。
 * 使用 WebGL 1 渲染上下文时，DepthTexture 需要支持 WEBGL_depth_texture 扩展。
 * @author: cnn
 * @createTime: 2021/12/22 9:46
 **/
import React, { useEffect, useState } from 'react';
import {
  DepthFormat,
  DepthStencilFormat,
  DepthTexture as TDepthTexture,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  RGBFormat,
  ShaderMaterial,
  TorusKnotGeometry,
  UnsignedShortType,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getClientHeight, getClientWidth } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';
import { message } from 'antd';

let supportsExtension: boolean = true;
let target: any;
let postCamera: any;
let postScene: any;
let postMaterial: any;
let controls: any;

const DepthTexture = () => {
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
      target = null;
      postScene = null;
      postCamera = null;
      postMaterial = null;
      controls = null;
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
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene();
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 70,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 0.01,
        far: 50,
      },
      position: [0, 0, 4]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initGeometry();
    setupPost();
    setThreeContainer(threeContainer);
  };
  // 初始化 webgl 渲染器
  const initRenderer = () => {
    const renderer = new WebGLRenderer();
    if (!renderer.capabilities.isWebGL2 && !renderer.extensions.has('WEBGL_depth_texture')) {
      supportsExtension = false;
      message.error('无法加载！');
    }
    // 设置设备像素比。通常用于避免 HiDPI 设备上绘图模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小，将 updateStyle 设置为 false 以阻止对 canvas 的样式做任何改变。
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化轨道控制器
  const initControls = () => {
    controls = new OrbitControls(THREE_CONST.camera, renderer.domElement);
    controls.enableDamping = true;
    setupRenderTarget();
    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
    animate();
  };
  // 新增几何体
  const initGeometry = () => {
    const geometry = new TorusKnotGeometry(1, 0.3, 128, 64);
    const material = new MeshBasicMaterial();
    const count = 50;
    const scale = 5;
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 2.0 * Math.PI;
      const z = Math.random() * 2.0 - 1.0;
      const zScale = Math.sqrt(1.0 - z * z) * scale;
      const mesh = new Mesh(geometry, material);
      mesh.position.set(
        Math.cos(r) * zScale,
        Math.sin(r) * zScale,
        z * scale
      );
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      THREE_CONST.scene.add(mesh);
    }
  };
  // 新建一个带有深度纹理的渲染目标
  const setupRenderTarget = () => {
    const params: any = {
      format: DepthFormat,
      type: UnsignedShortType
    };
    if (target) {
      target.dispose();
    }
    const format = parseFloat(params.format);
    const type = parseFloat(params.type);
    target = new WebGLRenderTarget(getClientWidth(), getClientHeight() - 60);
    target.texture.format = RGBFormat;
    target.texture.minFilter = NearestFilter;
    target.texture.magFilter = NearestFilter;
    target.texture.generateMipmaps = false;
    target.stencilBuffer = (format === DepthStencilFormat);
    target.depthBuffer = true;
    target.depthTexture = new TDepthTexture(100, 100);
    target.depthTexture.format = format;
    target.depthTexture.type = type;
  };
  // 新的场景
  const setupPost = () => {
    postCamera = initCamera({
      cameraType: CameraType.orthographicCamera,
      orthographicParams: {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1,
        near: 0,
        far: 1
      },
      position: [0, 0, 4]
    });
    postMaterial = new ShaderMaterial({
      vertexShader: 'varying vec2 vUv;\n' +
        '\n' +
        '\t\t\tvoid main() {\n' +
        '\t\t\t\tvUv = uv;\n' +
        '\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n' +
        '\t\t\t}',
      fragmentShader: '#include <packing>\n' +
        '\n' +
        '\t\t\tvarying vec2 vUv;\n' +
        '\t\t\tuniform sampler2D tDiffuse;\n' +
        '\t\t\tuniform sampler2D tDepth;\n' +
        '\t\t\tuniform float cameraNear;\n' +
        '\t\t\tuniform float cameraFar;\n' +
        '\n' +
        '\n' +
        '\t\t\tfloat readDepth( sampler2D depthSampler, vec2 coord ) {\n' +
        '\t\t\t\tfloat fragCoordZ = texture2D( depthSampler, coord ).x;\n' +
        '\t\t\t\tfloat viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );\n' +
        '\t\t\t\treturn viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );\n' +
        '\t\t\t}\n' +
        '\n' +
        '\t\t\tvoid main() {\n' +
        '\t\t\t\t//vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;\n' +
        '\t\t\t\tfloat depth = readDepth( tDepth, vUv );\n' +
        '\n' +
        '\t\t\t\tgl_FragColor.rgb = 1.0 - vec3( depth );\n' +
        '\t\t\t\tgl_FragColor.a = 1.0;\n' +
        '\t\t\t}',
      uniforms: {
        cameraNear: { value: THREE_CONST.camera.near },
        cameraFar: { value: THREE_CONST.camera.far },
        tDiffuse: { value: null },
        tDepth: { value: null }
      }
    });
    const postPlane = new PlaneGeometry(2, 2);
    const postQuad = new Mesh(postPlane, postMaterial);
    postScene = initScene();
    postScene.add(postQuad);
  };
  // 更新
  const animate = () => {
    if (!supportsExtension) return;
    const animationId = requestAnimationFrame(animate);
    setAnimationId(animationId);
    renderer.setRenderTarget(target);
    renderer.render(THREE_CONST.scene, THREE_CONST.camera);
    // render post FX
    if (postMaterial) {
      postMaterial.uniforms.tDiffuse.value = target.texture;
      postMaterial.uniforms.tDepth.value = target.depthTexture;
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    }
    controls.update();
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    const dpr = renderer.getPixelRatio();
    target.setSize(getClientWidth() * dpr, (getClientHeight() - 60) * dpr);
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default DepthTexture;
