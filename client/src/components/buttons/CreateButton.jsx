import AddIcon from "@mui/icons-material/Add";

export default function CreateButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors duration-200"
      aria-label="Create"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}
