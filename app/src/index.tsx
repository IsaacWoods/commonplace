import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { GlobalStyle, theme } from './theme';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Zettel from './scenes/zettel';

function Home() {
    return (<h1>Home</h1>);
}

const App = () => (
    <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/zettel/:id" component={Zettel} />
            </Switch>
        </Router>
    </ThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
