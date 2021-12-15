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
import { MeshDistanceMaterial, MeshLambertMaterial, OctahedronGeometry } from '@views/index';
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
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Other 其他">
              <Menu.Item key="line">画线</Menu.Item>
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
