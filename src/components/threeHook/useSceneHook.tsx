/**
 * @description: Three.js 使用场景
 * 场景能够让你在什么地方、摆放什么东西来交给 three.js 来渲染，这是你放置物体、灯光和摄像机的地方。
 * @author: cnn
 * @createTime: 2021/9/10 16:23
 **/
import { useState, useEffect } from 'react';
import { Scene, Texture, Fog, Material, Color } from 'three';

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
  fog?: Fog,
  // 如果不为空，它将强制场景中的每个物体使用这里的材质来渲染。默认值为 null。
  overrideMaterial?: Material
}

const useSceneHook = (props: ISceneProps) => {
  const { autoUpdate = true, background, environment, fog, overrideMaterial } = props;
  const [scene, setScene] = useState<Scene>(new Scene());
  useEffect(() => {
    initScene();
  }, []);
  // 初始化场景
  const initScene = () => {
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
    setScene(scene);
  };
  return { scene };
};
export default useSceneHook;