import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Static resources with external website links instead of file downloads
  const staticResources = [
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
  ];
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/resources');
        setResources(res.data.data);
        setLoading(false);
      } catch (err) {
        console.log('Using static resources instead of API');
        // Use static resources as fallback
        setResources(staticResources);
        setLoading(false);
      }
    };
    
    fetchResources();
  }, []);
  
  if (loading) {
    return <div className="text-center py-12">Loading resources...</div>;
  }
  
  // Categorize resources
  const templates = resources.filter(r => r.category === 'template');
  const guides = resources.filter(r => r.category === 'guide');
  const forms = resources.filter(r => r.category === 'form');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">DPA Resources</h1>
      
      <div className="compliance-section px-6 py-8">
        <h2 className="text-2xl font-bold mb-4">Philippine Data Privacy Act Resources</h2>
        <p className="text-lg mb-4">
          These official resources from the National Privacy Commission will help your organization 
          comply with PhilDPA requirements. Access guidelines, templates, and official forms.
        </p>
      </div>
      
      <div className="mb-8 mt-10">
        <h2 className="text-2xl font-bold mb-4">Templates & Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.length > 0 ? (
            templates.map(resource => (
              <div key={resource._id} className="privacy-card-compliance">
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="mb-4 text-gray-600">{resource.description}</p>
                <span className="compliance-badge mb-3">Official Resource</span>
                <a
                  href={resource.externalUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-compliance block mt-4 text-center"
                >
                  Visit Website
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No templates available.</p>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Official Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.length > 0 ? (
            guides.map(resource => (
              <div key={resource._id} className="privacy-card-security">
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="mb-4 text-gray-600">{resource.description}</p>
                <span className="dpa-badge mb-3">NPC Guide</span>
                <a
                  href={resource.externalUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-security block mt-4 text-center"
                >
                  Access Guide
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No guides available.</p>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Registration & Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.length > 0 ? (
            forms.map(resource => (
              <div key={resource._id} className="privacy-card-warning">
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="mb-4 text-gray-600">{resource.description}</p>
                <span className="warning-badge mb-3">Official Form</span>
                <a
                  href={resource.externalUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-warning block mt-4 text-center"
                >
                  Access Form
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No forms available.</p>
          )}
        </div>
      </div>
      
      <div className="mt-12 data-protection-box">
        <h2 className="text-2xl font-bold mb-4">Key PhilDPA References</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <a 
              href="https://www.privacy.gov.ph/data-privacy-act/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Data Privacy Act of 2012 (RA 10173) - Full Text
            </a>
          </li>
          <li>
            <a 
              href="https://www.privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Implementing Rules and Regulations (IRR)
            </a>
          </li>
          <li>
            <a 
              href="https://www.privacy.gov.ph/memorandum-circulars/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NPC Circulars and Issuances
            </a>
          </li>
          <li>
            <a 
              href="https://www.privacy.gov.ph/advisories/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NPC Advisories
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Resources;