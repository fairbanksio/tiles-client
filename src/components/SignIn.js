import React, { useState, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Grid,
  Header,
  Message,
  Segment
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


  return (

      <Grid style={{ margin: 0, minHeight: '100vh' }} centered verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 360 }}>
          <Segment style={{ padding: '2em' }}>
            <Header style={{ paddingTop: '0.3em', paddingBottom: '0.3em', color: '#3F3D56' }} as='h2' textAlign='center'>
              {authTitle}</Header>
            {loginInfo.message ?
              <Message negative>
                <Message.Header>{'an_error_occurred'}</Message.Header>
                <p>{loginInfo.message}</p>
              </Message> : null}
            {props.signup ?
              <p style={{ marginTop: 12, fontSize: '1.1em', textAlign: "center" }}>
                {'by_registering_you_agree'}
                  &amp;
                  </p> : null}
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
                  style={{ marginTop: 12 }}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled} />
              )} />

          </Segment>
        </Grid.Column>
      </Grid>
      
  )

}
export default withRouter(AuthPage);