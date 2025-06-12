import './StatColumn.css'
import { STAT_NAMES, calculateIndividualRollEfficiencies } from './ModCard'

function StatColumn({ stat, is6Dot = false }) {
  if (!stat) return null;
  
  const statId = stat.stat.unitStatId;
  const statName = STAT_NAMES[statId] || `Stat ${statId}`;
  const statValue = parseInt(stat.stat.statValueDecimal) / 10000;
  const rolls = stat.statRolls || 1;
  // Get individual roll efficiencies
  const rollEfficiencies = calculateIndividualRollEfficiencies(stat, is6Dot);
  
  // Format the value based on stat type
  const formatValue = () => {
    // Percentage stats
    if ([16, 17, 18, 48, 49, 52, 53, 54, 55, 56].includes(statId)) {
      return `${(statValue * 100).toFixed(2)}%`;
    }
    // Flat stats
    return Math.floor(statValue).toString();
  };
  
  return (
    <div className="stat-column">
      <div className="stat-header">
        <div className="stat-name">{statName}</div>
        <div className="stat-value">{formatValue()}</div>
        <div className="stat-rolls">({rolls} roll{rolls > 1 ? 's' : ''})</div>
      </div>
      
    <div className="stat-bars">
        {[...Array(5)].map((_, index) => {
          const efficiency = rollEfficiencies[index] || 0;
          const isActive = index < rolls;
          
          return (
            <div 
              key={index} 
              className={`efficiency-bar ${isActive ? 'active' : 'inactive'}`}
            >
              <div 
                className="bar-fill" 
                style={{ width: isActive ? `${efficiency}%` : '0%' }}
              >
                {isActive ? `${Math.round(efficiency)}%` : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatColumn