import { Task, Column, CardStatus } from '@/types/card'
import TaskCard from './TaskCard'
import { MoreVertical, Users } from 'lucide-react'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: number, newStatus: CardStatus) => void
  filter: string
  setFilter: (filter: string) => void
}

const columns: Column[] = [
  { id: 'todo', title: 'TO DO', color: 'bg-gray-200' },
  { id: 'inprogress', title: 'IN PROGRESS', color: 'bg-blue-200' },
  { id: 'done', title: 'DONE', color: 'bg-green-200' }
]

export default function KanbanBoard({ tasks, onTaskClick, onTaskStatusChange, filter, setFilter }: KanbanBoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('taskId'), 10)
    onTaskStatusChange(taskId, newStatus)
  }
  return (
    <main className="flex-1 overflow-x-auto bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Board</h2>
          <p className="text-gray-500 text-sm mt-1">My Project Board</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Issues</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          
          <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2 bg-white">
            <Users className="w-4 h-4" />
            <span>Group by</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-4 h-full">
        {columns.map(column => {
          const columnTasks = tasks.filter(task => task.status === column.id)
          
          return (
            <div key={column.id} className="flex-1 min-w-[320px]">
              <div className="bg-gray-100 rounded-t-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    {column.title}
                  </h3>
                  <span className="bg-gray-300 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div 
                className="bg-gray-50 rounded-b-lg p-4 min-h-[500px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {columnTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => onTaskClick(task)}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
