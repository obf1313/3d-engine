/**
 * @description: Header
 * @author: cnn
 * @createTime: 2020/7/21 9:39
 **/
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Row } from 'antd';
import { platform, projectName } from '@utils/CommonVars';
import './index.less';
import logo from '@static/images/logo.png';

const Header = () => {
  const history = useHistory();
  // 跳至主页
  const toHome = () => {
    history.push(platform);
  };
  return (
    <Row className="header header-shadow" justify="space-between" align="middle">
      <Row align="middle" justify="center" className="header-title-icon" onClick={toHome}>
        <img src={logo} alt="logo" height={28} />
        <div className="header-title">{projectName}</div>
      </Row>
    </Row>
  );
};
export default Header;
