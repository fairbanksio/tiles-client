import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import AuthProvider from './contexts/AuthContext';

ReactDOM.render(<AuthProvider><App /></AuthProvider>, document.getElementById('root'));
registerServiceWorker();
