import React from 'react';
import './InterventionRecommendations.css';

function InterventionRecommendations({ pillars, tract105, tract1100 }) {
  const recommendations = [
    {
      pillar: 'digital_infrastructure',
      title: 'Expand Broadband Access',
      priority: 'HIGH',
      gap: pillars.digital_infrastructure.metrics['Internet Access Score'],
      actions: [
        'Partner with ISPs to deploy last-mile fiber infrastructure',
        'Publicize Affordable Connectivity Program (ACP) through schools and churches',
        'Establish digital literacy classes at libraries and community centers',
        'Launch device lending programs for tablets and laptops'
      ],
      impact: 'Could improve IGS by 8-12 points based on Tract 1100 performance',
      timeline: '12-18 months',
      cost: '$$'
    },
    {
      pillar: 'entrepreneurship',
      title: 'Support Small Business Creation',
      priority: 'HIGH',
      gap: pillars.entrepreneurship.metrics['Minority/Women Owned Businesses Score'],
      actions: [
        'Partner with CDFIs to offer micro-loans and grants',
        'Create business incubator with co-working space',
        'Provide training in business planning and bookkeeping',
        'Establish procurement set-asides for local small businesses'
      ],
      impact: 'Could improve IGS by 5-8 points and create 15-20 new businesses',
      timeline: '9-12 months',
      cost: '$$'
    },
    {
      pillar: 'housing_transportation',
      title: 'Improve Housing Affordability',
      priority: 'HIGH',
      gap: pillars.housing_transportation.metrics['Affordable Housing Score'],
      actions: [
        'Leverage Low-Income Housing Tax Credits for new construction',
        'Renovate vacant properties into mixed-income housing',
        'Implement rent-to-own programs for low-income families',
        'Develop county-wide transit system with job center connections'
      ],
      impact: 'Could improve IGS by 6-10 points and reduce housing cost burden',
      timeline: '18-24 months',
      cost: '$$$'
    },
    {
      pillar: 'workforce_development',
      title: 'Sector-Aligned Training Programs',
      priority: 'MEDIUM',
      gap: pillars.workforce_development.metrics['Labor Market Engagement Index Score'],
      actions: [
        'Create apprenticeships in manufacturing and healthcare',
        'Expand GED completion and adult education programs',
        'Offer childcare vouchers to enable training participation',
        'Partner with Honda Manufacturing and local hospitals for curriculum design'
      ],
      impact: 'Could improve IGS by 4-7 points and increase median income',
      timeline: '12-15 months',
      cost: '$$'
    }
  ];

  const filteredRecommendations = recommendations.filter(r => r.gap !== null && Math.abs(r.gap) > 5);

  return (
    <div className="intervention-recommendations">
      <div className="recommendations-header">
        <p className="header-subtitle">
          Evidence-based interventions to raise Tract 105 IGS from {tract105.igs.latest} to above 45
        </p>
      </div>

      <div className="recommendations-grid">
        {filteredRecommendations.map((rec, index) => (
          <div key={index} className={`recommendation-card priority-${rec.priority.toLowerCase()}`}>
            <div className="recommendation-header">
              <div className="header-top">
                <h3>{rec.title}</h3>
                <span className={`priority-badge priority-${rec.priority.toLowerCase()}`}>
                  {rec.priority}
                </span>
              </div>
              <div className="gap-info">
                Current gap: <strong>{Math.abs(rec.gap).toFixed(1)} points</strong>
              </div>
            </div>

            <div className="recommendation-body">
              <div className="actions-section">
                <h4>Key Actions</h4>
                <ul>
                  {rec.actions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="recommendation-footer">
                <div className="impact-box">
                  <span className="label">Expected Impact</span>
                  <span className="value">{rec.impact}</span>
                </div>
                <div className="meta-info">
                  <span className="timeline">Timeline: {rec.timeline}</span>
                  <span className="cost">Investment: {rec.cost}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="implementation-note">
        <h4>Implementation Strategy</h4>
        <p>
          Prioritize high-impact interventions in parallel. Begin with digital infrastructure 
          (foundation for other programs) alongside entrepreneurship support. Coordinate with 
          federal funding sources: BEAD for broadband, ARPA for community programs, WIOA for 
          workforce training, and CDBG for housing initiatives.
        </p>
      </div>
    </div>
  );
}

export default InterventionRecommendations;

