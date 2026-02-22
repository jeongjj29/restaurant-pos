import DeleteIcon from "@mui/icons-material/Delete";
import { ButtonProps } from "@app/types";

const DeleteButton: React.FC<ButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-rose-500/90 px-2 py-1.5 text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-rose-400"
      aria-label="Delete"
    >
      <DeleteIcon fontSize="small" />
    </button>
  );
};

export default DeleteButton;
