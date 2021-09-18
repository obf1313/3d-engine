/**
 * @description: 使用 CubeTexture
 * @author: cnn
 * @createTime: 2021/9/18 9:25
 **/
import React, { useState, useEffect } from 'react';
import { CubeTexture, CubeTextureLoader } from 'three';

interface IProps {
  // 文件路径前缀
  path: string,
  // 文件列表
  // 指定顺序: pos-x, neg-x, pos-y, neg-y, pos-z, neg-z
  urlList: [string, string, string, string, string, string]
}

const useCubeTexture = (props: IProps) => {
  const { path, urlList } = props;
  const [cubeTexture, setCubeTexture] = useState<CubeTexture>();
  useEffect(() => {
    initCubeTexture();
  }, []);
  // 初始化 CubeTexture
  const initCubeTexture = () => {
    const cubeTextureLoader = new CubeTextureLoader();
    cubeTextureLoader.setPath(path);
    const cubeTexture = cubeTextureLoader.load(urlList);
    setCubeTexture(cubeTexture);
  };
  return { cubeTexture };
};
export default useCubeTexture;