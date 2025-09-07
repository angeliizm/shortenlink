export default function TestColors() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Color Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-red-500 text-white">Red 500</div>
        <div className="p-4 bg-blue-500 text-white">Blue 500</div>
        <div className="p-4 bg-green-500 text-white">Green 500</div>
        <div className="p-4 bg-purple-500 text-white">Purple 500</div>
        <div className="p-4 bg-violet-500 text-white">Violet 500</div>
        <div className="p-4 bg-pink-500 text-white">Pink 500</div>
        <div className="p-4 bg-yellow-500 text-black">Yellow 500</div>
        
        <div className="p-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          Gradient: Violet to Purple
        </div>
        
        <div className="p-4 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
          Light Gradient Background
        </div>
        
        <div className="relative h-32">
          <div className="absolute top-0 left-0 w-20 h-20 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>
      </div>
    </div>
  )
}