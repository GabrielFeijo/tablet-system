
local AUTHORIZED_ACLS = {"Console", "Police", "Admin"}
local AUTHORIZED_FACTIONS = {20}
local connection = nil

local randomPos = {
    {3053.8581542969,-1972.6236572266,11.06875038147},
    {3052.5766601563,-1960.96875,11.06875038147},
    {3050.4875488281,-1993.8082275391,11.06875038147},
}

function isPlayerAuthorized(player)
    local account = getPlayerAccount(player)
    if not account or isGuestAccount(account) then
        return false
    end

    local accountName = getAccountName(account)

    for _, aclGroup in ipairs(AUTHORIZED_ACLS) do
        if isObjectInACLGroup("user." .. accountName, aclGetGroup(aclGroup)) then
            return true
        end
    end

    for _, factionID in ipairs(AUTHORIZED_FACTIONS) do
        if exports.spc_dashboard and exports.spc_dashboard:isPlayerInFaction(player, factionID) then
            return true
        end
    end

    return false
end

function getPlayerByCharID(charID)
    for _, player in ipairs(getElementsByType("player")) do
        local playerCharID = getElementData(player, "char:id")
        if playerCharID and tonumber(playerCharID) == tonumber(charID) then
            return player
        end
    end
    return false
end

function bindTabletKey()
    local players = getElementsByType("player")
    for _, player in ipairs(players) do
        bindKey(player, "n", "down", openTablet)
    end
end
addEventHandler("onResourceStart", resourceRoot, bindTabletKey)

function bindTabletOnLogin()
    bindKey(source, "n", "down", openTablet)
end
addEventHandler("onPlayerLogin", root, bindTabletOnLogin)

function unbindTabletOnLogout()
    unbindKey(source, "n", "down", openTablet)
end
addEventHandler("onPlayerLogout", root, unbindTabletOnLogout)

function openTablet(player)
    if not isPlayerAuthorized(player) then
        outputChatBox("Você não tem permissão para usar o tablet corporativo.", player, 255, 0, 0)
        return
    end

    triggerClientEvent(player, "tablet:open", player)
end

function getPlayerData(player, targetCharID)
    if not isPlayerAuthorized(player) then return end

    local query = "SELECT c.id, c.charname, c.License, c.playedTime, c.job, a.online,COUNT(v.id) AS vehicles FROM characters c LEFT JOIN accounts a ON c.id = a.id LEFT JOIN vehicle v ON c.id = v.owner WHERE c.id = ?"

    dbQuery(function(queryHandle)
        local result = dbPoll(queryHandle, -1)
        if result and #result > 0 then
            triggerClientEvent(player,"tablet:sendTabletData", player, "playerData", result[1])
        else
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerData", nil)
        end
    end, connection, query, targetCharID)
end
addEvent("tablet:requestPlayerData", true)
addEventHandler("tablet:requestPlayerData", root, getPlayerData)

function getPlayerFines(player,targetCharID)
    if not isPlayerAuthorized(player) then return end

    local query = "SELECT * FROM multas WHERE dono = ? ORDER BY id DESC"

    dbQuery(function(queryHandle)
        local result = dbPoll(queryHandle, -1)
        if result and #result > 0 then
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerFines", result)
        else
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerFines", {})
        end
    end, connection, query, targetCharID)
end
addEvent("tablet:requestPlayerFines", true)
addEventHandler("tablet:requestPlayerFines", root, getPlayerFines)

function getPlayerVehicles(player, targetCharID)
    if not isPlayerAuthorized(player) then return end

    local query = "SELECT * FROM vehicle WHERE owner = ? ORDER BY id ASC"

    dbQuery(function(queryHandle)
        local result = dbPoll(queryHandle, -1)
        if result and #result > 0 then
            for _, vehicle in ipairs(result) do
                local modelId = tonumber(vehicle.model)

                local realName = exports.spc_carshop:getVehicleRealName(modelId) or "Desconhecido"

                local baseCost = tonumber(exports.spc_carshop:getVehicleShopCost(modelId)) or 0
                local realValue = math.floor(baseCost * (10/100))

                vehicle.realName = realName
                vehicle.realValue = realValue
            end
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerVehicles", result)
        else
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerVehicles", {})
        end
    end, connection, query, targetCharID)
