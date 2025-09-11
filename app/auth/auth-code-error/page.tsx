import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl border border-blue-100/50 shadow-xl shadow-blue-500/5 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Email Doğrulama Hatası
          </h1>
          
          <p className="text-gray-600 mb-6">
            Email doğrulama linkinde bir hata oluştu. Lütfen tekrar deneyin veya yeni bir doğrulama maili isteyin.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Ana Sayfaya Dön
            </Link>
            
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              Tekrar Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
