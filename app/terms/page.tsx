'use client'

import { ArrowLeft, FileText, Scale, AlertTriangle, Shield, Users, Ban, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Geri</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Kullanım Şartları</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <span>Kullanım Şartları</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Linkfy. hizmetlerini kullanarak bu Kullanım Şartlarını kabul etmiş sayılırsınız. 
                Lütfen bu şartları dikkatlice okuyun. Hizmetlerimizi kullanmaya devam etmeniz, 
                bu şartları kabul ettiğiniz anlamına gelir.
              </p>
              <p className="text-sm text-gray-500">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Hizmet Tanımı</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Linkfy., URL kısaltma ve yönetim hizmeti sunan bir platformdur. Hizmetlerimiz şunları içerir:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>URL kısaltma ve özelleştirme</li>
                <li>Link tıklama analitikleri</li>
                <li>Kullanıcı hesap yönetimi</li>
                <li>Güvenli link yönlendirme</li>
                <li>İstatistiksel raporlama</li>
                <li>API erişimi (ücretli planlarda)</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Kullanıcı Sorumlulukları</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Hesap Güvenliği</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Hesap bilgilerinizi güvenli tutmak sizin sorumluluğunuzdadır</li>
                  <li>Şifrenizi kimseyle paylaşmayın</li>
                  <li>Şüpheli aktivite durumunda derhal bizimle iletişime geçin</li>
                  <li>Hesabınızın güvenliğinden siz sorumlusunuz</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Yasal Kullanım</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Hizmetlerimizi yasalara uygun şekilde kullanın</li>
                  <li>Başkalarının haklarını ihlal etmeyin</li>
                  <li>Telif hakkı ihlali yapmayın</li>
                  <li>Spam veya zararlı içerik paylaşmayın</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ban className="h-5 w-5 text-red-600" />
                <span>Yasak Kullanımlar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Aşağıdaki kullanımlar kesinlikle yasaktır ve hesabınızın askıya alınmasına veya 
                kapatılmasına neden olabilir:
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Yasadışı Faaliyetler</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Yasadışı içerik paylaşımı</li>
                  <li>Telif hakkı ihlali</li>
                  <li>Sahte veya yanıltıcı bilgi yayma</li>
                  <li>Dolandırıcılık veya kimlik hırsızlığı</li>
                  <li>Çocuk istismarı içeriği</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Zararlı Faaliyetler</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Malware, virüs veya zararlı kod dağıtımı</li>
                  <li>Phishing veya kimlik avı</li>
                  <li>Spam veya istenmeyen e-posta</li>
                  <li>DDoS saldırıları veya sistem sabotajı</li>
                  <li>Güvenlik açıklarını sömürme</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Uygunsuz İçerik</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Nefret söylemi veya ayrımcılık</li>
                  <li>Şiddet içeren veya rahatsız edici içerik</li>
                  <li>Pornografik veya cinsel içerik</li>
                  <li>Kişisel bilgilerin izinsiz paylaşımı</li>
                  <li>Spam veya reklam amaçlı kullanım</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Hizmet Kullanılabilirliği</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Hizmet Garantisi</h4>
                <p className="text-gray-700 leading-relaxed">
                  Hizmetlerimizi "olduğu gibi" sunuyoruz. Mümkün olan en iyi hizmeti sağlamaya 
                  çalışsak da, hizmetlerimizin kesintisiz olacağını garanti edemeyiz.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Bakım ve Güncellemeler</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Planlı bakım çalışmaları önceden duyurulur</li>
                  <li>Acil güvenlik güncellemeleri anında uygulanabilir</li>
                  <li>Hizmet kesintileri minimum seviyede tutulmaya çalışılır</li>
                  <li>Önemli değişiklikler kullanıcılara bildirilir</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Hesap Askıya Alma</h4>
                <p className="text-gray-700 leading-relaxed">
                  Kullanım şartlarını ihlal eden hesaplar uyarı verilmeksizin askıya alınabilir 
                  veya kapatılabilir. Bu durumda oluşturduğunuz linkler erişilemez hale gelebilir.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Fikri Mülkiyet Hakları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Linkfy. Hakları</h4>
                <p className="text-gray-700 leading-relaxed">
                  Linkfy. platformu, yazılımı, tasarımı ve tüm içeriği Deniz Aksoy Medya'ya aittir. 
                  Bu materyaller telif hakkı ve diğer fikri mülkiyet yasaları ile korunmaktadır.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Kullanıcı İçeriği</h4>
                <p className="text-gray-700 leading-relaxed">
                  Oluşturduğunuz linkler ve içerikler size aittir. Ancak hizmetlerimizi kullanarak, 
                  bu içerikleri hizmetimizde gösterme ve işleme hakkını bize verirsiniz.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Lisans Kullanımı</h4>
                <p className="text-gray-700 leading-relaxed">
                  Hizmetlerimizi kullanma hakkı size kişisel, ticari olmayan amaçlarla verilmiştir. 
                  Ticari kullanım için ayrı lisans anlaşması gereklidir.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Gizlilik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için 
                <Link href="/privacy" className="text-blue-600 hover:underline ml-1">
                  Gizlilik Politikamızı
                </Link> inceleyiniz.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Önemli:</strong> Hizmetlerimizi kullanarak Gizlilik Politikamızı da 
                  kabul etmiş sayılırsınız.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>Sorumluluk Sınırlaması</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Hizmet Sorumluluğu</h4>
                <p className="text-gray-700 leading-relaxed">
                  Linkfy. olarak, hizmetlerimizin kullanımından doğabilecek doğrudan veya dolaylı 
                  zararlardan sorumlu değiliz. Bu zararlar şunları içerir:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Kar kaybı veya iş kaybı</li>
                  <li>Veri kaybı</li>
                  <li>İtibar kaybı</li>
                  <li>Üçüncü taraf zararları</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Kullanıcı Sorumluluğu</h4>
                <p className="text-gray-700 leading-relaxed">
                  Hizmetlerimizi kullanırken oluşabilecek tüm zararlardan kendiniz sorumlusunuz. 
                  Hizmetlerimizi kullanmadan önce riskleri değerlendirin.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Hesap Sonlandırma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Kullanıcı Tarafından Sonlandırma</h4>
                <p className="text-gray-700 leading-relaxed">
                  Hesabınızı istediğiniz zaman kapatabilirsiniz. Hesap kapatma işlemi geri alınamaz 
                  ve tüm verileriniz silinir.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Şirket Tarafından Sonlandırma</h4>
                <p className="text-gray-700 leading-relaxed">
                  Kullanım şartlarını ihlal eden hesaplar uyarı verilmeksizin kapatılabilir. 
                  Bu durumda oluşturduğunuz linkler erişilemez hale gelir.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Sonlandırma Sonrası</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Hesap verileri 30 gün içinde silinir</li>
                  <li>Oluşturulan linkler erişilemez hale gelir</li>
                  <li>Yedekleme sorumluluğu kullanıcıya aittir</li>
                  <li>Geri ödeme yapılmaz</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Şartlarda Değişiklik</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Bu Kullanım Şartları gerektiğinde güncellenebilir. Önemli değişiklikler durumunda 
                kullanıcılarımızı e-posta ile bilgilendiririz.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Değişiklik Bildirimi</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Önemli değişiklikler 30 gün önceden duyurulur</li>
                  <li>E-posta ile bildirim gönderilir</li>
                  <li>Web sitesinde güncel şartlar yayınlanır</li>
                  <li>Değişiklikleri kabul etmeyenler hesabını kapatabilir</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>İletişim</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Kullanım Şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>E-posta:</strong> legal@linkfy.vip
                </p>
                <p className="text-gray-700">
                  <strong>Şirket:</strong> Deniz Aksoy Medya
                </p>
                <p className="text-gray-700">
                  <strong>Web:</strong> https://linkfy.vip
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Uygulanacak Hukuk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Bu Kullanım Şartları Türk hukukuna tabidir. Herhangi bir uyuşmazlık durumunda 
                Türkiye Cumhuriyeti mahkemeleri yetkilidir. KVKK ve diğer Türk mevzuatı 
                hükümleri geçerlidir.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
