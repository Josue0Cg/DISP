import React from 'react';
import pattern from '../../assets/pattern.png';
import './Layout.css';

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src={pattern} alt="Pattern" className="sidebar-pattern" />
        <span className="brand">DISP</span>
      </div>
      <nav className="nav-links">
        <a href="#" className="nav-item active">
          Dashboard
        </a>
        <a href="#" className="nav-item">
          Dispersiones
        </a>
        <a href="#" className="nav-item">
          Configuración
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
