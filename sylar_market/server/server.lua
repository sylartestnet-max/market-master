-- ═══════════════════════════════════════════════════════════════════
-- SERVER SIDE - MARKET SYSTEM
-- ═══════════════════════════════════════════════════════════════════

local QBCore = nil
local ESX = nil
local playerLastPurchase = {}

-- ═══════════════════════════════════════════════════════════════════
-- FRAMEWORK INITIALIZATION
-- ═══════════════════════════════════════════════════════════════════

CreateThread(function()
    if Config.Framework == 'qb' then
        QBCore = exports['qb-core']:GetCoreObject()
    elseif Config.Framework == 'esx' then
        ESX = exports['es_extended']:getSharedObject()
    end
end)

-- ═══════════════════════════════════════════════════════════════════
-- UTILITY FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

local function GetPlayer(source)
    if Config.Framework == 'qb' then
        return QBCore.Functions.GetPlayer(source)
    elseif Config.Framework == 'esx' then
        return ESX.GetPlayerFromId(source)
    end
    return nil
end

-- DEV yetkisi kontrolü: QBCore permission veya ace izin
local function IsPlayerDev(source)
    if not source or source == 0 then return false end

    -- Ace izinleri kontrolü
    if Config.DevAces then
        for _, ace in ipairs(Config.DevAces) do
            if IsPlayerAceAllowed(source, ace) then
                return true
            end
        end
    end

    -- QBCore permission kontrolü
    if Config.Framework == 'qb' and QBCore then
        if Config.DevPermissions then
            for _, perm in ipairs(Config.DevPermissions) do
                local ok, has = pcall(function()
                    return QBCore.Functions.HasPermission(source, perm)
                end)
                if ok and has then
                    return true
                end
            end
        end
    end

    return false
end

-- Client'tan dev yetkisini sorgulamak için callback
RegisterNetEvent('market:requestDevStatus', function()
    local src = source
    TriggerClientEvent('market:devStatus', src, IsPlayerDev(src))
end)

local function GetPlayerIdentifier(source)
    if Config.Framework == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        return Player and Player.PlayerData.citizenid or nil
    elseif Config.Framework == 'esx' then
        local Player = ESX.GetPlayerFromId(source)
        return Player and Player.identifier or nil
    end
    return nil
end

local function GetPlayerMoney(source, moneyType)
    if Config.Framework == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            return Player.PlayerData.money[moneyType] or 0
        end
    elseif Config.Framework == 'esx' then
        local Player = ESX.GetPlayerFromId(source)
        if Player then
            if moneyType == 'cash' then
                return Player.getMoney()
            else
                return Player.getAccount('bank').money
            end
        end
    end
    return 0
end

local function RemoveMoney(source, moneyType, amount)
    if Config.Framework == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            return Player.Functions.RemoveMoney(moneyType, amount, 'market-purchase')
        end
    elseif Config.Framework == 'esx' then
        local Player = ESX.GetPlayerFromId(source)
        if Player then
            if moneyType == 'cash' then
                Player.removeMoney(amount)
            else
                Player.removeAccountMoney('bank', amount)
            end
            return true
        end
    end
    return false
end

local function AddItem(source, item, quantity)
    if Config.Inventory == 'ox' then
        return exports.ox_inventory:AddItem(source, item, quantity)
    elseif Config.Inventory == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            return Player.Functions.AddItem(item, quantity)
        end
    elseif Config.Inventory == 'qs' then
        return exports['qs-inventory']:AddItem(source, item, quantity)
    end
    return false
end

local function CanCarryItem(source, item, quantity)
    if Config.Inventory == 'ox' then
        local ok, result = pcall(function()
            return exports.ox_inventory:CanCarryItem(source, item, quantity)
        end)
        if ok then return result end
        return true
    elseif Config.Inventory == 'qb' then
        -- QB-Inventory: CanCarryItem doesn't always exist; default to allow
        local Player = QBCore.Functions.GetPlayer(source)
        if not Player then return false end
        local ok, result = pcall(function()
            if Player.Functions and Player.Functions.CanCarryItem then
                return Player.Functions.CanCarryItem(item, quantity)
            end
            return true
        end)
        if ok and result == false then return false end
        return true
    elseif Config.Inventory == 'qs' then
        local ok, result = pcall(function()
            return exports['qs-inventory']:CanCarryItem(source, item, quantity)
        end)
        if ok then return result end
        return true
    end
    return true
