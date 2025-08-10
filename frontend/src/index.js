import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {GoogleOAuthProvider} from "@react-oauth/google"

// Get Google Client ID from environment variable
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "787401426717-e4d48algs3th36v1ncpnee8pqq3boq0t.apps.googleusercontent.com";

if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
    console.warn('REACT_APP_GOOGLE_CLIENT_ID not found in environment variables. Using default value.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App />
    </GoogleOAuthProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
