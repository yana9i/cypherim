// import logo from './logo.svg';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import './style/App.css';


import Chat from './components/Chat.js';
import Login from './components/Login.js';
import Register from './components/Register.js';

function App() {

  return (
    <div className="App">
      <div id="bgDiv" />
      <Router>
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          {/* Edit <code>src/App.js</code> and save to reload.
          <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">CypherIM</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        <Link to="/chat">Chat</Link> */}

        </header>
        <main>

          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/chat" component={Chat} />
          </Switch>
        </main>
      </Router >
      <ToastContainer />
    </div>
  );
}

export default App;
