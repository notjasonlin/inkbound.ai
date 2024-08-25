import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Home from './pages/Home';
import SearchSchools from './pages/SearchSchools';
import Messaging from './pages/Messaging';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <NavBar />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/search-schools" element={<SearchSchools />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