end
addEvent("tablet:requestPlayerVehicles", true)
addEventHandler("tablet:requestPlayerVehicles", root, getPlayerVehicles)

function loadPlayerForArrest(player, targetCharID)
    if not isPlayerAuthorized(player) then return end

    local query = "SELECT id, charname, adminjail, jailed FROM characters WHERE id = ?"

    dbQuery(function(queryHandle)
       local result = dbPoll(queryHandle, -1)
        if result and #result > 0 then
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerForArrest", result[1])
        else
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerForArrest", {})
        end
    end, connection, query, targetCharID)
end
addEvent("tablet:loadPlayerForArrest", true)
addEventHandler("tablet:loadPlayerForArrest", root, loadPlayerForArrest)

function getPlayerRecord(player, targetCharID)
    if not isPlayerAuthorized(player) then return end

    local query = "SELECT * FROM antecedentes WHERE userid = ? ORDER BY id DESC"

    dbQuery(function(queryHandle)
        local result = dbPoll(queryHandle, -1)
        if result and #result > 0 then
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerRecord", result)
        else
            triggerClientEvent(player, "tablet:sendTabletData", player, "playerRecord", {})
        end
    end, connection, query, targetCharID)
end
addEvent("tablet:requestPlayerRecord", true)
addEventHandler("tablet:requestPlayerRecord", root, getPlayerRecord)

function isPlayerLeader(player)
    if not isPlayerAuthorized(player) then return end

    local charID = getElementData(player, "char:id")
    if not charID then return end

    local query = "SELECT isLeader FROM groupattach WHERE characterID = ?"

    dbQuery(function(queryHandle)
        local result = dbPoll(queryHandle, -1)
        local isLeader = false
        if result and #result > 0 and result[1].isLeader == 1 then
            isLeader = true
        end
        triggerClientEvent(player, "tablet:sendTabletData", player, "leaderStatus", isLeader)
    end, connection, query, charID)
end
addEvent("tablet:requestLeaderStatus", true)
addEventHandler("tablet:requestLeaderStatus", root, isPlayerLeader)

function arrestPlayer(officer, targetCharID, time, articles, description)
    if not isPlayerAuthorized(officer) then return end

    local targetPlayer = getPlayerByCharID(targetCharID)
    if not targetPlayer then
        triggerClientEvent(officer, "tablet:showMessage", officer, "error", "Jogador não encontrado.")
        return
    end

    local arrestTime = tonumber(time)
    if not arrestTime or arrestTime <= 0 or arrestTime > 999 then
        triggerClientEvent(officer, "tablet:showMessage", officer, "error", "Tempo de prisão inválido (1-999 minutos).")
        return
    end

    if not articles or articles == "" then
        triggerClientEvent(officer, "tablet:showMessage", officer, "error", "Artigos não informados.")
        return
    end

    if not description or description == "" then
        triggerClientEvent(officer, "tablet:showMessage", officer, "error", "Descrição não informada.")
        return
    end

    arrestPlayerProcedure(officer, targetPlayer, arrestTime, description)

end
addEvent("tablet:arrestPlayer", true)
addEventHandler("tablet:arrestPlayer", root, arrestPlayer)

