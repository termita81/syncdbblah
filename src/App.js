import React from 'react';

import { StateProvider } from './state';

import './App.css';

import { createDatabase, OP_ADD, OP_REMOVE, OP_EDIT, OP_SYNC, OP_SAVE } from './db'

import { Comp } from './Comp'

// operations can be contained in a separate object, so that all of App, Comp and db can use it

function get() {
  const data = JSON.parse(localStorage.getItem('data') || 'null');
  return data;
}

function set(data) {
  localStorage.setItem('data', JSON.stringify(data))
}

const App = () => {
  const db = createDatabase(get, set);

  const initialState = db.getState('samples')

  const reducer = (state, action) => {
    switch (action.type) {
      case OP_ADD:
          db.insert('samples', action.arg)
          return db.getState('samples');
      
      case OP_EDIT:
        db.edit('samples', action.arg)
        return db.getState('samples');
      
      case OP_REMOVE:
        db.remove('samples', action.arg)
        return db.getState('samples');
      
      case OP_SYNC: 
        const ops = db.sync()
        console.log(ops)
        return db.getState('samples');
    
      case OP_SAVE: 
        return db.getState('samples');
        
      default:
        return state;
    }
  };
  
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
        <Comp />
    </StateProvider>
  );
}

export default App;
