import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';

import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { LeaderboardPage } from './components/LeaderboardPage';

import './styles/App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <Switch>
                    <Route path="/leaderboard">
                        <LeaderboardPage />
                    </Route>
                    <Route path="/">
                        <HomePage />
                    </Route>
                    <Route path="*">
                        404
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
