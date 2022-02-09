/**
 * @description: 路由
 * @author: cnn
 * @createTime: 2020/7/16 15:42
 **/
import React, { createContext, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ErrorBoundary } from '@components/index';
import {
  NotFound, Home, SimpleScene, TextureScene, DracoLoaderUse,
  MultipleModel, SkyBox, Factory, Line, ArrayCamera,
  CubeCamera, Camera, StereoCamera, BoxGeometry, CircleGeometry,
  ConeGeometry, CylinderGeometry, DodecahedronGeometry, EdgesGeometry, ExtrudeGeometry,
  IcosahedronGeometry, LatheGeometry, OctahedronGeometry, PlaneGeometry, PolyhedronGeometry,
  RingGeometry, ShapeGeometry, SphereGeometry, TetrahedronGeometry, TorusGeometry,
  TorusKnotGeometry, TubeGeometry, WireframeGeometry, AmbientLight, DirectionalLight,
  HemisphereLight, PointLight, RectAreaLight, SpotLight, LightProbe,
  LineBasicMaterial, LineDashedMaterial, MeshBasicMaterial, MeshDepthMaterial, MeshDistanceMaterial,
  MeshLambertMaterial, MeshMatcapMaterial, MeshNormalMaterial, MeshPhongMaterial, MeshPhysicalMaterial,
  MeshStandardMaterial, MeshToonMaterial, PointsMaterial, RawShaderMaterial, ShaderMaterial,
  ShadowMaterial, SpriteMaterial, CanvasTexture, CompressedTexture, CubeTexture,
  DataTexture, DataTexture2DArray, DataTexture3D, DepthTexture, VideoTexture,
  Texture, Bone, Group, InstancedMesh, LineLoop, LineSegments, LOD,
  Mesh, Points, SkinnedMesh, Sprite, Skeleton,
  Fog, FogExp2, Scene, BufferGeometry, BufferAttribute,
  InterleavedBuffer, Raycaster, ArrowHelper, AxesHelper, BoxHelper,
  Box3Helper, CameraHelper, DirectionalLightHelper, GridHelper, PolarGridHelper,
  HemisphereLightHelper, PlaneHelper, PointLightHelper, SkeletonHelper, SpotLightHelper,
  Cache, CubeTextureLoader, ImageBitmapLoader, ImageLoader, ObjectLoader,
  TextureLoader, Audio, ShapePath, CatmullRomCurve3, CubicBezierCurve,
  CubicBezierCurve3, EllipseCurve, QuadraticBezierCurve, QuadraticBezierCurve3, SplineCurve, LoaderManager, Triangle
} from '@views/index';
import { platform } from '@utils/CommonVars';
import { homeInit, homeReducer } from '@views/home/HomeReducer';

export const HomeContext = createContext({ homeState: homeInit, homeDispatch: (value: any) => {} });

