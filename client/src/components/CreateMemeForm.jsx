import { useState } from 'react';
import PropTypes from 'prop-types';

const CreateMemeForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting meme:', formData);
      
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (!formData.image_url.trim()) {
        throw new Error('Image URL is required');
      }

      if (formData.tags.length === 0) {
        throw new Error('At least one tag is required');
      }

      await onSubmit({
        title: formData.title.trim(),
        image_url: formData.image_url.trim(),
        tags: formData.tags
      });

      // Reset form on success
      setFormData({ title: '', image_url: '', tags: [] });
      setTagInput('');
      
    } catch (err) {
      console.error('Error creating meme:', err);
      setError(err.message || 'Failed to create meme');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    
    if (!tag) return;
    
    if (tag.includes(' ')) {
      setError('Tags cannot contain spaces');
      return;
    }
    
    if (formData.tags.includes(tag)) {
      setError('Tag already exists');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    setTagInput('');
    setError(null);
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div style={{ 
      background: '#1a1a1a',
      padding: '1rem',
      borderRadius: '0.5rem',
      border: '2px solid #4a9eff'
    }}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '0.5rem',
            marginBottom: '1rem',
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid #ff0000',
            borderRadius: '0.25rem',
            color: '#ff0000',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Title Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="title"
            style={{
              display: 'block',
              color: '#4a9eff',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}
          >
            Title <span style={{ color: '#ff69b4' }}>*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#2a2a2a',
              border: '1px solid #4a9eff',
              borderRadius: '0.25rem',
              color: 'white'
            }}
            placeholder="Enter your meme title..."
          />
        </div>

        {/* Image URL Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="image_url"
            style={{
              display: 'block',
              color: '#4a9eff',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}
          >
            Image URL <span style={{ color: '#ff69b4' }}>*</span>
          </label>
          <input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, image_url: e.target.value }));
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#2a2a2a',
              border: '1px solid #4a9eff',
              borderRadius: '0.25rem',
              color: 'white'
            }}
            placeholder="https://example.com/your-meme.jpg"
          />
        </div>

        {/* Tags Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            color: '#4a9eff',
            fontSize: '0.875rem',
            marginBottom: '0.5rem'
          }}>
            Tags <span style={{ color: '#ff69b4' }}>*</span>
          </label>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setError(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: '#2a2a2a',
                  border: '1px solid #4a9eff',
                  borderRadius: '0.25rem',
                  color: 'white'
                }}
                placeholder="Enter a tag and press Enter or Add"
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#4a9eff',
                  border: 'none',
                  borderRadius: '0.25rem',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#666',
              marginTop: '0.25rem' 
            }}>
              Press Enter or click Add to add a tag
            </p>
          </div>

          {/* Tags Display */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {formData.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: 'transparent',
                  border: '1px solid #ff69b4',
                  borderRadius: '9999px',
                  color: '#ff69b4',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff69b4',
                    cursor: 'pointer',
                    padding: '0 0.25rem',
                    fontSize: '1rem',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: isSubmitting ? '#666' : '#4a9eff',
            border: 'none',
            borderRadius: '0.25rem',
            color: 'white',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {isSubmitting ? 'Creating Meme...' : 'Create Meme'}
        </button>
      </form>
    </div>
  );
};

CreateMemeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default CreateMemeForm; 