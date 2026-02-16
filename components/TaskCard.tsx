import { Task } from '@/types/card'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'high': return 'text-red-600 bg-red-100'
    case 'medium': return 'text-yellow-600 bg-yellow-100'
    case 'low': return 'text-green-600 bg-green-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getTypeIcon = (type: string) => {
  switch(type) {
    case 'bug': return '🐛'
    case 'story': return '📖'
    case 'task': return '✓'
    case 'design': return '🎨'
    default: return '📋'
  }
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('taskId', task.id.toString())
  }

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-white rounded-lg p-4 mb-3 cursor-move transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-blue-500 select-none active:opacity-75"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">TASK-{task.id}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
        {task.title}
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(task.type)}</span>
          <span className="text-xs text-gray-500">{task.points} pts</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
            {task.assignee.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  )
}
