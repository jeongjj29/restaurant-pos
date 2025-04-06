import AddIcon from "@mui/icons-material/Add";
import { ButtonProps } from "@app/types";

const CreateButton: React.FC<ButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md bg-green-500 hover:bg-green-400 text-white transition-colors duration-200"
      aria-label="Create"
    >
      <AddIcon fontSize="small" />
    </button>
  );
};

export default CreateButton;
