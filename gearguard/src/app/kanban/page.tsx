'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Equipment {
  id: string
  name: string
  category: string
  assignedMaintenanceTeamId?: string
}

interface WorkCenter {
  id: string
  name: string
  location?: string
}

interface MaintenanceRequest {
  id: string
  subject: string
  description?: string
  status: string
  type: string
  createdAt: string
  scheduledDate?: string
  assignedTechnician?: string
  equipmentId?: string
  workCenterId?: string
  urgency?: string
  category?: string
  usedPart?: string
  activationTicket?: string
  equipment?: Equipment
  workCenter?: WorkCenter
}

interface Team {
  id: string
  teamName: string
}

const STAGES = ['NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP']
const URGENCY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const CATEGORIES = ['ELECTRICAL', 'MECHANICAL', 'HYDRAULIC', 'PNEUMATIC', 'SOFTWARE', 'OTHER']
const STAGE_LABELS: Record<string, string> = {
  'NEW': 'New',
  'IN_PROGRESS': 'In Progress',
  'REPAIRED': 'Repaired',
  'SCRAP': 'Scrap'
}

const STAGE_COLORS: Record<string, string> = {
  'NEW': 'bg-blue-50 border-blue-200',
  'IN_PROGRESS': 'bg-yellow-50 border-yellow-200',
  'REPAIRED': 'bg-green-50 border-green-200',
  'SCRAP': 'bg-red-50 border-red-200'
}

// Droppable Column Component
function DroppableColumn({ stage, children, className }: { 
  stage: string
  children: React.ReactNode
  className?: string 
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      data-stage={stage}
    >
      {children}
    </div>
  )
}

