import { useEffect, useState } from 'react';
import './App.css';
import rustLogo from './assets/rust.svg';
import reactLogo from './assets/react.svg';
import { backend } from './declarations/backend';
import { BackendProvider, useBackendContext } from './utils/backendContext';
import HomePage from '@/compnents/homePage';

function App() {


  return (
    <BackendProvider>
      <HomePage />
    </BackendProvider>
  );
}

export default App;
