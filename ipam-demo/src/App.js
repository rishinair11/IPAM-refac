import React, { Component } from 'react';
import './App.css';
import PersistenDrawer from "./components/PersistentDrawer";

class App extends Component {
  render() {
    return (
      <div className="App">
        <PersistenDrawer />
      </div>
    );
  }
}

export default App;
