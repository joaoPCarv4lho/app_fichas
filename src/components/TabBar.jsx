import { NavLink } from 'react-router-dom'

export default function TabBar() {
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        <NavLink to="/" end className={({ isActive }) => 'tab' + (isActive ? ' on' : '')}>
          <span className="ic">📅</span>Agenda
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => 'tab' + (isActive ? ' on' : '')}>
          <span className="ic">👥</span>Clientes
        </NavLink>
      </div>
    </nav>
  )
}
