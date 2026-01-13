fx_version 'cerulean'
game 'gta5'

author 'Lovable Market Script'
description 'Advanced Market System with QB/ESX/OX Support'
version '1.0.0'

lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua', -- Optional: ox_lib support
    'config.lua'
}

client_scripts {
    'client/client.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua', -- MySQL support
    'server/server.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/assets/**/*'
}

dependencies {
    'oxmysql'
}
