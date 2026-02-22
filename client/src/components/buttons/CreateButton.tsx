import AddIcon from "@mui/icons-material/Add";
import { ButtonProps } from "@app/types";

const CreateButton: React.FC<ButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-emerald-500/90 px-2 py-1.5 text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-emerald-400"
      aria-label="Create"
    >
      <AddIcon fontSize="small" />
    </button>
  );
};

export default CreateButton;
