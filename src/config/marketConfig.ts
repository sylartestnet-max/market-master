import { MarketConfig, PlayerBalance } from '@/types/market';

// Demo market configurations
export const demoMarkets: Record<string, MarketConfig> = {
  market_247: {
    id: 'market_247',
    name: '24/7 Market - Sandy Shores',
    categories: [
      { id: 'food', name: 'Yiyecek', icon: '🍔' },
      { id: 'drinks', name: 'İçecek', icon: '🥤' },
      { id: 'health', name: 'Sağlık', icon: '💊' },
      { id: 'electronics', name: 'Elektronik', icon: '📱' },
      { id: 'tools', name: 'Araçlar', icon: '🔧' },
    ],
    items: [
      // Yiyecek
      { id: 'burger', name: 'Burger', description: 'Lezzetli ızgara burger', detailedDescription: 'Bu lezzetli ızgara burger açlık barınızı %30 oranında doldurur. Taze malzemeler ve özel sosla hazırlanmıştır.', usageInfo: 'Envanterinizden kullanarak açlık seviyenizi artırabilirsiniz. Araç sürerken veya koşarken kullanılamaz.', price: 25, image: '🍔', category: 'food' },
      { id: 'pizza', name: 'Pizza Dilimi', description: 'Sıcak peynirli pizza', detailedDescription: 'İtalyan usulü hazırlanan bu pizza dilimi açlık barınızı %25 oranında doldurur.', usageInfo: 'Envanterinizden kullanın. En iyi sonuç için oturarak yiyin.', price: 30, image: '🍕', category: 'food' },
      { id: 'hotdog', name: 'Sosisli', description: 'Klasik sokak lezzeti', detailedDescription: 'Klasik Amerikan hot dog, açlık barınızı %15 doldurur. Hızlı ve pratik bir seçenek.', usageInfo: 'Yürürken bile yiyebilirsiniz. Hızlı enerji için idealdir.', price: 15, image: '🌭', category: 'food' },
      { id: 'sandwich', name: 'Sandviç', description: 'Taze malzemelerle', detailedDescription: 'Taze sebzeler ve kaliteli etlerle hazırlanan sandviç. Açlık barınızı %20 doldurur.', usageInfo: 'Envanterinizden kullanın. Sağlık regenerasyonunu hafif artırır.', price: 20, image: '🥪', category: 'food' },
      { id: 'donut', name: 'Donut', description: 'Tatlı ve yumuşak', detailedDescription: 'Şekerli ve yumuşak bu tatlı, açlık barınızı %10 doldurur. Polis departmanının favorisi!', usageInfo: 'Hızlı şeker takviyesi sağlar. Koşu hızınızı geçici olarak artırabilir.', price: 10, image: '🍩', category: 'food' },
      { id: 'fries', name: 'Patates Kızartması', description: 'Çıtır çıtır', detailedDescription: 'Çıtır çıtır patates kızartması. Açlık barınızı %12 doldurur.', usageInfo: 'Yanık bir yemek olarak tek başına veya burger ile birlikte tüketilebilir.', price: 12, image: '🍟', category: 'food' },
      
      // İçecek
      { id: 'cola', name: 'Cola', description: 'Soğuk ve ferahlatıcı', price: 8, image: '🥤', category: 'drinks' },
      { id: 'water', name: 'Su', description: 'Saf kaynak suyu', price: 5, image: '💧', category: 'drinks' },
      { id: 'coffee', name: 'Kahve', description: 'Sıcak espresso', price: 15, image: '☕', category: 'drinks' },
      { id: 'energy', name: 'Enerji İçeceği', description: 'Güç ver!', price: 20, image: '⚡', category: 'drinks' },
      { id: 'juice', name: 'Meyve Suyu', description: 'Taze sıkılmış', price: 12, image: '🧃', category: 'drinks' },
      
      // Sağlık
      { id: 'bandage', name: 'Bandaj', description: 'İlk yardım bandajı', price: 50, image: '🩹', category: 'health' },
      { id: 'medkit', name: 'İlk Yardım Kiti', description: 'Tam iyileşme sağlar', price: 250, image: '🏥', category: 'health' },
      { id: 'painkiller', name: 'Ağrı Kesici', description: 'Ağrıları dindirir', price: 75, image: '💊', category: 'health' },
      { id: 'vitamins', name: 'Vitamin', description: 'Sağlık takviyesi', price: 40, image: '💉', category: 'health' },
      
      // Elektronik
      { id: 'phone', name: 'Telefon', description: 'Akıllı telefon', price: 500, image: '📱', category: 'electronics' },
      { id: 'radio', name: 'Telsiz', description: 'İletişim cihazı', price: 150, image: '📻', category: 'electronics' },
      { id: 'camera', name: 'Kamera', description: 'Fotoğraf çek', price: 300, image: '📷', category: 'electronics' },
      { id: 'flashlight', name: 'El Feneri', description: 'Karanlığı aydınlat', price: 45, image: '🔦', category: 'electronics' },
      
      // Araçlar
      { id: 'lockpick', name: 'Maymuncuk', description: 'Kilit açma aleti', price: 100, image: '🔓', category: 'tools' },
      { id: 'repairkit', name: 'Tamir Kiti', description: 'Araç tamiri için', price: 500, image: '🔧', category: 'tools' },
      { id: 'rope', name: 'İp', description: 'Çok amaçlı ip', price: 35, image: '🪢', category: 'tools' },
      { id: 'binoculars', name: 'Dürbün', description: 'Uzağı gör', price: 200, image: '🔭', category: 'tools' },
    ],
  },
  
  weapon_shop: {
    id: 'weapon_shop',
    name: 'Ammunition - Silah Dükkanı',
    categories: [
      { id: 'pistols', name: 'Tabancalar', icon: '🔫' },
      { id: 'ammo', name: 'Mühimmat', icon: '🎯' },
      { id: 'armor', name: 'Zırh', icon: '🛡️' },
      { id: 'accessories', name: 'Aksesuarlar', icon: '🔩' },
    ],
    items: [
      // Tabancalar
      { id: 'pistol', name: 'Pistol', description: 'Standart tabanca', price: 2500, image: '🔫', category: 'pistols' },
      { id: 'pistol_mk2', name: 'Pistol MK2', description: 'Geliştirilmiş tabanca', price: 5000, image: '🔫', category: 'pistols' },
      { id: 'combatpistol', name: 'Combat Pistol', description: 'Savaş tabancası', price: 7500, image: '🔫', category: 'pistols' },
      
      // Mühimmat
      { id: 'ammo_pistol', name: 'Tabanca Mermisi', description: '12 adet mermi', price: 150, image: '🎯', category: 'ammo' },
      { id: 'ammo_rifle', name: 'Tüfek Mermisi', description: '30 adet mermi', price: 500, image: '🎯', category: 'ammo' },
      { id: 'ammo_smg', name: 'SMG Mermisi', description: '30 adet mermi', price: 300, image: '🎯', category: 'ammo' },
      
      // Zırh
      { id: 'armor_light', name: 'Hafif Zırh', description: '%50 koruma', price: 1000, image: '🛡️', category: 'armor' },
      { id: 'armor_heavy', name: 'Ağır Zırh', description: '%100 koruma', price: 2500, image: '🛡️', category: 'armor' },
      
      // Aksesuarlar
      { id: 'silencer', name: 'Susturucu', description: 'Sessiz atış', price: 1500, image: '🔩', category: 'accessories' },
      { id: 'flashlight_gun', name: 'Taktik Fener', description: 'Silah feneri', price: 800, image: '🔦', category: 'accessories' },
    ],
  },
  
  pharmacy: {
    id: 'pharmacy',
    name: 'Eczane - Los Santos',
    categories: [
      { id: 'medicine', name: 'İlaçlar', icon: '💊' },
      { id: 'firstaid', name: 'İlk Yardım', icon: '🏥' },
      { id: 'supplements', name: 'Takviyeler', icon: '💪' },
    ],
    items: [
      // İlaçlar
      { id: 'aspirin', name: 'Aspirin', description: 'Baş ağrısı ilacı', price: 25, image: '💊', category: 'medicine' },
      { id: 'antibiotics', name: 'Antibiyotik', description: 'Enfeksiyona karşı', price: 100, image: '💊', category: 'medicine' },
      { id: 'adrenaline', name: 'Adrenalin', description: 'Acil müdahale', price: 500, image: '💉', category: 'medicine' },
      
      // İlk Yardım
      { id: 'bandage_sterile', name: 'Steril Bandaj', description: 'Hijyenik bandaj', price: 75, image: '🩹', category: 'firstaid' },
      { id: 'medkit_pro', name: 'Profesyonel Kit', description: 'Tam donanımlı', price: 500, image: '🏥', category: 'firstaid' },
      { id: 'icepack', name: 'Buz Torbası', description: 'Şişlik için', price: 30, image: '🧊', category: 'firstaid' },
      
      // Takviyeler
      { id: 'protein', name: 'Protein Tozu', description: 'Kas gelişimi', price: 150, image: '💪', category: 'supplements' },
      { id: 'multivitamin', name: 'Multivitamin', description: 'Günlük vitamin', price: 60, image: '🌟', category: 'supplements' },
      { id: 'energybar', name: 'Enerji Barı', description: 'Hızlı enerji', price: 35, image: '🍫', category: 'supplements' },
    ],
  },
};

// Demo player balance
export const demoBalance: PlayerBalance = {
  cash: 5000,
  bank: 25000,
  points: 350,
  minPointWithdraw: 500,
};

// Get default market
export const getDefaultMarket = (): MarketConfig => demoMarkets.market_247;
