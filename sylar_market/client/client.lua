-- ═══════════════════════════════════════════════════════════════════
-- CLIENT SIDE - MARKET SYSTEM
-- ═══════════════════════════════════════════════════════════════════

local QBCore = nil
local ESX = nil
local isUIOpen = false
local currentMarket = nil
local lastEventTime = 0
local isDev = false

-- Server'dan dev statüsünü al
RegisterNetEvent('market:devStatus', function(value)
    isDev = value and true or false
    if isUIOpen then
        SendNUIMessage({ action = 'updateDevStatus', isDev = isDev })
    end
end)

CreateThread(function()
    Wait(2000)
    TriggerServerEvent('market:requestDevStatus')
end)

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

local function Notify(message, type)
    if Config.Notification == 'ox' then
        lib.notify({ title = 'Market', description = message, type = type })
    elseif Config.Notification == 'qb' then
        QBCore.Functions.Notify(message, type)
    elseif Config.Notification == 'esx' then
        ESX.ShowNotification(message)
    else
        SetNotificationTextEntry('STRING')
        AddTextComponentString(message)
        DrawNotification(false, false)
    end
end

local function CanTriggerEvent()
    local currentTime = GetGameTimer()
    if currentTime - lastEventTime < Config.Security.EventSpamDelay then
        Notify(Config.Locale['spam_warning'], 'error')
        return false
    end
    lastEventTime = currentTime
    return true
end

local function GetDistanceToMarket(marketId)
    local market = Config.Markets[marketId]
    if not market then return 999.0 end
    
    local playerPed = PlayerPedId()
    local playerCoords = GetEntityCoords(playerPed)
    return #(playerCoords - market.coords)
end

-- ═══════════════════════════════════════════════════════════════════
-- NUI CALLBACKS
-- ═══════════════════════════════════════════════════════════════════

RegisterNUICallback('closeMarket', function(data, cb)
    isUIOpen = false
    SetNuiFocus(false, false)
    currentMarket = nil
    cb('ok')
end)

RegisterNUICallback('purchase', function(data, cb)
    if not CanTriggerEvent() then
        cb({ success = false, message = Config.Locale['spam_warning'] })
        return
    end
    
    if not currentMarket then
        cb({ success = false, message = Config.Locale['market_closed'] })
        return
    end
    
    -- Distance check
    if GetDistanceToMarket(currentMarket) > Config.Security.DistanceCheck then
        cb({ success = false, message = Config.Locale['too_far'] })
        return
    end
    
    -- Validate data
    if not data.items or #data.items == 0 then
        cb({ success = false, message = Config.Locale['invalid_quantity'] })
        return
    end
    
    -- Quantity check
    local totalQuantity = 0
    for _, item in ipairs(data.items) do
        totalQuantity = totalQuantity + (item.quantity or 0)
    end
    
    if totalQuantity > Config.Security.MaxPurchaseQuantity then
        cb({ success = false, message = Config.Locale['invalid_quantity'] })
        return
    end
    
    -- Send to server for processing
    TriggerServerEvent('market:purchase', {
        marketId = currentMarket,
        items = data.items,
        paymentMethod = data.paymentMethod,
    })
    
    cb({ success = true })
end)

RegisterNUICallback('getBalance', function(data, cb)
    if Config.Framework == 'qb' then
        local PlayerData = QBCore.Functions.GetPlayerData()
        cb({
            cash = PlayerData.money['cash'] or 0,
            bank = PlayerData.money['bank'] or 0,
            points = PlayerData.metadata['marketpoints'] or 0,
        })
    elseif Config.Framework == 'esx' then
        ESX.TriggerServerCallback('market:getBalance', function(balance)
            cb(balance)
        end)
    else
        cb({ cash = 0, bank = 0, points = 0 })
    end
end)

RegisterNUICallback('transferMarket', function(data, cb)
    if not CanTriggerEvent() then
        cb({ success = false, message = Config.Locale['spam_warning'] })
        return
    end

    if not currentMarket then
        cb({ success = false, message = Config.Locale['market_closed'] })
        return
    end
    
    TriggerServerEvent('market:transferMarket', {
        marketId = currentMarket,
        newOwnerId = data.newOwnerId,
        newOwnerName = data.newOwnerName,
    })
    
    cb({ success = true })
end)

