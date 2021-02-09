const {prefix} = require('../config.json')

const validatePerms = (permissions) => {
    const validPermissions =[ // up to date as of 08/02/21
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS',
    ]
    for (const permission of permissions){
        if(!validPermissions.includes(permission)){
            throw new Error(`Unknown permission node: "${permission}"`)
        }
    }
}

module.exports = (client, commandOptions) => {
    let{
        commands,
        expectedArgs = '',
        permissionsError = 'You do not have permission to run this command.',
        minArgs = 0,
        maxArgs = null,
        requiredPerms = [],
        requiredRoles = [],
        callback
    } = commandOptions
    if(typeof commands === 'string'){
        commands = [commands];
    }


    console.log(`Registering command "${commands[0]}`)
    if(requiredPerms.length) {
        if (typeof requiredPerms ==='string'){
            requiredPerms = [requiredPerms];
            validatePerms(requiredPerms);
        }
    }


    client.on("message", message => {
        const { user, content, guild } = message

        for (const alias of commands) {
            if(content.toLowerCase().startsWith(`${prefix}${alias.toLowerCase()}`)){
                // command is of correct structure

                for(const permission of requiredPerms){
                    if(!user.hasPermission(permission)){
                        message.reply(permissionsError)
                    }
                }

                for(const requiredRole of requiredRoles){
                    const role = guild.roles.cache.find(role => role.name === requiredRole);

                    if(!role || user.roles.cache.has(role.id)){
                        message.reply(`You need to have the "${requiredRole}" role to run this command`)
                    }
                }

                const args = content.split(/[ ]+/);
                args.shift();

                if(args.length < minArgs || (maxArgs !== null && args.length > maxArgs)){
                    message.reply(`Command error: Incorrect syntax. USe ${prefix}${alias} ${expectedArgs}`);
                    return;
                }

                callback(message, args, args.join(' '));

                return;

            }
        }
    })
}

