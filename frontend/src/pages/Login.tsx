import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import { api } from "../lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      setError("Please enter your email and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/auth/login", { email, password });
      navigate("/", { replace: true });
    } catch (requestError) {
      if (axios.isAxiosError<{ message?: string }>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Unable to log in. Check your connection and try again.",
        );
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Pick up where your curiosity left off."
      footer={
        <p className="auth-card__footer">
          New to Luma? <Link to="/signup">Create an account</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormInput
          autoComplete="email"
          id="login-email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <FormInput
          autoComplete="current-password"
          id="login-password"
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
          {isSubmitting ? "Logging in..." : "Log in"}
          <span className="auth-form__submit-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
