import { useState, useEffect } from 'react'
import api from '../../services/api'

const RequestForm = ({ request, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    request_type: 'corrective',
    equipment_id: '',
    scheduled_date: '',
    duration: '',
    priority: 'medium',
    technician_id: '',
  })
  const [equipment, setEquipment] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInitialData()
    if (request) {
      setFormData({
        subject: request.subject || '',
        description: request.description || '',
        request_type: request.request_type || 'corrective',
        equipment_id: request.equipment_id?.id || '',
        scheduled_date: request.scheduled_date ? request.scheduled_date.split('T')[0] : '',
        duration: request.duration || '',
        priority: request.priority || 'medium',
        technician_id: request.technician_id?.id || '',
      })
    }
  }, [request])

  const fetchInitialData = async () => {
    try {
      const [equipmentRes, usersRes, stagesRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/auth/users'),
        api.get('/stages'),
      ])
      setEquipment(equipmentRes.data)
      setTechnicians(usersRes.data.filter(u => u.role === 'technician' || u.role === 'manager'))
      setStages(stagesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleEquipmentChange = async (e) => {
    const equipmentId = e.target.value
    setFormData({ ...formData, equipment_id: equipmentId })
    setError('')

    if (equipmentId) {
      try {
        const equipmentData = equipment.find(eq => eq.id === parseInt(equipmentId))
        if (equipmentData) {
          setFormData(prev => ({
            ...prev,
            equipment_id: equipmentId,
            maintenance_team_id: equipmentData.maintenance_team_id,
            category: equipmentData.category,
          }))
        }
      } catch (error) {
        console.error('Error fetching equipment details:', error)
      }
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Find the "New" stage for new requests
      const newStage = stages.find(s => s.name === 'New')
      
      const data = {
        ...formData,
        stage_id: request ? formData.stage_id : (newStage ? newStage.id : stages[0]?.id),
      }

      if (request) {
        await api.put(`/requests/${request.id}`, data)
      } else {
        await api.post('/requests', data)
      }
      onSuccess()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save request')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject *
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g., Leaking oil, Broken conveyor belt"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Provide details about the maintenance issue..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request Type *
          </label>
          <select
            name="request_type"
            value={formData.request_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
          >
            <option value="corrective">Corrective (Breakdown)</option>
            <option value="preventive">Preventive (Routine)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Equipment *
        </label>
        <select
          name="equipment_id"
          value={formData.equipment_id}
          onChange={handleEquipmentChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          required
        >
          <option value="">Select equipment</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} {eq.serial_number ? `(${eq.serial_number})` : ''}
            </option>
          ))}
        </select>
        {formData.equipment_id && (
          <p className="text-xs text-gray-500 mt-1">
            Auto-filled: {equipment.find(eq => eq.id === parseInt(formData.equipment_id))?.category || 'No category'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.request_type === 'preventive' ? 'Scheduled Date *' : 'Scheduled Date'}
          </label>
          <input
            type="date"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required={formData.request_type === 'preventive'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (hours)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="0"
            step="0.5"
            placeholder="e.g., 2.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assigned Technician
        </label>
        <select
          name="technician_id"
          value={formData.technician_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        >
          <option value="">Unassigned</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.full_name || tech.username}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : request ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default RequestForm
