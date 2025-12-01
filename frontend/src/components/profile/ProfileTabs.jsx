const ProfileTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
      { id: 'activity', label: 'Activity' },
      { id: 'lists', label: 'Lists' },
      { id: 'reviews', label: 'Reviews' },
    ];
  
    return (
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-secondary hover:text-gray-300 hover:border-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  export default ProfileTabs;
