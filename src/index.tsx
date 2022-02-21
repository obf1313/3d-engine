/**
 * @description: 路由
 * @author: cnn
 * @createTime: 2020/7/16 15:42
 **/
import React, { createContext, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ErrorBoundary } from '@components/index';
import * as Views from '@views/index';
import { platform } from '@utils/CommonVars';
import { homeInit, homeReducer } from '@views/home/HomeReducer';

export const HomeContext = createContext({ homeState: homeInit, homeDispatch: (value: any) => {} });

const App = () => {
  const [homeState, homeDispatch] = useReducer(homeReducer, homeInit);
  return (
    <HomeContext.Provider value={{ homeState, homeDispatch }}>
      <Router>
        <Switch>
          <Views.Home>
            <Switch>
              <ErrorBoundary>
                {/* 三维示例 */}
                <Route exact path={platform} component={Views.SimpleScene} />
                <Route exact path={platform + 'example/simpleScene'} component={Views.SimpleScene} />
                <Route exact path={platform + 'example/textureScene'} component={Views.TextureScene} />
                <Route exact path={platform + 'example/dracoLoaderUse'} component={Views.DracoLoaderUse} />
                <Route exact path={platform + 'example/multipleModel'} component={Views.MultipleModel} />
                <Route exact path={platform + 'example/skyBox'} component={Views.SkyBox} />
                <Route exact path={platform + 'example/factory'} component={Views.Factory} />
                <Route exact path={platform + 'example/postProcessingUnrealBloom'} component={Views.PostProcessingUnrealBloom} />
                {/* 三维示例 - 摄像机 */}
                <Route exact path={platform + 'example/arrayCamera'} component={Views.ArrayCamera} />
                <Route exact path={platform + 'example/cubeCamera'} component={Views.CubeCamera} />
                <Route exact path={platform + 'example/camera'} component={Views.Camera} />
                <Route exact path={platform + 'example/stereoCamera'} component={Views.StereoCamera} />
                {/* 三维示例 - 几何体 */}
                <Route exact path={platform + 'example/boxGeometry'} component={Views.BoxGeometry} />
                <Route exact path={platform + 'example/circleGeometry'} component={Views.CircleGeometry} />
                <Route exact path={platform + 'example/coneGeometry'} component={Views.ConeGeometry} />
                <Route exact path={platform + 'example/cylinderGeometry'} component={Views.CylinderGeometry} />
                <Route exact path={platform + 'example/dodecahedronGeometry'} component={Views.DodecahedronGeometry} />
                <Route exact path={platform + 'example/edgesGeometry'} component={Views.EdgesGeometry} />
                <Route exact path={platform + 'example/extrudeGeometry'} component={Views.ExtrudeGeometry} />
                <Route exact path={platform + 'example/icosahedronGeometry'} component={Views.IcosahedronGeometry} />
                <Route exact path={platform + 'example/latheGeometry'} component={Views.LatheGeometry} />
                <Route exact path={platform + 'example/octahedronGeometry'} component={Views.OctahedronGeometry} />
                <Route exact path={platform + 'example/planeGeometry'} component={Views.PlaneGeometry} />
                <Route exact path={platform + 'example/polyhedronGeometry'} component={Views.PolyhedronGeometry} />
                <Route exact path={platform + 'example/ringGeometry'} component={Views.RingGeometry} />
                <Route exact path={platform + 'example/shapeGeometry'} component={Views.ShapeGeometry} />
                <Route exact path={platform + 'example/sphereGeometry'} component={Views.SphereGeometry} />
                <Route exact path={platform + 'example/tetrahedronGeometry'} component={Views.TetrahedronGeometry} />
                <Route exact path={platform + 'example/torusGeometry'} component={Views.TorusGeometry} />
                <Route exact path={platform + 'example/torusKnotGeometry'} component={Views.TorusKnotGeometry} />
                <Route exact path={platform + 'example/tubeGeometry'} component={Views.TubeGeometry} />
                <Route exact path={platform + 'example/wireframeGeometry'} component={Views.WireframeGeometry} />
                {/* 三维示例 - 灯光 */}
                <Route exact path={platform + 'example/ambientLight'} component={Views.AmbientLight} />
                <Route exact path={platform + 'example/directionalLight'} component={Views.DirectionalLight} />
                <Route exact path={platform + 'example/hemisphereLight'} component={Views.HemisphereLight} />
                <Route exact path={platform + 'example/pointLight'} component={Views.PointLight} />
                <Route exact path={platform + 'example/rectAreaLight'} component={Views.RectAreaLight} />
                <Route exact path={platform + 'example/spotLight'} component={Views.SpotLight} />
                <Route exact path={platform + 'example/lightProbe'} component={Views.LightProbe} />
                {/* 三维示例 - 材质 */}
                <Route exact path={platform + 'example/lineBasicMaterial'} component={Views.LineBasicMaterial} />
                <Route exact path={platform + 'example/lineDashedMaterial'} component={Views.LineDashedMaterial} />
                <Route exact path={platform + 'example/meshBasicMaterial'} component={Views.MeshBasicMaterial} />
                <Route exact path={platform + 'example/meshDepthMaterial'} component={Views.MeshDepthMaterial} />
                <Route exact path={platform + 'example/meshDistanceMaterial'} component={Views.MeshDistanceMaterial} />
                <Route exact path={platform + 'example/meshLambertMaterial'} component={Views.MeshLambertMaterial} />
                <Route exact path={platform + 'example/meshMatcapMaterial'} component={Views.MeshMatcapMaterial} />
                <Route exact path={platform + 'example/meshNormalMaterial'} component={Views.MeshNormalMaterial} />
                <Route exact path={platform + 'example/meshPhongMaterial'} component={Views.MeshPhongMaterial} />
                <Route exact path={platform + 'example/meshPhysicalMaterial'} component={Views.MeshPhysicalMaterial} />
                <Route exact path={platform + 'example/meshStandardMaterial'} component={Views.MeshStandardMaterial} />
                <Route exact path={platform + 'example/meshToonMaterial'} component={Views.MeshToonMaterial} />
                <Route exact path={platform + 'example/pointsMaterial'} component={Views.PointsMaterial} />
                <Route exact path={platform + 'example/rawShaderMaterial'} component={Views.RawShaderMaterial} />
                <Route exact path={platform + 'example/shaderMaterial'} component={Views.ShaderMaterial} />
                <Route exact path={platform + 'example/shadowMaterial'} component={Views.ShadowMaterial} />
                <Route exact path={platform + 'example/spriteMaterial'} component={Views.SpriteMaterial} />
                {/* 三维示例 - 纹理 */}
                <Route exact path={platform + 'example/canvasTexture'} component={Views.CanvasTexture} />
                <Route exact path={platform + 'example/compressedTexture'} component={Views.CompressedTexture} />
                <Route exact path={platform + 'example/cubeTexture'} component={Views.CubeTexture} />
                <Route exact path={platform + 'example/dataTexture'} component={Views.DataTexture} />
                <Route exact path={platform + 'example/dataTexture2DArray'} component={Views.DataTexture2DArray} />
                <Route exact path={platform + 'example/dataTexture3D'} component={Views.DataTexture3D} />
                <Route exact path={platform + 'example/depthTexture'} component={Views.DepthTexture} />
                <Route exact path={platform + 'example/videoTexture'} component={Views.VideoTexture} />
                <Route exact path={platform + 'example/texture'} component={Views.Texture} />
                {/* 三维示例 - 物体 */}
                <Route exact path={platform + 'example/bone'} component={Views.Bone} />
                <Route exact path={platform + 'example/group'} component={Views.Group} />
                <Route exact path={platform + 'example/instancedMesh'} component={Views.InstancedMesh} />
                <Route exact path={platform + 'example/line'} component={Views.Line} />
                <Route exact path={platform + 'example/lineLoop'} component={Views.LineLoop} />
                <Route exact path={platform + 'example/lineSegments'} component={Views.LineSegments} />
                <Route exact path={platform + 'example/levelsOfDetails'} component={Views.LOD} />
                <Route exact path={platform + 'example/mesh'} component={Views.Mesh} />
                <Route exact path={platform + 'example/points'} component={Views.Points} />
                <Route exact path={platform + 'example/Skeleton'} component={Views.Skeleton} />
                <Route exact path={platform + 'example/skinnedMesh'} component={Views.SkinnedMesh} />
                <Route exact path={platform + 'example/sprite'} component={Views.Sprite} />
                {/* 三维示例 - 场景 */}
                <Route exact path={platform + 'example/fog'} component={Views.Fog} />
                <Route exact path={platform + 'example/fogExp2'} component={Views.FogExp2} />
                <Route exact path={platform + 'example/scene'} component={Views.Scene} />
                {/* 三维示例 - 核心 */}
                <Route exact path={platform + 'example/bufferAttribute'} component={Views.BufferAttribute} />
                <Route exact path={platform + 'example/bufferGeometry'} component={Views.BufferGeometry} />
                <Route exact path={platform + 'example/interleavedBuffer'} component={Views.InterleavedBuffer} />
                <Route exact path={platform + 'example/raycaster'} component={Views.Raycaster} />
                {/* 三维示例 - 辅助对象 */}
                <Route exact path={platform + 'example/arrowHelper'} component={Views.ArrowHelper} />
                <Route exact path={platform + 'example/axesHelper'} component={Views.AxesHelper} />
                <Route exact path={platform + 'example/boxHelper'} component={Views.BoxHelper} />
                <Route exact path={platform + 'example/box3Helper'} component={Views.Box3Helper} />
                <Route exact path={platform + 'example/cameraHelper'} component={Views.CameraHelper} />
                <Route exact path={platform + 'example/directionalLightHelper'} component={Views.DirectionalLightHelper} />
                <Route exact path={platform + 'example/gridHelper'} component={Views.GridHelper} />
                <Route exact path={platform + 'example/polarGridHelper'} component={Views.PolarGridHelper} />
                <Route exact path={platform + 'example/hemisphereLightHelper'} component={Views.HemisphereLightHelper} />
                <Route exact path={platform + 'example/planeHelper'} component={Views.PlaneHelper} />
                <Route exact path={platform + 'example/pointLightHelper'} component={Views.PointLightHelper} />
                <Route exact path={platform + 'example/skeletonHelper'} component={Views.SkeletonHelper} />
                <Route exact path={platform + 'example/spotLightHelper'} component={Views.SpotLightHelper} />
                {/* 三维示例 - 加载器 */}
                <Route exact path={platform + 'example/cache'} component={Views.Cache} />
                <Route exact path={platform + 'example/cubeTextureLoader'} component={Views.CubeTextureLoader} />
                <Route exact path={platform + 'example/imageBitmapLoader'} component={Views.ImageBitmapLoader} />
                <Route exact path={platform + 'example/imageLoader'} component={Views.ImageLoader} />
                <Route exact path={platform + 'example/objectLoader'} component={Views.ObjectLoader} />
                <Route exact path={platform + 'example/textureLoader'} component={Views.TextureLoader} />
                {/* 三维示例 - 加载器/管理器 */}
                <Route exact path={platform + 'example/loaderManager'} component={Views.LoaderManager} />
                {/* 三维示例 - 音频 */}
                <Route exact path={platform + 'example/audio'} component={Views.Audio} />
                {/* 三维示例 - 附件/核心 */}
                <Route exact path={platform + 'example/shapePath'} component={Views.ShapePath} />
                {/* 三维示例 - 附件/曲线 */}
                <Route exact path={platform + 'example/catmullRomCurve3'} component={Views.CatmullRomCurve3} />
                <Route exact path={platform + 'example/cubicBezierCurve'} component={Views.CubicBezierCurve} />
                <Route exact path={platform + 'example/cubicBezierCurve3'} component={Views.CubicBezierCurve3} />
                <Route exact path={platform + 'example/ellipseCurve'} component={Views.EllipseCurve} />
                <Route exact path={platform + 'example/quadraticBezierCurve'} component={Views.QuadraticBezierCurve} />
                <Route exact path={platform + 'example/quadraticBezierCurve3'} component={Views.QuadraticBezierCurve3} />
                <Route exact path={platform + 'example/splineCurve'} component={Views.SplineCurve} />
                {/* webgl 学习 */}
                <Route exact path={platform + 'example/triangle'} component={Views.Triangle} />
                {/* 最终目标 */}
                <Route exact path={platform + 'example/merry'} component={Views.Merry} />
              </ErrorBoundary>
              <Route component={Views.NotFound} />
            </Switch>
          </Views.Home>
          <Route component={Views.NotFound} />
        </Switch>
      </Router>
    </HomeContext.Provider>
  );
};
export default App;
