import { useState, useEffect } from 'react'
import { Plus, Users } from 'lucide-react'
import api from '../services/api'
import TeamForm from '../components/teams/TeamForm'
import Modal from '../components/common/Modal'

const TeamsPage = () => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams')
      setTeams(response.data)
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setSelectedTeam(null)
    setShowModal(true)
  }

  const handleEditClick = (team) => {
    setSelectedTeam(team)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return
    
    try {
      await api.delete(`/teams/${id}`)
      fetchTeams()
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Failed to delete team')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedTeam(null)
  }

  const handleFormSuccess = () => {
    handleModalClose()
    fetchTeams()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Maintenance Teams</h1>
        <button
          onClick={handleAddClick}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{team.name}</h3>
                  </div>
                </div>
              </div>
              
              {team.description && (
                <p className="text-gray-600 text-sm mb-4">{team.description}</p>
              )}
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Users className="w-4 h-4 mr-2" />
                <span>
                  {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                </span>
              </div>

              {team.members && team.members.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {team.members.slice(0, 3).map((member) => (
                      <span key={member.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        {member.full_name || member.username}
                      </span>
                    ))}
                    {team.members.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        +{team.members.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t">
                <button
                  onClick={() => handleEditClick(team)}
                  className="flex-1 text-primary-600 hover:text-primary-800 py-1 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="flex-1 text-red-600 hover:text-red-800 py-1 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No teams yet</p>
          <p className="text-gray-400">Create your first maintenance team to get started</p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleModalClose} title={selectedTeam ? 'Edit Team' : 'Add Team'}>
        <TeamForm team={selectedTeam} onSuccess={handleFormSuccess} onCancel={handleModalClose} />
      </Modal>
    </div>
  )
}

export default TeamsPage
