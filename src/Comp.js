import React from 'react';

import { StateContext } from './state'
import { OP_ADD, OP_REMOVE, OP_EDIT, OP_SYNC, OP_SAVE } from './db'

export class Comp extends React.Component {
  static contextType = StateContext;

  constructor(props) {
    super(props)
    this.state = {
        newName: '',
        filterText: ''
    }
  }

  getList = (samples) => {
    const [{ }, dispatch] = this.context;
    const { filterText } = this.state;
    
    return samples
      .filter(item => item.name.indexOf(filterText) >= 0)
      .map((s, i) => 
          <div key={i}>
            {s.id}:
            &nbsp;&nbsp;&nbsp;&nbsp;
            <input type="text"
                value={s.name}
                onChange={e => dispatch({ 
                    type: OP_EDIT, 
                    arg: { id: s.id, name: e.target.value }
                })} ></input>
            <button onClick={e => dispatch({
                type: OP_REMOVE,
                arg: { id: s.id }
            })}>remove</button>
          </div>
            );
  }

  render() {
    const [{ data, updates }, dispatch] = this.context;
    const samples = data.samples;
    const { newName, filterText } = this.state;
    
    return (
      <div className="Comp" style={{textAlign: 'center'}}>
          <input value={filterText} 
            onChange={e => this.setState({ filterText: e.target.value })} />
          <br />

          <input value={newName} 
            onChange={e => this.setState({ newName: e.target.value })} />
            
          <button disabled={ !newName }
            onClick={() => {
              const temp = newName
              this.setState({ newName: '' }, () => dispatch({
                  type: OP_ADD,
                  arg: { name: temp }
                }))}}
          >
            Add
          </button>
          
          <br />

        <div className="samples">
        {this.getList(samples)}
        </div>

        <div className="updates">
        {updates.map((s, i) => 
          <div key={i}>{s.id}: {s.op}</div>
            )}
        </div>

        <button disabled={ !updates.length }
            onClick={() => {
              dispatch({
                type: OP_SYNC
              })
              }}
          >
            Sync
          </button>

          

        <button 
            onClick={() => {
              dispatch({
                type: OP_SAVE
              })
              }}
          >
            Save
          </button>
      </div>
    );
  }
}