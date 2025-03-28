import EditIcon from "@mui/icons-material/Edit";

export default function EditButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md bg-blue-500 hover:bg-blue-400 text-white transition-colors duration-200"
      aria-label="Edit"
    >
      <EditIcon fontSize="small" />
    </button>
  );
}
