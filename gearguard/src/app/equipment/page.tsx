'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useState } from 'react'

type Equipment = {
  id: string
  name: string
  serialNumber: string
  department: string | null
  owner: string | null
  location: string
  isScrapped: boolean
  assignedMaintenanceTeam: {
    id: string
    name: string
  } | null
  maintenanceRequests: Array<{
    id: string
    status: string
  }>
}

export default function EquipmentPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    location: '',
    department: '',
    owner: '',
    purchaseDate: '',
    warrantyEnd: ''
  })

  const queryClient = useQueryClient()

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await fetch('/api/equipment')
      if (!response.ok) throw new Error('Failed to fetch equipment')
      return response.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create equipment')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      setIsCreateDialogOpen(false)
      setFormData({
        name: '',
        serialNumber: '',
        location: '',
        department: '',
        owner: '',
        purchaseDate: '',
        warrantyEnd: ''
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
            <p className="text-sm text-gray-500">Manage your assets</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create Equipment</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Equipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Equipment Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g., Engineering"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner">Owner</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warrantyEnd">Warranty End Date</Label>
                    <Input
                      id="warrantyEnd"
                      type="date"
                      value={formData.warrantyEnd}
                      onChange={(e) => setFormData({ ...formData, warrantyEnd: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create Equipment'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Equipment Grid */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((eq: Equipment) => {
            const openRequests = eq.maintenanceRequests.filter(
              (r) => !['REPAIRED', 'SCRAP'].includes(r.status)
            ).length

            return (
              <Link key={eq.id} href={`/equipment/${eq.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{eq.name}</CardTitle>
                      {eq.isScrapped && (
                        <Badge variant="destructive" className="ml-2">
                          Scrapped
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{eq.serialNumber}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{eq.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {eq.department ? 'Department' : 'Owner'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {eq.department || eq.owner || 'N/A'}
                      </p>
                    </div>
                    {eq.assignedMaintenanceTeam && (
                      <div>
                        <p className="text-sm font-medium">Assigned Team</p>
                        <p className="text-sm text-gray-600">
                          {eq.assignedMaintenanceTeam.name}
                        </p>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Maintenance ({openRequests})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
