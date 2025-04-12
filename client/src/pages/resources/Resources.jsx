import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        // Simulate API call - replace with actual endpoint when available
        // const res = await api.get('/resources');
        
        // Temporary: Use mock data until API is ready
        const mockResources = [
          {
            id: 1,
            title: 'Philippine Data Privacy Act of 2012',
            description: 'Full text of the Republic Act 10173',
            category: 'Laws',
            url: 'https://www.privacy.gov.ph/data-privacy-act/',
            icon: 'file-text'
          },
          {
            id: 2,
            title: 'NPC Privacy Toolkit',
            description: 'Privacy toolkit for organizations',
            category: 'Guidelines',
            url: 'https://www.privacy.gov.ph/privacy-toolkit/',
            icon: 'tool'
          },
          {
            id: 3,
            title: 'Data Protection Officer Registration',
            description: 'Guidelines for registering a DPO',
            category: 'Guidelines',
            url: 'https://www.privacy.gov.ph/registration-of-data-protection-officers/',
            icon: 'user-check'
          },
          {
            id: 4,
            title: 'Privacy Impact Assessment Guide',
            description: 'How to conduct a privacy impact assessment',
            category: 'Templates',
            url: 'https://www.privacy.gov.ph/privacy-impact-assessment/',
            icon: 'clipboard'
          },
          {
            id: 5,
            title: 'Data Breach Management',
            description: 'Guidelines for handling data breaches',
            category: 'Guidelines',
            url: 'https://www.privacy.gov.ph/data-breach-management/',
            icon: 'alert-triangle'
          }
        ];

        setResources(mockResources);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(mockResources.map(resource => resource.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again later.');
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Safely filter resources - check if resources exists first
  const filteredResources = resources && resources.length > 0 
    ? (selectedCategory === 'All' 
        ? resources 
        : resources.filter(resource => resource.category === selectedCategory))
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Resources | Philippine Data Privacy Act Compliance</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold text-primary mb-8">Resources</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Resources grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.length > 0 ? (
              filteredResources.map(resource => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start mb-4">
                    <span className="bg-primary-light p-3 rounded-full text-primary mr-4">
                      <i className={`feather icon-${resource.icon}`}></i>
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{resource.title}</h3>
                      <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-600">
                        {resource.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">{resource.description}</p>
                </a>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No resources found for this category.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Resources;