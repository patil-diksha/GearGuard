'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WorkCenter {
  id: string
  name: string
  location?: string
}

interface Part {
  id: string
  name: string
  modelNo?: string
  serialNo: string
  location: string
  cost?: number
  quantity: number
  minQuantity: number
  description?: string
  workCenter?: WorkCenter
  createdAt: string
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterWorkCenter, setFilterWorkCenter] = useState<string>('')
  const [showLowStock, setShowLowStock] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    modelNo: '',
    serialNo: '',
    location: '',
    workCenterId: '',
    cost: '',
    quantity: '1',
    minQuantity: '1',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchParts()
    fetchWorkCenters()
  }, [filterWorkCenter, showLowStock])

  const fetchParts = async () => {
    try {
      setLoading(true)
      let url = '/api/parts'
      const params = new URLSearchParams()
      if (filterWorkCenter) params.append('workCenterId', filterWorkCenter)
      if (showLowStock) params.append('lowStock', 'true')
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      const data = await response.json()
      if (response.ok && Array.isArray(data)) {
        setParts(data)
      } else {
        setParts([])
      }
    } catch (error) {
      console.error('Error fetching parts:', error)
      setParts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkCenters = async () => {
    try {
      const response = await fetch('/api/work-centers')
      const data = await response.json()
      if (response.ok && Array.isArray(data)) {
        setWorkCenters(data)
      } else {
        setWorkCenters([])
      }
    } catch (error) {
      console.error('Error fetching work centers:', error)
      setWorkCenters([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          quantity: parseInt(formData.quantity),
          minQuantity: parseInt(formData.minQuantity)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create part')
      }

      await fetchParts()
      
      // Reset form and close dialog
      setFormData({
        name: '',
        modelNo: '',
        serialNo: '',
        location: '',
        workCenterId: '',
        cost: '',
        quantity: '1',
        minQuantity: '1',
        description: ''
      })
      setIsDialogOpen(false)
    } catch (error: any) {
      alert(error.message || 'Failed to create part. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStockStatus = (part: Part) => {
    if (part.quantity <= part.minQuantity) {
      return { label: 'Low Stock', color: 'bg-red-100 text-red-800' }
    } else if (part.quantity <= part.minQuantity * 2) {
      return { label: 'Warning', color: 'bg-yellow-100 text-yellow-800' }
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Parts Inventory</h1>
          <p className="text-gray-600 mt-2">Manage and track spare parts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              + Add Part
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Part</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Part Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Conveyor Belt Motor"
                  />
                </div>
                <div>
                  <Label htmlFor="modelNo">Model No.</Label>
                  <Input
                    id="modelNo"
                    value={formData.modelNo}
                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                    placeholder="e.g., M-2024-X1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serialNo">Serial Number *</Label>
                  <Input
                    id="serialNo"
                    required
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    placeholder="e.g., SN-123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Warehouse A, Shelf 3"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="workCenterId">Work Center</Label>
                <select
                  id="workCenterId"
                  value={formData.workCenterId}
                  onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select work center...</option>
                  {workCenters.map(wc => (
                    <option key={wc.id} value={wc.id}>{wc.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="minQuantity">Min Quantity *</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    min="1"
                    required
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    placeholder="Alert threshold"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the part..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setFormData({
                      name: '',
                      modelNo: '',
                      serialNo: '',
                      location: '',
                      workCenterId: '',
                      cost: '',
                      quantity: '1',
                      minQuantity: '1',
                      description: ''
                    })
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
                  {isSubmitting ? 'Adding...' : 'Add Part'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Work Center</label>
              <select
                value={filterWorkCenter}
                onChange={(e) => setFilterWorkCenter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Work Centers</option>
                {workCenters.map(wc => (
                  <option key={wc.id} value={wc.id}>{wc.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Show low stock items only</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Inventory ({parts.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          {parts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No parts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Center</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parts.map((part) => {
                    const stockStatus = getStockStatus(part)
                    return (
                      <tr key={part.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{part.name}</div>
                            {part.modelNo && <div className="text-sm text-gray-500">{part.modelNo}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.serialNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {part.workCenter?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{part.quantity}</div>
                            <div className="text-xs text-gray-500">Min: {part.minQuantity}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {part.cost ? `$${part.cost.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
