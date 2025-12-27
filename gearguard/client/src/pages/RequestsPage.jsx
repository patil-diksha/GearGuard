import { useState, useEffect } from 'react'
import { Plus, Calendar as CalendarIcon, LayoutGrid } from 'lucide-react'
import api from '../services/api'
import RequestForm from '../components/requests/RequestForm'
import KanbanBoard from '../components/requests/KanbanBoard'
import CalendarView from '../components/requests/CalendarView'
import Modal from '../components/common/Modal'

const RequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'calendar'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [requestsRes, stagesRes] = await Promise.all([
        api.get('/requests'),
        api.get('/stages'),
      ])
      setRequests(requestsRes.data)
      setStages(stagesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setSelectedRequest(null)
    setShowModal(true)
  }

  const handleEditClick = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return
    
    try {
      await api.delete(`/requests/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('Failed to delete request')
    }
  }

  const handleStageChange = async (requestId, newStageId) => {
    try {
      await api.patch(`/requests/${requestId}/stage`, { stage_id: newStageId })
      fetchData()
    } catch (error) {
      console.error('Error updating stage:', error)
      alert('Failed to update stage')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedRequest(null)
  }

  const handleFormSuccess = () => {
    handleModalClose()
    fetchData()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Maintenance Requests</h1>
        <div className="flex space-x-3">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                viewMode === 'kanban' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                viewMode === 'calendar' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* View Mode */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          requests={requests}
          stages={stages}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onStageChange={handleStageChange}
        />
      ) : (
        <CalendarView
          requests={requests}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}

      <Modal isOpen={showModal} onClose={handleModalClose} title={selectedRequest ? 'Edit Request' : 'New Request'}>
        <RequestForm request={selectedRequest} onSuccess={handleFormSuccess} onCancel={handleModalClose} />
      </Modal>
    </div>
  )
}

export default RequestsPage
