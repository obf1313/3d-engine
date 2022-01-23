/**
 * @description: Header
 * @author: cnn
 * @createTime: 2020/7/21 9:39
 **/
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Menu } from 'antd';
import { OrderedListOutlined } from '@ant-design/icons';
import { platform, projectName } from '@utils/CommonVars';
import './index.less';
import logo from '@static/images/logo.png';
import ExtrudeGeometry from '@views/example/geometry/ExtrudeGeometry';
import LatheGeometry from '@views/example/geometry/LatheGeometry';
import { CubeTextureLoader, MeshDistanceMaterial, MeshLambertMaterial, OctahedronGeometry } from '@views/index';
import PlaneGeometry from '@views/example/geometry/PlaneGeometry';

const { SubMenu } = Menu;

const Header = () => {
  const history = useHistory();
  const [current, setCurrent] = useState<any>('');
  // 跳至主页
  const toHome = () => {
    history.push(platform);
  };
  // 点击菜单
  const menuClick = (current: any) => {
    history.push(platform + 'example/' + current.key);
    setCurrent(current.key);
  };
  return (
    <Row className="header header-shadow" justify="space-between" align="middle">
      <Row align="middle" justify="center" className="header-title-icon" onClick={toHome}>
        <img src={logo} alt="logo" height={28} />
        <div className="header-title">{projectName}</div>
      </Row>
      <Row>
        <Menu onClick={menuClick} selectedKeys={[current]} mode="horizontal" style={{ borderBottom: 'none' }}>
          <SubMenu key="example" title="示例列表" icon={<OrderedListOutlined />}>
            <Menu.ItemGroup title="Core 核心">
              <Menu.Item key="bufferAttribute">流几何体属性</Menu.Item>
              <Menu.Item key="bufferGeometry">流几何体</Menu.Item>
              <Menu.Item key="interleavedBuffer">交叉存储流</Menu.Item>
              <Menu.Item key="raycaster">光线投射</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Scene 场景">
              <Menu.Item key="fog">雾</Menu.Item>
              <Menu.Item key="fogExp2">雾-指数</Menu.Item>
              <Menu.Item key="scene">场景</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Camera 相机">
              <Menu.Item key="camera">正交相机、透视相机</Menu.Item>
              <Menu.Item key="arrayCamera">摄像机阵列</Menu.Item>
              <Menu.Item key="cubeCamera">立方相机</Menu.Item>
              <Menu.Item key="stereoCamera">立体相机</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Geometry 几何体">
              <Menu.Item key="boxGeometry">立方缓冲几何体</Menu.Item>
              <Menu.Item key="circleGeometry">圆形缓冲几何体</Menu.Item>
              <Menu.Item key="coneGeometry">圆锥缓冲几何体</Menu.Item>
              <Menu.Item key="cylinderGeometry">圆柱缓冲几何体</Menu.Item>
              <Menu.Item key="dodecahedronGeometry">十二面缓冲几何体</Menu.Item>
              <Menu.Item key="edgesGeometry">边缘几何体</Menu.Item>
              <Menu.Item key="extrudeGeometry">挤压缓冲几何体</Menu.Item>
              <Menu.Item key="icosahedronGeometry">二十面缓冲几何体</Menu.Item>
              <Menu.Item key="latheGeometry">车削缓冲几何体</Menu.Item>
              <Menu.Item key="octahedronGeometry">八面缓冲几何体</Menu.Item>
              <Menu.Item key="planeGeometry">平面缓冲几何体</Menu.Item>
              <Menu.Item key="polyhedronGeometry">多面缓冲几何体</Menu.Item>
              <Menu.Item key="ringGeometry">圆环缓冲几何体</Menu.Item>
              <Menu.Item key="shapeGeometry">形状缓冲几何体</Menu.Item>
              <Menu.Item key="sphereGeometry">球缓冲几何体</Menu.Item>
              <Menu.Item key="tetrahedronGeometry">四面缓冲几何体</Menu.Item>
              <Menu.Item key="torusGeometry">圆环缓冲几何体</Menu.Item>
              <Menu.Item key="torusKnotGeometry">圆环缓冲扭结几何体</Menu.Item>
              <Menu.Item key="tubeGeometry">管道缓冲几何体</Menu.Item>
              <Menu.Item key="wireframeGeometry">网格几何体</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Light 灯光">
              <Menu.Item key="ambientLight">环境光</Menu.Item>
              <Menu.Item key="directionalLight">平行光</Menu.Item>
              <Menu.Item key="hemisphereLight">半球光</Menu.Item>
              <Menu.Item key="pointLight">点光源</Menu.Item>
              <Menu.Item key="rectAreaLight">平面光光源</Menu.Item>
              <Menu.Item key="spotLight">聚光灯</Menu.Item>
              <Menu.Item key="lightProbe">光照探针</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Material 材质">
              <Menu.Item key="lineBasicMaterial">基础线条材质</Menu.Item>
              <Menu.Item key="lineDashedMaterial">虚线材质</Menu.Item>
              <Menu.Item key="meshBasicMaterial">基础网格材质</Menu.Item>
              <Menu.Item key="meshDepthMaterial">深度网格材质</Menu.Item>
              <Menu.Item key="meshDistanceMaterial">深度着色材质</Menu.Item>
              <Menu.Item key="meshLambertMaterial">Lambert 网格材质</Menu.Item>
              <Menu.Item key="meshMatcapMaterial">材质捕捉纹理定义材质</Menu.Item>
              <Menu.Item key="meshNormalMaterial">法线网格材质</Menu.Item>
              <Menu.Item key="meshPhongMaterial">Phong 网格材质</Menu.Item>
              <Menu.Item key="meshPhysicalMaterial">物理网格材质</Menu.Item>
              <Menu.Item key="meshStandardMaterial">标准网格材质</Menu.Item>
              <Menu.Item key="meshToonMaterial">卡通网格材质</Menu.Item>
              <Menu.Item key="pointsMaterial">点材质</Menu.Item>
              <Menu.Item key="rawShaderMaterial">原始着色器材质</Menu.Item>
              <Menu.Item key="shaderMaterial">着色器材质</Menu.Item>
              <Menu.Item key="shadowMaterial">阴影材质</Menu.Item>
              <Menu.Item key="spriteMaterial">点精灵材质</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Texture 纹理">
              <Menu.Item key="canvasTexture">Canvas 纹理</Menu.Item>
              <Menu.Item key="compressedTexture">压缩的纹理</Menu.Item>
              <Menu.Item key="cubeTexture">立方纹理</Menu.Item>
              <Menu.Item key="dataTexture">原始数据纹理</Menu.Item>
              <Menu.Item key="dataTexture2DArray">2D数组数据纹理</Menu.Item>
              <Menu.Item key="dataTexture3D">三维纹理</Menu.Item>
              <Menu.Item key="depthTexture">深度纹理</Menu.Item>
              <Menu.Item key="texture">纹理</Menu.Item>
              <Menu.Item key="videoTexture">视频纹理</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Object 物体">
              <Menu.Item key="bone">骨骼</Menu.Item>
              <Menu.Item key="group">组</Menu.Item>
              <Menu.Item key="instancedMesh">实例化网格</Menu.Item>
              <Menu.Item key="line">线</Menu.Item>
              <Menu.Item key="lineLoop">环线</Menu.Item>
              <Menu.Item key="lineSegments">线段</Menu.Item>
              <Menu.Item key="levelsOfDetails">多细节层次</Menu.Item>
              <Menu.Item key="mesh">网格</Menu.Item>
              <Menu.Item key="points">点</Menu.Item>
              <Menu.Item key="skeleton">骨架</Menu.Item>
              <Menu.Item key="skinnedMesh">蒙皮网格</Menu.Item>
              <Menu.Item key="sprite">精灵</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Helper 辅助对象">
              <Menu.Item key="arrowHelper">箭头辅助对象</Menu.Item>
              <Menu.Item key="axesHelper">坐标轴辅助对象</Menu.Item>
              <Menu.Item key="boxHelper">包围盒辅助对象</Menu.Item>
              <Menu.Item key="box3Helper">3维包围盒辅助对象</Menu.Item>
              <Menu.Item key="cameraHelper">相机视锥体辅助对象</Menu.Item>
              <Menu.Item key="directionalLightHelper">平行光辅助对象</Menu.Item>
              <Menu.Item key="gridHelper">坐标格辅助对象</Menu.Item>
              <Menu.Item key="polarGridHelper">极坐标格辅助对象</Menu.Item>
              <Menu.Item key="hemisphereLightHelper">半球形光源辅助对象</Menu.Item>
              <Menu.Item key="planeHelper">平面辅助对象</Menu.Item>
              <Menu.Item key="pointLightHelper">点光辅助对象</Menu.Item>
              <Menu.Item key="skeletonHelper">骨骼辅助对象</Menu.Item>
              <Menu.Item key="spotLightHelper">聚光灯锥形辅助对象</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Loader 加载器">
              <Menu.Item key="cache">简单缓存系统</Menu.Item>
              <Menu.Item key="cubeTextureLoader">CubeTexture加载器</Menu.Item>
              <Menu.Item key="imageBitmapLoader">ImageBitmap加载器</Menu.Item>
              <Menu.Item key="imageLoader">图片加载器</Menu.Item>
              <Menu.Item key="objectLoader">JSON资源加载器</Menu.Item>
              <Menu.Item key="textureLoader">纹理加载器</Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Other 其他">
              <Menu.Item key="simpleScene">简单场景</Menu.Item>
              <Menu.Item key="skyBox">天空盒</Menu.Item>
              <Menu.Item key="textureScene">三维模型材质</Menu.Item>
              <Menu.Item key="dracoLoaderUse">DracoLoader 导入</Menu.Item>
              <Menu.Item key="factory">工厂模型</Menu.Item>
              <Menu.Item key="multipleModel">多模型（动画）</Menu.Item>
            </Menu.ItemGroup>
          </SubMenu>
        </Menu>
      </Row>
    </Row>
  );
};
export default Header;
