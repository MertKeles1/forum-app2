import dynamic from 'next/dynamic';

const LoginComponent = dynamic(() => import('./LoginComponent'), {
  ssr: false,
  loading: () => (
    <div className="container">
      <div className="main-content">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
});

export default function LoginPage() {
  return <LoginComponent />;
}