const App = () => {
  const [homeState, homeDispatch] = useReducer(homeReducer, homeInit);
  return (
    <HomeContext.Provider value={{ homeState, homeDispatch }}>
      <Router>
        <Switch>
          <Home>
            <Switch>
              <ErrorBoundary>
                {/* 三维示例 */}
                <Route exact path={platform} component={SimpleScene} />
                <Route exact path={platform + 'example/simpleScene'} component={SimpleScene} />
                <Route exact path={platform + 'example/textureScene'} component={TextureScene} />
                <Route exact path={platform + 'example/dracoLoaderUse'} component={DracoLoaderUse} />
                <Route exact path={platform + 'example/multipleModel'} component={MultipleModel} />
                <Route exact path={platform + 'example/skyBox'} component={SkyBox} />
                <Route exact path={platform + 'example/factory'} component={Factory} />
                {/* 三维示例 - 摄像机 */}
                <Route exact path={platform + 'example/arrayCamera'} component={ArrayCamera} />
                <Route exact path={platform + 'example/cubeCamera'} component={CubeCamera} />
                <Route exact path={platform + 'example/camera'} component={Camera} />
                <Route exact path={platform + 'example/stereoCamera'} component={StereoCamera} />
                {/* 三维示例 - 几何体 */}
                <Route exact path={platform + 'example/boxGeometry'} component={BoxGeometry} />
                <Route exact path={platform + 'example/circleGeometry'} component={CircleGeometry} />
                <Route exact path={platform + 'example/coneGeometry'} component={ConeGeometry} />
                <Route exact path={platform + 'example/cylinderGeometry'} component={CylinderGeometry} />
                <Route exact path={platform + 'example/dodecahedronGeometry'} component={DodecahedronGeometry} />
                <Route exact path={platform + 'example/edgesGeometry'} component={EdgesGeometry} />
                <Route exact path={platform + 'example/extrudeGeometry'} component={ExtrudeGeometry} />
                <Route exact path={platform + 'example/icosahedronGeometry'} component={IcosahedronGeometry} />
                <Route exact path={platform + 'example/latheGeometry'} component={LatheGeometry} />
                <Route exact path={platform + 'example/octahedronGeometry'} component={OctahedronGeometry} />
                <Route exact path={platform + 'example/planeGeometry'} component={PlaneGeometry} />
                <Route exact path={platform + 'example/polyhedronGeometry'} component={PolyhedronGeometry} />
                <Route exact path={platform + 'example/ringGeometry'} component={RingGeometry} />
                <Route exact path={platform + 'example/shapeGeometry'} component={ShapeGeometry} />
                <Route exact path={platform + 'example/sphereGeometry'} component={SphereGeometry} />
                <Route exact path={platform + 'example/tetrahedronGeometry'} component={TetrahedronGeometry} />
                <Route exact path={platform + 'example/torusGeometry'} component={TorusGeometry} />
                <Route exact path={platform + 'example/torusKnotGeometry'} component={TorusKnotGeometry} />
                <Route exact path={platform + 'example/tubeGeometry'} component={TubeGeometry} />
                <Route exact path={platform + 'example/wireframeGeometry'} component={WireframeGeometry} />
                {/* 三维示例 - 灯光 */}
                <Route exact path={platform + 'example/ambientLight'} component={AmbientLight} />
                <Route exact path={platform + 'example/directionalLight'} component={DirectionalLight} />
                <Route exact path={platform + 'example/hemisphereLight'} component={HemisphereLight} />
                <Route exact path={platform + 'example/pointLight'} component={PointLight} />
                <Route exact path={platform + 'example/rectAreaLight'} component={RectAreaLight} />
                <Route exact path={platform + 'example/spotLight'} component={SpotLight} />
                <Route exact path={platform + 'example/lightProbe'} component={LightProbe} />
                {/* 三维示例 - 材质 */}
                <Route exact path={platform + 'example/lineBasicMaterial'} component={LineBasicMaterial} />
                <Route exact path={platform + 'example/lineDashedMaterial'} component={LineDashedMaterial} />
                <Route exact path={platform + 'example/meshBasicMaterial'} component={MeshBasicMaterial} />
                <Route exact path={platform + 'example/meshDepthMaterial'} component={MeshDepthMaterial} />
                <Route exact path={platform + 'example/meshDistanceMaterial'} component={MeshDistanceMaterial} />
                <Route exact path={platform + 'example/meshLambertMaterial'} component={MeshLambertMaterial} />
                <Route exact path={platform + 'example/meshMatcapMaterial'} component={MeshMatcapMaterial} />
                <Route exact path={platform + 'example/meshNormalMaterial'} component={MeshNormalMaterial} />
                <Route exact path={platform + 'example/meshPhongMaterial'} component={MeshPhongMaterial} />
                <Route exact path={platform + 'example/meshPhysicalMaterial'} component={MeshPhysicalMaterial} />
                <Route exact path={platform + 'example/meshStandardMaterial'} component={MeshStandardMaterial} />
                <Route exact path={platform + 'example/meshToonMaterial'} component={MeshToonMaterial} />
                <Route exact path={platform + 'example/pointsMaterial'} component={PointsMaterial} />
                <Route exact path={platform + 'example/rawShaderMaterial'} component={RawShaderMaterial} />
                <Route exact path={platform + 'example/shaderMaterial'} component={ShaderMaterial} />
                <Route exact path={platform + 'example/shadowMaterial'} component={ShadowMaterial} />
                <Route exact path={platform + 'example/spriteMaterial'} component={SpriteMaterial} />
                {/* 三维示例 - 纹理 */}
                <Route exact path={platform + 'example/canvasTexture'} component={CanvasTexture} />
                <Route exact path={platform + 'example/compressedTexture'} component={CompressedTexture} />
                <Route exact path={platform + 'example/cubeTexture'} component={CubeTexture} />
                <Route exact path={platform + 'example/dataTexture'} component={DataTexture} />
                <Route exact path={platform + 'example/dataTexture2DArray'} component={DataTexture2DArray} />
                <Route exact path={platform + 'example/dataTexture3D'} component={DataTexture3D} />
                <Route exact path={platform + 'example/depthTexture'} component={DepthTexture} />
                <Route exact path={platform + 'example/videoTexture'} component={VideoTexture} />
                <Route exact path={platform + 'example/texture'} component={Texture} />
                {/* 三维示例 - 物体 */}
                <Route exact path={platform + 'example/bone'} component={Bone} />
                <Route exact path={platform + 'example/group'} component={Group} />
                <Route exact path={platform + 'example/instancedMesh'} component={InstancedMesh} />
                <Route exact path={platform + 'example/line'} component={Line} />
                <Route exact path={platform + 'example/lineLoop'} component={LineLoop} />
                <Route exact path={platform + 'example/lineSegments'} component={LineSegments} />
                <Route exact path={platform + 'example/levelsOfDetails'} component={LOD} />
                <Route exact path={platform + 'example/mesh'} component={Mesh} />
                <Route exact path={platform + 'example/points'} component={Points} />
                <Route exact path={platform + 'example/Skeleton'} component={Skeleton} />
                <Route exact path={platform + 'example/skinnedMesh'} component={SkinnedMesh} />
                <Route exact path={platform + 'example/sprite'} component={Sprite} />
                {/* 三维示例 - 场景 */}
                <Route exact path={platform + 'example/fog'} component={Fog} />
                <Route exact path={platform + 'example/fogExp2'} component={FogExp2} />
                <Route exact path={platform + 'example/scene'} component={Scene} />
                {/* 三维示例 - 核心 */}
                <Route exact path={platform + 'example/bufferAttribute'} component={BufferAttribute} />
                <Route exact path={platform + 'example/bufferGeometry'} component={BufferGeometry} />
                <Route exact path={platform + 'example/interleavedBuffer'} component={InterleavedBuffer} />
                <Route exact path={platform + 'example/raycaster'} component={Raycaster} />
                {/* 三维示例 - 辅助对象 */}
                <Route exact path={platform + 'example/arrowHelper'} component={ArrowHelper} />
                <Route exact path={platform + 'example/axesHelper'} component={AxesHelper} />
                <Route exact path={platform + 'example/boxHelper'} component={BoxHelper} />
                <Route exact path={platform + 'example/box3Helper'} component={Box3Helper} />
                <Route exact path={platform + 'example/cameraHelper'} component={CameraHelper} />
                <Route exact path={platform + 'example/directionalLightHelper'} component={DirectionalLightHelper} />
                <Route exact path={platform + 'example/gridHelper'} component={GridHelper} />
                <Route exact path={platform + 'example/polarGridHelper'} component={PolarGridHelper} />
                <Route exact path={platform + 'example/hemisphereLightHelper'} component={HemisphereLightHelper} />
                <Route exact path={platform + 'example/planeHelper'} component={PlaneHelper} />
                <Route exact path={platform + 'example/pointLightHelper'} component={PointLightHelper} />
                <Route exact path={platform + 'example/skeletonHelper'} component={SkeletonHelper} />
                <Route exact path={platform + 'example/spotLightHelper'} component={SpotLightHelper} />
                {/* 三维示例 - 加载器 */}
                <Route exact path={platform + 'example/cache'} component={Cache} />
                <Route exact path={platform + 'example/cubeTextureLoader'} component={CubeTextureLoader} />
                <Route exact path={platform + 'example/imageBitmapLoader'} component={ImageBitmapLoader} />
                <Route exact path={platform + 'example/imageLoader'} component={ImageLoader} />
                <Route exact path={platform + 'example/objectLoader'} component={ObjectLoader} />
                <Route exact path={platform + 'example/textureLoader'} component={TextureLoader} />
                {/* 三维示例 - 加载器/管理器 */}
                <Route exact path={platform + 'example/loaderManager'} component={LoaderManager} />
                {/* 三维示例 - 音频 */}
                <Route exact path={platform + 'example/audio'} component={Audio} />
                {/* 三维示例 - 附件/核心 */}
                <Route exact path={platform + 'example/shapePath'} component={ShapePath} />
                {/* 三维示例 - 附件/曲线 */}
                <Route exact path={platform + 'example/catmullRomCurve3'} component={CatmullRomCurve3} />
                <Route exact path={platform + 'example/cubicBezierCurve'} component={CubicBezierCurve} />
                <Route exact path={platform + 'example/cubicBezierCurve3'} component={CubicBezierCurve3} />
                <Route exact path={platform + 'example/ellipseCurve'} component={EllipseCurve} />
                <Route exact path={platform + 'example/quadraticBezierCurve'} component={QuadraticBezierCurve} />
                <Route exact path={platform + 'example/quadraticBezierCurve3'} component={QuadraticBezierCurve3} />
                <Route exact path={platform + 'example/splineCurve'} component={SplineCurve} />
                {/* webgl 学习 */}
                <Route exact path={platform + 'example/triangle'} component={Triangle} />
              </ErrorBoundary>
              <Route component={NotFound} />
            </Switch>
          </Home>
          <Route component={NotFound} />
        </Switch>
      </Router>
    </HomeContext.Provider>
  );
};
export default App;
