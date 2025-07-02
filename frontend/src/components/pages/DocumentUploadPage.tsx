import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ArrowLeft, Upload, FileText, Download, Trash2, File } from 'lucide-react'
import { documentAPI, handleApiError } from '../../services/api'

interface DocumentUploadPageProps {
  onBack: () => void
  tripId?: string
}

export function DocumentUploadPage({ onBack, tripId }: DocumentUploadPageProps) {
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const mockDocuments = [
    {
      id: '1',
      filename: 'consent_form.pdf',
      file_type: 'application/pdf',
      file_size: 245760,
      uploaded_by: 'John Doe',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      filename: 'medical_release.pdf',
      file_type: 'application/pdf',
      file_size: 189440,
      uploaded_by: 'Jane Smith',
      created_at: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      filename: 'travel_itinerary.docx',
      file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      file_size: 98304,
      uploaded_by: 'Admin',
      created_at: '2024-01-14T16:45:00Z'
    }
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !tripId) {
      alert('Please select a file and ensure a trip is selected')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await documentAPI.uploadDocument(tripId, selectedFile)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        alert('Document uploaded successfully!')
        setSelectedFile(null)
        setUploadProgress(0)
        setLoading(false)
      }, 500)
    } catch (error) {
      setLoading(false)
      setUploadProgress(0)
      handleApiError(error, 'upload document')
    }
  }

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const blob = await documentAPI.downloadDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      handleApiError(error, 'download document')
    }
  }

  const handleDelete = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await documentAPI.deleteDocument(documentId)
        alert('Document deleted successfully!')
      } catch (error) {
        handleApiError(error, 'delete document')
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (fileType.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />
    if (fileType.includes('image')) return <File className="h-4 w-4 text-green-500" />
    return <File className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Upload and manage trip-related documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Document</span>
            </CardTitle>
            <CardDescription>
              Upload consent forms, medical releases, and other trip documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document">Select Document</Label>
              <Input
                id="document"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="transport-button-primary"
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Trip Documents</span>
            </CardTitle>
            <CardDescription>
              View and manage uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(doc.file_type)}
                    <div>
                      <p className="text-sm font-medium">{doc.filename}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.file_size)} • Uploaded by {doc.uploaded_by}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.id, doc.filename)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {mockDocuments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm">Upload your first document to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
