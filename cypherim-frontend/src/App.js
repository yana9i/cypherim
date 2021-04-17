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
        {/* <header className="App-header">
        </header> */}
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
