fx_version 'cerulean'
game 'gta5'

author 'Lovable Market Script'
description 'Advanced Market System with QB/ESX/OX Support'
version '1.0.1'

lua54 'yes'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client/client.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/server.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/market-app.js',
    'html/assets/**/*'
}

dependencies {
    'oxmysql',
    'qb-core',
    'qb-target'
}
