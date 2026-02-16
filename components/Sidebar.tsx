import { LayoutGrid, ListTodo, BarChart3, Code, Rocket } from 'lucide-react'

export default function Sidebar() {
  const navigation = [
    { section: 'Planning', items: [
      { name: 'Board', icon: LayoutGrid, active: true },
      { name: 'Backlog', icon: ListTodo, active: false },
      { name: 'Reports', icon: BarChart3, active: false },
    ]},
    { section: 'Development', items: [
      { name: 'Code', icon: Code, active: false },
      { name: 'Releases', icon: Rocket, active: false },
    ]}
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto flex-shrink-0">
      <nav className="space-y-1">
        {navigation.map((section) => (
          <div key={section.section}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-6 first:mt-0">
              {section.section}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href="#"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className={item.active ? 'font-medium' : ''}>{item.name}</span>
                </a>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
