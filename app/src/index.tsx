import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Scene from './components/scene';

const App = () =>
    <Scene>
        <h1>Hello, React!</h1>
        <p>Content goes here</p>
        <p>Content goes here</p>
        <p>Content goes here</p>
    </Scene>;

ReactDOM.render(<App />, document.getElementById('root'));
