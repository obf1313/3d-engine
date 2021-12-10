# 3d-engine
该项目主要是我的 three.js 学习案例，把一些用到的技术和官网的例子整合在里面，可查看 src/views/examples 目录查看代码。
## camera 相机
- [x] ArrayCamera 摄像机阵列。
- [x] PerspectiveCamera 透视相机，OrthographicCamera 正交相机。
- [x] CubeCamera 立方相机。
- [x] StereoCamera 立体相机。
## light 灯光
- [ ] Light 光源基类。
- [x] LightProbe 光照探针。
- [x] AmbientLight 环境光。
- [ ] AmbientLightProbe 环境光探针。
- [x] DirectionalLight 平行光。
- [x] HemisphereLight 半球光。
- [ ] HemisphereLightProbe 半球光探针。
- [x] PointLight 点光源。
- [x] RectAreaLight 平面光光源。
- [x] SpotLight 聚光灯。
## Geometry 几何体
- [x] BoxGeometry 立体缓冲几何体。
- [x] CircleGeometry 圆形缓冲几何体。
- [x] ConeGeometry 圆锥缓冲几何体。
- [x] CylinderGeometry 圆柱缓冲几何体。
- [x] DodecahedronGeometry 十二面缓冲几何体。
- [x] EdgesGeometry 边缘几何体。
- [x] ExtrudeGeometry 挤压缓冲几何体。
- [x] IcosahedronGeometry 二十面缓冲几何体。
- [x] LatheGeometry 车削缓冲几何体。
- [x] OctahedronGeometry 八面缓冲几何体。
- [x] PlaneGeometry 平面缓冲几何体。
- [x] PolyhedronGeometry 多面缓冲几何体。
- [x] RingGeometry 圆环缓冲几何体。
- [x] ShapeGeometry 形状缓冲几何体。
- [x] SphereGeometry 球缓冲几何体。
- [x] TetrahedronGeometry 四面缓冲几何体。
- [x] TorusGeometry 圆环缓冲几何体。
- [x] TorusKnotGeometry 圆环缓冲扭结几何体。
- [x] TubeGeometry 管道缓冲几何体。
- [x] WireframeGeometry 网格几何体。
## 工作中用到的技术，暂无归类
- [x] Line 画线。
- [x] SimpleScene 简单场景，包含 scene, light, camera, renderer, OrbitControls, 简单结合体。
- [x] SkyBox 天空盒背景。
- [x] TextureScene 三维模型贴材质，材质使用导入图片作为纹理。
- [x] DracoLoaderUse 使用 dracoLoader 导入压缩后的模型，包含对导入模型的材质进行更改，加入材质动画，元素点击监听。
- [x] Factory 工厂模型，基本功能同上，添加平面作为视频承载。
- [x] MultipleModel 多个模型同时加载，制作动画。
