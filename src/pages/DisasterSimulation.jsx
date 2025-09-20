import React from 'react';
import DisasterPreparednessApp from '../components/DisasterPreparednessApp';

function DisasterSimulation() {
  return (
    <div className="py-4 disaster-simulation">


      {/* Main Simulation Component */}
      <DisasterPreparednessApp />

      {/* Additional Information */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-info-circle me-2"></i>
                About Disaster Preparedness Training
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <h6>🌍 Earthquake Simulation</h6>
                  <ul className="small">
                    <li>Learn Drop, Cover, and Hold techniques</li>
                    <li>Practice safe evacuation procedures</li>
                    <li>Identify safe zones during emergencies</li>
                    <li>Understand post-earthquake safety measures</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>🔥 Fire Drill Training</h6>
                  <ul className="small">
                    <li>Test your reaction time under pressure</li>
                    <li>Learn proper fire evacuation procedures</li>
                    <li>Practice quick decision-making skills</li>
                    <li>Develop emergency response confidence</li>
                  </ul>
                </div>
              </div>
              <div className="alert alert-info mt-3">
                <i className="bi bi-lightbulb me-2"></i>
                <strong>Pro Tip:</strong> Regular practice with these simulations helps build muscle memory for real emergency situations. 
                The more you practice, the better prepared you'll be when it matters most!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisasterSimulation;
