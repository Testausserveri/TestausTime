import {
    Link
} from 'react-router-dom';

import '../styles/Header.css';

export function Header() {
    return (
        <div className="header">
            <h1><Link to="/">TestausTime</Link></h1>
            <ul className="nav">
                <Link to="/leaderboard">
                    <li className="secondary">Leaderboard</li>
                </Link>
                <a href="#">
                    <li>Get the Extension</li>
                </a>
            </ul>
        </div>
    );
}