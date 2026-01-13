-- ═══════════════════════════════════════════════════════════════════
-- CLIENT SIDE - MARKET SYSTEM
-- ═══════════════════════════════════════════════════════════════════

local QBCore = nil
local ESX = nil
local isUIOpen = false
local currentMarket = nil
local lastEventTime = 0

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
        cb({ success = false })
        return
    end
    
    TriggerServerEvent('market:transferMarket', {
        marketId = currentMarket,
        newOwnerId = data.newOwnerId,
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
    
    -- Get player balance
    local balance = { cash = 0, bank = 0, points = 0 }
    if Config.Framework == 'qb' then
        local PlayerData = QBCore.Functions.GetPlayerData()
        balance.cash = PlayerData.money['cash'] or 0
        balance.bank = PlayerData.money['bank'] or 0
        balance.points = PlayerData.metadata['marketpoints'] or 0
    end
    
    -- Send data to NUI
    SendNUIMessage({
        action = 'openMarket',
        data = {
            marketId = marketId,
            name = market.name,
            ownerId = market.ownerId,
            ownerName = market.ownerName,
            ownable = market.ownable,
            items = items,
            categories = categories,
            balance = balance,
            pointsConfig = Config.Points,
        }
    })
    
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
                            icon = 'fas fa-shopping-cart',
                            label = 'Alışveriş Yap',
                            action = function()
                                OpenMarket(marketId)
                            end
                        }
                    },
                    distance = 2.5
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
                ownerId = ownerId,
                ownerName = ownerName
            }
        })
    end
end)

-- Export for other resources
exports('OpenMarket', OpenMarket)
