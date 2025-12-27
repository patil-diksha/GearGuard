import { useState, useEffect } from 'react'
import { Plus, Search, Wrench, AlertCircle } from 'lucide-react'
import api from '../services/api'
import EquipmentForm from '../components/equipment/EquipmentForm'
import Modal from '../components/common/Modal'

const EquipmentPage = () => {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment')
      setEquipment(response.data)
      setStats({
        total: response.data.length,
        active: response.data.filter(e => e.is_active).length,
        inactive: response.data.filter(e => !e.is_active).length,
      })
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setSelectedEquipment(null)
    setShowModal(true)
  }

  const handleEditClick = (equip) => {
    setSelectedEquipment(equip)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return
    
    try {
      await api.delete(`/equipment/${id}`)
      fetchEquipment()
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Failed to delete equipment')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedEquipment(null)
  }

  const handleFormSuccess = () => {
    handleModalClose()
    fetchEquipment()
  }

  const filteredEquipment = equipment.filter(equip =>
    equip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equip.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Equipment</h1>
        <button
          onClick={handleAddClick}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Wrench className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inactive/Scrap</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search equipment by name or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEquipment.map((equip) => (
              <tr key={equip.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{equip.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{equip.serial_number || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{equip.category || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{equip.location || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    equip.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {equip.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEditClick(equip)}
                    className="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(equip.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredEquipment.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No equipment found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={handleModalClose} title={selectedEquipment ? 'Edit Equipment' : 'Add Equipment'}>
        <EquipmentForm equipment={selectedEquipment} onSuccess={handleFormSuccess} onCancel={handleModalClose} />
      </Modal>
    </div>
  )
}

export default EquipmentPage
