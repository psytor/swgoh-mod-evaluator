import { useState } from 'react';
import { EVALUATION_WORKFLOWS, TIER_KEYS } from '../config/evaluationWorkflows';
import workflowConfig from '../config/workflowDescriptions.json';
import './WorkflowVisualizer.css';

function WorkflowVisualizer({ workflowKey }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [config] = useState(workflowConfig);
  
  const workflow = EVALUATION_WORKFLOWS[workflowKey];
  if (!workflow) return null;

  // Generic template replacement function
  const replaceTemplate = (template, values) => {
    return template.replace(/{([^}]+)}/g, (match, path) => {
      // Handle nested paths like params.stat
      const keys = path.split('.');
      let value = values;
      
      for (const key of keys) {
        value = value?.[key];
      }
      
      // Handle special display name lookups
      if (path.includes('.stat') && value && config.statDisplayNames[value]) {
        return config.statDisplayNames[value];
      }
      
      return value !== undefined ? value : match;
    });
  };

  // Generic condition evaluator
  const evaluateCondition = (condition, data) => {
    if (condition === "always") return true;
    
    // Recursively check all conditions
    for (const [key, expectedValue] of Object.entries(condition)) {
      const actualValue = key.includes('.') 
        ? key.split('.').reduce((obj, k) => obj?.[k], data)
        : data[key];
      
      if (expectedValue === "_exists") {
        if (actualValue === undefined || actualValue === null) return false;
      } else if (expectedValue === "_notExists") {
        if (actualValue !== undefined && actualValue !== null) return false;
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }
    
    return true;
  };

  // Process value transformations (like array joining)
  const processValues = (check, processors) => {
    const processedValues = {};
    
    for (const [key, processor] of Object.entries(processors || {})) {
      if (processor.type === 'array' && processor.source) {
        // Get the array from the source path
        const sourceArray = processor.source.split('.').reduce((obj, k) => obj?.[k], check);
        
        if (Array.isArray(sourceArray)) {
          // Transform each item using the template
          const items = sourceArray.map(item => 
            replaceTemplate(processor.itemTemplate, item)
          );
          processedValues[key] = items.join(processor.joiner || ', ');
        }
      }
    }
    
    return processedValues;
  };

  // Completely generic renderCheck function
  const renderCheck = (check) => {
    const checkConfig = config.checks[check.check];
    if (!checkConfig) {
      console.warn(`No configuration found for check type: ${check.check}`);
      return `Unknown check: ${check.check}`;
    }

    // Build the data object for condition evaluation
    const data = {
      hasTarget: !!check.target,
      hasResult: !!check.result,
      target: check.target,
      result: check.result,
      resultText: config.resultTexts[check.result] || check.result,
      params: check.params || {}
    };

    // Process any value transformations defined in the config
    const processedValues = processValues(check, checkConfig.logic?.valueProcessors);

    // Merge all values for template replacement
    const allValues = {
      ...data,
      ...processedValues
    };

    // Find the first matching condition
    const matchingCondition = checkConfig.logic.conditions.find(cond => 
      evaluateCondition(cond.if, data)
    );

    if (!matchingCondition) {
      console.warn(`No matching condition found for ${check.check}`, data);
      return `${check.check}: No matching condition`;
    }

    return replaceTemplate(matchingCondition.template, allValues);
  };

  // Get tooltip for a check type
  const getTooltip = (checkType) => {
    return config.tooltips[checkType] || '';
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const renderLevelRules = (rules, level) => {
    return (
      <div className="level-rules">
        <h5>Level {level}:</h5>
        <ol className="rules-list">
          {rules.map((check, idx) => (
            <li 
              key={idx} 
              className={`rule-item result-${check.result?.toLowerCase()}`}
              title={getTooltip(check.check)}
            >
              {renderCheck(check)}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const renderTierRules = (tierRules, tierName) => {
    const levels = Object.keys(tierRules)
      .sort((a, b) => {
        const aNum = parseInt(a.replace('level_', ''));
        const bNum = parseInt(b.replace('level_', ''));
        return aNum - bNum;
      });

    return (
      <div className="tier-section">
        <h4 className={`tier-header tier-${tierName.toLowerCase()}`}>
          {tierName} Mods
        </h4>
        {levels.map(levelKey => {
          const level = parseInt(levelKey.replace('level_', ''));
          return (
            <div key={levelKey}>
              {renderLevelRules(tierRules[levelKey], level)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDotSection = (dotConfig, dotLabel) => {
    const sectionKey = `${workflowKey}-${dotLabel}`;
    const isExpanded = expandedSections[sectionKey] !== false;
    
    // Check if all tiers have the same simple rule
    const allTiers = Object.values(dotConfig);
    const firstRule = allTiers[0]?.level_1?.[0];
    const allSame = allTiers.every(tier => 
      tier.level_1?.length === 1 && 
      tier.level_1[0].check === firstRule?.check &&
      tier.level_1[0].result === firstRule?.result
    );

    return (
      <div className="dot-section">
        <h3 
          className="dot-header"
          onClick={() => toggleSection(sectionKey)}
        >
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          {dotLabel} Mods
        </h3>
        
        {isExpanded && (
          <div className="dot-content">
            {allSame && firstRule ? (
              <div className="simple-rule">
                <p>{renderCheck(firstRule)}</p>
              </div>
            ) : (
              Object.entries(dotConfig).map(([tierKey, tierRules]) => {
                const tierName = TIER_KEYS[Object.keys(TIER_KEYS).find(k => TIER_KEYS[k] === tierKey)];
                return (
                  <div key={tierKey}>
                    {renderTierRules(tierRules, tierName || tierKey)}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="workflow-visualizer">
      <div className="workflow-header">
        <h2>{workflow.name}</h2>
        <p className="workflow-description">{workflow.description}</p>
      </div>

      <div className="workflow-sections">
        {workflow["dot_1-4"] && renderDotSection(workflow["dot_1-4"], "1-4 Dot")}
        {workflow["dot_5"] && renderDotSection(workflow["dot_5"], "5 Dot")}
        {workflow["dot_6"] && renderDotSection(workflow["dot_6"], "6 Dot")}
      </div>

      <div className="workflow-legend">
        <h4>Legend:</h4>
        <div className="legend-items">
          {Object.entries(config.resultTexts).map(([code, text]) => (
            <span key={code} className={`legend-item result-${code.toLowerCase()}`}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkflowVisualizer;