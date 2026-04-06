import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Link } from 'react-router-dom'
import App from './App.tsx'
import { ROUTES } from './Routes'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/sabatie-theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <BrowserRouter>
      <ul>
        <li><Link to={ROUTES.HOME}>Главная</Link></li>
        <li><Link to={ROUTES.REAGENTS}>Реагенты</Link></li>
      </ul>
      <hr />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)