import * as React from 'react';
import Scene from '../components/scene';
import Header, { Action } from '../components/header';
import CenteredContent from '../components/centered';
import NewZettelButton from '../components/new_zettel_button';

export default function Home() {
    return (
        <Scene>
            <Header title="Home" actions={
                <Action><NewZettelButton /></Action>
            } />
            <CenteredContent>
                <h1>Home</h1>
            </CenteredContent>
        </Scene>
    );
}
