/**
 * @description: Three.js 使用相机
 * @author: cnn
 * @createTime: 2021/9/6 14:34
 **/
import { useEffect, useState } from 'react';
import { getClientHeight, getClientWidth } from '@utils/CommonFunc';
import { Vector3, OrthographicCamera, PerspectiveCamera } from 'three';

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
    // near 表示摄像机视锥体近端面，这个值默认为 0.1，实际项目中都会设置为 1；
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
const useCameraHook = (props: ICameraProps) => {
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
  const [camera, setCamera] = useState<any>(new PerspectiveCamera());
  useEffect(() => {
    initCamera();
  }, []);
  // 初始化 camera
  const initCamera = () => {
    // 如果是正交相机
    if (cameraType === CameraType.orthographicCamera) {
      const camera = new OrthographicCamera(
        orthographicParams.left,
        orthographicParams.right,
        orthographicParams.top,
        orthographicParams.bottom,
        orthographicParams.near,
        orthographicParams.far
      );
      setCamera(camera);
    } else {
      const camera = new PerspectiveCamera(perspectiveParams.fov, perspectiveParams.aspect, perspectiveParams.near, perspectiveParams.far);
      camera.position.set(position[0], position[1], position[2]);
      camera.lookAt(new Vector3(...lookPoint));
      setCamera(camera);
    }
  };
  return { camera };
};
export default useCameraHook;
