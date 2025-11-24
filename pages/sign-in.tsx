import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <SignIn 
        routing="hash"
        signUpUrl="/sign-up"
        afterSignInUrl="/clerk-dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
      />
    </div>
  );
}
