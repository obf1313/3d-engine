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
  Mesh, Points, SkinnedMesh, Sprite, Skeleton, Fog, FogExp2, Scene
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
