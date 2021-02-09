
module.exports ={
    commands: ['ping'],
    minArgs: 0,
    maxArgs: 0,
    callback: (message, args, text) =>{
        message.channel.send(`🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
    },
    permissions: [],
    requiredRoles: [],
}