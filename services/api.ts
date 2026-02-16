import { supabase } from '@/lib/supabaseClient'
import { Task } from '@/types/card'
import { User, AuthResponse, UserRole } from '@/types/auth'

const mapSupabaseUserToUser = (supabaseUser: any): User => {
  const metadata = supabaseUser.user_metadata || {}
  const email: string = supabaseUser.email || ''
  const defaultRole: UserRole = email.endsWith('@botnoigroup.com') ? 'member' : 'guest'
  const role: UserRole = metadata.role === 'member' || metadata.role === 'guest' ? metadata.role : defaultRole

  return {
    id: 0,
    email,
    name: metadata.name || email,
    role,
    createdAt: supabaseUser.created_at ? new Date(supabaseUser.created_at) : undefined,
  }
}

const mapTaskRowToTask = (row: any): Task => {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee,
    type: row.type,
    points: row.points,
    reporter: row.reporter ?? undefined,
    impact: row.impact ?? undefined,
    urgency: row.urgency ?? undefined,
    priorityLevel: row.priority_level ?? undefined,
    plannedStartDate: row.planned_start_date ? new Date(row.planned_start_date) : null,
    plannedEndDate: row.planned_end_date ? new Date(row.planned_end_date) : null,
    actualStartDate: row.actual_start_date ? new Date(row.actual_start_date) : null,
    actualEndDate: row.actual_end_date ? new Date(row.actual_end_date) : null,
    plannedEstimatedHours: row.planned_estimated_hours ?? null,
    actualEstimatedHours: row.actual_estimated_hours ?? null,
    labels: row.labels ?? undefined,
    cardLevel: row.card_level ?? undefined,
    sprintId: row.sprint_id ?? null,
    dependencies: row.dependencies ?? undefined,
    ownerId: row.ownerId ?? row.owner_id,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  }
}

export const authService = {
  register: async (email: string, name: string, password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: email.endsWith('@botnoigroup.com') ? 'member' : 'guest',
        },
      },
    })

    if (error) {
      throw error
    }

    if (!data.user || !data.session) {
      throw new Error('Registration failed')
    }

    const user = mapSupabaseUserToUser(data.user)
    const token = data.session.access_token

    return { user, token }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed')
    }

    const user = mapSupabaseUserToUser(data.user)
    const token = data.session.access_token

    return { user, token }
  },

  validateToken: async (token: string): Promise<User> => {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error('User not authenticated')
    }

    return mapSupabaseUserToUser(data.user)
  },

  getMe: async (): Promise<User> => {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error('User not authenticated')
    }

    return mapSupabaseUserToUser(data.user)
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }
}

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    return (data || []).map(mapTaskRowToTask)
  },

  getTaskById: async (id: number): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error('Task not found')
    }

    return mapTaskRowToTask(data)
  },

  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const insertPayload: any = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      type: task.type,
      points: task.points,
    }

    if (task.reporter !== undefined) {
      insertPayload.reporter = task.reporter
    }
    if (task.impact !== undefined) {
      insertPayload.impact = task.impact
    }
    if (task.urgency !== undefined) {
      insertPayload.urgency = task.urgency
    }
    if (task.priorityLevel !== undefined) {
      insertPayload.priority_level = task.priorityLevel
    }
    if (task.plannedStartDate !== undefined) {
      insertPayload.planned_start_date = task.plannedStartDate
    }
    if (task.plannedEndDate !== undefined) {
      insertPayload.planned_end_date = task.plannedEndDate
    }
    if (task.actualStartDate !== undefined) {
      insertPayload.actual_start_date = task.actualStartDate
    }
    if (task.actualEndDate !== undefined) {
      insertPayload.actual_end_date = task.actualEndDate
    }
    if (task.plannedEstimatedHours !== undefined) {
      insertPayload.planned_estimated_hours = task.plannedEstimatedHours
    }
    if (task.actualEstimatedHours !== undefined) {
      insertPayload.actual_estimated_hours = task.actualEstimatedHours
    }
    if (task.labels !== undefined) {
      insertPayload.labels = task.labels
    }
    if (task.cardLevel !== undefined) {
      insertPayload.card_level = task.cardLevel
    }
    if (task.sprintId !== undefined) {
      insertPayload.sprint_id = task.sprintId
    }
    if (task.dependencies !== undefined) {
      insertPayload.dependencies = task.dependencies
    }

    if (task.ownerId !== undefined) {
      insertPayload.owner_id = task.ownerId
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(insertPayload)
      .select('*')
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error('Failed to create task')
    }

    return mapTaskRowToTask(data)
  },

  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    const updatePayload: any = {}

    if (task.title !== undefined) updatePayload.title = task.title
    if (task.description !== undefined) updatePayload.description = task.description
    if (task.status !== undefined) updatePayload.status = task.status
    if (task.priority !== undefined) updatePayload.priority = task.priority
    if (task.assignee !== undefined) updatePayload.assignee = task.assignee
    if (task.type !== undefined) updatePayload.type = task.type
    if (task.points !== undefined) updatePayload.points = task.points
     if (task.reporter !== undefined) updatePayload.reporter = task.reporter
     if (task.impact !== undefined) updatePayload.impact = task.impact
     if (task.urgency !== undefined) updatePayload.urgency = task.urgency
     if (task.priorityLevel !== undefined) updatePayload.priority_level = task.priorityLevel
     if (task.plannedStartDate !== undefined) updatePayload.planned_start_date = task.plannedStartDate
     if (task.plannedEndDate !== undefined) updatePayload.planned_end_date = task.plannedEndDate
     if (task.actualStartDate !== undefined) updatePayload.actual_start_date = task.actualStartDate
     if (task.actualEndDate !== undefined) updatePayload.actual_end_date = task.actualEndDate
     if (task.plannedEstimatedHours !== undefined) updatePayload.planned_estimated_hours = task.plannedEstimatedHours
     if (task.actualEstimatedHours !== undefined) updatePayload.actual_estimated_hours = task.actualEstimatedHours
     if (task.labels !== undefined) updatePayload.labels = task.labels
     if (task.cardLevel !== undefined) updatePayload.card_level = task.cardLevel
     if (task.sprintId !== undefined) updatePayload.sprint_id = task.sprintId
     if (task.dependencies !== undefined) updatePayload.dependencies = task.dependencies
    if (task.ownerId !== undefined) updatePayload.owner_id = task.ownerId

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error('Failed to update task')
    }

    return mapTaskRowToTask(data)
  },

  deleteTask: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  },

  getTasksByStatus: async (status: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', status)
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    return (data || []).map(mapTaskRowToTask)
  },
}
