import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dumbbell, Repeat, Zap, Music, BookOpen, Lightbulb, ListMusic } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { path: '/gimnasio', icon: Dumbbell, label: 'Gimnasio' },
    { path: '/transiciones', icon: Repeat, label: 'Trans' },
    { path: '/secuenciador', icon: ListMusic, label: 'Secuencia' },
    { path: '/fisico', icon: Zap, label: 'Físico' },
    { path: '/creaciones', icon: Lightbulb, label: 'Laboratorio' },
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