end

local function AddPoints(source, points)
    if not Config.Points.Enabled then return end
    
    if Config.Framework == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            local currentPoints = Player.PlayerData.metadata['marketpoints'] or 0
            Player.Functions.SetMetaData('marketpoints', currentPoints + points)
        end
    elseif Config.Framework == 'esx' then
        -- ESX: Store in database
        local identifier = GetPlayerIdentifier(source)
        if identifier then
            MySQL.update('UPDATE users SET marketpoints = marketpoints + ? WHERE identifier = ?', 
                {points, identifier})
        end
    end
end

local function GetPlayerPoints(source)
    if not Config.Points.Enabled then return 0 end

    if Config.Framework == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            return Player.PlayerData.metadata['marketpoints'] or 0
        end
    elseif Config.Framework == 'esx' then
        local identifier = GetPlayerIdentifier(source)
        if identifier then
            local result = MySQL.query.await('SELECT marketpoints FROM users WHERE identifier = ?', { identifier })
            return result[1] and result[1].marketpoints or 0
        end
    end

    return 0
end

local function RemovePoints(source, points)
    if not Config.Points.Enabled then return false end

    if Config.Framework == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            local currentPoints = Player.PlayerData.metadata['marketpoints'] or 0
            if currentPoints < points then return false end
            Player.Functions.SetMetaData('marketpoints', currentPoints - points)
            return true
        end
    elseif Config.Framework == 'esx' then
        local identifier = GetPlayerIdentifier(source)
        if identifier then
            local currentPoints = GetPlayerPoints(source)
            if currentPoints < points then return false end
            MySQL.update('UPDATE users SET marketpoints = marketpoints - ? WHERE identifier = ?', { points, identifier })
            return true
        end
    end

    return false
end

local function AddBankMoney(source, amount)
    if Config.Framework == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            return Player.Functions.AddMoney('bank', amount, 'market-points-withdraw')
        end
    elseif Config.Framework == 'esx' then
        local Player = ESX.GetPlayerFromId(source)
        if Player then
            Player.addAccountMoney('bank', amount)
            return true
        end
    end

    return false
end

