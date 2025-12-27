import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { AlertTriangle, Clock, User, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'

const KanbanBoard = ({ requests, stages, onEdit, onDelete, onStageChange }) => {
  const [showMenu, setShowMenu] = useState(null)

  const groupedRequests = stages.map(stage => ({
    ...stage,
    requests: requests.filter(r => r.stage_id.id === stage.id),
  }))

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const requestId = result.draggableId
    const newStageId = groupedRequests[result.destination.droppableId].id

    onStageChange(requestId, newStageId)
  }

  const toggleMenu = (requestId, e) => {
    e.stopPropagation()
    setShowMenu(showMenu === requestId ? null : requestId)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {groupedRequests.map((stage, index) => (
          <div key={stage.id} className="bg-gray-100 rounded-lg flex flex-col min-h-[500px]">
            <div className="p-4 bg-gray-200 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {stage.requests.length}
                </span>
              </div>
            </div>
            
            <Droppable droppableId={index.toString()}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="kanban-column flex-1 p-3 overflow-y-auto space-y-3"
                >
                  {stage.requests.map((request, reqIndex) => (
                    <Draggable
                      key={request.id}
                      draggableId={request.id.toString()}
                      index={reqIndex}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer relative"
                          onClick={() => onEdit(request)}
                        >
                          {/* Overdue Indicator */}
                          {request.is_overdue && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 rounded-t-lg" />
                          )}

                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-800 text-sm flex-1">
                              {request.subject}
                            </h4>
                            <button
                              onClick={(e) => toggleMenu(request.id, e)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Dropdown Menu */}
                          {showMenu === request.id && (
                            <div className="absolute right-2 top-8 bg-white shadow-lg rounded-lg py-1 z-10 border">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEdit(request)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(request.id)
                                  setShowMenu(null)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}

                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {request.description || 'No description'}
                          </p>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`} />
                              <span className="text-gray-600 capitalize">{request.request_type}</span>
                            </div>

                            <div className={`flex items-center space-x-1 ${request.is_overdue ? 'text-red-600' : 'text-gray-500'}`}>
                              {request.is_overdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              <span>
                                {request.scheduled_date 
                                  ? format(new Date(request.scheduled_date), 'MMM d')
                                  : 'No date'
                                }
                              </span>
                            </div>
                          </div>

                          {/* Technician */}
                          {request.technician_id && (
                            <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-primary-600" />
                              </div>
                              <span className="text-xs text-gray-600">
                                {request.technician_id.full_name || request.technician_id.username}
                              </span>
                            </div>
                          )}

                          {/* Equipment */}
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Equipment:</span> {request.equipment_id.name}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}

export default KanbanBoard
