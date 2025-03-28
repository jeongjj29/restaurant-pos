function NavBar({ tab, setTab }) {
  const tabs = ["items", "categories", "layout"];

  return (
    <div className="flex border-b border-border space-x-6 text-sm md:text-base lg:text-lg mb-4">
      {tabs.map((key) => {
        const isActive = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 transition-colors duration-200 font-medium border-b-2 
              ${
                isActive
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

export default NavBar;
