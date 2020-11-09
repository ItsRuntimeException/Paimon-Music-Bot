const PREFIX = "?";
const ytdl = require('ytdl-core');
const YouTube = require("discord-youtube-api");
const Discord = require("discord.js");
const filestream = require("fs");
const client = new Discord.Client();
const DICE = 6;

// native token file
const BOT_TOKEN = readTextFile('./source/bot_token.txt');
const youtube = new YouTube(readTextFile('./source/youtube_api_key.txt')); // Personal Youtube-API key
var audio_dispatcher = null;

/* bot online */
client.on("ready", () => {
    console.log("\nOne freshly baked Paimon. Now ready to serve!");
    console.log("\n\nLOGGING STARTED:\n");
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
        case "join":
            join(message);
            break;
        case "sing":
            sing(message, args);
            break;
        case "pause":
            pause_music(message);
            break;
        case "resume":
            resume_music(message);
            break;
        case "stop":
            stop_music(message);
            break;
        case "leave":
            leave(message);
            break;
        case "source":
            source_send(message);
            break;
        case "wipe":
            clear_messages(message, args[0]);
            break;
        case "mention":
            mention(message)
            break;
        case "reboot":
            reboot(message)
            break;
        case "kill":
            emergency_food_time(message);
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
        /* Owner Commands */
        case "gshowall":
            showall(message);
            break;
        default:
            message.channel.send(`${message.author}. You didn't provide a VALID function argument!`);
    }
});

async function join(message) {
    const { voiceChannel } = message.member;
    if (!voiceChannel) {
        return message.reply("please join a voice channel first!");
    }
    else {
        message.member.voiceChannel.join();
    }
}

async function sing(message, search_string) {
    // user search:
    const original_string = search_string.toString();
    let validate = ytdl.validateURL(original_string);
    search_string = original_string.toString().replace(/,/g,' ');
    console.log('[tag: ' + message.member.user.tag + ' | search_string: ' + search_string + '] search-mode? ' + !validate);
    // VALIDATE ARG NOT NULL
    const { voiceChannel } = message.member;
    if (search_string == undefined) {
        console.log(`${message.member.user.tag} requested for music-playing, but reached UNDEFINED arguments.`);
        return message.channel.send(`${message.author}.`
            +"\nThis command plays your specified Youtube-link or keyword searched."
            +"\n\nUsage: " + "play [Link | Keywords]"
            +"\n\nLink example:\n"
                +"\t\tyoutube.com/watch?v=oHg5SJYRHA0"
            +"\n\nKeywords example:\n"
                +"\t\tPekora bgm music 1 hour");
    }
    
    // IN-CHANNEL CHECK
    if (!voiceChannel) {
        return message.reply("please join a voice channel first!", {files: ['./moji/PaimonCookies.gif']});
    }

    // channel reply
    /* https://discord.com/developers/docs/resources/channel#embed-object */
    if (!validate) {
        // PRELOAD
        let video = await youtube.searchVideos(search_string);
        let url = video.url.toString();

        // PLAY MUSIC via keywords
        let info = await ytdl.getInfo(url);
        let connection = await message.member.voiceChannel.join();
        let stream = ytdl(url, { filter: 'audioonly' });
        audio_dispatcher = connection.playStream(stream);
        console.log(`url: ${video.url}`);
        console.log(`Now Playing: ${info.videoDetails.title}\nDuration: ${sec_Convert(info.videoDetails.lengthSeconds)}\n`);
        message.channel.send({embed: {
            author: {
                name: 'Paimon-chan\'s Embedded Info',
                icon_url: client.user.avatarURL,
                url: 'https://github.com/ItsRuntimeException/SimpleDiscordBot'
            },
            title: info.videoDetails.title,
            url: info.videoDetails.video_url,
            fields: [{
                name: "Link",
                value: info.videoDetails.video_url,
              },
              {
                  name: "Duration",
                  value: sec_Convert(info.videoDetails.lengthSeconds)
              }
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: '© Rich Embedded Frameworks'
            }
        }})
    }
    else {
        // PLAY MUSIC via link
        let info = await ytdl.getInfo(original_string);
        let connection = await message.member.voiceChannel.join();
        let stream = ytdl(original_string, { filter: 'audioonly' });
        audio_dispatcher = connection.playStream(stream);
        console.log(`url: ${original_string}`);
        console.log(`Now Playing: ${info.videoDetails.title}\nDuration: ${sec_Convert(info.videoDetails.lengthSeconds)}\n`);
        message.channel.send({embed: {
            author: {
                name: 'Paimon-chan\'s Embedded Info',
                icon_url: client.user.avatarURL,
                url: 'https://github.com/ItsRuntimeException/SimpleDiscordBot'
            },
            fields: [{
                name: "Title",
                value: info.videoDetails.title,
              },
              {
                  name: "Duration",
                  value: sec_Convert(info.videoDetails.lengthSeconds)
              }
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: '© Rich Embedded Frameworks'
            }
        }})
    }
}

