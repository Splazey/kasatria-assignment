import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../config';

export default function LoginScreen({ onSuccess }) {
  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={{ textAlign: 'center', padding: '40px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Welcome :)</h2>
          <p>Please sign in to view the visualization.</p>
          <br/>

          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => console.error('Login Failed')}
          />
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}
