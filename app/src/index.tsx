import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { GlobalStyle } from './theme';
import { ThemeProvider } from 'styled-components';
import Scene from './components/scene';

const App = () =>
    <ThemeProvider theme={{}}>
        <GlobalStyle />
        <Scene>
            <h1>Hello, React!</h1>
            <p>Content goes here</p>
            <p>Content goes here</p>
            <p>Content goes here</p>
        </Scene>
    </ThemeProvider>;

ReactDOM.render(<App />, document.getElementById('root'));