local function LogPurchase(source, marketId, items, total, paymentMethod)
    if not Config.Security.LogPurchases then return end

    local identifier = GetPlayerIdentifier(source)
    local itemNames = {}

    for _, item in ipairs(items) do
        table.insert(itemNames, item.itemId .. ' x' .. item.quantity)
    end

    print(string.format(
        '[MARKET] Player: %s | Market: %s | Items: %s | Total: $%d | Method: %s',
        identifier or source,
        marketId,
        table.concat(itemNames, ', '),
        total,
        paymentMethod
    ))

    -- Optional: Save to database (wrapped in pcall so missing table doesn't break purchase)
    pcall(function()
        if MySQL and MySQL.insert then
            MySQL.insert('INSERT INTO market_logs (identifier, market_id, items, total, payment_method, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
                {identifier, marketId, json.encode(items), total, paymentMethod})
        end
    end)
end

-- ═══════════════════════════════════════════════════════════════════
-- ANTI-EXPLOIT: Rate limiting
-- ═══════════════════════════════════════════════════════════════════

local function CanPurchase(source)
    local currentTime = os.time() * 1000
    local lastTime = playerLastPurchase[source] or 0
    
    if currentTime - lastTime < Config.Security.EventSpamDelay then
        return false
    end
    
    playerLastPurchase[source] = currentTime
    return true
end

-- ═══════════════════════════════════════════════════════════════════
-- PURCHASE EVENT
-- ═══════════════════════════════════════════════════════════════════

RegisterNetEvent('market:purchase', function(data)
    local source = source
    
    -- Anti-spam check
    if not CanPurchase(source) then
        TriggerClientEvent('market:purchaseResult', source, false, Config.Locale['spam_warning'])
        return
    end
    
    -- Validate market
    local market = Config.Markets[data.marketId]
    if not market then
        TriggerClientEvent('market:purchaseResult', source, false, Config.Locale['market_closed'])
        return
    end
    
    -- Validate items and calculate total (SERVER-SIDE PRICE)
    local totalPrice = 0
    local totalWeight = 0
    local validatedItems = {}
    
    for _, purchaseItem in ipairs(data.items) do
        local itemConfig = Config.Items[purchaseItem.itemId]
        
        if not itemConfig then
            TriggerClientEvent('market:purchaseResult', source, false, Config.Locale['item_not_found'])
            return
        end
        
        -- Check if category is allowed in this market
        local categoryAllowed = false
        for _, cat in ipairs(market.categories) do
            if cat == itemConfig.category then
                categoryAllowed = true
                break
            end
        end
        
        if not categoryAllowed then
            TriggerClientEvent('market:purchaseResult', source, false, Config.Locale['item_not_found'])
            return
        end
        
        -- Validate quantity
        local quantity = math.floor(purchaseItem.quantity or 0)
        if quantity <= 0 or quantity > Config.Security.MaxPurchaseQuantity then
            TriggerClientEvent('market:purchaseResult', source, false, Config.Locale['invalid_quantity'])
            return
        end
        
        -- Calculate using SERVER price (anti-exploit)
        totalPrice = totalPrice + (itemConfig.price * quantity)
        totalWeight = totalWeight + (itemConfig.weight * quantity)
        
        table.insert(validatedItems, {
            itemId = purchaseItem.itemId,
            quantity = quantity,
            price = itemConfig.price
        })
    end
    
    -- Check inventory space
    for _, item in ipairs(validatedItems) do
        if not CanCarryItem(source, item.itemId, item.quantity) then
            TriggerClientEvent('market:purchaseResult', source, false, Config.Locale['inventory_full'])
            return
        end
    end
    
    -- Check money
    local playerMoney = GetPlayerMoney(source, data.paymentMethod)
    if playerMoney < totalPrice then
        TriggerClientEvent('market:purchaseResult', source, false, Config.Locale['not_enough_money'])
        return
    end
    
    -- Process purchase
    if not RemoveMoney(source, data.paymentMethod, totalPrice) then
        TriggerClientEvent('market:purchaseResult', source, false, Config.Locale['purchase_failed'])
        return
    end
    
    -- Give items
    for _, item in ipairs(validatedItems) do
        AddItem(source, item.itemId, item.quantity)
    end
    
    -- Calculate and add points
    local points = 0
    if Config.Points.Enabled then
        points = math.floor(totalPrice * Config.Points.PointsPerDollar * Config.Points.Multiplier)
        AddPoints(source, points)

        -- Owner bonus points (online ise)
        if market.ownerId then
            local ownerSource = GetPlayerByIdentifier(market.ownerId)
            if ownerSource then
                local bonusPoints = math.floor(points * (Config.Points.OwnerBonusPercent / 100))
                AddPoints(ownerSource, bonusPoints)
            end
        end
    end

    -- ═══════════ MARKET SAHİBİ KASA BONUSU ═══════════
    -- TÜM marketlerden kazanılan puanların %50'si market mesleğindeki kişinin (boss menü) kasasına yatar.
    -- Sahip = market_ownership tablosundaki herhangi bir aktif sahip; biz "market" job kasasına ekliyoruz.
    if Config.OwnerCutPercent and Config.OwnerCutPercent > 0 and points > 0 then
        local cut = math.floor(points * (Config.OwnerCutPercent / 100))
        if cut > 0 then
            pcall(function()
                if MySQL and MySQL.update then
                    -- management_funds tablosu (sylar_bossmenu) ile entegre
                    MySQL.update.await([[
                        INSERT INTO management_funds (job_name, amount, type)
                        VALUES (?, ?, 'boss')
                        ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)
                    ]], { Config.MarketJob or 'market', cut })
                end
            end)
        end
    end

    -- Log purchase
    LogPurchase(source, data.marketId, validatedItems, totalPrice, data.paymentMethod)

    -- Haftalık satış istatistiklerini MySQL'e kaydet (kalıcı)
    pcall(function()
        if MySQL and MySQL.insert then
            for _, vi in ipairs(validatedItems) do
                local itemConf = Config.Items[vi.itemId]
                local itemName = itemConf and itemConf.name or vi.itemId
                MySQL.insert.await([[
                    INSERT INTO market_weekly_sales (sale_date, item_id, item_name, quantity)
                    VALUES (CURDATE(), ?, ?, ?)
                    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), item_name = VALUES(item_name)
                ]], { vi.itemId, itemName, vi.quantity })
            end
        end
    end)

    -- Get new balance
    local newBalance = {
        cash = GetPlayerMoney(source, 'cash'),
        bank = GetPlayerMoney(source, 'bank'),
        points = GetPlayerPoints(source),
    }

    -- Success response
    local message = string.format('%s ($%s)', Config.Locale['purchase_success'], totalPrice)
    TriggerClientEvent('market:purchaseResult', source, true, message, newBalance)
