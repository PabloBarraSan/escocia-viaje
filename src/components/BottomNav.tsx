import { NavLink } from 'react-router-dom'
import { Calendar, Map, Menu, Sunrise } from 'lucide-react'

export function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-medium transition-colors ${
      isActive ? 'text-highland-700' : 'text-gray-400'
    }`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-highland-200 bg-white/95 backdrop-blur safe-bottom">
      <div className="mx-auto flex max-w-lg justify-around">
        <NavLink to="/" end className={linkClass}>
          <Sunrise size={22} />
          Avui
        </NavLink>
        <NavLink to="/dies" className={linkClass}>
          <Calendar size={22} />
          Viatge
        </NavLink>
        <NavLink to="/mapa" className={linkClass}>
          <Map size={22} />
          Mapa
        </NavLink>
        <NavLink to="/mes" className={linkClass}>
          <Menu size={22} />
          Més
        </NavLink>
      </div>
    </nav>
  )
}
