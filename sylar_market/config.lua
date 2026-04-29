Config = {}

-- ═══════════════════════════════════════════════════════════════════
-- FRAMEWORK AYARLARI
-- ═══════════════════════════════════════════════════════════════════
-- Config.Framework = 'qb' | 'esx' | 'standalone'
Config.Framework = 'qb'

-- Envanter sistemi: 'ox' | 'qb' | 'qs' | 'custom'
Config.Inventory = 'qb'

-- Target sistemi: 'ox' | 'qb' | 'none'
Config.Target = 'qb'

-- ═══════════════════════════════════════════════════════════════════
-- BİLDİRİM SİSTEMİ
-- ═══════════════════════════════════════════════════════════════════
-- 'ox' | 'qb' | 'esx' | 'custom'
Config.Notification = 'qb'

-- ═══════════════════════════════════════════════════════════════════
-- GÜVENLİK AYARLARI
-- ═══════════════════════════════════════════════════════════════════
Config.Security = {
    EventSpamDelay = 500,
    MaxPurchaseQuantity = 100,
    DistanceCheck = 5.0,
    LogPurchases = true,
}

-- ═══════════════════════════════════════════════════════════════════
-- DEV YETKİSİ (Marketi Devret özelliğini sadece DEV görür/kullanır)
-- ═══════════════════════════════════════════════════════════════════
-- QBCore'da en yüksek yetki: 'god' veya 'dev' (qbcore.dev permission)
-- Burada listelenen permission'lardan herhangi birine sahipse DEV sayılır.
Config.DevPermissions = { 'god', 'dev', 'qbcore.dev', 'admin' }
-- Ek olarak ace izinleri (server.cfg'de add_ace ile verilen):
Config.DevAces = { 'qbcore.dev', 'command.dev' }

-- ═══════════════════════════════════════════════════════════════════
-- PUAN SİSTEMİ
-- ═══════════════════════════════════════════════════════════════════
Config.Points = {
    Enabled = true,
    PointsPerDollar = 1,
    OwnerBonusPercent = 5,        -- Online sahip puan bonusu (kişisel)
    Multiplier = 1.0,
    minWithdraw = 500,
}

-- ═══════════════════════════════════════════════════════════════════
-- MARKET SAHİBİ KASA BONUSU (Boss Menü Entegrasyonu)
-- ═══════════════════════════════════════════════════════════════════
-- Tüm marketlerden alışveriş yapan oyuncuların kazandığı puanların
-- bu yüzdesi market mesleğinin (sylar_bossmenu) şirket kasasına yatar.
Config.OwnerCutPercent = 50

-- Devredilen kişinin atanacağı QBCore mesleği ve boss rütbesi.
-- (qb-core/shared/jobs.lua içinde 'market' jobu tanımlı olmalı)
Config.MarketJob = 'market'
Config.MarketJobBossGrade = 4

-- ═══════════════════════════════════════════════════════════════════
-- MARKET NOKTALARI
-- ═══════════════════════════════════════════════════════════════════
Config.Markets = {
    ['market_1'] = {
        name = 'Merkez Market',
        coords = vector3(25.7, -1347.3, 29.5),
        blip = {
            enabled = true,
            sprite = 52,
            color = 2,
            scale = 0.8,
        },
        npc = {
            enabled = true,
            model = 'mp_m_shopkeep_01',
            heading = 270.0,
        },
        ownable = false,
        ownerId = nil,
        ownerName = nil,
        price = 0,
        categories = {'food', 'drinks', 'medical', 'tools'},
    },
    ['market_2'] = {
        name = 'Sahil Market',
        coords = vector3(-3038.9, 585.9, 7.9),
        blip = {
            enabled = true,
            sprite = 52,
            color = 2,
            scale = 0.8,
        },
        npc = {
            enabled = true,
            model = 'mp_m_shopkeep_01',
            heading = 17.0,
        },
        ownable = false,
        ownerId = nil,
        ownerName = nil,
        price = 0,
        categories = {'food', 'drinks', 'fishing'},
    },
}

-- ═══════════════════════════════════════════════════════════════════
-- KATEGORİLER (icon: emoji veya nui-assets/img yolu)
-- ═══════════════════════════════════════════════════════════════════
Config.Categories = {
    ['food'] = {
        name = 'Yiyecekler',
        icon = '🍔',
        color = '#f59e0b',
    },
    ['drinks'] = {
        name = 'İçecekler',
        icon = '🥤',
        color = '#3b82f6',
    },
    ['medical'] = {
        name = 'Medikal',
        icon = '🏥',
        color = '#ef4444',
    },
    ['tools'] = {
        name = 'Araçlar',
        icon = '🔧',
        color = '#8b5cf6',
    },
    ['survival'] = {
        name = 'Hayatta Kalma',
        icon = '🏕️',
        color = '#22c55e',
    },
    ['fishing'] = {
        name = 'Balıkçılık',
        icon = '🎣',
        color = '#06b6d4',
    },
}

-- ═══════════════════════════════════════════════════════════════════
-- ÜRÜNLER
-- image alanı: emoji (önerilen) veya 'nui://qb-inventory/html/images/bread.png' gibi yol
-- detailedDescription = modal'da "Ne işe yarar?" bölümünde gözükür
-- usageInfo            = modal'da "Nerede kullanılır?" bölümünde gözükür
-- ═══════════════════════════════════════════════════════════════════
Config.Items = {
    -- YİYECEK
    ['bread']    = { name = 'Ekmek',    category = 'food', price = 5,  weight = 100, image = '🍞', description = 'Taze pişmiş ekmek', maxStock = 100,
        detailedDescription = 'Sıcak fırından çıkmış taze ekmek. Açlık barınızı %10 oranında doldurur.',
        usageInfo = 'Envanterden kullanın. Her yerde tüketilebilir.' },
    ['sandwich'] = { name = 'Sandviç',  category = 'food', price = 15, weight = 200, image = '🥪', description = 'Lezzetli sandviç', maxStock = 50,
        detailedDescription = 'Taze sebze ve etle hazırlanmış sandviç. Açlık barınızı %20 doldurur.',
        usageInfo = 'Envanterden kullanın. Sağlığı hafif yeniler.' },
    ['burger']   = { name = 'Hamburger', category = 'food', price = 25, weight = 300, image = '🍔', description = 'Büyük hamburger', maxStock = 30,
        detailedDescription = 'Izgara köfte ve özel sosla hazırlanan büyük hamburger. Açlığı %30 doldurur.',
        usageInfo = 'Envanterden kullanın. Araç sürerken kullanılamaz.' },
    ['donut']    = { name = 'Donut',    category = 'food', price = 8,  weight = 100, image = '🍩', description = 'Tatlı donut', maxStock = 40,
        detailedDescription = 'Şekerli donut. Açlığı %15 doldurur ve hız bonusu sağlar (kısa süre).',
        usageInfo = 'Yürürken bile yiyebilirsiniz.' },

    -- İÇECEK
    ['water']       = { name = 'Su',             category = 'drinks', price = 3,  weight = 500, image = '💧', description = 'Saf içme suyu', maxStock = 200,
        detailedDescription = 'Soğuk ve berrak içme suyu. Susuzluk barınızı %25 doldurur.',
        usageInfo = 'Envanterden kullanın. Sıcakta vazgeçilmez.' },
    ['cola']        = { name = 'Kola',           category = 'drinks', price = 5,  weight = 500, image = '🥤', description = 'Soğuk kola', maxStock = 100,
        detailedDescription = 'Buz gibi gazlı içecek. Susuzluğu %20 doldurur, kafein bonusu verir.',
        usageInfo = 'Anında içilebilir, sürerken kullanılamaz.' },
    ['coffee']      = { name = 'Kahve',          category = 'drinks', price = 10, weight = 300, image = '☕', description = 'Sıcak kahve', maxStock = 50,
        detailedDescription = 'Demlenmiş espresso. Susuzluğu hafif doldurur, stamina yenilenmesini hızlandırır.',
        usageInfo = 'Sabah saatlerinde idealdir.' },
    ['energydrink'] = { name = 'Enerji İçeceği', category = 'drinks', price = 20, weight = 350, image = '⚡', description = 'Enerji ver', maxStock = 30,
        detailedDescription = 'Yüksek kafeinli enerji içeceği. 60 saniye boyunca koşma hızı bonusu sağlar.',
        usageInfo = 'Yarış ve kovalamacalarda kullanın.' },

    -- MEDİKAL
    ['bandage']     = { name = 'Bandaj',          category = 'medical', price = 50,  weight = 50,  image = '🩹', description = 'İlk yardım bandajı', maxStock = 50,
        detailedDescription = 'Hızlı kanama durdurucu bandaj. Sağlığınızı %25 yeniler.',
        usageInfo = 'Çatışma sonrası hızlı iyileşme için.' },
    ['painkillers'] = { name = 'Ağrı Kesici',     category = 'medical', price = 100, weight = 20,  image = '💊', description = 'Ağrıları azaltır', maxStock = 30,
        detailedDescription = 'Güçlü ağrı kesici hap. Alınan hasarı 30 saniye %15 azaltır.',
        usageInfo = 'Çatışmaya girmeden önce kullanın.' },
    ['firstaid']    = { name = 'İlk Yardım Kiti', category = 'medical', price = 250, weight = 500, image = '🏥', description = 'Tam ilk yardım seti', maxStock = 20,
        detailedDescription = 'Profesyonel ilk yardım kiti. Sağlığınızı %100 yeniler.',
        usageInfo = 'Acil durumlarda kullanın. Kullanım süresi 8 saniye.' },

    -- ARAÇLAR
    ['flashlight'] = { name = 'El Feneri', category = 'tools', price = 75,  weight = 200, image = '🔦', description = 'Karanlıkta aydınlatma', maxStock = 25,
        detailedDescription = 'Güçlü LED el feneri. Karanlık alanları aydınlatır.',
        usageInfo = 'Mağaralarda ve gece keşiflerinde kullanın.' },
    ['binoculars'] = { name = 'Dürbün',    category = 'tools', price = 150, weight = 400, image = '🔭', description = 'Uzağı görme', maxStock = 15,
        detailedDescription = 'Profesyonel dürbün. Uzaktaki hedefleri 8x yakınlaştırır.',
        usageInfo = 'Gözcülük ve keşif görevlerinde idealdir.' },
    ['lockpick']   = { name = 'Maymuncuk', category = 'tools', price = 200, weight = 50,  image = '🔓', description = 'Kilit açma aracı', maxStock = 10,
        detailedDescription = 'Sıradan kilitleri açabilen alet. Tek kullanımlıktır.',
        usageInfo = 'Araba ve ev kapılarına kullanın. Yasadışı.' },

    -- HAYATTA KALMA
    ['tent']    = { name = 'Çadır',  category = 'survival', price = 500, weight = 2000, image = '⛺', description = 'Kamp çadırı', maxStock = 10,
        detailedDescription = 'Hızla kurulabilen kamp çadırı. Güvenli kayıt noktası oluşturur.',
        usageInfo = 'Açık alanlarda kurun. İçinde uyuyarak sağlık yenileyin.' },
    ['lighter'] = { name = 'Çakmak', category = 'survival', price = 25,  weight = 30,   image = '🔥', description = 'Ateş yakma', maxStock = 50,
        detailedDescription = 'Klasik benzinli çakmak. Kamp ateşi yakmak için gereklidir.',
        usageInfo = 'Odun ile birlikte kullanın.' },
    ['rope']    = { name = 'Halat',  category = 'survival', price = 100, weight = 500,  image = '🪢', description = 'Güçlü halat', maxStock = 20,
        detailedDescription = 'Naylon kaplı dayanıklı halat. Tırmanma ve bağlama amaçlı.',
        usageInfo = 'Tırmanma görevlerinde ve görev mekaniklerinde kullanılır.' },

    -- BALIKÇILIK
    ['fishingrod'] = { name = 'Olta',        category = 'fishing', price = 300, weight = 800,  image = '🎣', description = 'Balık tutma oltası', maxStock = 15,
        detailedDescription = 'Karbon fiber olta. Balıkçılık aktivitesi için zorunludur.',
        usageInfo = 'Su kenarlarında kullanın. Yem gerekir.' },
    ['bait']       = { name = 'Yem',         category = 'fishing', price = 10,  weight = 50,   image = '🪱', description = 'Balık yemi', maxStock = 100,
        detailedDescription = 'Canlı solucan yemi. Her balık tutma denemesinde 1 adet harcanır.',
        usageInfo = 'Olta ile birlikte kullanılır.' },
    ['tacklebox']  = { name = 'Olta Kutusu', category = 'fishing', price = 150, weight = 1000, image = '🧰', description = 'Balıkçılık ekipmanları', maxStock = 10,
        detailedDescription = 'Yedek olta uçları, misina ve aksesuar kutusu. Nadir balık şansını artırır.',
        usageInfo = 'Envanterde taşıyın, otomatik etki sağlar.' },
}

-- ═══════════════════════════════════════════════════════════════════
-- DİL / MESAJLAR
-- ═══════════════════════════════════════════════════════════════════
Config.Locale = {
    ['market_open']      = 'Markete hoş geldiniz!',
    ['purchase_success'] = 'Satın alma başarılı!',
    ['purchase_failed']  = 'Satın alma başarısız!',
    ['not_enough_money'] = 'Yeterli paranız yok!',
    ['inventory_full']   = 'Envanteriniz dolu!',
    ['item_not_found']   = 'Ürün bulunamadı!',
    ['invalid_quantity'] = 'Geçersiz miktar!',
    ['too_far']          = 'Marketten çok uzaksınız!',
    ['market_closed']    = 'Market şu anda kapalı!',
    ['spam_warning']     = 'Çok hızlı işlem yapıyorsunuz!',
    ['points_earned']    = 'Puan kazandınız: ',
}
