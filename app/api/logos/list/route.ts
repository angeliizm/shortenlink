import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const imagesDir = join(process.cwd(), 'public', 'images')
    
    // Klasörün var olup olmadığını kontrol et
    try {
      await stat(imagesDir)
    } catch (error) {
      // Klasör yoksa boş array döndür
      return NextResponse.json([])
    }

    // Klasördeki dosyaları listele
    const files = await readdir(imagesDir)
    
    // Desteklenen dosya formatları
    const supportedFormats = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']
    
    const logoFiles = []
    
    for (const file of files) {
      const filePath = join(imagesDir, file)
      const fileStat = await stat(filePath)
      
      // Sadece dosyaları al (klasörleri değil)
      if (fileStat.isFile()) {
        const ext = file.toLowerCase().substring(file.lastIndexOf('.'))
        
        // Desteklenen formatları kontrol et
        if (supportedFormats.includes(ext)) {
          logoFiles.push({
            name: file,
            path: `/images/${file}`,
            size: fileStat.size,
            type: ext.substring(1), // nokta olmadan
            modified: fileStat.mtime.toISOString()
          })
        }
      }
    }
    
    // Dosya adına göre sırala
    logoFiles.sort((a, b) => a.name.localeCompare(b.name))
    
    return NextResponse.json(logoFiles)
    
  } catch (error) {
    console.error('Logo listesi hatası:', error)
    return NextResponse.json(
      { error: 'Logo listesi alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
