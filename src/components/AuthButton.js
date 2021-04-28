import React, { useState, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Grid,
  Header,
  Message,
  Segment,
  Dropdown
} from 'semantic-ui-react';
import { GoogleLogin } from 'react-google-login';
import { AuthContext } from '../contexts/AuthContext';
import * as AuthAPI from '../controllers/Auth';

const AuthPage = (props) => {

  const loginState = {
    message: null,
  }

  const [loginInfo, setloginInfo] = useState(loginState);

  const Auth = useContext(AuthContext);

  const handleGoogleSignIn = (response) => {
    AuthAPI
      .loginGoogle(response, result => {
        if (result.success) {
          Auth.login(result);
          console.log(props.location.state)
          if(props.location.state){
            props.history.push('/'+props.location.state.ref);
          } else {
            props.history.push('/');
          }
        } else {
          console.log(result)
          setloginInfo(...loginInfo, { message: "error signing in with google" });
        }
      });
  }


  const handleFailure = e => {
    console.log(e)
    setloginInfo(...loginInfo, { message: "error signing in with google" });
  }

  const authTitle = (props.signup ? "Sign up" : "Sign In");
  const googleText = (props.signup ? 'register_with_google' : 'Sign in with Google');
  console.log(Auth.isAuth)

  return (

          !Auth.isAuth?
            <GoogleLogin
              clientId={process.env.REACT_APP_GOOGLE_CLIENT ? process.env.REACT_APP_GOOGLE_CLIENT : window.REACT_APP_GOOGLE_CLIENT}
              onSuccess={(response) => handleGoogleSignIn(response)}
              onFailure={handleFailure}
              render={renderProps => (
                <Button
                  fluid
                  icon='google'
                  content={googleText}
                  color='google plus'
                  size='large'
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled} />
              )} />
          : <Dropdown text={Auth.name}>
          <Dropdown.Menu>
            <Dropdown.Item text='SignOut' onClick={(e)=>Auth.logout()}/>

          </Dropdown.Menu>
        </Dropdown>

      
  )

}
export default withRouter(AuthPage);