/**
 * @description: 原始着色器材质
 * 此类的工作方式与 ShaderMaterial 类似，不同之处在于内置的 uniforms 和 attributes 的定义不会自动添加到 GLSL shader 代码中。
 * @author: cnn
 * @createTime: 2021/12/16 9:34
 **/
import React, { useEffect, useState } from 'react';
import {
  Color, WebGLRenderer, RawShaderMaterial as TRawShaderMaterial, BufferGeometry,
  Float32BufferAttribute, Uint8BufferAttribute, DoubleSide, Mesh
} from 'three';
import { getClientWidth, getClientHeight } from '@utils/CommonFunc';
import { CameraType, initCamera, initScene, resetThreeConst, THREE_CONST } from '@utils/ThreeUtils';

const RawShaderMaterial = () => {
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
      animate();
      window.addEventListener('resize', onWindowResize, false);
    }
  }, [renderer]);
  // 初始化场景
  const initMyScene = () => {
    THREE_CONST.scene = initScene({
      background: new Color(0x101010)
    });
    THREE_CONST.camera = initCamera({
      cameraType: CameraType.perspectiveCamera,
      perspectiveParams: {
        fov: 50,
        aspect: getClientWidth() / (getClientHeight() - 60),
        near: 1,
        far: 10,
      },
      position: [0, 0, 2]
    });
    const threeContainer = document.getElementById('threeContainer') || document;
    initGeometry();
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
    setRenderer(renderer);
    threeContainer.appendChild(renderer.domElement);
  };
  // 初始化几何体
  const initGeometry = () => {
    const vertexCount = 200 * 3;
    const geometry = new BufferGeometry();
    const positions = [];
    const colors = [];
    for (let i = 0; i < vertexCount; i++) {
      // adding x,y,z
      positions.push(Math.random() - 0.5);
      positions.push(Math.random() - 0.5);
      positions.push(Math.random() - 0.5);
      // adding r,g,b,a
      colors.push(Math.random() * 255);
      colors.push(Math.random() * 255);
      colors.push(Math.random() * 255);
      colors.push(Math.random() * 255);
    }
    const positionAttribute = new Float32BufferAttribute(positions, 3);
    const colorAttribute = new Uint8BufferAttribute(colors, 4);
    colorAttribute.normalized = true;
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', colorAttribute);
    const material = new TRawShaderMaterial({
      uniforms: {
        time: { value: 1.0 }
      },
      vertexShader: 'precision mediump float;\n' +
        '\t\t\tprecision mediump int;\n' +
        '\n' +
        '\t\t\tuniform mat4 modelViewMatrix; // optional\n' +
        '\t\t\tuniform mat4 projectionMatrix; // optional\n' +
        '\n' +
        '\t\t\tattribute vec3 position;\n' +
        '\t\t\tattribute vec4 color;\n' +
        '\n' +
        '\t\t\tvarying vec3 vPosition;\n' +
        '\t\t\tvarying vec4 vColor;\n' +
        '\n' +
        '\t\t\tvoid main()\t{\n' +
        '\n' +
        '\t\t\t\tvPosition = position;\n' +
        '\t\t\t\tvColor = color;\n' +
        '\n' +
        '\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
        '\n' +
        '\t\t\t}',
      fragmentShader: 'precision mediump float;\n' +
        '\t\t\tprecision mediump int;\n' +
        '\n' +
        '\t\t\tuniform float time;\n' +
        '\n' +
        '\t\t\tvarying vec3 vPosition;\n' +
        '\t\t\tvarying vec4 vColor;\n' +
        '\n' +
        '\t\t\tvoid main()\t{\n' +
        '\n' +
        '\t\t\t\tvec4 color = vec4( vColor );\n' +
        '\t\t\t\tcolor.r += sin( vPosition.x * 10.0 + time ) * 0.5;\n' +
        '\n' +
        '\t\t\t\tgl_FragColor = color;\n' +
        '\n' +
        '\t\t\t}',
      side: DoubleSide,
      transparent: true
    });
    const mesh = new Mesh(geometry, material);
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
    const time = performance.now();
    if (THREE_CONST.scene.children.length > 0) {
      const object = THREE_CONST.scene.children[0];
      object.rotation.y = time * 0.0005;
      object.material.uniforms.time.value = time * 0.005;
      renderer.render(THREE_CONST.scene, THREE_CONST.camera);
    }
  };
  // 监听拉伸浏览器事件
  const onWindowResize = () => {
    THREE_CONST.camera.aspect = getClientWidth() / (getClientHeight() - 60);
    THREE_CONST.camera.updateProjectionMatrix();
    renderer.setSize(getClientWidth(), getClientHeight() - 60);
  };
  return <div id="threeContainer" />;
};
export default RawShaderMaterial;
