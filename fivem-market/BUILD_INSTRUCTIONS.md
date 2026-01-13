# 🔨 React UI Build Talimatları

Bu dokümant, React NUI'yi FiveM için nasıl build edeceğinizi açıklar.

## Adım 1: React Projesini Build Edin

Ana proje dizininde terminal açın ve:

```bash
npm run build
```

Bu komut `dist/` klasörü oluşturacak.

## Adım 2: Build Dosyalarını Kopyalayın

```bash
# dist klasörünün içeriğini html klasörüne kopyalayın
cp -r dist/* fivem-market/html/
```

## Adım 3: index.html Düzenlemesi

`fivem-market/html/index.html` dosyasını açın ve build edilen dosya isimlerini güncelleyin:

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Market NUI</title>
    <!-- Build edilen CSS dosyası -->
    <link rel="stylesheet" href="./assets/index-XXXXX.css">
</head>
<body>
    <div id="root"></div>
    <!-- Build edilen JS dosyası -->
    <script type="module" src="./assets/index-XXXXX.js"></script>
</body>
</html>
```

`XXXXX` kısmını gerçek hash değerleriyle değiştirin (dist/assets/ içindeki dosya isimlerine bakın).

## Adım 4: NUI Bridge Entegrasyonu

React uygulamasında NUI callback'leri kullanmak için `src/hooks/useNUI.ts` hook'u ekleyin:

```typescript
// src/hooks/useNUI.ts
export const useNUI = () => {
  const fetchNUI = async <T>(eventName: string, data?: any): Promise<T> => {
    const resourceName = (window as any).GetParentResourceName?.() || 'market';
    
    const response = await fetch(`https://${resourceName}/${eventName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    });
    
    return response.json();
  };

  return { fetchNUI };
};
```

## Adım 5: Message Listener

`src/App.tsx` içinde FiveM mesajlarını dinleyin:

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const { action, data } = event.data;
    
    if (action === 'openMarket') {
      // Market verilerini set et
      setMarketData(data);
      setIsOpen(true);
    }
    
    if (action === 'updateBalance') {
      setBalance(data);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

## Adım 6: ESC Kapatma

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      fetchNUI('closeMarket');
      setIsOpen(false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Son Dosya Yapısı

Build sonrası `html/` klasörü şöyle görünmeli:

```
html/
├── index.html
├── style.css (fallback)
├── script.js (bridge - opsiyonel)
└── assets/
    ├── index-abc123.js
    ├── index-abc123.css
    └── ... (diğer asset'ler)
```

## Test Etme

1. Resource'u FiveM server'a kopyalayın
2. `ensure fivem-market` ile başlatın
3. Oyunda bir markete gidin
4. NPC'ye target yapın veya E tuşuna basın

## Troubleshooting

### UI Açılmıyor
- Console'da hata mesajlarını kontrol edin
- `fxmanifest.lua` içinde dosya yollarını kontrol edin
- Build dosya isimlerinin doğru olduğundan emin olun

### Satın Alma Çalışmıyor
- Server console'da hata mesajlarını kontrol edin
- Database tablolarının oluşturulduğundan emin olun
- Config.Framework ve Config.Inventory ayarlarını kontrol edin
