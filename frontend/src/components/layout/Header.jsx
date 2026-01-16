import React from 'react';
import { Link } from 'react-router-dom';
import Clock from '../Clock';
import './Layout.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-left">
                <h2 className="header-title">DISP Dashboard</h2>
                <nav className="top-nav">
                    <Link to="/" className="nav-link">Nueva Dispersión</Link>
                    <Link to="/history" className="nav-link">Historial</Link>
                </nav>
            </div>
            <div className="header-right">
                <Clock />
                <div className="user-profile">
                    <div className="avatar">AD</div>
                </div>
            </div>
        </header>
    );
};

export default Header;
