import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dumbbell, Repeat, Zap, Music, BookOpen, Lightbulb } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { path: '/gimnasio', icon: Dumbbell, label: 'Gimnasio' },
    { path: '/transiciones', icon: Repeat, label: 'Transiciones' },
    { path: '/fisico', icon: Zap, label: 'Físico' },
    { path: '/creaciones', icon: Lightbulb, label: 'Creaciones' },
    { path: '/tecnica', icon: BookOpen, label: 'Técnica' },
    { path: '/repertorio', icon: Music, label: 'Repertorio' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon strokeWidth={2.5} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
