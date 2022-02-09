/**
 * @description: 使用 WebGL 绘制三角形
 * @author: cnn
 * @createTime: 2022/2/9 10:06
 **/
import React, { useEffect } from 'react';
import { message } from 'antd';

const Triangle = () => {
  useEffect(() => {
    drawTriangle();
  }, []);
  // 初始化 webgl
  const webglInit = () => {
    const canvasEl: any = document.getElementById('webglCanvas');
    // 兼容性判断
    if (!canvasEl.getContext('webgl') && !canvasEl.getContext('experimental-webgl')) {
      message.error('该浏览器不支持 WebGL');
      return;
    }
    const context = canvasEl.getContext('webgl') || canvasEl.getContext('experimental-webgl');
    context.viewport(0, 0, context.canvas.width, context.canvas.height);
    return context;
  };
  // 准备顶点着色器和元片着色器，绘制三角形
  const drawTriangle = () => {
    const gl = webglInit();
    // 创建顶点着色器，语法：gl.createShader(type)
    // 此处 type 为枚举型，值为 gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER 两者中的一个。
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    // 编写顶点着色器的 GLSL 代码，语法：gl.shaderSource(shader, source)
    // shader - 用于设置程序代码的 webglShader （着色器对象）; source - 包含 GLSL 程序代码的字符串。
    gl.shaderSource(vShader, `
      attribute vec4 v_position;
      void main() {
        gl_Position = v_position; // 设置顶点位置
      }
    `);
    // 编译着色器代码
    gl.compileShader(vShader);
    // 创建片元着色器
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    // 编写片元着色器代码
    gl.shaderSource(fShader, `
      precision mediump float;
      uniform vec4 f_color;
      void main() {
        gl_FragColor = vec4(0.1, 0.7, 0.3, 1.0); // 设置片元颜色
      }
    `);
    // 编译着色器代码
    gl.compileShader(fShader);
    // 绘制三角形
    // 创建一个程序用于连接顶点着色器和片元着色器
    const program = gl.createProgram();
    // 添加顶点着色器
    gl.attachShader(program, vShader);
    // 添加片元着色器
    gl.attachShader(program, fShader);
    // 连接 program 中的着色器
    gl.linkProgram(program);
    // 告知 WebGL 用这个 program 进行渲染
    gl.useProgram(program);
    const color = gl.getUniformLocation(program, 'f_color');
    // 获取 f_color 变量位置，设置它的值
    gl.uniform4f(color, 0.93, 0, 0.56, 1);
    // 获取 v_position 的位置
    const position = gl.getAttribLocation(program, 'v_position');
    // 创建一个顶点缓冲对象，返回其 id，用来放三角形顶点数据
    const pBuffer = gl.createBuffer();
    // 将这个顶点缓冲对象绑定到 gl.ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    // 后续对 gl.ARRAY_BUFFER 的操作都会映射到这个缓存
    // 三角形的三个顶点
    // 因为会将数据发送到 GPU，为了省去数据解析，这里使用 Float32Array 直接传送数据
    // gl.STATIC_DRAW 表示缓冲区不会经常更改。
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0.5,
      0.5, 0,
      -0.5, -0.5
    ]), gl.STATIC_DRAW);
    // 将顶点数据加入刚刚创建的缓存对象，告诉 OpenGL 如何从 Buffer 中获取数据
    // position 顶点属性的索引
    // 组成数量，必须是 1/2/3/4，我们只提供了 x,y
    // 每个元素的数据类型
    // 是否归一化到特定的范围，对 FLOAT 类型数据设置无效
    // stride 步长 数组中一行长度，0 表示数据是紧密的没有空隙，让 OpenGL 决定具体步长
    // offset 字节偏移量，必须是类型的字节长度的倍数
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    // 开启 attribute 变量，使顶点着色器能访问缓冲区数据
    gl.enableVertexAttribArray(position);
    // 设置清空颜色缓冲区的颜色值
    gl.clearColor(0, 1, 1, 1);
    // 清空颜色缓冲区，也就是清空画布
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 语法 gl.drawArrays(mode, first, count);
    // mode - 指定绘制图元的方式
    // first - 指定从哪个点开始绘制
    // count - 指定绘制需要使用多少个点
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  return (
    <canvas id="webglCanvas" style={{ width: '100%', height: 'calc(100vh - 70px)' }} />
  );
};
export default Triangle;
