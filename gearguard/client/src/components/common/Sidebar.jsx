import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
  FileText,
  Calendar
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/equipment', icon: Wrench, label: 'Equipment' },
    { path: '/teams', icon: Users, label: 'Teams' },
    { path: '/requests', icon: FileText, label: 'Requests' },
  ]

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg z-40">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