RegisterNUICallback('withdrawPoints', function(data, cb)
    if not CanTriggerEvent() then
        cb({ success = false, message = Config.Locale['spam_warning'] })
        return
    end

    local amount = math.floor(tonumber(data.amount) or 0)
    if amount < ((Config.Points and Config.Points.minWithdraw) or 500) then
        cb({ success = false, message = Config.Locale['invalid_quantity'] })
        return
    end

    TriggerServerEvent('market:withdrawPoints', {
        amount = amount,
    })

    cb({ success = true })
end)

-- ═══════════════════════════════════════════════════════════════════
-- OPEN MARKET UI
-- ═══════════════════════════════════════════════════════════════════

local function OpenMarket(marketId)
    if isUIOpen then return end
    
    local market = Config.Markets[marketId]
    if not market then return end
    
    currentMarket = marketId
    isUIOpen = true
    
    -- Build items list for this market
    local items = {}
    for itemId, itemData in pairs(Config.Items) do
        for _, allowedCategory in ipairs(market.categories) do
            if itemData.category == allowedCategory then
                table.insert(items, {
                    id = itemId,
                    name = itemData.name,
                    price = itemData.price,
                    category = itemData.category,
                    image = itemData.image,
                    description = itemData.description,
                    detailedDescription = itemData.detailedDescription,
                    usageInfo = itemData.usageInfo,
                    weight = itemData.weight,
                    maxStock = itemData.maxStock,
                })
                break
            end
        end
    end
    
    -- Build categories list
    local categories = {}
    for _, catId in ipairs(market.categories) do
        local catData = Config.Categories[catId]
        if catData then
            table.insert(categories, {
                id = catId,
                name = catData.name,
                icon = catData.icon,
                color = catData.color,
            })
        end
    end

    local availableMarkets = {}
    for id, marketData in pairs(Config.Markets) do
        local marketCategories = {}
        for _, marketCatId in ipairs(marketData.categories) do
            local marketCatData = Config.Categories[marketCatId]
            if marketCatData then
                table.insert(marketCategories, {
                    id = marketCatId,
                    name = marketCatData.name,
                    icon = marketCatData.icon,
                    color = marketCatData.color,
                })
            end
        end

        local marketItems = {}
        for itemId, itemData in pairs(Config.Items) do
            for _, allowedCategory in ipairs(marketData.categories) do
                if itemData.category == allowedCategory then
                    table.insert(marketItems, {
                        id = itemId,
                        name = itemData.name,
                        price = itemData.price,
                        category = itemData.category,
                        image = itemData.image,
                        description = itemData.description,
                        detailedDescription = itemData.detailedDescription,
                        usageInfo = itemData.usageInfo,
                        weight = itemData.weight,
                        maxStock = itemData.maxStock,
                    })
                    break
                end
            end
        end

        table.insert(availableMarkets, {
            id = id,
            name = marketData.name,
            ownerId = marketData.ownerId,
            ownerName = marketData.ownerName,
            ownable = marketData.ownable,
            items = marketItems,
            categories = marketCategories,
        })
    end
    
    -- Get player balance
    local balance = { cash = 0, bank = 0, points = 0 }
    if Config.Framework == 'qb' then
        local PlayerData = QBCore.Functions.GetPlayerData()
        balance.cash = PlayerData.money['cash'] or 0
        balance.bank = PlayerData.money['bank'] or 0
        balance.points = PlayerData.metadata['marketpoints'] or 0
    end
    
    -- Send data to NUI (market-app.js expects data.config and data.balance structure)
    SendNUIMessage({
        action = 'openMarket',
        config = {
            id = marketId,
            name = market.name,
            ownerId = market.ownerId,
            ownerName = market.ownerName,
            ownable = market.ownable,
            items = items,
            categories = categories,
        },
        availableMarkets = availableMarkets,
        balance = {
            cash = balance.cash,
            bank = balance.bank,
            points = balance.points,
            minPointWithdraw = (Config.Points and Config.Points.minWithdraw) or 500,
        },
        pointsConfig = Config.Points,
        isDev = isDev,
    })

    -- Dev statüsünü ve satış verilerini her açılışta tazele
    TriggerServerEvent('market:requestDevStatus')
    TriggerServerEvent('market:requestSalesData')

    SetNuiFocus(true, true)
    Notify(Config.Locale['market_open'], 'success')
end

-- ═══════════════════════════════════════════════════════════════════
-- BLIPS & NPCS
-- ═══════════════════════════════════════════════════════════════════

