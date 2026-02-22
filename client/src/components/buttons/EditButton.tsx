import EditIcon from "@mui/icons-material/Edit";
import { ButtonProps } from "@app/types";

const EditButton: React.FC<ButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-amber-500/90 px-2 py-1.5 text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-amber-400"
      aria-label="Edit"
    >
      <EditIcon fontSize="small" />
    </button>
  );
};

export default EditButton;
