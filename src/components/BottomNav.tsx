import { NavLink } from 'react-router-dom'
import { Calendar, Map, ClipboardList, FileLock2 } from 'lucide-react'

export function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 px-4 py-2 text-xs font-medium transition-colors ${
      isActive ? 'text-highland-700' : 'text-gray-400'
    }`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-highland-200 bg-white/95 backdrop-blur safe-bottom">
      <div className="mx-auto flex max-w-lg justify-around">
        <NavLink to="/" end className={linkClass}>
          <Calendar size={22} />
          Dies
        </NavLink>
        <NavLink to="/mapa" className={linkClass}>
          <Map size={22} />
          Mapa
        </NavLink>
        <NavLink to="/resum" className={linkClass}>
          <ClipboardList size={22} />
          Resum
        </NavLink>
        <NavLink to="/reservas" className={linkClass}>
          <FileLock2 size={22} />
          Reservas
        </NavLink>
      </div>
    </nav>
  )
}
