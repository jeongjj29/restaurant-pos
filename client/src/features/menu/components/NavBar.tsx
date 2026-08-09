export type MenuTabKey = "items" | "categories";

interface NavBarProps {
  tab: MenuTabKey;
  setTab: (tab: MenuTabKey) => void;
}

const NavBar: React.FC<NavBarProps> = ({ tab, setTab }) => {
  const tabs: { key: MenuTabKey; label: string }[] = [
    { key: "items", label: "Menu items" },
    { key: "categories", label: "Categories" },
  ];

  return (
    <div className="flex border-b border-border space-x-6 text-sm md:text-base lg:text-lg mb-4">
      {tabs.map(({ key, label }) => {
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
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default NavBar;
