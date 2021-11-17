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