function pause_music(message) {
    if (audio_dispatcher != null) {
        audio_dispatcher.pause();
        message.channel.send('Music paused.').catch(console.error);
    }
    else {
        message.channel.send('There is nothing to pause.').catch(console.error);
    }
    console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested to paused music.');
}

function resume_music(message) {
    if (audio_dispatcher != null) {
        audio_dispatcher.resume();
        message.channel.send('Music resume.').catch(console.error);
    }
    else {
        message.channel.send('There is nothing to resume.').catch(console.error);
    }
    console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested to resumed music.');
}

function stop_music(message) {
    if (audio_dispatcher != null) {
        audio_dispatcher.destroy();
        message.channel.send('Music stopped.').catch(console.error);
    }
    else {
        message.channel.send('There is nothing to stop.').catch(console.error);
    }
    console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested to stopped music.');
}

async function leave(message) {
    let userVoiceChannel = message.member.voiceChannel;
    let clientVoiceConnection = message.guild.voiceConnection;
    // https://stackoverflow.com/questions/55089293/how-to-locate-the-voice-chat-that-the-discord-bot-is-connected-to
    // Compare the voiceChannels, The client and user are in the same voiceChannel, the client can disconnect
    
    // no current connection or check for same current channel
    if (clientVoiceConnection == null){
        message.channel.send("I'm not in a channel!", {files: ['./moji/PaimonAngry.png']});
    }
    // valid compare
    else if (userVoiceChannel == clientVoiceConnection.channel) {
        stop_music(message);
        clientVoiceConnection.disconnect();
    }
    else {
        message.channel.send("I'm not in the same channel as you!", {files: ['./moji/PaimonNani.png']});
    }
}

function source_send(message) {
    var paimon = 'https://github.com/ItsRuntimeException/SimpleDiscordBot';
    message.channel.send(`Paimon's delicious source code: ${paimon}`);
    console.log(`${message.member.user.tag} requested Paimon as food!`);
}

async function clear_messages(message, numline) {
    /* ONLY OWNER MAY USE THIS COMMAND */
    var moji_array = ['moji/PaimonAngry.png', 'moji/PaimonNani.png', 'moji/PaimonCookies.gif', 'moji/PaimonLunch.jpg', 'moji/PaimonNoms.gif', 'moji/PaimonSqueezy.jpg', 'moji/PaimonThonks.jpg'];
    var rand = Math.floor(Math.random() * Math.floor(length(moji_array)));
    if (message.author.id !== "190588852769914880"){
        console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] tried to access an owner command.');
        message.channel.send(`${message.author}. Only Paimon's master may access this command! `, {files: [ moji_array[rand] ]});
        return;
    }
    // Checks if the `amount` parameter is given
    if (numline == undefined)
        return message.reply('You haven\'t given the amount of messages to be deleted!');
    // Checks if the `amount` parameter is a number. If not, the command throws an error
    if (isNaN(numline))
        return message.reply('The amount parameter isn`t a number!');
    // Checks if the `numline` integer is bigger than 100
    if (numline > 99)
        return message.reply('Maximum of clearing **99 messages** at once!');
    // Checks if the `numline` integer is smaller than 1
    if (numline < 1)
        return message.reply('You must delete **at least 1 message!**');
    
    /* BEGIN SWEEPING */
    // Fetching the execution command and sweep that first, catch any errors.

    // Fetch the given number of messages to sweeps: numline+1 to include the execution command
    await message.channel.fetchMessages({ limit: ++numline })
    .then(messages => {
        // Sweep all messages that have been fetched and are not older than 14 days (due to the Discord API), catch any errors.
        message.channel.bulkDelete(messages).catch(console.err);
    });
}

