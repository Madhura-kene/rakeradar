
import './TrainDiagram.css';

export const TrainDiagram = ({ crowdData, activeFilter = 'all' }) => {
  if (!crowdData || !crowdData.coaches) return null;

  return (
    <div className="train-diagram-container">
      <div className="train-diagram-scroll">
        <div className="train-rake">
          {/* Engine/Loco placeholder for visual completeness */}
          <div className="coach engine">
            <div className="engine-cab"></div>
          </div>
          
          {crowdData.coaches.map((coachData) => {
            const matchesFilter = activeFilter === 'all' || coachData.type === activeFilter;
            
            return (
              <div 
                key={coachData.coach} 
                className={`coach-wrapper ${matchesFilter ? '' : 'faded'}`}
                style={{ transition: 'opacity 0.3s ease' }}
              >
                <div className="coach">
                  {coachData.sections.map((section) => (
                    <div 
                      key={section.id} 
                      className={`coach-section section-level-${section.level}`}
                      title={`${section.label}: ${section.level}`}
                    >
                      {/* Interactive Section indicators */}
                    </div>
                  ))}
                </div>
                <div className="coach-labels">
                  <span className="coach-number">C{coachData.coach}</span>
                  <span className="coach-type-icon">
                    {coachData.type === 'ladies' ? '♀ Ladies' : 
                     coachData.type === 'divyangjan' ? '♿ Divyang' : 
                     coachData.type === 'first_class' ? '⭐ 1st Class' : 'Gen'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
