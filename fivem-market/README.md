# 🛒 FiveM Advanced Market System

Modern, güvenli ve özelleştirilebilir FiveM market scripti.

## ✨ Özellikler

- 🎨 **Modern UI** - React tabanlı uzay temalı NUI
- 🔐 **Güvenlik** - Server-side fiyat kontrolü, exploit koruması
- 💳 **Ödeme** - Nakit / Banka seçimi
- 🏪 **Çoklu Market** - Birden fazla market noktası
- 👤 **Sahiplik** - Oyuncular market satın alabilir
- 🎯 **Puan Sistemi** - Sadakat puanları
- 📦 **Envanter** - OX, QB, QS inventory desteği
- 🎮 **Framework** - QB-Core ve ESX desteği
- 🎯 **Target** - ox_target ve qb-target desteği

## 📁 Dosya Yapısı

```
fivem-market/
├── fxmanifest.lua      # Resource manifest
├── config.lua          # Tüm ayarlar
├── client/
│   └── client.lua      # Client-side kod
├── server/
│   └── server.lua      # Server-side kod
├── sql/
│   └── market.sql      # Database şeması
├── html/
│   ├── index.html      # NUI giriş noktası
│   ├── style.css       # Temel stiller
│   ├── script.js       # NUI bridge
│   └── assets/         # React build dosyaları
└── README.md
```

## 🚀 Kurulum

### 1. Gereksinimler
- oxmysql
- QB-Core veya ESX
- ox_inventory / qb-inventory / qs-inventory (birini seçin)
- ox_target / qb-target (opsiyonel)
- ox_lib (opsiyonel, bildirimler için)

### 2. Database Kurulumu
```sql
-- sql/market.sql dosyasını MySQL'de çalıştırın
```

### 3. React UI Build
```bash
# Ana proje dizininde
npm run build

# Build dosyalarını kopyalayın
cp -r dist/* fivem-market/html/
```

### 4. Config Ayarları
`config.lua` dosyasını düzenleyin:

```lua
Config.Framework = 'qb' -- 'qb' veya 'esx'
Config.Inventory = 'ox' -- 'ox', 'qb', veya 'qs'
Config.Target = 'ox'    -- 'ox', 'qb', veya 'none'
```

### 5. Kaynağı Başlatma
```cfg
# server.cfg
ensure oxmysql
ensure qb-core -- veya es_extended
ensure ox_inventory -- veya kullandığınız inventory
ensure fivem-market
```

## ⚙️ Konfigürasyon

### Market Ekleme
```lua
Config.Markets['yeni_market'] = {
    name = 'Yeni Market',
    coords = vector3(x, y, z),
    blip = {
        enabled = true,
        sprite = 52,
        color = 2,
        scale = 0.8,
    },
    npc = {
        enabled = true,
        model = 'mp_m_shopkeep_01',
        heading = 180.0,
    },
    ownable = true,
    ownerId = nil,
    ownerName = nil,
    price = 500000,
    categories = {'food', 'drinks'},
}
```

### Ürün Ekleme
```lua
Config.Items['yeni_urun'] = {
    name = 'Yeni Ürün',
    category = 'food',
    price = 50,
    weight = 200,
    image = 'yeni_urun.png',
    description = 'Ürün açıklaması',
    maxStock = 100,
}
```

### Kategori Ekleme
```lua
Config.Categories['yeni_kategori'] = {
    name = 'Yeni Kategori',
    icon = 'icon-name',
    color = '#ffffff',
}
```

## 🔒 Güvenlik Özellikleri

- ✅ Server-side fiyat kontrolü (client'tan fiyat alınmaz)
- ✅ Event spam koruması (rate limiting)
- ✅ Mesafe kontrolü (market dışından alışveriş engeli)
- ✅ Miktar limiti (tek seferde max ürün)
- ✅ Envanter doluluğu kontrolü
- ✅ Satın alma logları (database kaydı)

## 📡 Exports

```lua
-- Marketi açmak için
exports['fivem-market']:OpenMarket('market_id')
```

## 🎯 Events

```lua
-- Client Events
RegisterNetEvent('market:purchaseResult')
RegisterNetEvent('market:updateOwner')

-- Server Events
RegisterNetEvent('market:purchase')
RegisterNetEvent('market:transferMarket')
```

## 📝 Notlar

- Ürün resimleri `html/assets/items/` klasörüne eklenmeli
- ESX kullanıyorsanız `users` tablosuna `marketpoints` sütunu ekleyin
- Target sistemi kullanmıyorsanız `Config.Target = 'none'` yapın

## 🤝 Destek

Sorun veya önerileriniz için issue açabilirsiniz.

## 📄 Lisans

MIT License