function readTextFile(file)
{
    var text = filestream.readFileSync(file).toString('utf-8');
    return text;
}

function reboot(message) {
    message.channel.send("Rebooting...")
    .then(console.log(`${message.member.user.tag} rebooted the bot.`)).catch(console.error)
    .then(client.destroy())
    .then(client.login(BOT_TOKEN));
}

function emergency_food_time(message) {
    // channel reply
    message.channel.send('Nooooooooooo! Paimon is turning into fooooooood!', {files:['moji/PaimonLunch.jpg']})
    .then(console.log(`${message.member.user.tag} killed Paimon as food~`)).catch(console.error)
    
    /*fix error: 'Request to use token, but token was unavailable to the client' */
    setTimeout(function(err) {
        if (err) throw err;
        client.destroy();
    }, 3000);
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
    var text = readTextFile('./genshin_data/genshin_wish_tables.json');
    var arrayObj = JSON.parse(text);

    var new_userdata = {
        uid: message.author.id,
        username: message.member.user.tag,
        bannerTypes: { event:0, weapon:0, standard:0, novice:'N/A' }
    };

    if (length(arrayObj.users) == 0) {
        arrayObj.users.push(new_userdata);
    }
    if (length(arrayObj.users) > 0) {
        // this is inefficient if the # of users gets too large, would be nice to convert it into a database to filter duplicates.
        for (var i = 0; i < length(arrayObj.users); i++) {
            // this user table already exist.
            if (arrayObj.users[i].uid === message.author.id) {
                // check if this user has recently changed his/her userTag.
                update_genshin_userTag(arrayObj, i);
                //terminal logging
                console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] already EXIST!');
                // channel reply
                message.channel.send(`${message.author}. Your Genshin Gacha Table aready exist!`);
                return;
            }
        }
        // if this user does does not have an existing table, create a default table for this user.
        arrayObj.users.push(new_userdata);
    }

    // update JSON Data
    save_JSON_Data(arrayObj);

    // display message
    console.log('Finished creating Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '].');
    console.log(new_userdata);
    message.channel.send(`${message.author}. Your Genshin Gacha Table has been created!`);
}

function showtable(message) {
    var text = readTextFile('./genshin_data/genshin_wish_tables.json');
    var arrayObj = JSON.parse(text);
    for (var i = 0; i < length(arrayObj.users); i++) {
        if (arrayObj.users[i].uid === message.author.id) {
            // check if this user has recently changed his/her userTag.
            update_genshin_userTag(arrayObj, i);
            // terminal logging
            console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
            console.log(arrayObj.users[i]);
            // channel reply
            message.channel.send(`${message.author}. Your Genshin Gacha Table is being fetched...\n${JSON.stringify(arrayObj.users[i], undefined, 2)}`);
            return;
        }
    }
    // this user table already exist.
    message.channel.send(`${message.author}. Please initialize your Genshin Gacha Table by using the '${PREFIX}gcreate' function`);
}

