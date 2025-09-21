import React, { useState } from 'react';
import AssignmentService from '../services/AssignmentService';

function AssignmentForm({ onClose, onAssignmentCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    instructions: '',
    pdfFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const classes = [
    'B.Sc CS - I',
    'B.Sc CS - II', 
    'B.Sc CS - III',
    'B.Com - I',
    'B.Com - II',
    'B.Com - III',
    'B.A - I',
    'B.A - II',
    'B.A - III',
    'M.Sc CS - I',
    'M.Sc CS - II',
    'M.Com - I',
    'M.Com - II'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      pdfFile: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const assignmentData = {
        ...formData,
        teacherName: 'Dr. Sarah Johnson' // This should come from auth context
      };

      console.log('Creating assignment with data:', assignmentData);
      const response = await AssignmentService.createAssignment(assignmentData);
      console.log('Assignment creation response:', response);
      
      setMessage('Assignment created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        classId: '',
        dueDate: '',
        instructions: '',
        pdfFile: null
      });

      // Notify parent component
      if (onAssignmentCreated) {
        onAssignmentCreated(response.data);
      }

      // Close form after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Assignment creation error:', error);
      
      // Check if it's a JSON parsing error
      if (error.message.includes('Unexpected token') || error.message.includes('<!DOCTYPE')) {
        setMessage('Error: Server is not responding properly. Please check if the backend server is running.');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Assignment</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {message && (
                <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                  {message}
                </div>
              )}

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Assignment Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-control"
                    required
                    placeholder="e.g., Earthquake Safety Assignment"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Brief description of the assignment..."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Class *</label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="form-control"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    className="form-control"
                    rows="4"
                    placeholder="Detailed instructions for students..."
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">PDF File (Optional)</label>
                  <input
                    type="file"
                    name="pdfFile"
                    onChange={handleFileChange}
                    className="form-control"
                    accept=".pdf"
                  />
                  <div className="form-text">Upload a PDF file with additional materials or instructions</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  'Create Assignment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssignmentForm;
