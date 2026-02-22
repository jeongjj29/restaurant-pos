interface SubmitButtonProps {
  label?: string;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  label = "Submit",
  disabled = false,
}) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`rounded-lg bg-accent px-5 py-2.5 font-semibold text-[#2a1703] shadow-md transition-all duration-200 hover:-translate-y-[1px] hover:bg-accent-soft ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {label}
    </button>
  );
};

export default SubmitButton;
