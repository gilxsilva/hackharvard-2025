import { useState, useRef } from 'react';
import { Upload, FileText, X, Calendar, CheckCircle } from 'lucide-react';

export default function SyllabusUpload({ onSyllabusProcessed }) {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setSuccess(false);
      } else {
        alert('Please upload a PDF, DOCX, or TXT file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful processing
      const mockEvents = [
        {
          title: 'CS 101 - Introduction to Programming',
          date: '2025-01-15',
          time: '10:00',
          type: 'class',
          location: 'Science Building Room 201'
        },
        {
          title: 'CS 101 - Midterm Exam',
          date: '2025-03-15',
          time: '10:00',
          type: 'exam',
          location: 'Science Building Room 201'
        }
      ];

      setSuccess(true);
      onSyllabusProcessed?.(mockEvents);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Upload Syllabus</h3>
      </div>

      {!file ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drop your syllabus here or click to browse</p>
          <p className="text-sm text-gray-500">Supports PDF, DOCX, and TXT files</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-800">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-1 text-gray-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">Syllabus processed successfully! Calendar events have been created.</span>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing Syllabus...' : 'Generate Calendar Events'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}