/**
 * @description: 骨骼
 * 骨骼是 Skeleton（骨架）的一部分。
 * 骨架是由 SkinnedMesh（蒙皮网格）依次来使用的。 骨骼几乎和空白 Object3D 相同。
 * @createTime: 2021/12/22 14:28
 **/
import React from 'react';
import SkinnedMesh from '@views/example/object/SkinnedMesh';

const Bone = () => {
  return <SkinnedMesh />;
};
export default Bone;
