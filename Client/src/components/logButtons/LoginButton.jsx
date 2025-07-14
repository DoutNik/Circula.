import { useClerk } from '@clerk/clerk-react';
import style from './LoginButton.module.css'


const LoginButton = () => {
  const { signInWithRedirect } = useClerk();

  const handleLogin = () => {
    signInWithRedirect({
      strategy: "oauth_google", // 👈 Directo a Google
      redirectUrl: "/",         // 👈 A dónde volver después del login (opcional)
    });
  };

  return (
    <div className={style.login}>
      
    <button onClick={handleLogin} >
      Ingresa con{" "}
     { <img
        width="24"
        height="24"
        src="https://img.icons8.com/color/48/google-logo.png"
        alt="google-logo"
      />}
    </button>
    </div>
  );
};

export default LoginButton;
