/**
 * @description: 路由
 * @author: cnn
 * @createTime: 2020/7/16 15:42
 **/
import React, { createContext, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ErrorBoundary } from '@components/index';
import {
  NotFound, Home, SimpleScene, TextureScene, DracoLoaderUse,
  MultipleModel, SkyBox, Factory
} from '@views/index';
import { platform } from '@utils/CommonVars';
import { homeInit, homeReducer } from '@views/home/HomeReducer';

export const HomeContext = createContext({ homeState: homeInit, homeDispatch: (value: any) => {} });

const App = () => {
  const [homeState, homeDispatch] = useReducer(homeReducer, homeInit);
  return (
    <HomeContext.Provider value={{ homeState, homeDispatch }}>
      <Router>
        <Switch>
          <Home>
            <Switch>
              <ErrorBoundary>
                <Route exact path={platform} component={SimpleScene} />
                <Route exact path={platform + 'example/simpleScene'} component={SimpleScene} />
                <Route exact path={platform + 'example/textureScene'} component={TextureScene} />
                <Route exact path={platform + 'example/dracoLoaderUse'} component={DracoLoaderUse} />
                <Route exact path={platform + 'example/multipleModel'} component={MultipleModel} />
                <Route exact path={platform + 'example/skyBox'} component={SkyBox} />
                <Route exact path={platform + 'example/factory'} component={Factory} />
              </ErrorBoundary>
              <Route component={NotFound} />
            </Switch>
          </Home>
          <Route component={NotFound} />
        </Switch>
      </Router>
    </HomeContext.Provider>
  );
};
export default App;
