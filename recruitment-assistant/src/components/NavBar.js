import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/NavBar.css';
import logo from '../media/soccer-logo.png'; // Adjust the path to your logo
import { FaBars, FaTimes } from 'react-icons/fa';

const NavBar = () => {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img src={logo} alt="College Recruitment" className="navbar-logo-image" />
          </Link>
          <span className="navbar-title">College Recruitment</span>
        </div>
        <div className="menu-icon" onClick={handleClick}>
          {click ? <FaTimes /> : <FaBars />}
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/Messaging" className="nav-links" onClick={closeMobileMenu}>
              Messaging
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/SearchSchools" className="nav-links" onClick={closeMobileMenu}>
              Search Schools
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/Pricing" className="nav-links" onClick={closeMobileMenu}>
              Pricing
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/About" className="nav-links" onClick={closeMobileMenu}>
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
