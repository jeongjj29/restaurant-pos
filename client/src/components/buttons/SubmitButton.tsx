interface SubmitButtonProps {
  label?: string;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ label = "Submit", disabled = false }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`bg-accent hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {label}
    </button>
  );
}

export default SubmitButton;
