import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import { api } from "../lib/api";

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const firstname = formData.get("firstName");
    const lastname = formData.get("lastName");
    const email = formData.get("email");
    const password = formData.get("password");

    if (
      typeof firstname !== "string" ||
      typeof lastname !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      setError("Please complete all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/auth/register", {
        email,
        fullname: { firstname, lastname },
        password,
      });
      navigate("/", { replace: true });
    } catch (requestError) {
      if (axios.isAxiosError<{ message?: string }>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Unable to create your account. Check your connection and try again.",
        );
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Your next idea starts here"
      description="Create an account and make room for a new perspective."
      footer={
        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__names">
          <FormInput
            autoComplete="given-name"
            id="signup-first-name"
            label="First name"
            name="firstName"
            required
            type="text"
          />
          <FormInput
            autoComplete="family-name"
            id="signup-last-name"
            label="Last name"
            name="lastName"
            required
            type="text"
          />
        </div>
        <FormInput
          autoComplete="email"
          id="signup-email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <FormInput
          autoComplete="new-password"
          id="signup-password"
          label="Password"
          name="password"
          required
          type="password"
        />
        {error && (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        )}
        <button
          className="auth-form__submit"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
          <span className="auth-form__submit-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;
