import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="layout">
            <Sidebar isOpen={isSidebarOpen} />
            <div className="main-content">
                <Header onToggleSidebar={toggleSidebar} />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
