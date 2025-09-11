'use client'

import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Gizlilik Politikası</h1>
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
                <Eye className="h-5 w-5 text-blue-600" />
                <span>Gizlilik Politikamız</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Linkfy. olarak, kullanıcılarımızın gizliliğini korumak bizim için en önemli önceliklerden biridir. 
                Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını, saklandığını 
                ve korunduğunu açıklamaktadır.
              </p>
              <p className="text-sm text-gray-500">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <span>Toplanan Veriler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Kişisel Bilgiler</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>E-posta adresi (hesap oluşturma ve giriş için)</li>
                  <li>Ad ve soyad (isteğe bağlı)</li>
                  <li>Şifre (şifrelenmiş olarak saklanır)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Teknik Bilgiler</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>IP adresi (güvenlik ve analitik amaçlı)</li>
                  <li>Tarayıcı türü ve versiyonu</li>
                  <li>İşletim sistemi bilgisi</li>
                  <li>Cihaz türü (mobil, tablet, masaüstü)</li>
                  <li>Sayfa görüntüleme süreleri</li>
                  <li>Coğrafi konum (genel bölge düzeyinde)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Kullanım Verileri</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Oluşturulan kısa linkler</li>
                  <li>Link tıklama sayıları ve zamanları</li>
                  <li>Site ziyaret istatistikleri</li>
                  <li>Kullanıcı etkileşim verileri</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Verilerin Kullanımı</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Hizmet Sağlama</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Kullanıcı hesaplarının yönetimi</li>
                  <li>Link kısaltma hizmetinin sunulması</li>
                  <li>Analitik raporların oluşturulması</li>
                  <li>Teknik destek sağlanması</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">İletişim</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Hesap doğrulama e-postaları</li>
                  <li>Şifre sıfırlama bildirimleri</li>
                  <li>Önemli hizmet güncellemeleri</li>
                  <li>Güvenlik uyarıları</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Geliştirme ve Analiz</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Hizmet kalitesinin iyileştirilmesi</li>
                  <li>Kullanıcı deneyiminin optimize edilmesi</li>
                  <li>Güvenlik önlemlerinin geliştirilmesi</li>
                  <li>İstatistiksel analizler</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-red-600" />
                <span>Veri Güvenliği</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Teknik Önlemler</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>SSL/TLS şifreleme ile veri iletimi</li>
                  <li>Veritabanı şifreleme</li>
                  <li>Güvenli sunucu altyapısı</li>
                  <li>Düzenli güvenlik güncellemeleri</li>
                  <li>Erişim kontrolü ve yetkilendirme</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Operasyonel Önlemler</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Personel eğitimi ve gizlilik protokolleri</li>
                  <li>Veri erişim loglarının tutulması</li>
                  <li>Düzenli güvenlik denetimleri</li>
                  <li>Yedekleme ve kurtarma prosedürleri</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-orange-600" />
                <span>Veri Paylaşımı</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Kişisel verilerinizi üçüncü taraflarla paylaşmayız, ancak aşağıdaki durumlar istisnadır:
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Yasal Zorunluluklar</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Mahkeme kararı veya yasal düzenleme gereği</li>
                  <li>Güvenlik tehditlerinin önlenmesi</li>
                  <li>Hukuki hakların korunması</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Hizmet Sağlayıcılar</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Veritabanı ve sunucu hizmetleri (Supabase)</li>
                  <li>E-posta gönderim hizmetleri</li>
                  <li>Analitik hizmetleri (anonim veriler)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Kullanıcı Hakları</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">KVKK Kapsamında Haklarınız</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Bilgi Alma Hakkı:</strong> Hangi verilerinizin işlendiğini öğrenme</li>
                  <li><strong>Erişim Hakkı:</strong> İşlenen verilerinize erişim talep etme</li>
                  <li><strong>Düzeltme Hakkı:</strong> Yanlış veya eksik verilerin düzeltilmesini isteme</li>
                  <li><strong>Silme Hakkı:</strong> Verilerinizin silinmesini talep etme</li>
                  <li><strong>İtiraz Hakkı:</strong> Veri işlemeye itiraz etme</li>
                  <li><strong>Taşınabilirlik Hakkı:</strong> Verilerinizi başka bir hizmete aktarma</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Haklarınızı kullanmak için:</strong> privacy@linkfy.vip adresine e-posta gönderebilir 
                  veya hesap ayarlarından veri yönetimi seçeneklerini kullanabilirsiniz.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Çerezler (Cookies)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanılmaktadır:
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Çerez Türleri</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Zorunlu Çerezler:</strong> Site işlevselliği için gerekli</li>
                  <li><strong>Analitik Çerezler:</strong> Kullanım istatistikleri için</li>
                  <li><strong>Tercih Çerezleri:</strong> Kullanıcı ayarlarını hatırlama</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz, ancak bazı özellikler çalışmayabilir.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>İletişim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>E-posta:</strong> privacy@linkfy.vip
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

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Politika Güncellemeleri</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Bu Gizlilik Politikası gerektiğinde güncellenebilir. Önemli değişiklikler durumunda 
                kullanıcılarımızı e-posta ile bilgilendiririz. Güncel politika her zaman web sitemizde 
                yayınlanmaktadır.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