function showall(message) {
    /* Hard-coded OwnerID */
    var moji_array = ['moji/PaimonAngry.png', 'moji/PaimonNani.png', 'moji/PaimonCookies.gif', 'moji/PaimonLunch.jpg', 'moji/PaimonNoms.gif', 'moji/PaimonSqueezy.jpg', 'moji/PaimonThonks.jpg'];
    var rand = Math.floor(Math.random() * Math.floor(length(moji_array)));
    if (message.author.id !== "190588852769914880"){
        console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] tried to access an owner command.');
        message.channel.send(`${message.author}. Only Paimon's master may access this command!`, {files: [ moji_array[rand] ]});
        return;
    }

    var text = readTextFile('./genshin_data/genshin_wish_tables.json');
    var arrayObj = JSON.parse(text);
    for (var i = 0; i < length(arrayObj.users); i++) {
        // check if this user has recently changed his/her userTag.
        update_genshin_userTag(arrayObj, i);
        // terminal logging
        console.log('Genshin Gacha Table for all users requested by: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '].');
        console.log(arrayObj.users);
        // channel reply
        message.channel.send(`${message.author}. All Genshin Gacha Tables are being fetched...\n${JSON.stringify(arrayObj.users, undefined, 2)}`);
        return;
    }
    // this user table already exist.
    message.channel.send(`${message.author}. There are no Genshin Gacha Tables in the database!`);
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
                +"\t\t[S]: Standard Banner"
            +"\n\nCommandType:\n"
                +"\t\t[Add]: Character Event Banner\n"
                +"\t\t[Replace]: Weapon Banner"
            +"\n\nNumber:\n"
                +"\t\t[Integer]").then(console.log(`${message.member.user.tag} requested for a specific bot functions.`)).catch(console.error);
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
        var text = readTextFile('./genshin_data/genshin_wish_tables.json');
        var arrayObj = JSON.parse(text);
        for (var i = 0; i < length(arrayObj.users); i++) {
            if (arrayObj.users[i].uid === message.author.id) {
                // check if this user has recently changed his/her userTag.
                update_genshin_userTag(arrayObj, i);
                // terminal logging
                console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
                break;
            }
        }
        if (i == length(arrayObj.users)) {
            // this user table already exist.
            return message.channel.send(`${message.author}. Please initialize your Genshin Gacha Table by using the '${PREFIX}gcreate' function`);
        }

        // edit GGachaTable
        if ( !(commandType === "add" || commandType === "replace") ) {
            return message.channel.send(`${message.author}. Unsupported CommandType, cannot edit your gacha data.`)
            .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID commandType.`)).catch(console.error);
        }
        else if (commandType === "add") {
            switch (bannerType) {
                case "c":
                    arrayObj.users[i].bannerTypes.event += roll_count;
                    break;
                case "w":
                    arrayObj.users[i].bannerTypes.weapon += roll_count;
                    break;
                case "s":
                    arrayObj.users[i].bannerTypes.standard += roll_count;
                    break;
                default: 
                    return message.channel.send(`${message.author}. Unsupported BannerType, cannot determine your gacha data.`)
                    .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`)).catch(console.error);
            }
        }
        else if (commandType === "replace") {
            switch (bannerType) {
                case "c":
                    arrayObj.users[i].bannerTypes.event = roll_count;
                    break;
                case "w":
                    arrayObj.users[i].bannerTypes.weapon = roll_count;
                    break;
                case "s":
                    arrayObj.users[i].bannerTypes.standard = roll_count;
                    break;
                default: 
                    return message.channel.send(`${message.author}. Unsupported BannerType, cannot fetch your gacha data.`)
                    .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`)).catch(console.error);
            }
        }

        // save data back to json
        save_JSON_Data(arrayObj);
        
        // display message
        console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] updated!');
        console.log(arrayObj.users[i]);
        message.channel.send(`${message.author}. Your Genshin Gacha Table is now updated...\n${JSON.stringify(arrayObj.users[i], undefined, 2)}`);
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
                +"\t\t[S]: Standard Banner").then(console.log(`${message.member.user.tag} requested for a specific bot functions.`)).catch(console.error);
    }

    // find user
    var text = readTextFile('./genshin_data/genshin_wish_tables.json');
    var arrayObj = JSON.parse(text);
    for (var i = 0; i < length(arrayObj.users); i++) {
        if (arrayObj.users[i].uid === message.author.id) {
            // check if this user has recently changed his/her userTag.
            update_genshin_userTag(arrayObj, i);
            // terminal logging
            console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
            break;
        }
    }
    if (i == length(arrayObj.users)) {
        // this user table already exist.
        return message.channel.send(`${message.author}. Please initialize your Genshin Gacha Table by using the '${PREFIX}gcreate' function`);
    }
    
    bannerType = bannerType.toLowerCase();
    var bannerString = "";
    switch (bannerType) {
        case "c":
            bannerString = "Character Event Banner";
            arrayObj.users[i].bannerTypes.event = 0;
            break;
        case "w":
            bannerString = "Weapon Banner";
            arrayObj.users[i].bannerTypes.weapon = 0;
            break;
        case "s":
            bannerString = "Standard Wish Banner";
            arrayObj.users[i].bannerTypes.standard = 0;
            break;
        default: 
            return message.channel.send(`${message.author}. Unsupported BannerType, cannot reset your gacha data.`)
            .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`)).catch(console.error);
    }

    // save data back to json
    save_JSON_Data(arrayObj);

    // display message
    console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] updated!');
    console.log(arrayObj.users[i]);
    message.channel.send(`${message.author}. Your GGT-${bannerString} has now been reset...\n${JSON.stringify(arrayObj.users[i], undefined, 2)}`);
}

