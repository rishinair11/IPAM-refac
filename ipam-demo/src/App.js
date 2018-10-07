import React, { Component } from 'react';
import { Drawer, Button } from 'react-md';
import './App.css';

import WebFontLoader from 'webfontloader';

WebFontLoader.load({
  google: {
    families: ['Roboto:300,400,500,700', 'Material Icons'],
  },
});

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      visible : false
    }

    this.toggleDrawerVisiblity = this.toggleDrawerVisiblity.bind(this);
  }

  toggleDrawerVisiblity(){
    this.setState({
      visible: !this.state.visible
    });
  }

  render() {
    return (
      <div>
        <Drawer 
          type={Drawer.DrawerTypes.TEMPORARY}
          visible = {this.state.visible}
        >
          <Button 
            onClick={this.toggleDrawerVisiblity}>
              Click Me 
          </Button>
        </Drawer>
        <Button 
          onClick={this.toggleDrawerVisiblity}>
            Click Me 
        </Button>
      </div>
    );
  }
}

export default App;
