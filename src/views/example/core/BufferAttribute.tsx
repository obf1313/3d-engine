/**
 * @description: 流属性
 * 这个类用于存储与 BufferGeometry 相关联的 attribute（例如顶点位置向量，面片索引，法向量，颜色值，UV坐标以及任何自定义 attribute ）。
 * 利用 BufferAttribute，可以更高效的向 GPU 传递数据。详情和例子见该页。
 * 在 BufferAttribute 中，数据被存储为任意长度的矢量（通过 itemSize 进行定义），下列函数如无特别说明， 函数参数中的 index 会自动乘以矢量长度进行计算。
 * @author: cnn
 * @createTime: 2022/1/11 14:23
 **/
import React from 'react';
import { BufferGeometry } from '@views/index';

const BufferAttribute = () => {
  return (
    <>
      <BufferGeometry />
    </>
  );
};
export default BufferAttribute;
