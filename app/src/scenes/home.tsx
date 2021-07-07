import * as React from 'react';
import Scene from '../components/scene';
import Header from '../components/header';
import CenteredContent from '../components/centered';

export default function Home() {
    return (
        <Scene>
            <Header title="Home" />
            <CenteredContent>
                <h1>Home</h1>
            </CenteredContent>
        </Scene>
    );
}
