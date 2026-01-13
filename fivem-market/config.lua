Config = {}

-- ═══════════════════════════════════════════════════════════════════
-- FRAMEWORK SETTINGS
-- ═══════════════════════════════════════════════════════════════════
Config.Framework = 'qb' -- 'qb', 'esx', 'standalone'
Config.Inventory = 'ox' -- 'ox', 'qb', 'qs', 'custom'
Config.Target = 'ox' -- 'ox', 'qb', 'none'

-- ═══════════════════════════════════════════════════════════════════
-- NOTIFICATION SYSTEM
-- ═══════════════════════════════════════════════════════════════════
Config.Notification = 'ox' -- 'ox', 'qb', 'esx', 'custom'

-- ═══════════════════════════════════════════════════════════════════
-- SECURITY SETTINGS
-- ═══════════════════════════════════════════════════════════════════
Config.Security = {
    EventSpamDelay = 500, -- ms between events
    MaxPurchaseQuantity = 100, -- Max items per purchase
    DistanceCheck = 5.0, -- Max distance from shop
    LogPurchases = true, -- Log all purchases
}

-- ═══════════════════════════════════════════════════════════════════
-- POINT SYSTEM
-- ═══════════════════════════════════════════════════════════════════
Config.Points = {
    Enabled = true,
    PointsPerDollar = 1, -- Points earned per $1 spent
    OwnerBonusPercent = 5, -- Owner gets 5% bonus points on sales
    Multiplier = 1.0, -- Global multiplier
}

-- ═══════════════════════════════════════════════════════════════════
-- MARKET LOCATIONS
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
        ownable = true, -- Can be purchased by players
        ownerId = nil, -- Player citizen ID (nil = unowned)
        ownerName = nil,
        price = 500000, -- Purchase price
        categories = {'food', 'drinks', 'medical', 'tools'},
    },
    
    ['market_2'] = {
        name = 'Sandy Shores Market',
        coords = vector3(1960.0, 3740.0, 32.3),
        blip = {
            enabled = true,
            sprite = 52,
            color = 2,
            scale = 0.8,
        },
        npc = {
            enabled = true,
            model = 'mp_m_shopkeep_01',
            heading = 300.0,
        },
        ownable = true,
        ownerId = nil,
        ownerName = nil,
        price = 350000,
        categories = {'food', 'drinks', 'survival'},
    },
    
    ['market_3'] = {
        name = 'Paleto Market',
        coords = vector3(-161.0, 6321.0, 31.6),
        blip = {
            enabled = true,
            sprite = 52,
            color = 2,
            scale = 0.8,
        },
        npc = {
            enabled = true,
            model = 'mp_m_shopkeep_01',
            heading = 220.0,
        },
        ownable = false,
        ownerId = nil,
        ownerName = nil,
        price = 0,
        categories = {'food', 'drinks', 'fishing'},
    },
}

-- ═══════════════════════════════════════════════════════════════════
-- ITEM CATEGORIES
-- ═══════════════════════════════════════════════════════════════════
Config.Categories = {
    ['food'] = {
        name = 'Yiyecekler',
        icon = 'utensils',
        color = '#f59e0b',
    },
    ['drinks'] = {
        name = 'İçecekler',
        icon = 'glass-water',
        color = '#3b82f6',
    },
    ['medical'] = {
        name = 'Medikal',
        icon = 'first-aid',
        color = '#ef4444',
    },
    ['tools'] = {
        name = 'Araçlar',
        icon = 'wrench',
        color = '#8b5cf6',
    },
    ['survival'] = {
        name = 'Hayatta Kalma',
        icon = 'campground',
        color = '#22c55e',
    },
    ['fishing'] = {
        name = 'Balıkçılık',
        icon = 'fish',
        color = '#06b6d4',
    },
}

