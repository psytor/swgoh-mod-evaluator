// src/components/WorkflowManager.jsx
// Component for managing and creating custom workflows

import { useState, useEffect } from 'react';
import { EVALUATION_WORKFLOWS } from '../config/evaluationWorkflows';
import './WorkflowManager.css';

function WorkflowManager({ onWorkflowChange, currentWorkflow }) {
  const [customWorkflows, setCustomWorkflows] = useState(() => {
    const saved = localStorage.getItem('swgoh_custom_workflows');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Get all available workflows (built-in + custom)
  const allWorkflows = {
    ...EVALUATION_WORKFLOWS,
    ...customWorkflows
  };

  const saveCustomWorkflows = (workflows) => {
    setCustomWorkflows(workflows);
    localStorage.setItem('swgoh_custom_workflows', JSON.stringify(workflows));
  };

  const createNewWorkflow = () => {
    const newWorkflow = {
      name: "Custom Workflow",
      description: "My custom evaluation rules",
      dot_5: {
        grey: {
          level_1: [
            { check: "needs_leveling", result: "LV", target: 9 }
          ],
          level_9: [
            { check: "speed_threshold", params: { any: true }, result: "K" },
            { check: "default", result: "S" }
          ],
          level_12: [
            { check: "speed_threshold", params: { any: true }, result: "K" },
            { check: "default", result: "S" }
          ]
        }
        // User can add more tiers
      },
      dot_6: {
        // User can configure 6-dot rules
      }
    };

    const workflowKey = `custom_${Date.now()}`;
    setEditingWorkflow({ key: workflowKey, workflow: newWorkflow });
    setShowEditor(true);
  };

  const deleteWorkflow = (key) => {
    if (window.confirm('Delete this workflow?')) {
      const updated = { ...customWorkflows };
      delete updated[key];
      saveCustomWorkflows(updated);
      
      // If deleting current workflow, switch to basic
      if (currentWorkflow === key) {
        onWorkflowChange('basic');
      }
    }
  };

  return (
    <div className="workflow-manager">
      <div className="workflow-selector">
        <label>Evaluation Method:</label>
        <select 
          value={currentWorkflow} 
          onChange={(e) => onWorkflowChange(e.target.value)}
          className="workflow-dropdown"
        >
          <optgroup label="Built-in Methods">
            {Object.entries(EVALUATION_WORKFLOWS).map(([key, workflow]) => (
              <option key={key} value={key}>
                {workflow.name}
              </option>
            ))}
          </optgroup>
          
          {Object.keys(customWorkflows).length > 0 && (
            <optgroup label="Custom Methods">
              {Object.entries(customWorkflows).map(([key, workflow]) => (
                <option key={key} value={key}>
                  {workflow.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        
        <button 
          className="new-workflow-btn"
          onClick={createNewWorkflow}
          title="Create custom workflow"
        >
          + New
        </button>
      </div>

      {/* Show description of current workflow */}
      {allWorkflows[currentWorkflow] && (
        <div className="workflow-description">
          {allWorkflows[currentWorkflow].description}
          {currentWorkflow.startsWith('custom_') && (
            <button 
              className="edit-workflow-btn"
              onClick={() => {
                setEditingWorkflow({ 
                  key: currentWorkflow, 
                  workflow: customWorkflows[currentWorkflow] 
                });
                setShowEditor(true);
              }}
            >
              Edit
            </button>
          )}
        </div>
      )}

      {/* Simple workflow editor modal */}
      {showEditor && editingWorkflow && (
        <WorkflowEditor
          workflow={editingWorkflow.workflow}
          workflowKey={editingWorkflow.key}
          onSave={(key, workflow) => {
            const updated = { ...customWorkflows, [key]: workflow };
            saveCustomWorkflows(updated);
            setShowEditor(false);
            onWorkflowChange(key);
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

// Simple workflow editor component
function WorkflowEditor({ workflow, workflowKey, onSave, onCancel }) {
  const [editedWorkflow, setEditedWorkflow] = useState(JSON.parse(JSON.stringify(workflow)));
  
  // Simplified editor - in a real app this would be more sophisticated
  return (
    <div className="workflow-editor-modal">
      <div className="workflow-editor-content">
        <h2>Edit Workflow</h2>
        
        <div className="editor-field">
          <label>Name:</label>
          <input 
            type="text" 
            value={editedWorkflow.name}
            onChange={(e) => setEditedWorkflow({
              ...editedWorkflow,
              name: e.target.value
            })}
          />
        </div>

        <div className="editor-field">
          <label>Description:</label>
          <textarea 
            value={editedWorkflow.description}
            onChange={(e) => setEditedWorkflow({
              ...editedWorkflow,
              description: e.target.value
            })}
          />
        </div>

        <div className="editor-note">
          Full workflow editing coming soon! For now, you can:
          <ul>
            <li>Copy an existing workflow as a starting point</li>
            <li>Edit the JSON directly in browser DevTools</li>
            <li>Import/Export workflows</li>
          </ul>
        </div>

        <div className="editor-actions">
          <button onClick={() => onSave(workflowKey, editedWorkflow)}>
            Save
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowManager;