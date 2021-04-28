import axios from 'axios'
const apiEndpoint = process.env.REACT_APP_API ? process.env.REACT_APP_API : window.REACT_APP_API

export const registerUser = (User, callback) => {
  const { username, password, name, email } = User
  axios
    .post('https://' + apiEndpoint + '/auth/register', {
      username,
      password,
      name,
      email
    })
    .then(result => {
      callback(result.data);
    })
    .catch(error => {
      
      callback({success: false, msg: "Error calling api."});
    })
};

export const loginUser = (Credentials, callback) => {
  const { username, password } = Credentials
  axios
    .post('https://' + apiEndpoint + '/auth/login', { username, password })
    .then(result => {
      callback(result.data);
    })
    .catch(error => {
      callback({success: false, msg: "Error calling api."});
    })
}

export const loginGoogle = (response, callback) => {
  axios
    .post('https://' + apiEndpoint + '/auth/google', {access_token: response.accessToken})
    .then(result => {
      callback(result.data);
    })
    .catch(error => {
      callback({success: false, msg: "Error calling api."});
    })
};

export const loginGithub = (response, callback) => {
  axios
    .post('https://' + apiEndpoint + '/auth/github', {access_token: response.access_token})
    .then(result => {
      callback(result.data);
    })
    .catch(error => {
      callback({success: false, msg: "Error calling api."});
    })
};

export const getGithubToken = (response, callback) => {
  axios
    .post('https://' + apiEndpoint + '/auth/github/get-token', {code: response.code})
    .then(result => {
      callback(result.data);
    })
    .catch(error => {
      callback({success: false, msg: "Error calling api."});
    })
};