function arrestPlayerProcedure(officer, target, sentenceTime, reasonArgs)
    local reasonText = table.concat({reasonArgs}, " ")
    local isVip = getElementData(target, "VIP")
    local jailTime = tonumber(sentenceTime)

    if isVip then
        jailTime = math.floor(jailTime / 2)
    end

    setElementData(target, "player:preso", true)
    setElementData(target, "char:moneysujo", 0)

    local officerName = getPlayerName(officer)
    local targetName = getPlayerName(target)

    outputChatBox("#dc143c[Departamento de policia]:#7cc576 " .. officerName .. "#ffffff prendeu #7cc576" .. targetName .. " #ffffffpor #1a75ff" .. jailTime .. "#ffffff anos.", root, 255, 255, 255, true)

    if isVip then
        outputChatBox("#dc143c[Decreto]:#FFFFFF Pelo fato do preso ser VIP a sentença foi alterada: #dc143c" .. tonumber(sentenceTime) .. " anos #ffffffpara #dc143c" .. jailTime .. " anos", root, 255, 255, 255, true)
        outputChatBox("#dc143c[Departamento de policia]:#7cc576 Motivo:#ffffff Os artigos do preso se encontram em sigilo.", root, 255, 255, 255, true)
    else
        outputChatBox("#dc143c[Departamento de policia]:#7cc576 Motivo:#ffffff " .. reasonText, root, 255, 255, 255, true)
    end

    takeAllWeapons(target)
    exports.spc_admin:iniciarRemocaoItems(target)
    if not exports.serialVip:isPlayerVip(target) then
        exports.spc_admin:iniciarRemocaoItemsVIP(target)
    end

    local timer1 = getElementData(target, "adminjail:theTimer")
    local timer2 = getElementData(target, "adminjail:theTimerAccounts")

    if isTimer(timer1) then killTimer(timer1) end
    if isTimer(timer2) then killTimer(timer2) end

    if isPedInVehicle(target) then removePedFromVehicle(target) end

    fadeCamera(target, false, 1.0)
    setElementFrozen(target, true)

    if isPedInVehicle(target) then
        toggleAllControls(target, false, false, false)
    end

    if getElementData(target, "algemado") then
        setElementData(target, "algemado", false)
    end

    setTimer(function()
        triggerClientEvent(target, "triggerAdminjail", target, officer, reasonText, jailTime, 1, false)
    end, 500, 1)

    setTimer(function()
        local posIndex = math.random(#randomPos)
        local jailTimer = setTimer(idoTelikLe, 60000, jailTime, target)

        setElementData(target, "adminjail:theTimer", jailTimer)
        setElementData(target, "idoTelik", jailTime)
        setElementData(target, "idoLetelt", 0)

        setElementPosition(target, randomPos[posIndex][1], randomPos[posIndex][2], randomPos[posIndex][3])
        setElementInterior(target, 0)
        setElementDimension(target, 0)

        setElementData(target, "adminjail", 1)
        setElementData(target, "adminjail:reason", reasonText)
        setElementData(target, "adminjail:ido", jailTime)
        setElementData(target, "adminjail:admin", officerName)
        setElementData(target, "adminjail:adminSerial", getPlayerSerial(officer))
         triggerClientEvent(officer, "tablet:open", officer)
    end, 1500, 1)

    dbExec(connection,
        "UPDATE characters SET adminjail = ?, adminjail_reason = ?, adminjail_idoTelik = ?, adminjail_alapIdo = ?, adminjail_admin = ?, adminjail_adminSerial = ? WHERE id = ?",
        1, reasonText, jailTime, jailTime, officerName, getPlayerSerial(officer), getElementData(target, "char:id")
    )

    setTimer(function()
        fadeCamera(target, true, 2.5)
        setElementFrozen(target, false)
        toggleAllControls(target, true, true, true)
    end, 7500, 1)

end

function getNearbyPlayers(player)
    if not isPlayerAuthorized(player) then return end

    local playerX, playerY, playerZ = getElementPosition(player)
    local nearbyPlayers = {}

    for _, targetPlayer in ipairs(getElementsByType("player")) do
        -- Estou me incluindo na lista | :)
        --if targetPlayer ~= player then
            local targetX, targetY, targetZ = getElementPosition(targetPlayer)
            local distance = getDistanceBetweenPoints3D(playerX, playerY, playerZ, targetX, targetY, targetZ)

            if distance <= 10 then
                local charID = getElementData(targetPlayer, "char:id")
                if charID then
                    table.insert(nearbyPlayers, {
                        id = charID,
                        name = getPlayerName(targetPlayer),
                        distance = math.floor(distance)
                    })
                end
            end
        --end
    end
    triggerClientEvent(player, "tablet:sendTabletData", player, "nearbyPlayers", nearbyPlayers)
end
addEvent("tablet:requestNearbyPlayers", true)
addEventHandler("tablet:requestNearbyPlayers", root, getNearbyPlayers)

addEventHandler("onResourceStart", resourceRoot, function()

    if exports.spc_mysql then
        connection = exports.spc_mysql:getConnection()
    end

    outputServerLog("Tablet Corporativo carregado com sucesso!")
end)