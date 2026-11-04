import { forwardRef, useState } from "react";
import { passwordRequirements } from "../../utils/formValidation.js";
import styles from "./FormUI.module.css";

export function FormPage({ eyebrow, title, description, wide = false, children }) {
  return <main className={`${styles.page} ${wide ? styles.wide : ""}`}>
    <header className={styles.header}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
    <div className={styles.card}>{children}</div>
  </main>;
}

export function Field({ id, label, required = false, hint, error, children }) {
  return <div className={`${styles.field} ${error ? styles.invalid : ""}`}>
    <label className={styles.label} htmlFor={id}>{label}{required && <span className={styles.required} aria-label="obligatorio"> *</span>}</label>
    {children}
    {hint && <p id={`${id}-hint`} className={styles.help}>{hint}</p>}
    {error && <p id={`${id}-error`} className={styles.fieldError}><span aria-hidden="true">!</span>{error}</p>}
  </div>;
}

export const PasswordInput = forwardRef(function PasswordInput({ className = "", disabled, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return <div className={styles.password}>
    <input {...props} ref={ref} disabled={disabled} type={visible ? "text" : "password"} className={`${styles.control} ${className}`} />
    <button type="button" className={styles.passwordToggle} disabled={disabled} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible((current) => !current)}>{visible ? "Ocultar" : "Mostrar"}</button>
  </div>;
});

export function PasswordChecklist({ value = "" }) {
  return <div className={styles.checklist}>
    <p>Tu contraseña necesita:</p>
    <ul aria-label="Requisitos de la contraseña">
      {passwordRequirements(value).map((rule) => <li key={rule.id} className={rule.met ? styles.met : ""}>
        <span className={styles.checkIcon} aria-hidden="true">{rule.met ? "✓" : "○"}</span>
        <span>{rule.label}<span className={styles.srOnly}>{rule.met ? ": cumplido" : ": pendiente"}</span></span>
      </li>)}
    </ul>
  </div>;
}

export function FormStatus({ kind = "info", children, message }) {
  const content = children || message;
  if (!content) return null;
  return <div className={`${styles.status} ${styles[kind] || ""}`} role={kind === "error" ? "alert" : "status"}>
    <span className={styles.statusIcon} aria-hidden="true">{kind === "success" ? "✓" : kind === "error" ? "!" : "i"}</span>
    <div>{content}</div>
  </div>;
}
