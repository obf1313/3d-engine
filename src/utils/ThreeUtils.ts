/**
 * @description: 三维模型帮助方法
 * @author: cnn
 * @createTime: 2021/9/17 11:11
 **/

import { Raycaster, Scene, Vector3 } from 'three';

/**
 * 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
**/
export const getIntersects = (event: MouseEvent, container: any, camera: any, scene: Scene) => {
  event.preventDefault();
  let getBoundingClientRect = container.getBoundingClientRect();
  // 屏幕坐标转标准设备坐标
  let x = ((event.clientX - getBoundingClientRect.left) / container.offsetWidth) * 2 - 1;// 标准设备横坐标
  let y = -((event.clientY - getBoundingClientRect.top) / container.offsetHeight) * 2 + 1;// 标准设备纵坐标
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