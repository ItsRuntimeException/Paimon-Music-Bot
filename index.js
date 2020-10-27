const PREFIX = ">>";
//const ytdl = require("ytdl-core");
const Discord = require("discord.js");
const filestream = require("fs");
const client = new Discord.Client();
const DICE = 6;

// set up envrionment token for heroku deployment website.
const TOKEN = process.env.BOT_TOKEN;

/* bot online */
client.on("ready", () => {
    console.log("\nI'm online & ready to meme!")
    console.log("\n\nLOGGING STARTED:\n")
});

/* initial message after getting invited to a new server */
client.on("guildCreate", guild => {
    let channelID;
    let channels = guild.channels;
    channelLoop:
        for (let c of channels) {
            let channelType = c[1].type;
            if (channelType === "text") {
                channelID = c[0];
                break channelLoop;
            }
        }
    let channel = client.channels.get(guild.systemChannelID || channelID);
    channel.send("I'm online & ready to meme!");
});

client.on("message", async message => {
    
    /* Ignore messages that don"t start with prefix or written by bot*/
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    const args = message.content.slice(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();

    /* if a user mentioned the bot, reply back to the user */
    if (message.isMentioned(client.user)) {
        message.reply("Sup! How's your day Goin'?");
    }
    /* Voice only works in guilds, if the message does not come from a guild, then ignore it */
    if (!message.guild) return;

    /* commands & voice*/
    switch (command) {
        case "help":
            userHelp(message)
            break;
        /*
        case "join":
            join(message);
            break;
        case "play":
            play(message, args[0]);
            break;
        case "leave":
            leave(message, args[0]);
            break;
        */
        case "mention":
            mention(message)
            break;
        case "reboot":
            reboot(message)
            break;
        case "kill":
            shutdown(message);
            break;
        case "roll":
            roll(message);
            break;
        case "maplestory":
            guildLink(message);
            break;
        case "valorant":
            vSens(message, args[0], args[1]);
            break;
        case "gcreate":
            create_genshin_table(message);
            break;
        case "gshowtable":
            showtable(message);
            break;
        case "gwish":
            wishCount(message, args[0], args[1], args[2]);
            break;
        case "greset":
            wishReset(message, args[0]);
            break;
        default:
            message.channel.send(`${message.author}. You didn't provide a VALID function argument!`);
    }
});

/*
async function join(message) {
    const { voiceChannel } = message.member;
    if (!voiceChannel) {
        return message.reply("please join a voice channel first!");
    }
    else {
        message.member.voiceChannel.join();
    }
}
*/

/*
async function play(message, url) {
    // VALIDATE ARG NOT NULL
    const { voiceChannel } = message.member;
    if (!url.length) {
        return message.channel.send("You need to supply a youtube-link!");
    }
    if (!voiceChannel) {
        return message.reply("please join a voice channel first!");
    }

    // VALIDATE LINK AS PLAYABLE LINK
    let validLink = await ytdl.validateURL(url);
    if (!validLink)
        return message.channel.send('You need to supply a VALID youtube-link!');

    // PLAY MUSIC
    let info = await ytdl.getInfo(url);
    let connection = await message.member.voiceChannel.join();
    let stream = ytdl(url, { filter: 'audioonly' });
        connection.playStream(stream);
        message.channel.send(`Now Playing: + ${info.title}`)
        .then(console.log(`music: "${info.title}" | requested by user: ` + message.member.user.tag)).catch(console.error);
}
*/

/*
async function leave(message) {
    let userVoiceChannel = message.member.voiceChannel;
            let clientVoiceConnection = message.guild.voiceConnection;
            // https://stackoverflow.com/questions/55089293/how-to-locate-the-voice-chat-that-the-discord-bot-is-connected-to
            // Compare the voiceChannels, The client and user are in the same voiceChannel, the client can disconnect
            
            // no current connection or check for same current channel
            if (clientVoiceConnection === null){
                message.channel.send("I'm not in a channel!");
            }
            // valid compare
            else if (userVoiceChannel === clientVoiceConnection.channel) {
                clientVoiceConnection.disconnect();
                message.channel.send("Bye!");
            }
            else {
                message.channel.send("I'm not in the same channel as you!");
            }
}
*/

function readTextFile(file)
{
    var text = filestream.readFileSync(file).toString('utf-8');
    return text;
}

function reboot(message) {
    message.channel.send("Rebooting...")
    .then(console.log(`${message.member.user.tag} rebooted the bot.`)).catch(console.error)
    .then(client.destroy())
    .then(client.login(TOKEN));
}

function shutdown(message) {
    message.channel.send("Shutting down...")
    //.then(leave(message))
    .then(console.log(`${message.member.user.tag} shutdown the bot.`)).catch(console.error)
    .then(client.destroy());
}

function rand(length) {
    return 1 + Math.floor(Math.random()*length);
}

function roll(message) {
    var diceNum1 = rand(DICE);
    var diceNum2 = rand(DICE);
    message.channel.send(`${message.author}. You rolled (${diceNum1}, ${diceNum2}) on a pair of dice.\nTotal: ${diceNum1+diceNum2}`)
    .then(console.log(`${message.member.user.tag} rolled (${diceNum1}, ${diceNum2}) on a pair of dice. Total: ${diceNum1+diceNum2}`));
}

function guildLink(message) {
    message.reply("I welcome you to Ensemble HQ!"
                     +`\nhttps://ensemble-hq.herokuapp.com/`)
    .then(console.log(`${message.member.user.tag} requested for MapleStory guild link.`));
}

function vSens(message, gameCode, sens) {
    if (gameCode == undefined || sens == undefined) {
        console.log(`${message.member.user.tag} requested for VALORANT sensitivity conversion, but reached UNDEFINED arguments.`);
        console.log(`\n    gameCode = ${gameCode}, sensitivity = ${sens}\n\n`);
        return message.channel.send(`${message.author}.`
            +"\nThis command converts your CSGO sensitivity to Valorant."
            +"\n\nUsage: " + "Valorant [GameCode] [Sensitivity]"
            +"\n\nGameCode:\n"
                +"\t\t[A]: APEX LEGEND\n"
                +"\t\t[B]: RAINBOW SIX\n"
                +"\t\t[C]: CSGO\n"
                +"\t\t[O]: OVERWATCH"
            +"\n\nSensitivity:\n"
                +"\t\t[A Decimal Number]");
    }

    gameCode = gameCode.toLowerCase();
    var sensitivity = parseFloat(sens);
    if (isNaN(sensitivity)) // is Not a Number
        return message.channel.send(`${message.author}. You need to supply a VALID sensitivity!`)
        .then(console.log(`${message.member.user.tag} requested for VALORANT sensitivity conversion, but reached INVALID sensitivity.`)).catch(console.error);
    else {
        var convertedSens = 0;
        var gameName = null;
        switch (gameCode) {
            case "a":
                convertedSens = (sensitivity / 3.18181818);
                gameName = "APEX LEGEND";
                break;
            case "b":
                convertedSens = (sensitivity * 1.2);
                gameName = "RAINBOW SIX";
                break;
            case "c":
                convertedSens = (sensitivity / 3.18181818);
                gameName = "CSGO";
                break;
            case "o":
                convertedSens = (sensitivity / 10.6);
                gameName = "OVERWATCH";
                break;
            default: 
                return message.channel.send(`${message.author}. Unsupported GameCode, cannot determine your sensitivity.`)
                .then(console.log(`${message.member.user.tag} requested for VALORANT sensitivity conversion, but reached INVALID GameCode.`)).catch(console.error);
        }

        console.log(`\n${message.member.user.tag} requested for VALORANT sensitivity conversion.`);
        console.log(`\n    Converted ${message.member.user.tag}'s game sensitivity.`);
        console.log(`    [${gameName} ↦ VALORANT] : [${sensitivity} ↦ ${convertedSens.toFixed(5)}]\n`);
        message.channel.send(`Converting your sensitivity: [ ${gameName} ↦ VALORANT ]`)
        message.channel.send(`${message.author}. Your VALORANT game sensitivity = ${convertedSens.toFixed(5)}`);
    }
}

function create_genshin_table(message) {
    var text = readTextFile('genshin_wishes.json');
    var arrayObj = JSON.parse(text);

    if (length(arrayObj.users) == 0) {
        arrayObj.users.push({
            username: message.member.user.tag,
            event:0,
            weapon:0,
            perm:0
        });
    }
    else if (length(arrayObj.users) > 0) {
        // this is inefficient if the # of users gets too large, would be nice to convert it into a database to filter duplicates.
        for (var i = 0; i < length(arrayObj.users); i++) {
            // this user table already exist.
            if (arrayObj.users[i].username === message.member.user.tag) {
                console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] already EXIST!');
                message.channel.send(`${message.author}. Your Genshin Gacha Table aready exist!`);
                return;
            }
        }
        // if this user does does not have an existing table, create a default table for this user.
        arrayObj.users.push({
            username: message.member.user.tag,
            event:0,
            weapon:0,
            perm:0
        });
    }

    var tableString = JSON.stringify(arrayObj);
    filestream.writeFile('genshin_wishes.json', tableString, 'utf-8', function(err) {
        if (err) throw err;
        console.log(arrayObj.users);
    })
    console.log('Finished creating Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '].');
    message.channel.send(`${message.author}. Your Genshin Gacha Table has been created!`);
}

