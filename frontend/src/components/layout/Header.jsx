import React from 'react';
import './Layout.css';

const Header = ({ onToggleSidebar }) => {
    return (
        <header className="header">
            <button className="mobile-toggle" onClick={onToggleSidebar}>
                ☰
            </button>
            <h2 className="header-title">Dashboard</h2>
            <div className="user-profile">
                <div className="avatar">AD</div>
                <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>Admin</span>
            </div>
        </header>
    );
};

export default Header;
