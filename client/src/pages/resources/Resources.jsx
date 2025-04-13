import React, { useEffect, useState, useMemo } from 'react';
import api from '../../utils/api'; // Make sure this path is correct

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  // Wrap staticResources in useMemo to prevent recreation on every render
  const staticResources = useMemo(() => [
    {
      _id: 'template1',
      title: 'Privacy Policy Guidelines',
      description: 'Official guidelines for creating your organization\'s privacy policy in compliance with PhilDPA requirements.',
      category: 'template',
      externalUrl: 'https://www.privacy.gov.ph/privacy-policy-templates/'
    },
    {
      _id: 'template2',
      title: 'Data Sharing Agreement Guidelines',
      description: 'NPC guidance on creating proper data sharing agreements as required by the Philippine Data Privacy Act.',
      category: 'template',
      externalUrl: 'https://www.privacy.gov.ph/data-sharing-agreement/'
    },
    {
      _id: 'guide1',
      title: 'DPO Registration Guidelines',
      description: 'Official instructions on appointing and registering a Data Protection Officer with the NPC.',
      category: 'guide',
      externalUrl: 'https://www.privacy.gov.ph/registration-of-data-protection-officers/'
    },
    {
      _id: 'guide2',
      title: 'Personal Data Breach Management',
      description: 'NPC guidelines on creating and implementing a data breach response protocol.',
      category: 'guide',
      externalUrl: 'https://www.privacy.gov.ph/memorandum-circulars/npc-circular-16-03-personal-data-breach-management/'
    },
    {
      _id: 'form1',
      title: 'NPC Complaints Form',
      description: 'Official form for filing complaints related to data privacy violations.',
      category: 'form',
      externalUrl: 'https://www.privacy.gov.ph/complaints-assistance/'
    },
    {
      _id: 'form2',
      title: 'Registration of Data Processing Systems',
      description: 'Register your data processing systems with the National Privacy Commission.',
      category: 'form',
      externalUrl: 'https://www.privacy.gov.ph/registration-of-data-processing-systems/'
    }
  ], []); // Empty dependency array means this only runs once
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Try to fetch from API
        const res = await api.get('/resources');
        if (res.data && res.data.data) {
          setResources(res.data.data);
          setLoading(false);
        } else {
          // Fallback to static if API response doesn't have expected format
         
          setResources(staticResources);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        // Use static resources as fallback
       
        setResources(staticResources);
        setFetchError(true);
        setLoading(false);
      }
    };
    
    // Try API, but don't wait too long
    const timeoutId = setTimeout(() => {
      if (loading) {
       
        setResources(staticResources);
        setLoading(false);
      }
    }, 3000); // 3 second timeout
    
    fetchResources();
    
    // Clean up timeout
    return () => clearTimeout(timeoutId);
  }, [staticResources, loading]);
  
  // If still loading after timeout, use static resources
  if (loading) {
    return <div className="text-center py-12">Loading resources...</div>;
  }
  
  // Categorize resources - safely handle empty arrays
  const templates = resources ? resources.filter(r => r.category === 'template') : [];
  const guides = resources ? resources.filter(r => r.category === 'guide') : [];
  const forms = resources ? resources.filter(r => r.category === 'form') : [];
  
  // Resource card component for DRY rendering
  const ResourceCard = ({ resource }) => (
    <a 
      href={resource.externalUrl} 
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
    >
      <h3 className="text-xl font-semibold mb-2 text-primary">{resource.title}</h3>
      <p className="text-gray-600">{resource.description}</p>
      <div className="mt-4 text-sm text-blue-600 hover:underline">
        View Resource →
      </div>
    </a>
  );
  
  // Category section component for DRY rendering
  const CategorySection = ({ title, resources, icon }) => {
    if (!resources || resources.length === 0) return null;
    
    return (
      <div className="my-8">
        <div className="flex items-center mb-4">
          {icon && <span className="mr-2">{icon}</span>}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">DPA Resources</h1>
      
      {fetchError && (
        <div className="mb-4 text-sm text-gray-600 italic">
          Using cached resources (API connection unavailable)
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg shadow px-6 py-8 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary">Philippine Data Privacy Act Resources</h2>
        <p className="text-lg mb-4">
          These official resources from the National Privacy Commission will help your organization 
          comply with PhilDPA requirements. Access guidelines, templates, and official forms.
        </p>
      </div>
      
      {/* Display resources by category */}
      <CategorySection 
        title="Templates & Guidelines" 
        resources={templates} 
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
      />
      
      <CategorySection 
        title="Official Guides" 
        resources={guides} 
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} 
      />
      
      <CategorySection 
        title="Forms & Registration" 
        resources={forms} 
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} 
      />
      
      {/* Display message if no resources at all */}
      {(!templates.length && !guides.length && !forms.length) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg text-gray-600">No resources available at this time.</p>
          <p className="text-gray-500 mt-2">Please check back later or contact support.</p>
        </div>
      )}
      
      {/* Additional help section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Need Further Assistance?</h2>
        <p className="text-gray-600">
          If you need more specific resources or have questions about PhilDPA compliance,
          please contact our support team or the National Privacy Commission directly.
        </p>
        <div className="mt-4">
          <a 
            href="https://www.privacy.gov.ph/contact-us/" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            Contact NPC
          </a>
        </div>
      </div>
    </div>
  );
};

export default Resources;