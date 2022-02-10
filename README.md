# 3d-engine
该项目主要是我的 three.js 学习案例，把一些用到的技术和官网的例子整合在里面，可查看 src/views/examples 目录查看代码。
## core 核心
- [x] BufferAttribute 流属性。
- [x] BufferGeometry 流几何体。
- [ ] Clock 时钟。
- [x] EventDispatcher 事件调度。
- [ ] GLBufferAttribute GL流属性。
- [x] InstancedBufferAttribute 实例化流属性。
- [x] InstancedBufferGeometry 实例化流几何体。
- [x] InterleavedBuffer 交叉存储流。
- [x] InstancedInterleavedBuffer 实例化交叉存储流。
- [x] Layers 图层。
- [x] Object3D 三维物体。
- [x] Raycaster 光线投射。
- [x] Uniform GLSL着色器中的全局变量。
## scene 场景
- [x] Scene 场景。
- [x] Fog 雾。
- [x] FogExp2 雾-指数。
## camera 相机
- [x] ArrayCamera 摄像机阵列。
- [x] PerspectiveCamera 透视相机，OrthographicCamera 正交相机。
- [x] CubeCamera 立方相机。
- [x] StereoCamera 立体相机。
## light 灯光
- [x] Light 光源基类，暂无示例。
- [x] LightProbe 光照探针。
- [x] AmbientLight 环境光。
- [x] AmbientLightProbe 环境光探针，暂无示例。
- [x] DirectionalLight 平行光。
- [x] HemisphereLight 半球光。
- [x] HemisphereLightProbe 半球光探针，暂无示例。
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
## 材质
- [x] LineBasicMaterial 基础线条材质。
- [x] LineDashedMaterial 虚线材质。
- [x] Material 材质，暂无示例。
- [x] MeshBasicMaterial 基础网格材质。
- [x] MeshDepthMaterial 深度网格材质。
- [x] MeshDistanceMaterial 深度着色材质。
- [x] MeshLambertMaterial Lambert网格材质。
- [x] MeshMatcapMaterial 材质捕捉纹理定义材质（我自己按功能翻译的）。
- [x] MeshNormalMaterial 法线网格材质。
- [x] MeshPhongMaterial Phong网格材质。
- [x] MeshPhysicalMaterial 物理网格材质。
- [x] MeshStandardMaterial 标准网格材质。
- [x] MeshToonMaterial 卡通网格材质。
- [x] PointsMaterial 点材质。
- [x] RawShaderMaterial 原始着色器材质。
- [x] ShaderMaterial 着色器材质。
- [x] ShadowMaterial 阴影材质。
- [x] SpriteMaterial 点精灵材质。
## 纹理
- [x] CanvasTexture Canvas纹理。
- [x] CompressedTexture 压缩的纹理 暂无示例。
- [x] CubeTexture 立方纹理。
- [x] DataTexture 原始数据纹理。
- [x] DataTexture2DArray 2D数组数据纹理。
- [x] DataTexture3D 三维纹理。
- [x] DepthTexture 深度纹理。
- [x] Texture 纹理。
- [x] VideoTexture 视频纹理。
## 物体
- [x] Bone 骨骼。
- [x] Group 组。
- [x] InstancedMesh 实例化网格。
- [x] Line 线。
- [x] LineLoop 环线。
- [x] LineSegments 线段。
- [x] LOD 多细节层次（Levels of Detail）。
- [x] Mesh 网格。
- [ ] Points 点（未找到具体场景，待之后添加）。
- [x] Skeleton 骨架。
- [x] SkinnedMesh 蒙皮网格。
- [x] Sprite 精灵。
## 辅助对象
- [x] ArrowHelper 箭头辅助对象。
- [x] AxesHelper 坐标轴辅助对象。
- [x] BoxHelper 包围盒辅助对象。
- [x] Box3Helper 3维包围盒辅助对象。
- [x] CameraHelper 相机视锥体辅助对象。
- [x] DirectionalLightHelper 平行光辅助对象。
- [x] GridHelper 坐标格辅助对象。
- [x] PolarGridHelper 极坐标格辅助对象。
- [x] HemisphereLightHelper 半球形光源辅助对象。
- [x] PlaneHelper 平面辅助对象。
- [x] PointLightHelper 点光辅助对象。
- [x] SkeletonHelper 骨骼辅助对象。
- [x] SpotLightHelper 聚光灯锥形辅助对象。
## 加载器
- [ ] AnimationLoader 动画加载器。
- [ ] AudioLoader 音频加载器。
- [ ] BufferGeometryLoader 流几何体加载器。
- [x] Cache 简单缓存系统。
- [ ] CompressedTextureLoader 基于块的纹理加载器。
- [x] CubeTextureLoader CubeTexture加载器。
- [ ] DataTextureLoader 二进制文件加载器。
- [ ] FileLoader 文件加载器。
- [x] ImageBitmapLoader 把图片加载为ImageBitmap的加载器。
- [x] ImageLoader 图片加载器。
- [ ] Loader 加载器。
- [ ] LoaderUtils 加载器功能函数。
- [ ] MaterialLoader 材质加载器。
- [x] ObjectLoader JSON资源加载器。
- [x] TextureLoader 纹理加载器。
## 加载器 / 管理器
- [x] LoadingManager 加载器管理器。
## 音频
- [ ] Audio 音频。
- [ ] AudioAnalyser 音频分析器。
- [ ] AudioContext 音频上下文。
- [ ] AudioListener 音频监听器。
- [ ] PositionalAudio 位置相关音频对象。
## 附件 / 核心
- [x] Shape 形状。
- [x] ShapePath 形状路径。
## 附件 / 曲线
- [x] CatmullRomCurve3 平滑三维样条曲线。
- [x] CubicBezierCurve 二维三次贝塞尔曲线。
- [x] CubicBezierCurve3 三维三次贝塞尔曲线。
- [x] EllipseCurve 椭圆曲线。
- [x] QuadraticBezierCurve 二维二次贝塞尔曲线。
- [x] QuadraticBezierCurve3 三维二次贝塞尔曲线。
- [x] SplineCurve 样条曲线。
## 工作中用到的技术，暂无归类
- [x] Line 画线。
- [x] SimpleScene 简单场景，包含 scene, light, camera, renderer, OrbitControls, 简单结合体。
- [x] SkyBox 天空盒背景。
- [x] TextureScene 三维模型贴材质，材质使用导入图片作为纹理。
- [x] DracoLoaderUse 使用 dracoLoader 导入压缩后的模型，包含对导入模型的材质进行更改，加入材质动画，元素点击监听。
- [x] Factory 工厂模型，基本功能同上，添加平面作为视频承载。
- [x] MultipleModel 多个模型同时加载，制作动画。
## WebGL 学习
- [x] 使用 WebGL 画三角形。
