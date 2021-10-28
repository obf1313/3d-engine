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
import { Camera, CubeCamera, StereoCamera } from '@views/index';

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
            <Menu.Item key="simpleScene">简单场景</Menu.Item>
            <Menu.Item key="textureScene">三维模型材质</Menu.Item>
            <Menu.Item key="dracoLoaderUse">DracoLoader 导入</Menu.Item>
            <Menu.Item key="multipleModel">多模型（动画）</Menu.Item>
            <Menu.Item key="skyBox">天空盒</Menu.Item>
            <Menu.Item key="factory">工厂模型</Menu.Item>
            <Menu.Item key="line">画线</Menu.Item>
            <Menu.Item key="camera">正交相机、透视相机</Menu.Item>
            <Menu.Item key="arrayCamera">摄像机阵列</Menu.Item>
            <Menu.Item key="cubeCamera">立方相机</Menu.Item>
            <Menu.Item key="stereoCamera">立体相机</Menu.Item>
            <Menu.Item key="boxGeometry">立方缓冲几何体</Menu.Item>
          </SubMenu>
        </Menu>
      </Row>
    </Row>
  );
};
export default Header;
