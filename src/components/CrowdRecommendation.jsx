
import './CrowdRecommendation.css';

export const CrowdRecommendation = ({ crowdData }) => {
  if (!crowdData || !crowdData.coaches) return null;

  // Convert crowd levels to numerical weight to calculate stats
  const levelValues = { low: 1, medium: 2, high: 3 };

  // Track the best general, ladies, and first class coaches
  let bestGeneral = null;
  let bestLadies = null;
  let bestFirstClass = null;

  let minGenVal = Infinity;
  let minLadiesVal = Infinity;
  let minFcVal = Infinity;

  let totalSections = 0;
  let totalScore = 0;

  crowdData.coaches.forEach(coach => {
    coach.sections.forEach(section => {
      totalSections++;
      totalScore += levelValues[section.level];

      const val = levelValues[section.level];

      if (coach.type === 'general' && val < minGenVal) {
        minGenVal = val;
        bestGeneral = { coach: coach.coach, level: section.level };
      } else if (coach.type === 'ladies' && val < minLadiesVal) {
        minLadiesVal = val;
        bestLadies = { coach: coach.coach, level: section.level };
      } else if (coach.type === 'first_class' && val < minFcVal) {
        minFcVal = val;
        bestFirstClass = { coach: coach.coach, level: section.level };
      }
    });
  });

  // Calculate overall occupancy percentage
  // 1 is 20%, 2 is 60%, 3 is 95%
  const averageLevel = totalSections > 0 ? totalScore / totalSections : 2;
  let occupancyPercent = Math.round(((averageLevel - 1) / 2) * 75 + 20);

  return (
    <div className="recommendation-card">
      <div className="occupancy-summary">
        <div className="summary-left">
          <span className="summary-label">Average Rake Load</span>
          <span className="summary-percentage">{occupancyPercent}%</span>
        </div>
        <div className="summary-right">
          <div className="occupancy-progress-bar">
            <div 
              className="occupancy-progress-fill" 
              style={{ 
                width: `${occupancyPercent}%`,
                backgroundColor: occupancyPercent > 75 ? 'var(--crowd-high)' : 
                                occupancyPercent > 45 ? 'var(--crowd-medium)' : 'var(--crowd-low)'
              }}
            ></div>
          </div>
          <span className="status-descriptor">
            {occupancyPercent > 75 ? 'Extremely Crowded' : 
             occupancyPercent > 45 ? 'Moderately Full' : 'Optimal Capacity'}
          </span>
        </div>
      </div>

      <div className="recommendations-grid">
        {bestGeneral && (
          <div className="rec-item">
            <div className="rec-icon">🚉</div>
            <div className="rec-details">
              <span className="rec-title">Best General Coach</span>
              <span className="rec-value">Coach C{bestGeneral.coach} ({bestGeneral.level.toUpperCase()})</span>
            </div>
          </div>
        )}

        {bestLadies && (
          <div className="rec-item accent-pink">
            <div className="rec-icon">♀</div>
            <div className="rec-details">
              <span className="rec-title">Best Ladies Coach</span>
              <span className="rec-value">Coach C{bestLadies.coach} ({bestLadies.level.toUpperCase()})</span>
            </div>
          </div>
        )}

        {bestFirstClass && (
          <div className="rec-item accent-blue">
            <div className="rec-icon">⭐</div>
            <div className="rec-details">
              <span className="rec-title">Best First Class</span>
              <span className="rec-value">Coach C{bestFirstClass.coach} ({bestFirstClass.level.toUpperCase()})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
