'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import KanbanBoard from '@/components/KanbanBoard'
import TaskModal from '@/components/TaskModal'
import CreateTaskModal from '@/components/CreateTaskModal'
import { Task } from '@/types/card'
import { taskService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch tasks from API
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!authLoading && isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await taskService.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      // Use fallback data if API is not available
      setTasks([
        {
          id: 1,
          title: "ออกแบบ UI/UX สำหรับหน้า Dashboard",
          description: "สร้างออกแบบ mockup และ prototype",
          status: "todo",
          priority: "high",
          assignee: "สมชาย",
          type: "design",
          points: 5,
          ownerId: 1
        },
        {
          id: 2,
          title: "พัฒนา API สำหรับ Authentication",
          description: "สร้าง JWT token และ middleware",
          status: "todo",
          priority: "high",
          assignee: "สมหญิง",
          type: "task",
          points: 8,
          ownerId: 1
        },
        {
          id: 3,
          title: "แก้ไข Bug การแสดงผลบน Mobile",
          description: "ปรับ responsive design",
          status: "inprogress",
          priority: "medium",
          assignee: "วิชัย",
          type: "bug",
          points: 3,
          ownerId: 2
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const handleCloseModal = () => {
    setSelectedTask(null)
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await taskService.updateTask(updatedTask.id, updatedTask)
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
      setSelectedTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      // Fallback: update locally
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
      setSelectedTask(null)
    }
  }

  const handleDeleteTask = (taskId: number) => {
    // Remove task from list without refetching
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleTaskStatusChange = async (taskId: number, newStatus: any) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Update locally first for immediate UI feedback
    const updatedTask = { ...task, status: newStatus }
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))

    // Update on server
    try {
      await taskService.updateTask(taskId, { status: newStatus })
    } catch (error) {
      console.error('Error updating task status:', error)
      // Revert on error
      setTasks(tasks)
    }
  }

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.priority === filter)

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar />}
        
        <KanbanBoard 
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onTaskStatusChange={handleTaskStatusChange}
          filter={filter}
          setFilter={setFilter}
        />
      </div>

      <TaskModal 
        task={selectedTask}
        onClose={handleCloseModal}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={() => {
          setIsCreateModalOpen(false)
          fetchTasks()
        }}
      />
    </div>
  )
}
