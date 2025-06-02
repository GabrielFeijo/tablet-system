local isTabletOpen = false
local browser = nil
local screenW, screenH = guiGetScreenSize()

local TABLET_CONFIG = {
    width = 1280,
    height = 720,
    url = "http://mta/local/tablet/index.html"
}

local tabletX = (screenW - TABLET_CONFIG.width) / 2
local tabletY = (screenH - TABLET_CONFIG.height) / 2

function openTablet()
    if isTabletOpen then
        closeTablet()
        return
    end

    browser = createBrowser(TABLET_CONFIG.width, TABLET_CONFIG.height, true, true)
    if not browser then
        outputChatBox("Erro ao abrir o tablet.", 255, 0, 0)
        return
    end

    addEventHandler("onClientBrowserCreated", browser, function()
        loadBrowserURL(browser, TABLET_CONFIG.url)

        focusBrowser(browser)
        showCursor(true)
        guiSetInputMode("no_binds_when_editing")

        setElementData(localPlayer, "tablet:open", true)
        isTabletOpen = true

        addEventHandler("onClientRender", root, renderTablet)
        addEventHandler("onClientClick", root, handleClick)
        addEventHandler("onClientCursorMove", root, handleCursorMove)
        addEventHandler("onClientKey", root, handleKey)

        bindKey("backspace", "down", closeTablet)

        outputChatBox("Tablet aberto. Pressione BACKSPACE para fechar.", 0, 255, 0)
    end)
end

function closeTablet()
    if not isTabletOpen then return end

    destroyElement(browser)
    browser = nil

    showCursor(false)
    setElementData(localPlayer, "tablet:open", false)
    isTabletOpen = false

    removeEventHandler("onClientRender", root, renderTablet)
    removeEventHandler("onClientClick", root, handleClick)
    removeEventHandler("onClientCursorMove", root, handleCursorMove)
    removeEventHandler("onClientKey", root, handleKey)
    unbindKey("backspace", "down", closeTablet)
end

function renderTablet()
    if browser then
        dxDrawImage(tabletX, tabletY, TABLET_CONFIG.width, TABLET_CONFIG.height, browser, 0, 0, 0, tocolor(255, 255, 255, 255))
    end
end

function handleClick(button, state, absoluteX, absoluteY)
    if not isTabletOpen or not browser then return end

    if absoluteX >= tabletX and absoluteX <= tabletX + TABLET_CONFIG.width and
       absoluteY >= tabletY and absoluteY <= tabletY + TABLET_CONFIG.height then

        local relX = absoluteX - tabletX
        local relY = absoluteY - tabletY

        if button == "left" then
            if state == "down" then
                injectBrowserMouseDown(browser, "left")
            else
                injectBrowserMouseUp(browser, "left")
            end
        elseif button == "right" then
            if state == "down" then
                injectBrowserMouseDown(browser, "right")
            else
                injectBrowserMouseUp(browser, "right")
            end
        end

        focusBrowser(browser)
        cancelEvent()
    end
end

function handleCursorMove(_, _,absoluteX, absoluteY)
    if not isTabletOpen or not browser then return end

    if absoluteX >= tabletX and absoluteX <= tabletX + TABLET_CONFIG.width and
       absoluteY >= tabletY and absoluteY <= tabletY + TABLET_CONFIG.height then

        local relX = absoluteX - tabletX
        local relY = absoluteY - tabletY

        injectBrowserMouseMove(browser, relX, relY)
        focusBrowser(browser)
    end
end

function handleKey()
    if not isTabletOpen or not browser then return end

    local cursorX, cursorY = getCursorPosition()
    if cursorX and cursorY then
        local absoluteX, absoluteY = cursorX * screenW, cursorY * screenH
        if absoluteX >= tabletX and absoluteX <= tabletX + TABLET_CONFIG.width and
           absoluteY >= tabletY and absoluteY <= tabletY + TABLET_CONFIG.height then

            focusBrowser(browser)
            cancelEvent()
        end
    end
end

addEvent("tablet:open", true)
addEventHandler("tablet:open", root, openTablet)

function handleJavaScriptRequest(data)
    if not data or not data.action then return end

    local action = data.action

    local actions = {
        closeTablet = function()
            closeTablet()
        end,

        searchPlayer = function()
            if data.playerID then
                searchPlayer(tonumber(data.playerID))
            end
        end,

        arrestPlayer = function()
            if data.playerID and data.time and data.articles and data.description then
                triggerServerEvent("tablet:arrestPlayer", localPlayer, localPlayer, data.playerID, data.time, data.articles, data.description)
            end
        end,

        getNearbyPlayers = function()
            triggerServerEvent("tablet:requestNearbyPlayers", localPlayer, localPlayer)
        end,

        playerForArrest = function()
            triggerServerEvent("tablet:loadPlayerForArrest", localPlayer, localPlayer, data.playerID)
        end,

        requestLeaderStatus = function()
            triggerServerEvent("tablet:requestLeaderStatus", localPlayer)
        end
    }

    if actions[action] then
        actions[action]()
    end
end