function length(obj) {
    return Object.keys(obj).length;
}

function sec_Convert(sec_string) {
    // time variable decl
    var seconds = Math.floor(parseInt(sec_string));
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);

    // re-factor minutes and seconds
    for (var i = 0; i < hours; i++) {
        minutes -= 60;
        seconds -= 3600;
    }
    for (var i = 0; i < minutes; i++) {
        seconds -= 60;
    }

    // string variable
    var time_string = `${seconds} secs`;
    if (minutes > 0)
        time_string = `${minutes} mins : ` + time_string;
    if (hours > 0) {
        time_string = `${hours} hrs : ` + time_string;
    }
    return time_string;
}

function update_genshin_userTag(arrayObj, cached_index) {
    var uniqueID = arrayObj.users[cached_index].uid;
    var current_userTag = client.users.get(uniqueID).tag;
    var cached_userTag = arrayObj.users[cached_index].username;

    if (cached_userTag !== current_userTag) {
        arrayObj.users[cached_index].username = current_userTag;
    }
    // update JSON Data
    save_JSON_Data(arrayObj);
    // no need to return arrayObj, it is passed by reference
}

function save_JSON_Data(arrayObj) {
    // save data back to json
    var tableString = JSON.stringify(arrayObj, undefined, 2);
    filestream.writeFile('./genshin_data/genshin_wish_tables.json', tableString, 'utf-8', function(err) {
        if (err) throw err;
    });
}

function userHelp(message) {
    message.channel.send(`${message.author}.`
            +`\n[Currently Hosting Natively]\n"Music Support Enabled!."`
            +"\n\nUsage: " + `${PREFIX}`+"[function]"
                +"\n\nFunctions:"
                    +"\n\tJoin"
                    +"\n\tSing [Link | Keyword]"
                    +"\n\tLeave"
                    +"\n\tHelp"
                    +"\n\tKill"
                    +"\n\tReboot"
                    +"\n\tSource"
                    +"\n\tWipe"
                    +"\n\tRoll"
                    +"\n\tMapleStory"
                    +"\n\tgCreate"
                    +"\n\tgShowtable"
                    +"\n\tgWish"
                    +"\n\tgReset"
                    +"\n\tValorant [GameCode] [Sensitivity]\n")
    .then(console.log(`${message.member.user.tag} requested for a general list of bot functions.`)).catch(console.error);
}

client.login(BOT_TOKEN);
