import EditIcon from "@mui/icons-material/Edit";
import { ButtonProps } from "@app/types";

const EditButton: React.FC<ButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md bg-blue-500 hover:bg-blue-400 text-white transition-colors duration-200"
      aria-label="Edit"
    >
      <EditIcon fontSize="small" />
    </button>
  );
};

export default EditButton;