end)

-- ═══════════════════════════════════════════════════════════════════
-- HAFTALIK SATIŞ İSTATİSTİKLERİ (kalıcı, MySQL)
-- ═══════════════════════════════════════════════════════════════════

local function GetWeeklySales()
    local out = {}
    local rows = {}
    pcall(function()
        rows = MySQL.query.await([[
            SELECT DATE_FORMAT(sale_date, '%Y-%m-%d') AS date, item_id, item_name, quantity
            FROM market_weekly_sales
            WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            ORDER BY sale_date ASC
        ]]) or {}
    end)

    -- 7 günlük şablon
    local dayMap = {}
    for i = 6, 0, -1 do
        local key = os.date('%Y-%m-%d', os.time() - i * 86400)
        dayMap[key] = { date = key, items = {} }
        table.insert(out, dayMap[key])
    end

    local itemNames = {}
    for _, r in ipairs(rows) do
        if dayMap[r.date] then
            dayMap[r.date].items[r.item_id] = (dayMap[r.date].items[r.item_id] or 0) + (r.quantity or 0)
        end
        itemNames[r.item_id] = r.item_name
    end

    return out, itemNames
end

RegisterNetEvent('market:requestSalesData', function()
    local src = source
    local sales, names = GetWeeklySales()
    TriggerClientEvent('market:salesData', src, sales, names)
end)

-- ═══════════════════════════════════════════════════════════════════
-- MARKET TRANSFER
-- ═══════════════════════════════════════════════════════════════════

RegisterNetEvent('market:transferMarket', function(data)
    local source = source

    -- DEV yetkisi kontrolü (sadece dev marketi devredebilir)
    if not IsPlayerDev(source) then
        TriggerClientEvent('market:transferResult', source, false, 'Bu işlem için DEV yetkisi gereklidir.')
        return
    end

    local market = Config.Markets[data.marketId]

    if not market then
        TriggerClientEvent('market:transferResult', source, false, 'Market bulunamadı.')
        return
    end

    -- DEV her marketi devredebilir (ownable kontrolü atlanır)

    -- Get new owner info
    local newOwnerSource = GetPlayerByIdentifier(data.newOwnerId)
    if not newOwnerSource then
        TriggerClientEvent('market:transferResult', source, false, 'Yeni sahip oyunda bulunamadı.')
        return
    end

    local newOwnerName = data.newOwnerName and data.newOwnerName ~= '' and data.newOwnerName or GetPlayerName(newOwnerSource)

    -- Update config
    Config.Markets[data.marketId].ownerId = data.newOwnerId
    Config.Markets[data.marketId].ownerName = newOwnerName

    -- Update database
    MySQL.update('UPDATE market_ownership SET owner_id = ?, owner_name = ? WHERE market_id = ?',
        {data.newOwnerId, newOwnerName, data.marketId})

    -- ═══════════ MARKET MESLEĞİNE BOSS OLARAK ATA ═══════════
    if Config.Framework == 'qb' and QBCore then
        local NewOwnerPlayer = QBCore.Functions.GetPlayer(newOwnerSource)
        if NewOwnerPlayer then
            local jobName = Config.MarketJob or 'market'
            local jobGrade = Config.MarketJobBossGrade or 4
            local ok = pcall(function()
                NewOwnerPlayer.Functions.SetJob(jobName, jobGrade)
            end)
            if ok then
                TriggerClientEvent('QBCore:Notify', newOwnerSource,
                    ('Artık %s mesleğinin patronusunuz.'):format(jobName), 'success')
            end
        end
    end

    -- Notify all clients
    TriggerClientEvent('market:updateOwner', -1, data.marketId, data.newOwnerId, newOwnerName)
    TriggerClientEvent('market:transferResult', source, true, 'Market başarıyla devredildi.')
end)