CreateThread(function()
    for marketId, market in pairs(Config.Markets) do
        -- Create blips
        if market.blip.enabled then
            local blip = AddBlipForCoord(market.coords.x, market.coords.y, market.coords.z)
            SetBlipSprite(blip, market.blip.sprite)
            SetBlipDisplay(blip, 4)
            SetBlipScale(blip, market.blip.scale)
            SetBlipColour(blip, market.blip.color)
            SetBlipAsShortRange(blip, true)
            BeginTextCommandSetBlipName("STRING")
            AddTextComponentString(market.name)
            EndTextCommandSetBlipName(blip)
        end
        
        -- Create NPCs
        if market.npc.enabled then
            RequestModel(GetHashKey(market.npc.model))
            while not HasModelLoaded(GetHashKey(market.npc.model)) do
                Wait(100)
            end
            
            local ped = CreatePed(4, GetHashKey(market.npc.model), 
                market.coords.x, market.coords.y, market.coords.z - 1.0, 
                market.npc.heading, false, true)
            
            SetEntityInvincible(ped, true)
            SetBlockingOfNonTemporaryEvents(ped, true)
            FreezeEntityPosition(ped, true)
            
            -- Target system
            if Config.Target == 'ox' then
                exports.ox_target:addLocalEntity(ped, {
                    {
                        name = 'market_' .. marketId,
                        icon = 'fas fa-shopping-cart',
                        label = 'Alışveriş Yap',
                        onSelect = function()
                            OpenMarket(marketId)
                        end
                    }
                })
            elseif Config.Target == 'qb' then
                exports['qb-target']:AddTargetEntity(ped, {
                    options = {
                        {
                            type = "client",
                            icon = 'fas fa-shopping-cart',
                            label = 'Alışveriş Yap',
                            action = function()
                                OpenMarket(marketId)
                            end,
                        },
                    },
                    distance = 2.5,
                })
            end
        end
    end
end)

-- ═══════════════════════════════════════════════════════════════════
-- KEYBIND (for testing without target)
-- ═══════════════════════════════════════════════════════════════════

if Config.Target == 'none' then
    CreateThread(function()
        while true do
            Wait(0)
            local playerPed = PlayerPedId()
            local playerCoords = GetEntityCoords(playerPed)
            
            for marketId, market in pairs(Config.Markets) do
                local distance = #(playerCoords - market.coords)
                
                if distance < 2.0 then
                    DrawText3D(market.coords.x, market.coords.y, market.coords.z + 1.0, 
                        '[E] ' .. market.name)
                    
                    if IsControlJustReleased(0, 38) then -- E key
                        OpenMarket(marketId)
                    end
                end
            end
        end
    end)
end

function DrawText3D(x, y, z, text)
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    ClearDrawOrigin()
end

-- ═══════════════════════════════════════════════════════════════════
-- SERVER EVENTS
-- ═══════════════════════════════════════════════════════════════════

RegisterNetEvent('market:purchaseResult', function(success, message, newBalance)
    if success then
        Notify(message, 'success')
        -- Update UI balance
        SendNUIMessage({
            action = 'updateBalance',
            data = newBalance
        })
    else
        Notify(message, 'error')
    end

    SendNUIMessage({
        action = 'purchaseResult',
        success = success,
        message = message,
        balance = newBalance
    })
end)

RegisterNetEvent('market:withdrawResult', function(success, message, newBalance)
    if success then
        Notify(message, 'success')
    else
        Notify(message, 'error')
    end

    SendNUIMessage({
        action = 'withdrawResult',
        success = success,
        message = message,
        balance = newBalance
    })
end)

RegisterNetEvent('market:updateOwner', function(marketId, ownerId, ownerName)
    if Config.Markets[marketId] then
        Config.Markets[marketId].ownerId = ownerId
        Config.Markets[marketId].ownerName = ownerName
    end
    
    if currentMarket == marketId then
        SendNUIMessage({
            action = 'updateOwner',
            data = {
                marketId = marketId,
                ownerId = ownerId,
                ownerName = ownerName
            }
        })
    end
end)

RegisterNetEvent('market:transferResult', function(success, message)
    if success then
        Notify(message, 'success')
    else
        Notify(message, 'error')
    end

    SendNUIMessage({
        action = 'transferResult',
        success = success,
        message = message
    })
end)

-- Haftalık satış istatistikleri (MySQL'den)
RegisterNetEvent('market:salesData', function(salesData, itemNames)
    SendNUIMessage({
        action = 'updateSalesData',
        salesData = salesData or {},
        itemNames = itemNames or {},
    })
end)

-- NUI istatistik isteği
RegisterNUICallback('requestSalesData', function(_, cb)
    TriggerServerEvent('market:requestSalesData')
    cb('ok')
end)

-- Export for other resources
exports('OpenMarket', OpenMarket)