// Sortable Card Component
function SortableCard({ request }: { request: MaintenanceRequest }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: request.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  // Check if overdue
  const isOverdue = request.scheduledDate && 
    new Date(request.scheduledDate) < new Date() && 
    request.status !== 'REPAIRED' && 
    request.status !== 'SCRAP'

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'LOW': return 'bg-blue-100 text-blue-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-md p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow ${
        isOverdue ? 'border-l-4 border-red-500' : ''
      }`}
    >
      {isOverdue && (
        <div className="flex items-center text-red-600 text-sm font-medium mb-2">
          <span className="mr-1">⚠️</span>
          <span>Overdue</span>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{request.subject}</h3>
        {request.urgency && (
          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
            {request.urgency}
          </span>
        )}
      </div>
      
      <div className="space-y-1 text-sm text-gray-600">
        {request.equipment && (
          <p>
            <span className="font-medium">Equipment:</span> {request.equipment?.name}
          </p>
        )}
        {request.workCenter && (
          <p>
            <span className="font-medium">Work Center:</span> {request.workCenter?.name}
          </p>
        )}
        {request.category && (
          <p>
            <span className="font-medium">Category:</span> {request.category}
          </p>
        )}
        {request.assignedTechnician && (
          <p>
            <span className="font-medium">Technician:</span> {request.assignedTechnician}
          </p>
        )}
        {request.usedPart && (
          <p>
            <span className="font-medium">Part Used:</span> {request.usedPart}
          </p>
        )}
        {request.activationTicket && (
          <p>
            <span className="font-medium">Ticket:</span> {request.activationTicket}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            request.type === 'Corrective' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {request.type}
          </span>
          {request.scheduledDate && (
            <span className="text-xs text-gray-500">
              {new Date(request.scheduledDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filterEquipment, setFilterEquipment] = useState<string | null>(null)
  const [filterTeam, setFilterTeam] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [useWorkCenter, setUseWorkCenter] = useState(false)
  
  // Form state for new request
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    type: 'Corrective',
    equipmentId: '',
    workCenterId: '',
    scheduledDate: '',
    assignedTechnician: '',
    urgency: 'MEDIUM',
    category: '',
    usedPart: '',
    activationTicket: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    fetchData()
  }, [filterEquipment, filterTeam])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      let url = '/api/requests'
      const params = new URLSearchParams()
      if (filterEquipment) params.append('equipmentId', filterEquipment.toString())
      if (filterTeam) params.append('teamId', filterTeam.toString())
      if (params.toString()) url += `?${params.toString()}`

      const [reqRes, equipRes, wcRes, teamRes] = await Promise.all([
        fetch(url),
        fetch('/api/equipment'),
        fetch('/api/work-centers'),
        fetch('/api/teams')
      ])

      const [reqData, equipData, wcData, teamData] = await Promise.all([
        reqRes.json(),
        equipRes.json(),
        wcRes.json(),
        teamRes.json()
      ])

      setRequests(reqRes.ok && Array.isArray(reqData) ? reqData : [])
      setEquipment(equipRes.ok && Array.isArray(equipData) ? equipData : [])
      setWorkCenters(wcRes.ok && Array.isArray(wcData) ? wcData : [])
      setTeams(teamRes.ok && Array.isArray(teamData) ? teamData : [])
    } catch (error) {
      console.error('Error fetching kanban data:', error)
      setRequests([])
      setEquipment([])
      setWorkCenters([])
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      // The over.id should be stage name (column id)
      const targetStage = over.id.toString()
      
      // Update request status
      try {
        const updatedRequest = await fetch(`/api/requests/${active.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStage })
        }).then(res => res.json())

        setRequests(requests.map(req => 
          req.id === active.id ? updatedRequest : req
        ))

        // Log activity
        if (updatedRequest.equipment?.assignedMaintenanceTeamId) {
          await fetch(`/api/requests/${active.id}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId: updatedRequest.equipment.assignedMaintenanceTeamId,
              action: `Status changed to ${STAGE_LABELS[targetStage]}`
            })
          })
        }
      } catch (error) {
        console.error('Error updating request status:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload: any = {
        subject: formData.subject,
        description: formData.description,
        type: formData.type,
        urgency: formData.urgency,
        scheduledDate: formData.scheduledDate || undefined,
        assignedTechnician: formData.assignedTechnician || undefined,
        category: formData.category || undefined,
        usedPart: formData.usedPart || undefined,
        activationTicket: formData.activationTicket || undefined
      }

      if (useWorkCenter) {
        payload.workCenterId = formData.workCenterId
      } else {
        payload.equipmentId = formData.equipmentId
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to create request')

      const newRequest = await response.json()
      setRequests([newRequest, ...requests])
      
      // Reset form and close dialog
      setFormData({
        subject: '',
        description: '',
        type: 'Corrective',
        equipmentId: '',
        workCenterId: '',
        scheduledDate: '',
        assignedTechnician: '',
        urgency: 'MEDIUM',
        category: '',
        usedPart: '',
        activationTicket: ''
      })
      setUseWorkCenter(false)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Failed to create request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeRequest = requests.find(r => r.id === activeId)

  // Filter requests by search query
  const filteredRequests = requests.filter(req => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      req.subject.toLowerCase().includes(query) ||
      req.equipment?.name.toLowerCase().includes(query) ||
      req.workCenter?.name.toLowerCase().includes(query) ||
      req.assignedTechnician?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600 mt-2">Manage and track maintenance workflows</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              + New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Maintenance Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Toggle between Equipment and Work Center */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="targetType"
                    value="equipment"
                    checked={!useWorkCenter}
                    onChange={() => setUseWorkCenter(false)}
                    className="mr-2"
                  />
                  Equipment
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="targetType"
                    value="workCenter"
                    checked={useWorkCenter}
                    onChange={() => setUseWorkCenter(true)}
                    className="mr-2"
                  />
                  Work Center
                </label>
              </div>

              {!useWorkCenter ? (
                <div>
                  <Label htmlFor="equipmentId">Equipment *</Label>
                  <select
                    id="equipmentId"
                    required={!useWorkCenter}
                    value={formData.equipmentId}
                    onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select equipment...</option>
                    {equipment.map(equip => (
                      <option key={equip.id} value={equip.id}>{equip.name} ({equip.category})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="workCenterId">Work Center *</Label>
                  <select
                    id="workCenterId"
                    required={useWorkCenter}
                    value={formData.workCenterId}
                    onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select work center...</option>
                    {workCenters.map(wc => (
                      <option key={wc.id} value={wc.id}>{wc.name} {wc.location ? `(${wc.location})` : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Request Type *</Label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Corrective">Corrective (Emergency)</option>
                    <option value="Preventive">Preventive (Scheduled)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency *</Label>
                  <select
                    id="urgency"
                    required
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {URGENCY_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Request Title *</Label>
                <Input
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="activationTicket">Activation Ticket</Label>
                  <Input
                    id="activationTicket"
                    value={formData.activationTicket}
                    onChange={(e) => setFormData({ ...formData, activationTicket: e.target.value })}
                    placeholder="Ticket number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTechnician">Assigned Staff</Label>
                  <Input
                    id="assignedTechnician"
                    value={formData.assignedTechnician}
                    onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                    placeholder="Enter staff/technician name"
                  />
                </div>
                <div>
                  <Label htmlFor="usedPart">Used Part</Label>
                  <Input
                    id="usedPart"
                    value={formData.usedPart}
                    onChange={(e) => setFormData({ ...formData, usedPart: e.target.value })}
                    placeholder="Part name or number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setFormData({
                      subject: '',
                      description: '',
                      type: 'Corrective',
                      equipmentId: '',
                      workCenterId: '',
                      scheduledDate: '',
                      assignedTechnician: '',
                      urgency: 'MEDIUM',
                      category: '',
                      usedPart: '',
                      activationTicket: ''
                    })
                    setUseWorkCenter(false)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Equipment</label>
            <select
              value={filterEquipment || ''}
              onChange={(e) => setFilterEquipment(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Equipment</option>
              {equipment.map(equip => (
                <option key={equip.id} value={equip.id}>{equip.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Team</label>
            <select
              value={filterTeam || ''}
              onChange={(e) => setFilterTeam(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.teamName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map(stage => {
            const stageRequests = filteredRequests.filter(r => r.status === stage)
            
            return (
              <DroppableColumn
                key={stage}
                stage={stage}
                className={`${STAGE_COLORS[stage]} rounded-lg p-4 min-h-96`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {STAGE_LABELS[stage]}
                  </h2>
                  <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                    {stageRequests.length}
                  </span>
                </div>
                
                <SortableContext
                  items={stageRequests.map(r => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {stageRequests.map(request => (
                      <SortableCard key={request.id} request={request} />
                    ))}
                    {stageRequests.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <p className="text-sm">No requests in this stage</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableColumn>
            )
          })}
        </div>

        <DragOverlay>
          {activeRequest ? (
            <div className="bg-white rounded-lg shadow-lg p-4 cursor-grabbing opacity-90">
              <h3 className="font-semibold text-gray-900 mb-2">{activeRequest.subject}</h3>
              <p className="text-sm text-gray-600">
                {activeRequest.equipment?.name || activeRequest.workCenter?.name}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
