import DeleteIcon from "@mui/icons-material/Delete";
import { ButtonProps } from "@app/types";

const DeleteButton: React.FC<ButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md bg-red-500 hover:bg-red-400 text-white transition-colors duration-200"
      aria-label="Delete"
    >
      <DeleteIcon fontSize="small" />
    </button>
  );
};

export default DeleteButton;