-- ═══════════════════════════════════════════════════════════════════
-- ITEMS DATABASE
-- ═══════════════════════════════════════════════════════════════════
Config.Items = {
    -- FOOD
    ['bread'] = {
        name = 'Ekmek',
        category = 'food',
        price = 5,
        weight = 100,
        image = 'bread.png',
        description = 'Taze pişmiş ekmek',
        maxStock = 100,
    },
    ['sandwich'] = {
        name = 'Sandviç',
        category = 'food',
        price = 15,
        weight = 200,
        image = 'sandwich.png',
        description = 'Lezzetli sandviç',
        maxStock = 50,
    },
    ['burger'] = {
        name = 'Hamburger',
        category = 'food',
        price = 25,
        weight = 300,
        image = 'burger.png',
        description = 'Büyük hamburger',
        maxStock = 30,
    },
    ['donut'] = {
        name = 'Donut',
        category = 'food',
        price = 8,
        weight = 100,
        image = 'donut.png',
        description = 'Tatlı donut',
        maxStock = 40,
    },
    
    -- DRINKS
    ['water'] = {
        name = 'Su',
        category = 'drinks',
        price = 3,
        weight = 500,
        image = 'water.png',
        description = 'Saf içme suyu',
        maxStock = 200,
    },
    ['cola'] = {
        name = 'Kola',
        category = 'drinks',
        price = 5,
        weight = 500,
        image = 'cola.png',
        description = 'Soğuk kola',
        maxStock = 100,
    },
    ['coffee'] = {
        name = 'Kahve',
        category = 'drinks',
        price = 10,
        weight = 300,
        image = 'coffee.png',
        description = 'Sıcak kahve',
        maxStock = 50,
    },
    ['energydrink'] = {
        name = 'Enerji İçeceği',
        category = 'drinks',
        price = 20,
        weight = 350,
        image = 'energydrink.png',
        description = 'Enerji ver',
        maxStock = 30,
    },
    
    -- MEDICAL
    ['bandage'] = {
        name = 'Bandaj',
        category = 'medical',
        price = 50,
        weight = 50,
        image = 'bandage.png',
        description = 'İlk yardım bandajı',
        maxStock = 50,
    },
    ['painkillers'] = {
        name = 'Ağrı Kesici',
        category = 'medical',
        price = 100,
        weight = 20,
        image = 'painkillers.png',
        description = 'Ağrıları azaltır',
        maxStock = 30,
    },
    ['firstaid'] = {
        name = 'İlk Yardım Kiti',
        category = 'medical',
        price = 250,
        weight = 500,
        image = 'firstaid.png',
        description = 'Tam ilk yardım seti',
        maxStock = 20,
    },
    
    -- TOOLS
    ['flashlight'] = {
        name = 'El Feneri',
        category = 'tools',
        price = 75,
        weight = 200,
        image = 'flashlight.png',
        description = 'Karanlıkta aydınlatma',
        maxStock = 25,
    },
    ['binoculars'] = {
        name = 'Dürbün',
        category = 'tools',
        price = 150,
        weight = 400,
        image = 'binoculars.png',
        description = 'Uzağı görme',
        maxStock = 15,
    },
    ['lockpick'] = {
        name = 'Maymuncuk',
        category = 'tools',
        price = 200,
        weight = 50,
        image = 'lockpick.png',
        description = 'Kilit açma aracı',
        maxStock = 10,
    },
    
    -- SURVIVAL
    ['tent'] = {
        name = 'Çadır',
        category = 'survival',
        price = 500,
        weight = 2000,
        image = 'tent.png',
        description = 'Kamp çadırı',
        maxStock = 10,
    },
    ['lighter'] = {
        name = 'Çakmak',
        category = 'survival',
        price = 25,
        weight = 30,
        image = 'lighter.png',
        description = 'Ateş yakma',
        maxStock = 50,
    },
    ['rope'] = {
        name = 'Halat',
        category = 'survival',
        price = 100,
        weight = 500,
        image = 'rope.png',
        description = 'Güçlü halat',
        maxStock = 20,
    },
    
    -- FISHING
    ['fishingrod'] = {
        name = 'Olta',
        category = 'fishing',
        price = 300,
        weight = 800,
        image = 'fishingrod.png',
        description = 'Balık tutma oltası',
        maxStock = 15,
    },
    ['bait'] = {
        name = 'Yem',
        category = 'fishing',
        price = 10,
        weight = 50,
        image = 'bait.png',
        description = 'Balık yemi',
        maxStock = 100,
    },
    ['tacklebox'] = {
        name = 'Olta Kutusu',
        category = 'fishing',
        price = 150,
        weight = 1000,
        image = 'tacklebox.png',
        description = 'Balıkçılık ekipmanları',
        maxStock = 10,
    },
}

-- ═══════════════════════════════════════════════════════════════════
-- LOCALE / LANGUAGE
-- ═══════════════════════════════════════════════════════════════════
Config.Locale = {
    ['market_open'] = 'Markete hoş geldiniz!',
    ['purchase_success'] = 'Satın alma başarılı!',
    ['purchase_failed'] = 'Satın alma başarısız!',
    ['not_enough_money'] = 'Yeterli paranız yok!',
    ['inventory_full'] = 'Envanteriniz dolu!',
    ['item_not_found'] = 'Ürün bulunamadı!',
    ['invalid_quantity'] = 'Geçersiz miktar!',
    ['too_far'] = 'Marketten çok uzaksınız!',
    ['market_closed'] = 'Market şu anda kapalı!',
    ['spam_warning'] = 'Çok hızlı işlem yapıyorsunuz!',
    ['points_earned'] = 'Puan kazandınız: ',
}
