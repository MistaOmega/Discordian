const {Client} = require("discord.js");
const fs = require("fs");

const path = require('path')

const client = new Client({ partials: ['MESSAGE'] });
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

client.on('ready', onReady);
client.on('messageReactionAdd', addRole);
client.on('messageReactionRemove', delRole);

client.login(process.env.BOT_TOKEN)

async function onReady(){
    let roleChannel = client.channels.cache.get(config.channel)
    try{
        await roleChannel.messages.fetch();
    } catch (e) {
        console.error(e);
        return;
    }
    roleChannel.messages.fetch().then(messages =>{
        config.messageID = messages.first().id;
        console.log(`Watching over '${config.messageID}`)
    })

    await client.user.setPresence({
        activity:{
            name:"over all",
            type: "WATCHING"
        },
        status: 'online'
    });

    const commandBaseFile = 'base_command.js'
    const base_command = require(`./commands/${commandBaseFile}`)

    const readAllCommands = dir =>{
        const files = fs.readdirSync(path.join(__dirname, dir))
        for (const file of files){
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if(stat.isDirectory()){
                readAllCommands(file.join(dir, file))
            } else if(file !== commandBaseFile){
                const option = require(path.join(__dirname, dir, file))
                console.log(file, option)
                base_command(client, option)
            }
        }
    }

}

/**
 * Event Handler when a message is reacted to
 * @param reaction reacted message
 * @param user user who reacted
 * @returns {Promise<void>}
 */
async function addRole({message, emoji}, user){
    console.log(user.id);

    //ignore bots, and return if the messageID assigned earlier isn't the message being reacted to
    if (user.bot || message.id !== config.messageID) {
        return;
    }

    if (message.partial) {
        try {
            await message.fetch();
        } catch (e) {
            console.error('Error on fetching message, partial received', e);
            return;
        }
    }

    const { guild: {members, roles} } = message;
    const member = await members.fetch(user.id)
    const role = roles.cache.get(config.roles[emoji.name]);

    if (role) {
        try {
            member.roles.add(role.id);
        } catch (e) {
            console.error('Error adding role', e);

        }
    }
}


async function delRole({message, emoji}, user){
    console.log(user.id);

    //ignore bots, and return if the messageID assigned earlier isn't the message being reacted to
    if (user.bot || message.id !== config.messageID) {
        return;
    }

    if (message.partial) {
        try {
            await message.fetch();
        } catch (e) {
            console.error('Error on fetching message, partial received', e);
            return;
        }
    }

    const { guild: {members, roles} } = message;
    const member = await members.fetch(user.id)
    const role = roles.cache.get(config.roles[emoji.name]);

    if (role) {
        try {
            member.roles.remove(role.id);
        } catch (e) {
            console.error('Error adding role', e);

        }
    }


}

