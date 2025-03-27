function NavBar({ tab, setTab }) {
  const BASE_STYLE =
    "px-4 py-2 font-semibold rounded-md transition-colors duration-200";
  const ACTIVE_STYLE = "bg-white text-background";
  const INACTIVE_STYLE = "bg-white/10 hover:bg-white/20 text-text-secondary";

  return (
    <div className="flex space-x-2 text-sm md:text-base lg:text-lg  mb-2">
      {["items", "categories", "layout"].map((key) => (
        <button
          key={key}
          onClick={() => setTab(key)}
          className={`${BASE_STYLE} ${
            tab === key ? ACTIVE_STYLE : INACTIVE_STYLE
          }`}
        >
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default NavBar;
