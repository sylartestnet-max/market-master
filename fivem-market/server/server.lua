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
        return exports.ox_inventory:CanCarryItem(source, item, quantity)
    elseif Config.Inventory == 'qb' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            local itemData = Config.Items[item]
            local weight = itemData and itemData.weight or 100
            return Player.Functions.CanCarryItem(item, quantity) or true -- Fallback
        end
    elseif Config.Inventory == 'qs' then
        return exports['qs-inventory']:CanCarryItem(source, item, quantity)
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
    
    -- Optional: Save to database
    MySQL.insert('INSERT INTO market_logs (identifier, market_id, items, total, payment_method, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
        {identifier, marketId, json.encode(items), total, paymentMethod})
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
    if Config.Points.Enabled then
        local points = math.floor(totalPrice * Config.Points.PointsPerDollar * Config.Points.Multiplier)
        AddPoints(source, points)
        
        -- Owner bonus points
        if market.ownerId then
            local ownerSource = GetPlayerByIdentifier(market.ownerId)
            if ownerSource then
                local bonusPoints = math.floor(points * (Config.Points.OwnerBonusPercent / 100))
                AddPoints(ownerSource, bonusPoints)
            end
        end
    end
    
    -- Log purchase
    LogPurchase(source, data.marketId, validatedItems, totalPrice, data.paymentMethod)
    
    -- Get new balance
    local newBalance = {
        cash = GetPlayerMoney(source, 'cash'),
        bank = GetPlayerMoney(source, 'bank'),
    }
    
    -- Success response
    local message = string.format('%s ($%s)', Config.Locale['purchase_success'], totalPrice)
    TriggerClientEvent('market:purchaseResult', source, true, message, newBalance)
end)

-- ═══════════════════════════════════════════════════════════════════
-- MARKET TRANSFER
-- ═══════════════════════════════════════════════════════════════════

RegisterNetEvent('market:transferMarket', function(data)
    local source = source
    local market = Config.Markets[data.marketId]
    
    if not market or not market.ownable then return end
    
    -- Check if player is current owner
    local playerId = GetPlayerIdentifier(source)
    if market.ownerId ~= playerId then return end
    
    -- Get new owner info
    local newOwnerSource = GetPlayerByIdentifier(data.newOwnerId)
    if not newOwnerSource then return end
    
    local newOwnerName = GetPlayerName(newOwnerSource)
    
    -- Update config
    Config.Markets[data.marketId].ownerId = data.newOwnerId
    Config.Markets[data.marketId].ownerName = newOwnerName
    
    -- Update database
    MySQL.update('UPDATE market_ownership SET owner_id = ?, owner_name = ? WHERE market_id = ?',
        {data.newOwnerId, newOwnerName, data.marketId})
    
    -- Notify all clients
    TriggerClientEvent('market:updateOwner', -1, data.marketId, data.newOwnerId, newOwnerName)
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
