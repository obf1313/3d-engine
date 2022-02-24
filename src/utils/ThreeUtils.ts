/**
 * @description: 三维模型帮助方法
 * @author: cnn
 * @createTime: 2021/9/17 11:11
 **/
import {
  Color, CubeTexture, CubeTextureLoader, Fog, FogExp2,
  Material, OrthographicCamera, PerspectiveCamera, Raycaster, Scene,
  ShapePath, Texture, Vector2, Vector3
} from 'three';
import { getClientHeight, getClientWidth } from '@utils/CommonFunc';

/**
 * Three.js 全局变量
**/
export const THREE_CONST: any = {
  scene: null,
  camera: null,
  stats: null
};
/**
 * 重置全局变量
**/
export const resetThreeConst = () => {
  THREE_CONST.scene = null;
  THREE_CONST.camera = null;
};
export enum CameraType {
  /**
   * 透视相机
   * 这一投影模式被用来模拟人眼所看到的景象，它是 3D 场景的渲染中使用得最普遍的投影模式。
   **/
  perspectiveCamera,
  /**
   * 正交相机
   * 在这种投影模式下，无论物体距离相机距离远或者近，在最终渲染的图片中物体的大小都保持不变。
   * 这对于渲染2D场景或者UI元素是非常有用的。
   **/
  orthographicCamera
}
/**
 * 获取 raycaster 所需标准设备坐标
**/
export const getIntersectPosition = (event: MouseEvent, container: any) => {
  event.preventDefault();
  let getBoundingClientRect = container.getBoundingClientRect();
  // 屏幕坐标转标准设备坐标
  let x = ((event.clientX - getBoundingClientRect.left) / container.offsetWidth) * 2 - 1;// 标准设备横坐标
  let y = -((event.clientY - getBoundingClientRect.top) / container.offsetHeight) * 2 + 1;// 标准设备纵坐标
  return { x, y };
};
/**
 * 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
**/
export const getIntersects = (event: MouseEvent, container: any, camera: any, scene: Scene) => {
  event.preventDefault();
  const { x, y } = getIntersectPosition(event, container);
  let standardVector = new Vector3(x, y, 1);// 标准设备坐标
  // 标准设备坐标转世界坐标
  let worldVector = standardVector.unproject(camera);
  // 射线投射方向单位向量(worldVector坐标减相机位置坐标)
  let ray = worldVector.sub(camera.position).normalize();
  // 创建射线投射器对象
  let rayCaster = new Raycaster(camera.position, ray);
  // 返回射线选中的对象 第二个参数如果不填 默认是false
  return rayCaster.intersectObjects(scene.children, true);
};
/**
 * 返回世界坐标
**/
export const getWordVector = (event: MouseEvent, container: any, camera: any) => {
  event.preventDefault();
  const { x, y } = getIntersectPosition(event, container);
  let standardVector = new Vector3(x, y, 1);// 标准设备坐标
  // 标准设备坐标转世界坐标
  return standardVector.unproject(camera);
};
/**
 * 初始化 CubeTexture
 * 文件路径前缀 path: string,
 * 文件列表，指定顺序: pos-x, neg-x, pos-y, neg-y, pos-z, neg-z：urlList: [string, string, string, string, string, string]
**/
export const initCubeTexture = (path: string, urlList: [string, string, string, string, string, string], backFunc?: (texture: CubeTexture) => void) => {
  const cubeTextureLoader = new CubeTextureLoader();
  cubeTextureLoader.setPath(path);
  return cubeTextureLoader.load(urlList, backFunc);
};
/**
 * 初始化 Scene
 * 场景能够让你在什么地方、摆放什么东西来交给 three.js 来渲染，这是你放置物体、灯光和摄像机的地方。
**/
interface ISceneProps {
  // 默认值为 true，若设置了这个值，则渲染器会检查每一帧是否需要更新场景及其中物体的矩阵。 当设为 false 时，你必须亲自手动维护场景中的矩阵。
  autoUpdate?: boolean,
  // 若不为空，在渲染场景的时候将设置背景，且背景总是首先被渲染的。
  // 可以设置一个用于的 clear 的 Color（颜色）
  // 一个覆盖 canvas 的 Texture（纹理）
  // 或是 a cubemap as a CubeTexture or an equirectangular as a Texture。
  // 默认值为 null。
  background?: null | Color | Texture,
  // 若该值不为 null，则该纹理贴图将会被设为场景中所有物理材质的环境贴图。
  // 然而，该属性不能够覆盖已存在的、已分配给 MeshStandardMaterial.envMap 的贴图。
  // 默认为 null。
  environment?: Texture,
  // 一个 fog 实例定义了影响场景中的每个物体的雾的类型。默认值为 null。
  fog?: Fog | FogExp2,
  // 如果不为空，它将强制场景中的每个物体使用这里的材质来渲染。默认值为 null。
  overrideMaterial?: Material
}
export const initScene = (props: ISceneProps = {}) => {
  const { autoUpdate = true, background, environment, fog, overrideMaterial } = props;
  const scene = new Scene();
  if (!autoUpdate) {
    scene.autoUpdate = false;
  }
  if (background) {
    scene.background = background;
  }
  if (environment) {
    scene.environment = environment;
  }
  if (fog) {
    scene.fog = fog;
  }
  if (overrideMaterial) {
    scene.overrideMaterial = overrideMaterial;
  }
  return scene;
};
/**
 * 初始化相机
**/
export interface ICameraProps {
  cameraType: CameraType,
  orthographicParams?: {
    left: number, // 摄像机视锥体左侧面
    right: number, // 摄像机视锥体右侧面
    top: number, // 摄像机视锥体上侧面
    bottom: number, // 摄像机视锥体下侧面
    near: number, // 摄像机视锥体近端面
    far: number // 摄像机视锥体远端面
  },
  // fov 表示摄像机视锥体垂直视野角度，最小值为 0，最大值为 180，默认值为 50，实际项目中一般都定义 45，因为 45 最接近人正常睁眼角度；
  // aspect 表示摄像机视锥体长宽比，默认长宽比为 1，即表示看到的是正方形，实际项目中使用的是屏幕的宽高比；
  // near 表示摄像机视锥体近端面，这个值默认为 0.1，实际项目中都会设置为 1，大于 0 的数；
  // far 表示摄像机视锥体远端面，默认为 2000，这个值可以是无限的，说的简单点就是我们视觉所能看到的最远距离。
  perspectiveParams?: {
    fov: number, // 摄像机视锥体垂直视野角度
    aspect: number, // 摄像机视锥体长宽比
    near: number, // 摄像机视锥体近端面
    far: number, // 摄像机视锥体远端面
  },
  // 相机在三维坐标中的位置
  position?: [number, number, number],
  // 相机拍摄时指向的中心点
  lookPoint?: [number, number, number]
}
export const initCamera = (props: ICameraProps) => {
  const {
    cameraType,
    orthographicParams = {
      left: 1,
      right: 1,
      top: 1,
      bottom: 1,
      near: 1,
      far: 1
    },
    perspectiveParams = {
      fov: 45,
      aspect: getClientWidth() / getClientHeight(),
      near: 1,
      far: 2000,
    },
    position = [0, 0, 0],
    lookPoint = [0, 0, 0]
  } = props;
  let camera: any;
  // 如果是正交相机
  if (cameraType === CameraType.orthographicCamera) {
    camera = new OrthographicCamera(
      orthographicParams.left,
      orthographicParams.right,
      orthographicParams.top,
      orthographicParams.bottom,
      orthographicParams.near,
      orthographicParams.far
    );
  } else {
    camera = new PerspectiveCamera(perspectiveParams.fov, perspectiveParams.aspect, perspectiveParams.near, perspectiveParams.far);
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(new Vector3(...lookPoint));
  }
  return camera;
};
/**
 * From d3-threeD.js
**/
export const d3threeD = (exports: any) => {
  const DEGS_TO_RADS = Math.PI / 180;
  const DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46, MINUS = 45;
  exports.transformSVGPath = function transformSVGPath(pathStr: string) {
    const path = new ShapePath();
    let idx = 1, activeCmd,
      x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
      x1 = 0, x2 = 0, y1 = 0, y2 = 0,
      rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;
    const len = pathStr.length;
    function eatNum() {
      let sidx, c, isFloat = false, s;
      // eat delims
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE) break;
        idx ++;
      }
      if (c === MINUS) {
        sidx = idx ++;
      } else {
        sidx = idx;
      }
      // eat number
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (DIGIT_0 <= c && c <= DIGIT_9) {
          idx ++;
          continue;
        } else if (c === PERIOD) {
          idx ++;
          isFloat = true;
          continue;
        }
        s = pathStr.substring(sidx, idx);
        return isFloat ? parseFloat(s) : parseInt(s);
      }
      s = pathStr.substring(sidx);
      return isFloat ? parseFloat(s) : parseInt(s);
    }
    function nextIsNum() {
      let c;
      // do permanently eat any delims...
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE) break;
        idx ++;
      }
      c = pathStr.charCodeAt(idx);
      return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
    }
    let canRepeat;
    activeCmd = pathStr[ 0 ];
    while (idx <= len) {
      canRepeat = true;
      switch (activeCmd) {
        // moveto commands, become lineto's if repeated
        case 'M':
          x = eatNum();
          y = eatNum();
          path.moveTo(x, y);
          activeCmd = 'L';
          firstX = x;
          firstY = y;
          break;
        case 'm':
          x += eatNum();
          y += eatNum();
          path.moveTo(x, y);
          activeCmd = 'l';
          firstX = x;
          firstY = y;
          break;
        case 'Z':
        case 'z':
          canRepeat = false;
          if (x !== firstX || y !== firstY) { // @ts-ignore
            path.lineTo(firstX, firstY);
          }
          break;
        // - lines!
        case 'L':
        case 'H':
        case 'V':
          nx = (activeCmd === 'V') ? x : eatNum();
          ny = (activeCmd === 'H') ? y : eatNum();
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
        case 'l':
        case 'h':
        case 'v':
          nx = (activeCmd === 'v') ? x : (x + eatNum());
          ny = (activeCmd === 'h') ? y : (y + eatNum());
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
        // - cubic bezier
        case 'C':
          x1 = eatNum(); y1 = eatNum();
        case 'S':
          if (activeCmd === 'S') {
            x1 = 2 * x - x2;
            y1 = 2 * y - y2;
          }
          x2 = eatNum();
          y2 = eatNum();
          nx = eatNum();
          ny = eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx; y = ny;
          break;
        case 'c':
          x1 = x + eatNum();
          y1 = y + eatNum();
        case 's':
          if (activeCmd === 's') {
            x1 = 2 * x - x2;
            y1 = 2 * y - y2;
          }
          x2 = x + eatNum();
          y2 = y + eatNum();
          nx = x + eatNum();
          ny = y + eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx; y = ny;
          break;
        // - quadratic bezier
        case 'Q':
          x1 = eatNum(); y1 = eatNum();
        case 'T':
          if (activeCmd === 'T') {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = eatNum();
          ny = eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx;
          y = ny;
          break;
        case 'q':
          x1 = x + eatNum();
          y1 = y + eatNum();
        case 't':
          if (activeCmd === 't') {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = x + eatNum();
          ny = y + eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx; y = ny;
          break;
        // - elliptical arc
        case 'A':
          rx = eatNum();
          ry = eatNum();
          xar = eatNum() * DEGS_TO_RADS;
          laf = eatNum();
          sf = eatNum();
          nx = eatNum();
          ny = eatNum();
          if (rx !== ry) console.warn('Forcing elliptical arc to be a circular one:', rx, ry);
          // SVG implementation notes does all the math for us! woo!
          // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
          // step1, using x1 as x1'
          x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
          y1 = - Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
          // step 2, using x2 as cx'
          let norm = Math.sqrt((rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1) /
            (rx * rx * y1 * y1 + ry * ry * x1 * x1));
          if (laf === sf) norm = - norm;
          x2 = norm * rx * y1 / ry;
          y2 = norm * - ry * x1 / rx;
          // step 3
          cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
          cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;
          const u = new Vector2(1, 0);
          const v = new Vector2((x1 - x2) / rx, (y1 - y2) / ry);
          let startAng = Math.acos(u.dot(v) / u.length() / v.length());
          if ((u.x * v.y) - (u.y * v.x) < 0) startAng = - startAng;
          // we can reuse 'v' from start angle as our 'u' for delta angle
          u.x = (- x1 - x2) / rx;
          u.y = (- y1 - y2) / ry;
          let deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
          // This normalization ends up making our curves fail to triangulate...
          if ((v.x * u.y) - (v.y * u.x) < 0) deltaAng = - deltaAng;
          if (! sf && deltaAng > 0) deltaAng -= Math.PI * 2;
          if (sf && deltaAng < 0) deltaAng += Math.PI * 2;
          // @ts-ignore
          path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
          x = nx;
          y = ny;
          break;
        default:
          throw new Error('Wrong path command: ' + activeCmd);
      }
      // just reissue the command
      if (canRepeat && nextIsNum()) continue;
      activeCmd = pathStr[idx ++];
    }
    return path;
  };
};
