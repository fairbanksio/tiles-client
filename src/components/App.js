import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import '../styles/App.css';
import Home from './Home';
import Board from './Board';
import SignIn from './SignIn';
import { AuthContext } from '../contexts/AuthContext';

function App (props) {
    const Auth = useContext(AuthContext);
    return (
        <Router>
          <Switch>
              <Route exact path="/signin" component={SignIn} />
              <Route exact path="/signup" component={SignIn} />
              <Route exact path="/" component={Home} />
              <Route path="/:boardId" component={({...props}) => <Board {...props} auth={Auth}  />} />
            </Switch>
        </Router>
    );

}

export default App;