function showtable(message) {
    var text = readTextFile('genshin_wishes.json');
    var arrayObj = JSON.parse(text);
    for (var i = 0; i < length(arrayObj.users); i++) {
        if (arrayObj.users[i].username === message.member.user.tag) {
            console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
            message.channel.send(`${message.author}. Your Genshin Gacha Table is being fetched...\n${JSON.stringify(arrayObj.users[i])}`);
            return;
        }
    }
    // this user table already exist.
    message.channel.send(`${message.author}. Your Genshin Gacha Table is not initialized!`);
}

function wishCount(message, bannerType, commandType, nInc) {
    if (bannerType == undefined || commandType == undefined || nInc == undefined) {
        console.log(`${message.member.user.tag} requested for genshin wish count, but reached UNDEFINED arguments.`);
        console.log(`\n    bannerType = ${bannerType}, commandType = ${commandType}, nInc = ${nInc}\n\n`);
        return message.channel.send(`${message.author}.`
            +"\nThis command adds the number of rolls to your current Genshin Gacha Table."
            +"\n\nUsage: " + "gwish [BannerType] [CommandType] [Number]"
            +"\n\nBannerType:\n"
                +"\t\t[C]: Character Event Banner\n"
                +"\t\t[W]: Weapon Banner\n"
                +"\t\t[P]: Permanent Banner"
            +"\n\nCommandType:\n"
                +"\t\t[Add]: Character Event Banner\n"
                +"\t\t[Replace]: Weapon Banner"
            +"\n\nNumber:\n"
                +"\t\t[Integer]");
    }

    bannerType = bannerType.toLowerCase();
    commandType = commandType.toLowerCase();
    var roll_count = parseInt(nInc);
    if (isNaN(roll_count)) // is Not a Number
    {
        return message.channel.send(`${message.author}. You need to supply a VALID count!`)
        .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID count.`)).catch(console.error);
    }
    else {
        // find user
        var text = readTextFile('genshin_wishes.json');
        var arrayObj = JSON.parse(text);
        for (var i = 0; i < length(arrayObj.users); i++) {
            if (arrayObj.users[i].username === message.member.user.tag) {
                console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
                break;
            }
        }
        if (i == length(arrayObj.users)) {
            // this user table already exist.
            return message.channel.send(`${message.author}. Your Genshin Gacha Table is not initialized!`);
        }

        // edit GGachaTable
        if ( !(commandType === "add" || commandType === "replace") ) {
            return message.channel.send(`${message.author}. Unsupported CommandType, cannot edit your gacha data.`)
            .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID commandType.`)).catch(console.error);
        }
        else if (commandType === "add") {
            switch (bannerType) {
                case "c":
                    arrayObj.users[i].event += roll_count;
                    break;
                case "w":
                    arrayObj.users[i].weapon += roll_count;
                    break;
                case "p":
                    arrayObj.users[i].perm += roll_count;
                    break;
                default: 
                    return message.channel.send(`${message.author}. Unsupported BannerType, cannot determine your gacha data.`)
                    .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`)).catch(console.error);
            }
        }
        else if (commandType === "replace") {
            switch (bannerType) {
                case "c":
                    arrayObj.users[i].event = roll_count;
                    break;
                case "w":
                    arrayObj.users[i].weapon = roll_count;
                    break;
                case "p":
                    arrayObj.users[i].perm = roll_count;
                    break;
                default: 
                    return message.channel.send(`${message.author}. Unsupported BannerType, cannot fetch your gacha data.`)
                    .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`)).catch(console.error);
            }
        }

        // save data back to json
        var tableString = JSON.stringify(arrayObj);
        filestream.writeFile('genshin_wishes.json', tableString, 'utf-8', function(err) {
            if (err) throw err;
        })
        // display message
        console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] updated!');
        console.log(arrayObj.users[i]);
        message.channel.send(`${message.author}. Your Genshin Gacha Table is now updated...\n${JSON.stringify(arrayObj.users[i])}`);
        
    }
}

