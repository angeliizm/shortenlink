# Environment Variables Setup

Bu proje Supabase kullanıyor ve environment variables gerektiriyor.

## Gerekli Environment Variables

Proje root dizininde `.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site URL (Production)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Development
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Credentials Nasıl Alınır

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Projenizi seçin
3. **Settings** > **API** bölümüne gidin
4. **Project URL** ve **anon public** key'i kopyalayın

## Güvenlik Notları

- `.env.local` dosyası git'e commit edilmemelidir
- Production'da environment variables'ları hosting platformunuzda ayarlayın
- API key'lerinizi asla public repository'lerde paylaşmayın

## Development vs Production

### Development
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production
```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Test Etme

Environment variables'ları ayarladıktan sonra:

```bash
npm run dev
```

Ve `/test-supabase` sayfasını ziyaret ederek bağlantıyı test edin.
