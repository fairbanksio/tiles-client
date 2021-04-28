import React, { useState } from 'react';

export const AuthContext = React.createContext();

export const AuthConsumer = AuthContext.Consumer;

const AuthProvider = props => {

  //initial state
  const userInformation = {
    isAuth: localStorage.getItem('jwtToken') ? true : false,
    token: localStorage.getItem('jwtToken'),
    name: localStorage.getItem('name'),
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
    admin: false,
    hasProfile: false,
    login: (identity) => {

      //set localstorage/session storage here in the future
      localStorage.setItem('jwtToken', identity.token)
      localStorage.setItem('userId', identity.id)
      localStorage.setItem('name', identity.name)
      localStorage.setItem('username', identity.username)
      localStorage.setItem('admin', identity.admin ? "true" : "false")

      //set context state with profile info
      setUserInfo({
        ...userInformation,
        isAuth: true,
        token: identity.token,
        userId: identity.id,
        name: identity.name,
        username: identity.username,
        admin: identity.admin,
        hasProfile: identity.hasProfile
      })
    },
    logout: () => {
      localStorage.clear();
      sessionStorage.clear();
      setUserInfo({ ...userInformation, isAuth: false });
    }

  }

  const [userInfo, setUserInfo] = useState(userInformation);

  return (
    <AuthContext.Provider value={userInfo}>
      {props.children}
    </AuthContext.Provider>
  );

};

export default AuthProvider;