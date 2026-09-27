import type { InputHTMLAttributes } from "react";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

const FormInput = ({ id, label, ...inputProps }: FormInputProps) => {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <input className="form-field__input" id={id} {...inputProps} />
    </div>
  );
};

export default FormInput;