RegisterNetEvent('market:withdrawPoints', function(data)
    local source = source
    local amount = math.floor(tonumber(data.amount) or 0)

    if amount < ((Config.Points and Config.Points.minWithdraw) or 500) then
        TriggerClientEvent('market:withdrawResult', source, false, 'Geçersiz miktar!')
        return
    end

    local currentPoints = GetPlayerPoints(source)
    if currentPoints < amount then
        TriggerClientEvent('market:withdrawResult', source, false, 'Yeterli puanınız yok!')
        return
    end

    if not RemovePoints(source, amount) then
        TriggerClientEvent('market:withdrawResult', source, false, 'Puan düşülemedi!')
        return
    end

    if not AddBankMoney(source, amount) then
        AddPoints(source, amount)
        TriggerClientEvent('market:withdrawResult', source, false, 'Banka bakiyesi güncellenemedi!')
        return
    end

    TriggerClientEvent('market:withdrawResult', source, true, ('%s puan bankaya aktarıldı!'):format(amount), {
        cash = GetPlayerMoney(source, 'cash'),
        bank = GetPlayerMoney(source, 'bank'),
        points = GetPlayerPoints(source),
    })
end)

-- ═══════════════════════════════════════════════════════════════════
-- HELPER: Get player by identifier
-- ═══════════════════════════════════════════════════════════════════

function GetPlayerByIdentifier(identifier)
    if Config.Framework == 'qb' then
        local players = QBCore.Functions.GetPlayers()
        for _, playerId in ipairs(players) do
            local Player = QBCore.Functions.GetPlayer(playerId)
            if Player and Player.PlayerData.citizenid == identifier then
                return playerId
            end
        end
    elseif Config.Framework == 'esx' then
        local players = ESX.GetPlayers()
        for _, playerId in ipairs(players) do
            local Player = ESX.GetPlayerFromId(playerId)
            if Player and Player.identifier == identifier then
                return playerId
            end
        end
    end
    return nil
end

function GetPlayerName(source)
    if Config.Framework == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            return Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname
        end
    elseif Config.Framework == 'esx' then
        local Player = ESX.GetPlayerFromId(source)
        if Player then
            return Player.getName()
        end
    end
    return 'Unknown'
end

-- ═══════════════════════════════════════════════════════════════════
-- ESX CALLBACK
-- ═══════════════════════════════════════════════════════════════════

if Config.Framework == 'esx' then
    ESX.RegisterServerCallback('market:getBalance', function(source, cb)
        local Player = ESX.GetPlayerFromId(source)
        if Player then
            local result = MySQL.query.await('SELECT marketpoints FROM users WHERE identifier = ?', 
                {Player.identifier})
            cb({
                cash = Player.getMoney(),
                bank = Player.getAccount('bank').money,
                points = result[1] and result[1].marketpoints or 0
            })
        else
            cb({ cash = 0, bank = 0, points = 0 })
        end
    end)
end

-- ═══════════════════════════════════════════════════════════════════
-- LOAD MARKET OWNERSHIP FROM DATABASE
-- ═══════════════════════════════════════════════════════════════════

CreateThread(function()
    Wait(1000) -- Wait for MySQL to be ready
    
    local results = MySQL.query.await('SELECT * FROM market_ownership')
    
    if results then
        for _, row in ipairs(results) do
            if Config.Markets[row.market_id] then
                Config.Markets[row.market_id].ownerId = row.owner_id
                Config.Markets[row.market_id].ownerName = row.owner_name
            end
        end
    end
    
    print('[MARKET] Loaded ' .. (#results or 0) .. ' market ownership records')
end)