function wishReset(message, bannerType) {
    if (bannerType == undefined) {
        console.log(`${message.member.user.tag} requested for genshin wish reset, but reached UNDEFINED arguments.`);
        console.log(`\n    bannerType = ${bannerType}\n\n`);
        return message.channel.send(`${message.author}.`
            +"\nThis command resets the specified Genshin Gacha BannerType back to 0."
            +"\n\nUsage: " + "gReset [BannerType]"
            +"\n\nBannerType:\n"
                +"\t\t[C]: Character Event Banner\n"
                +"\t\t[W]: Weapon Banner\n"
                +"\t\t[P]: Permanent Banner");
    }
    bannerType = bannerType.toLowerCase();

    switch (bannerType) {
        case "c":
            arrayObj.users[i].event = 0;
            break;
        case "w":
            arrayObj.users[i].weapon = 0;
            break;
        case "p":
            arrayObj.users[i].perm = 0;
            break;
        default: 
            return message.channel.send(`${message.author}. Unsupported BannerType, cannot reset your gacha data.`)
            .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`)).catch(console.error);
    }
}

function length(obj) {
    return Object.keys(obj).length;
}

function userHelp(message) {
    message.channel.send(`${message.author}.`
            +`\n[Currently Hosting via Heroku]\n"Music Support deprecated."`
            +"\n\nUsage: " + `${PREFIX}`+"[function]"
                +"\n\nFunctions:"
                    +"\n\tHelp"
                    +"\n\tKill"
                    +"\n\tReboot"
                    +"\n\tRoll"
                    +"\n\tMapleStory"
                    +"\n\tgCreate"
                    +"\n\tgShowtable"
                    +"\n\tgWish"
                    +"\n\tgReset"
                    +"\n\tValorant [GameCode] [Sensitivity]\n")
    .then(console.log(`${message.member.user.tag} requested for bot functions.`)).catch(console.error);
}

client.login(TOKEN);