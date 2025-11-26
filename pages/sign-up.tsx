import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <SignUp 
        routing="hash"
        signInUrl="/sign-in"
        afterSignUpUrl="/clerk-dashboard"
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

// Force server-side rendering to prevent static export
export async function getServerSideProps() {
  return { props: {} };
}
