import { useState } from 'react';
import WorkflowVisualizer from './WorkflowVisualizer';
import { EVALUATION_WORKFLOWS } from '../config/evaluationWorkflows';
import './WorkflowHelpModal.css';

function WorkflowHelpModal({ isOpen, onClose, initialWorkflow = null }) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(initialWorkflow || Object.keys(EVALUATION_WORKFLOWS)[0]);

  if (!isOpen) return null;

  return (
    <div className="workflow-help-modal-overlay" onClick={onClose}>
      <div className="workflow-help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="workflow-help-header">
          <h2>Evaluation Methods Guide</h2>
          <button className="workflow-help-close" onClick={onClose}>×</button>
        </div>

        <div className="workflow-help-body">
          {/* Workflow selector tabs */}
          <div className="workflow-tabs">
            {Object.entries(EVALUATION_WORKFLOWS).map(([key, workflow]) => (
              <button
                key={key}
                className={`workflow-tab ${selectedWorkflow === key ? 'active' : ''}`}
                onClick={() => setSelectedWorkflow(key)}
              >
                {workflow.name}
              </button>
            ))}
          </div>

          {/* Workflow visualizer */}
          <div className="workflow-content">
            <WorkflowVisualizer workflowKey={selectedWorkflow} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowHelpModal;