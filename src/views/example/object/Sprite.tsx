/**
 * @description: 精灵
 * 精灵是一个总是面朝着摄像机的平面，通常含有使用一个半透明的纹理。
 * 精灵不会投射任何阴影，即使设置了 castShadow = true，也将不会有任何效果。
 * 备注：因为点精灵材质处写了点精灵相关的代码，故直接使用。
 * @author: cnn
 * @createTime: 2021/12/23 11:19
 **/
import React from 'react';
import SpriteMaterial from '@views/example/material/SpriteMaterial';

const Sprite = () => {
  return (
    <>
      <SpriteMaterial />
    </>
  );
};
export default Sprite;
