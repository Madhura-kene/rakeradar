
import './CompartmentList.css';

export const CompartmentList = ({ crowdData, activeFilter = 'all' }) => {
  if (!crowdData || !crowdData.coaches) return null;

  // Flatten the coaches and sections into a single list of rows
  const rows = [];
  crowdData.coaches.forEach(coach => {
    if (activeFilter === 'all' || coach.type === activeFilter) {
      coach.sections.forEach(section => {
        rows.push({
          coachNumber: coach.coach,
          coachType: coach.type,
          id: section.id,
          label: section.label,
          level: section.level
        });
      });
    }
  });

  const getLevelLabel = (level) => {
    switch (level) {
      case 'low': return 'Low Crowd';
      case 'medium': return 'Medium Crowd';
      case 'high': return 'High Crowd';
      default: return 'Unknown';
    }
  };

  return (
    <div className="compartment-list">
      <div className="list-header">
        <span className="col-coach">Coach</span>
        <span className="col-type">Compartment</span>
        <span className="col-status">Status</span>
      </div>
      <div className="list-body">
        {rows.length === 0 ? (
          <div className="no-rows-msg">No compartments match this filter.</div>
        ) : (
          rows.map(row => (
            <div key={row.id} className="list-row">
              <div className="col-coach">
                <span className="coach-badge">C{row.coachNumber}</span>
              </div>
              <div className="col-type">
                {row.label}
                {row.coachType === 'first_class' && <span className="tag-fc">FC</span>}
                {row.coachType === 'ladies' && <span className="tag-ladies">♀</span>}
                {row.coachType === 'divyangjan' && <span className="tag-divyang">♿</span>}
              </div>
              <div className="col-status">
                <div className={`status-indicator level-${row.level}`}></div>
                <span className={`status-text text-${row.level}`}>
                  {getLevelLabel(row.level)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