addEventHandler("onClientBrowserDocumentReady", root, function()
    if source == browser then
        executeBrowserJavascript(browser, [[
            window.mtaReceiveData = function(data) {
                try {
                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
        
                    switch (data.type) {
                        case 'playerData':
                            if (typeof displayPlayerData === 'function') {
                                displayPlayerData(data.data);
                            }
                            break;
                        case 'playerFines':
                            if (typeof displayPlayerFines === 'function') {
                                displayPlayerFines(data.data);
                            }
                            break;
                        case 'playerVehicles':
                            if (typeof displayPlayerVehicles === 'function') {
                                displayPlayerVehicles(data.data);
                            }
                            break;
                        case 'playerRecord':
                            if (typeof displayPlayerRecord === 'function') {
                                displayPlayerRecord(data.data);
                            }
                            break;
                        case 'nearbyPlayers':
                            if (typeof displayNearbyPlayers === 'function') {
                                displayNearbyPlayers(data.data);
                            }
                            break;
                        case 'message':
                            if (typeof showMessage === 'function') {
                                showMessage(data.messageType, data.message);
                            }
                            break;
                        case 'playerForArrest':
                            if (typeof displayArrestedPlayer === 'function') {
                                displayArrestedPlayer(data.data);
                            }
                            break;
                        case 'leaderStatus':
                            if (typeof setLeaderStatus === 'function') {
                                setLeaderStatus(data.isLeader);
                            }
                            break;
                        default:
                            console.warn('Tipo de dado desconhecido:', data.type);
                    }
                } catch (e) {
                    console.error('Erro ao processar dados do MTA:', e);
                }
            };
        
            window.mtaSendData = function(data) {
                try {
                    var url = 'mta://local/tablet/bridge.php?data=' + encodeURIComponent(JSON.stringify(data));
                    window.location.href = url;
                } catch (e) {
                    console.error('Erro ao enviar dados para MTA:', e);
                }
            };
        
            console.log('Bridge MTA inicializado com sucesso!');
        ]])
    end
end)

function searchPlayer(playerID)
    if not playerID or playerID <= 0 then
        sendMessageToTablet("error", "ID de jogador inválido.")
        return
    end

    triggerServerEvent("tablet:requestPlayerData", localPlayer, localPlayer, playerID)
    triggerServerEvent("tablet:requestPlayerFines", localPlayer, localPlayer, playerID)
    triggerServerEvent("tablet:requestPlayerVehicles", localPlayer, localPlayer, playerID)
    triggerServerEvent("tablet:loadPlayerForArrest", localPlayer, localPlayer, playerID)
end

local function escapeString(str)
    return '"' .. str:gsub('"', '\\"') .. '"'
end

local function valueToJSONString(value)
    local typeHandlers = {
        string = escapeString,
        number = tostring,
        boolean = tostring,
        table = function(v) return tableToJSONString(v) end
    }

    local handler = typeHandlers[type(value)]
    return handler and handler(value) or 'null'
end

function tableToJSONString(tbl)
    local json = "{"
    local first = true

    for key, value in pairs(tbl) do
        if not first then
            json = json .. ","
        end
        first = false

        json = json .. escapeString(tostring(key)) .. ":"
        json = json .. valueToJSONString(value)
    end

    json = json .. "}"
    return json
end

function sendTabletData(dataType, data)
    if browser then
        local jsonData = (dataType == "nearbyPlayers") and toJSON(data) or tableToJSONString(data)
        local jsCode = "mtaReceiveData({type: '" .. dataType .. "', data: " .. jsonData .. "});"
        
        if dataType == "leaderStatus" then
            jsCode = "mtaReceiveData({type: 'leaderStatus', isLeader: " .. tableToJSONString(data) .. "});"
        end

        executeBrowserJavascript(browser, jsCode)
    end
end
addEvent("tablet:sendTabletData", true)
addEventHandler("tablet:sendTabletData", root, sendTabletData)

function sendMessageToTablet(messageType, message)
    showMessage(messageType, message)
end

function urlDecode(str)
    str = string.gsub(str, '+', ' ')
    str = string.gsub(str, '%%(%x%x)', function(hex)
        return string.char(tonumber(hex, 16))
    end)
    return str
end

addEventHandler("onClientBrowserNavigate", root, function(url)
    if source ~= browser then return end

    if string.find(string.lower(url), "mta://local/tablet/bridge.php") then
        local dataParam = url:match("data=([^&]*)")
        if not dataParam then
            outputDebugString("[Tablet] Parâmetro 'data' não encontrado na URL.", 1)
            return false
        end

        local decodedData = urlDecode(dataParam)
        if not decodedData or decodedData == "" then
            outputDebugString("[Tablet] Falha ao decodificar a string URL.", 1)
            return false
        end

        local success, data = pcall(fromJSON, decodedData)
        if not success or type(data) ~= "table" then
            outputDebugString("[Tablet] Falha ao interpretar JSON recebido: " .. tostring(decodedData), 1)
            return false
        end

        handleJavaScriptRequest(data)

        return false
    end
end)

addCommandHandler("tablet", function()
    if isTabletOpen then
        closeTablet()
    else
        openTablet()
    end
end)