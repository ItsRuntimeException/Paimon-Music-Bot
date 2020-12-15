const PREFIX = "?";
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const YouTube = require("discord-youtube-api");
const Discord = require("discord.js");
const filestream = require("fs");
const client = new Discord.Client();
const DICE = 6;

// set up envrionment token for heroku deployment website.
const TOKEN = process.env.BOT_TOKEN;
const youtube = new YouTube(process.env.YOUTUBE_API_KEY); // Personal Youtube-API key

// music variables
var servers = {};
var volume_float = 0.25;
var loop = false;
var skip = false;

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
    // initialize music queue
    if (!servers[message.guild.id]) {
        servers[message.guild.id] = {
            queue:[]
        }
    }

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
        case "play":
            var server = servers[message.guild.id];
            // string logic:
            var search_string = args.toString().replace(/,/g,' ');
            // VALIDATE ARG NOT NULL
            if (search_string == '') {
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
            if (!message.member.voiceChannel) {
                return message.reply("please join a voice channel first!", {files: ['./moji/PaimonCookies.gif']});
            }

            /** Queue Logic
             *    0  = no song; queue then play
             *    1  = playing; queue
             *    1+ = queue
             */
            if (server.queue.length == 0) {
                queueLogic(message, search_string, true);
            }
            else if (server.queue.length >= 1) {
                queueLogic(message, search_string);
            }
            break;
        case "playlocal":
            // IN-CHANNEL CHECK
            if (!message.member.voiceChannel) {
                return message.reply("please join a voice channel first!", {files: ['./moji/PaimonCookies.gif']});
            }
            queueLogic(message, '', true, true);
            break;
        case "currentsong":
            var server = servers[message.guild.id];
            // display current song
            var video = await youtube.searchVideos(server.queue[0]);
            message.channel.send({embed: {
                author: {
                    name: 'Paimon-chan\'s Embedded Lookup',
                    icon_url: client.user.avatarURL,
                    url: 'https://github.com/ItsRuntimeException/SimpleDiscordBot'
                },
                thumbnail: video.thumbnail,
                title: video.title,
                url: video.url,
                fields: [{
                    name: "Link",
                    value: video.url
                },
                {
                    name: "Duration",
                    value: sec_Convert(video.durationSeconds)
                }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: '© Rich Embedded Frameworks'
                }
            }}).then(newMessage => newMessage.delete(10000));
        case "vol":
            vol_music(message, args[0]);
            break;
        case "loop":
            loop_music(message, args[0]);
            break;
        case "pause":
            pause_music(message);
            break;
        case "resume":
            resume_music(message);
            break;
        case "skip":
            skip_music(message);
            break;
        case "stop":
            stop_music(message, 0);
            break;
        case "leave":
            leave(message);
            break;
        case "source":
            source_send(message);
            break;
        case "reboot":
            reboot(message);
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
        case "gpity":
            genshin_pity_calculation(message);
            break;
        case "gwish":
            wishCount(message, args[0], args[1], args[2]);
            break;
        case "greset":
            wishReset(message, args[0]);
            break;
        /* Owner Commands */
        case "clean":
            clean_messages(message, args[0]);
            break;
        default:
            message.channel.send(`${message.author}. You didn't provide a VALID function argument!`);
            break;
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

async function queueLogic(message, search_string, playToggle = false, local = false) {
    var server = servers[message.guild.id];
    if (local) {
        while (server.queue > 0) {
            //clear queue
            server.queue.shift();
        }
        let soundPath = './local_music/';
        filestream.readdir(soundPath, function (err, files) {
            if (err) {
                console.log(err);
                return;
            }
            for(let i = 0; i < files.length; i++) {
                server.queue.push(files[i]);
            }
            console.log(server.queue);
            if (server.queue > 0)
                play_music(message, soundPath, local);
            else {
                /*    USE:     https://regexr.com/ to help build a regex   */
                /*    GOAL:       get rid of './' or '/'                   */
                /*    RESULT:     ./local_music/    ----->   'local_music' */
                console.log(`${soundPath.replace(/\/|\./g,'')} folder currently has no music files!`);
                return message.channel.send(`${soundPath.replace(/\/|\./g,'')} folder currently has no music files!`);
            }
        });
    }
    else {
        // queue the search_string only, only fetch metadata upon playing
        let validateURL = ytdl.validateURL(search_string);
        let validate_playlist = ytpl.validateID(search_string);
        if (!validate_playlist) {
            server.queue.push(search_string);
        }
        else if (validate_playlist) {
            try {
                var yt_playlist = await youtube.getPlaylist(search_string);
            } catch (error) {
                console.log(error);
                return message.channel.send('Something went wrong!\n\n' + error);
            }
            for (var i = 0; i < yt_playlist.length; i++) {
                server.queue.push(yt_playlist[i].url);
            }
        }
        if (server.queue.length > 1) {
            if (!validate_playlist) {
                if (!validateURL) {
                    message.channel.send(`Your query: '${search_string}' have been queued.\n`);
                }
                else if (validateURL) {
                    message.channel.send(`Your link have been queued.\n`);
                }
            }
            else if (validate_playlist) {
                message.channel.send(`Your playlist have been queued.\n`);
            }
        }
        /* 
        *  server.queue only seems to have updated inside this function instead of client.on(...), 
        *  call play_music here to avoid playing [undefined] song.
        */
        if (playToggle) {
            play_music(message);
        }
        console.log(server.queue);
    }
}

async function play_music(message, soundPath = '', local = false) {
    var server = servers[message.guild.id];
    var connection = await message.member.voiceChannel.join();
    if (local) {
        let song = soundPath + server.queue[0];
        server.dispatcher = connection.playStream(song, {volume: volume_float});
        let songName = server.queue[0].split('.')[0];
        var video = await youtube.searchVideos(songName);
        message.channel.send('[Local] Now Playing: ' + songName);
        message.channel.send({embed: {
            author: {
                name: 'Paimon-chan\'s Embedded Lookup',
                icon_url: client.user.avatarURL,
                url: 'https://github.com/ItsRuntimeException/SimpleDiscordBot'
            },
            thumbnail: video.thumbnail,
            title: video.title,
            url: video.url,
            fields: [{
                name: "Link",
                value: video.url
            },
            {
                name: "Duration",
                value: sec_Convert(video.durationSeconds)
            }
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: '© Rich Embedded Frameworks'
            }
        }}).then(newMessage => newMessage.delete(10000));
    }
    else {
        message.channel.send('ytdl-core currently \'may or may not\' be able to play youtube audio-stream!');
        let validate = ytdl.validateURL(server.queue[0]);
        console.log('validate-mode? ' + validate);
        if (!validate) {
            // PRELOAD
            try {
                var video = await youtube.searchVideos(server.queue[0]);
            } catch (error) {
                console.log(error);
                return message.channel.send('Something went wrong!\n\n' + error);
            }
            // PLAY MUSIC via keywords
            let stream = ytdl(video.url, { filter: 'audioonly' });
            server.dispatcher = connection.playStream(stream, {volume: volume_float});
            console.log(`url: ${video.url}`);
            console.log(`Now Playing: ${video.title}\nDuration: ${sec_Convert(video.durationSeconds)}\n`);
            message.channel.send({embed: {
                author: {
                    name: 'Paimon-chan\'s Embedded Lookup',
                    icon_url: client.user.avatarURL,
                    url: 'https://github.com/ItsRuntimeException/SimpleDiscordBot'
                },
                thumbnail: video.thumbnail,
                title: video.title,
                url: video.url,
                fields: [{
                    name: "Link",
                    value: video.url
                },
                {
                    name: "Duration",
                    value: sec_Convert(video.durationSeconds)
                }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: '© Rich Embedded Frameworks'
                }
            }}).then(newMessage => newMessage.delete(10000));
        }
        else if (validate) {
            // PLAY MUSIC via link
            try {
                var video = await youtube.getVideo(server.queue[0]);
            } catch (error) {
                console.log(error);
                return message.channel.send('Something went wrong!\n\n' + error);
            }
            let stream = ytdl(video.url, { filter: 'audioonly' });
            server.dispatcher = connection.playStream(stream, {volume: volume_float});
            console.log(`url: ${video.url}`);
            console.log(`Now Playing: ${video.title}\nDuration: ${sec_Convert(video.durationSeconds)}\n`);
            message.channel.send({embed: {
                author: {
                    name: 'Paimon-chan\'s Embedded Lookup',
                    icon_url: client.user.avatarURL,
                    url: 'https://github.com/ItsRuntimeException/SimpleDiscordBot'
                },
                fields: [{
                    name: "Title",
                    value: video.title
                },
                {
                    name: "Duration",
                    value: sec_Convert(video.durationSeconds)
                }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: '© Rich Embedded Frameworks'
                }
            }}).then(newMessage => newMessage.delete(10000));
        }
    }

    server.dispatcher.on('end', function() {
        if (loop) {
            if (skip) {
                server.queue.shift();
                skip = false;
            }
            else {
                console.log('Loop Mode: ON, replay current song.');
            }
        }
        else
            server.queue.shift();

        if (server.queue.length > 0) {
            if (local) {
                play_music(message, local);
            }
            else {
                play_music(message);
            }
        }
        else if (server.queue.length == 0) {
            server.dispatcher = undefined;
            leave(message);
        }
    })
}

function vol_music(message, num) {
    if (num == undefined) {
        console.log(`Current volume: ${volume_float*100}%`);
        return message.channel.send(`Current volume: ${volume_float*100}%`).then(newMessage => newMessage.delete(5000));
    }
    var percentage = parseFloat(num);
    if (isNaN(percentage)) {
        console.log(`${message.member.user.tag} requested for volume change, but reached INVALID number.`);
        return message.channel.send(`${message.author}. You need to supply a VALID number!`);
    }
    let server = servers[message.guild.id];
    if (server.dispatcher != null) {
        // Sets the volume relative to the input stream - i.e. 1 is normal, 0.5 is half, 2 is double.
        volume_float = percentage / 100;
        if (volume_float <= 1) {
            server.dispatcher.setVolume(volume_float);
            console.log(`Volume set to ${percentage}%`);
            message.channel.send(`Volume set to ${percentage}%`).then(newMessage => newMessage.delete(5000));
        }
        else {
            console.log(`Cannot set volume greater than 100%`);
            message.channel.send(`Cannot set volume greater than 100%`).then(newMessage => newMessage.delete(5000));
        }
    }
    else {
        message.channel.send('Music is not playing.').then(newMessage => newMessage.delete(5000));
    }
}

function loop_music(message, switcher) {
    if (switcher == undefined) {
        if (loop) {
            return message.channel.send('Loop Mode Status: ON').then(newMessage => newMessage.delete(5000));
        }
        else {
            return message.channel.send('Loop Mode Status: OFF').then(newMessage => newMessage.delete(5000));
        }
    }

    switcher = switcher.toLowerCase();
    switch (switcher) {
        case 'on':
            loop = true;
            console.log('Loop Mode is turned ON');
            message.channel.send('Loop Mode is turned ON');
            break;
        case 'off':
            loop = false;
            console.log('Loop Mode is turned OFF');
            message.channel.send('Loop Mode is turned OFF');
            break;
        default:
            message.channel.send('Usage: ?loop ON|OFF');
            break;
    }
}

function pause_music(message) {
    let server = servers[message.guild.id];
    if (server.dispatcher != null) {
        server.dispatcher.pause();
        message.channel.send('Music paused.');
    }
    else {
        message.channel.send('There is nothing to pause.');
    }
    console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested to pause music.');
}

function resume_music(message) {
    // initialize queue
    if (!servers[message.guild.id]) {
	servers[message.guild.id] = {
            queue:[]
        }
    }
    let server = servers[message.guild.id];
    if (server.dispatcher != null) {
        server.dispatcher.resume();
        message.channel.send('Music resume.');
    }
    else {
        message.channel.send('There is nothing to resume.');
    }
    console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested to resume music.');
}

function skip_music(message) {
    let server = servers[message.guild.id];
    skip = true;
    if (server.dispatcher != null) {
        server.dispatcher.end();
        message.channel.send('Music skipped.');
    }
    else {
        message.channel.send('There is nothing to skip.');
    }
    console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested to skip music.');
}

function stop_music(message, fcode) {
    let server = servers[message.guild.id];
    if (server.dispatcher != null) {
        // clear queue
        while (server.queue.length > 0) {
            server.queue.shift();
        }
        server.dispatcher.end();
        if (fcode == 0) {
            message.channel.send('Music stopped.');
            console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested to stop music.');
        }
        else if (fcode == 1)
            message.channel.send("I have left the voice channel.");
    }
    else {
        if (fcode == 0) {
            message.channel.send('There is nothing to stop.');
            console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested to stop music.');
        }
        else if (fcode == 1)
            message.channel.send("I have left the voice channel.");
    }
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
        stop_music(message, 1);
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

async function clean_messages(message, numline) {
    /* ONLY OWNER MAY USE THIS COMMAND */
    var moji_array = ['moji/PaimonAngry.png', 'moji/PaimonNani.png', 'moji/PaimonCookies.gif', 'moji/PaimonLunch.jpg', 'moji/PaimonNoms.gif', 'moji/PaimonSqueezy.jpg', 'moji/PaimonThonks.jpg'];
    var rand = Math.floor(Math.random() * Math.floor(objLength(moji_array)));
    if (message.author.id !== readTextFile('./src/ownerID.txt')){
        console.log('[tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] tried to access an owner command.');
        message.channel.send(`${message.author}. Only Paimon's master may access this command! `, {files: [ moji_array[rand] ]});
        return;
    }
    // Checks if the `amount` parameter is a number. If not, the command throws an error
    if (numline == undefined) {
        // it's fine, continue...
    }
    else if (isNaN(numline))
        return message.reply('The amount parameter isn`t a number!');
    // Checks if the `numline` integer is bigger than 100
    else if (numline > 99)
        return message.reply('Maximum of clearing **99 messages** at once!');
    // Checks if the `numline` integer is smaller than 1
    else if (numline < 1)
        return message.reply('You must delete **at least 1 message!**');
    
    /* BEGIN SWEEPING */
    // Fetching the execution command and sweep that first, catch any errors.

    // Fetch the given number of messages to sweeps: numline+1 to include the execution command
    // Sweep all messages that have been fetched and are not older than 14 days (due to the Discord API), catch any errors.
    var bulkMessages = ((numline == undefined) ? await message.channel.fetchMessages() : await message.channel.fetchMessages( {limit: ++numline}));
    message.channel.bulkDelete(bulkMessages, true).then(console.log('message cleaning requested!'));
    message.channel.send(`Cleaned ${bulkMessages.array().length-1} messages.`).then(newMessage => newMessage.delete(5000));
    console.log('Cleared!');
}

function readTextFile(file)
{
    var text = filestream.readFileSync(file).toString('utf-8');
    return text;
}

function reboot(message) {
    message.channel.send("Rebooting...")
    .then(console.log(`${message.member.user.tag} rebooted the bot.`))
    .then(client.destroy())
    .then(client.login(TOKEN));
}

function emergency_food_time(message) {
    // channel reply
    message.channel.send('Nooooooooooo! Paimon is turning into fooooooood!', {files:['moji/PaimonLunch.jpg']})
    .then(console.log(`${message.member.user.tag} killed Paimon as food~`));
    
    /*fix error: 'Request to use token, but token was unavailable to the client' */
    setTimeout(function(err) {
        if (err) throw err;
        client.destroy();
    }, 1000);
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
        .then(console.log(`${message.member.user.tag} requested for VALORANT sensitivity conversion, but reached INVALID sensitivity.`));
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
                .then(console.log(`${message.member.user.tag} requested for VALORANT sensitivity conversion, but reached INVALID GameCode.`));
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
        bannerTypes: { event:0, weapon:0, standard:0 }
    };

    if (objLength(arrayObj.users) == 0) {
        arrayObj.users.push(new_userdata);
    }
    if (objLength(arrayObj.users) > 0) {
        // this is inefficient if the # of users gets too large, would be nice to convert it into a database to filter duplicates.
        for (var i = 0; i < objLength(arrayObj.users); i++) {
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
    setTimeout(function(err) {
        if (err) throw err;
        save_JSON_Data(arrayObj);
    }, 1000);

    // display message
    console.log('Finished creating Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '].');
    console.log(new_userdata);
    message.channel.send(`${message.author}. Your Genshin Gacha Table has been created!`);
}

function showtable(message) {
    var text = readTextFile('./genshin_data/genshin_wish_tables.json');
    var arrayObj = JSON.parse(text);
    for (var i = 0; i < objLength(arrayObj.users); i++) {
        if (arrayObj.users[i].uid === message.author.id) {
	        message.channel.send(`${message.author}. Your Genshin Gacha Table is being fetched...`);
            // check if this user has recently changed his/her userTag.
            update_genshin_userTag(arrayObj, i);
            // terminal logging
            console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
            console.log(arrayObj.users[i]);
            // channel reply
            var bannerObj = arrayObj.users[i].bannerTypes;
            return message.channel.send({embed: {
                    author: {
                        name: message.member.user.tag,
                        icon_url: message.member.user.avatarURL,
                    },
                    fields: [{
                        name: "Character Event Banner",
                        value: `Currently at: ${bannerObj.event} ${((bannerObj.event > 1) ? 'wishes' : 'wish')}`
                    },
                    {
                        name: "Weapon Banner",
                        value: `Currently at: ${bannerObj.weapon} ${((bannerObj.weapon > 1) ? 'wishes' : 'wish')}`
                    },
                    {
                        name: "Standard Permanent Banner",
                        value: `Currently at: ${bannerObj.standard} ${((bannerObj.standard > 1) ? 'wishes' : 'wish')}`
                    }
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: '© Rich Embedded Frameworks'
                    }
            }});
        }
    }
    // this user table already exist.
    message.channel.send(`${message.author}. Please initialize your Genshin Gacha Table by using the '${PREFIX}gcreate' function!`);
}

function genshin_pity_calculation(message) {
    var text = readTextFile('./genshin_data/genshin_wish_tables.json');
    var arrayObj = JSON.parse(text);
    for (var i = 0; i < objLength(arrayObj.users); i++) {
        if (arrayObj.users[i].uid === message.author.id) {
	    message.channel.send(`${message.author}. Calculating your 5-star pity point...`);
            // check if this user has recently changed his/her userTag.
            update_genshin_userTag(arrayObj, i);
            // terminal logging
            console.log('Genshin Pity Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
            console.log('Pity Calculation: ');
            const normal_pity_goal = 90;
            const weapon_pity_goal = normal_pity_goal - 10;
            const primogem_value = 160;
            let pity_table = {
                event: normal_pity_goal- arrayObj.users[i].bannerTypes.event, 
                weapon: weapon_pity_goal - arrayObj.users[i].bannerTypes.weapon, 
                standard: normal_pity_goal - arrayObj.users[i].bannerTypes.standard
            }
            // channel reply
            console.log(pity_table);
            console.log('\n');
            return message.channel.send({embed: {
                author: {
                    name: message.member.user.tag,
                    icon_url: message.member.user.avatarURL,
                },
                fields: [{
                    name: "Character Event Banner",
                    value: `${pity_table.event} ${((pity_table.event > 1) ? 'wishes' : 'wish')} until pity goal.\n(${pity_table.event*primogem_value} primo-gems)`
                  },
                  {
                    name: "Weapon Banner",
                    value: `${pity_table.weapon} ${((pity_table.weapon > 1) ? 'wishes' : 'wish')} until pity goal.\n(${pity_table.weapon*primogem_value} primo-gems)`
                  },
                  {
                    name: "Standard Permanent Banner",
                    value: `${pity_table.standard} ${((pity_table.standard > 1) ? 'wishes' : 'wish')} until pity goal.\n(${pity_table.standard*primogem_value} primo-gems)`
                  }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: '© Rich Embedded Frameworks'
                }
            }});
        }
    }
    // this user table already exist.
    message.channel.send(`${message.author}. Please initialize your Genshin Gacha Table by using the '${PREFIX}gcreate' function!`);
}

function wishCount(message, bannerType, commandType, nInc) {
    if (bannerType == undefined || commandType == undefined || nInc == undefined) {
        console.log(`${message.member.user.tag} requested for genshin wish count, but reached UNDEFINED arguments.`);
        console.log(`\n    bannerType = ${bannerType}, commandType = ${commandType}, nInc = ${nInc}\n\n`);
        return message.channel.send(`${message.author}.`
            +"\nThis command adds the number of rolls to your current Genshin Gacha Table."
            +"\n\nUsage: " + "gwish [BannerType] [CommandType] [Number]"
            +"\n\nBannerType:\n"
                +"\t\t[Event]: Character Event Banner\n"
                +"\t\t[Weapon]: Weapon Banner\n"
                +"\t\t[Standard]: Standard Permanent Banner"
            +"\n\nCommandType:\n"
                +"\t\t[Add]: Add to the existing count\n"
                +"\t\t[Replace]: Replace the existing count"
            +"\n\nNumber:\n"
                +"\t\t[Integer]").then(console.log(`${message.member.user.tag} requested for a specific bot functions.`));
    }

    bannerType = bannerType.toLowerCase();
    commandType = commandType.toLowerCase();
    var roll_count = parseInt(nInc);
    if (isNaN(roll_count)) // is Not a Number
    {
        return message.channel.send(`${message.author}. You need to supply a VALID count!`)
        .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID count.`));
    }
    else {
        // find user
        var text = readTextFile('./genshin_data/genshin_wish_tables.json');
        var arrayObj = JSON.parse(text);
        for (var i = 0; i < objLength(arrayObj.users); i++) {
            if (arrayObj.users[i].uid === message.author.id) {
                // check if this user has recently changed his/her userTag.
                update_genshin_userTag(arrayObj, i);
                // terminal logging
                console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
                break;
            }
        }
        if (i == objLength(arrayObj.users)) {
            // this user table already exist.
            return message.channel.send(`${message.author}. Please initialize your Genshin Gacha Table by using the '${PREFIX}gcreate' function`);
        }

        // edit GGachaTable
        if ( !(commandType === "add" || commandType === "replace") ) {
            return message.channel.send(`${message.author}. Unsupported CommandType, cannot edit your gacha data.`)
            .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID commandType.`));
        }
        if (commandType === "add") {
            switch (bannerType) {
                case "event":
                    arrayObj.users[i].bannerTypes.event += roll_count;
                    break;
                case "weapon":
                    arrayObj.users[i].bannerTypes.weapon += roll_count;
                    break;
                case "standard":
                    arrayObj.users[i].bannerTypes.standard += roll_count;
                    break;
                default: 
                    console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`);
                    message.channel.send(`${message.author}. Unsupported BannerType, cannot determine your gacha data.`);
            }
        }
        if (commandType === "replace") {
            switch (bannerType) {
                case "event":
                    arrayObj.users[i].bannerTypes.event = roll_count;
                    break;
                case "weapon":
                    arrayObj.users[i].bannerTypes.weapon = roll_count;
                    break;
                case "standard":
                    arrayObj.users[i].bannerTypes.standard = roll_count;
                    break;
                default: 
                    console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`);
                    return message.channel.send(`${message.author}. Unsupported BannerType, cannot determine your gacha data.`);
            }
        }

        // save data back to json
        setTimeout(function(err) {
            if (err) throw err;
            save_JSON_Data(arrayObj);
        }, 1000);
        
        // display message
        console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] updated!');
        console.log(arrayObj.users[i]);
        message.channel.send(`${message.author}. Your Genshin Gacha Table has been updated!`);
        var bannerObj = arrayObj.users[i].bannerTypes;
        return message.channel.send({embed: {
            author: {
                name: message.member.user.tag,
                icon_url: message.member.user.avatarURL,
            },
            fields: [{
                name: "Character Event Banner",
                value: `Currently at: ${bannerObj.event} ${((bannerObj.event > 1) ? 'wishes' : 'wish')}`
            },
            {
                name: "Weapon Banner",
                value: `Currently at: ${bannerObj.weapon} ${((bannerObj.weapon > 1) ? 'wishes' : 'wish')}`
            },
            {
                name: "Standard Permanent Banner",
                value: `Currently at: ${bannerObj.standard} ${((bannerObj.standard > 1) ? 'wishes' : 'wish')}`
            }
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: '© Rich Embedded Frameworks'
            }
        }}).then(newMessage => newMessage.delete(5000));
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
                +"\t\t[Event]: Character Event Banner\n"
                +"\t\t[Weapon]: Weapon Banner\n"
                +"\t\t[Standard]: Standard Permanent Banner")
                .then(console.log(`${message.member.user.tag} requested for a specific bot functions.`));
    }

    // find user
    var text = readTextFile('./genshin_data/genshin_wish_tables.json');
    var arrayObj = JSON.parse(text);
    for (var i = 0; i < objLength(arrayObj.users); i++) {
        if (arrayObj.users[i].uid === message.author.id) {
            // check if this user has recently changed his/her userTag.
            update_genshin_userTag(arrayObj, i);
            // terminal logging
            console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] requested!');
            break;
        }
    }
    if (i == objLength(arrayObj.users)) {
        // this user table already exist.
        return message.channel.send(`${message.author}. Please initialize your Genshin Gacha Table by using the '${PREFIX}gcreate' function`);
    }
    
    bannerType = bannerType.toLowerCase();
    var bannerString = "";
    switch (bannerType) {
        case "event":
            bannerString = "Character Event Banner";
            arrayObj.users[i].bannerTypes.event = 0;
            break;
        case "weapon":
            bannerString = "Weapon Banner";
            arrayObj.users[i].bannerTypes.weapon = 0;
            break;
        case "standard":
            bannerString = "Standard Wish Banner";
            arrayObj.users[i].bannerTypes.standard = 0;
            break;
        default: 
            return message.channel.send(`${message.author}. Unsupported BannerType, cannot reset your gacha data.`)
            .then(console.log(`${message.member.user.tag} requested for Genshin Wish Count, but reached INVALID bannerType.`));
    }

    // save data back to json
    setTimeout(function(err) {
        if (err) throw err;
        save_JSON_Data(arrayObj);
    }, 1000);

    // display message
    console.log('Genshin Gacha Table for user: [tag: ' + message.member.user.tag + ' | uid: ' + message.author + '] updated!');
    console.log(arrayObj.users[i]);
    message.channel.send(`${message.author}. Your GGT:${bannerString} has been reset...`);
    var bannerObj = arrayObj.users[i].bannerTypes;
    return message.channel.send({embed: {
        author: {
            name: message.member.user.tag,
            icon_url: message.member.user.avatarURL,
        },
        fields: [{
            name: "Character Event Banner",
            value: `Currently at: ${bannerObj.event} ${((bannerObj.event > 1) ? 'wishes' : 'wish')}`
        },
        {
            name: "Weapon Banner",
            value: `Currently at: ${bannerObj.weapon} ${((bannerObj.weapon > 1) ? 'wishes' : 'wish')}`
        },
        {
            name: "Standard Permanent Banner",
            value: `Currently at: ${bannerObj.standard} ${((bannerObj.standard > 1) ? 'wishes' : 'wish')}`
        }
        ],
        timestamp: new Date(),
        footer: {
            icon_url: client.user.avatarURL,
            text: '© Rich Embedded Frameworks'
        }
    }}).then(newMessage => newMessage.delete(5000));
}

function objLength(obj) {
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
    setTimeout(function(err) {
        if (err) throw err;
        save_JSON_Data(arrayObj);
    }, 1000);
}

function save_JSON_Data(arrayObj) {
    // save data back to json
    var tableString = JSON.stringify(arrayObj, undefined, 2);
    filestream.writeFile('./genshin_data/genshin_wish_tables.json', tableString, 'utf-8', function(err) {
        if (err) throw err;
    });
}

function userHelp(message) {
    message.channel.send({embed: {
        author: {
            name: 'Paimon-chan\'s Embedded Info',
            icon_url: client.user.avatarURL,
            url: 'https://github.com/ItsRuntimeException/SimpleDiscordBot'
        },
        title: "Fuctions",
        description: "[Currently Hosting via Heroku]\nMusic Support Enabled!",
        fields: [{
            name: "?Help",
            value: "Display a general list of commands."
          },
          {
            name: "?Join|Leave",
            value: "Paimon will join/leave your voice channel!"
          },
          {
            name: "?Play [YouTube-Link|Keyword]",
            value: "1: Play audio from the user's provided link.\n2: Perform a search on the user's provided keyword."
          },
          {
            name: "?vol [Percent]",
            value:"Set the current music volume."
          },
          {
            name: "Pause|Resume|Skip|Stop|Loop",
            value: "Music Control Logic."
          },
          {
            name: "Kill",
            value: "Paimon shall be served as food T^T"
          },
          {
            name: "Reboot",
            value: "Paimon shall take a nap!"
          },
          {
            name: "Source",
            value: "Paimon's delicious sauce code~"
          },
          {
            name: "Clean",
            value: "Paimon will clean up your mess!"
          },
          {
            name: "Roll",
            value: "Random Number between 1-6."
          },
          {
            name: "MapleStory",
            value: "MapleStory guild page."
          },
          {
            name: "g[Create|Showtable|Pity|Wish|Reset]",
            value: "Genshin Impact's manual \'Gacha Count-Table\'."
          },
          {
            name: "Valorant [GameCode] [Sensitivity]",
            value: "Convert other games' sensitivity ↦ Valorant's."
          }
        ],
        timestamp: new Date(),
        footer: {
            icon_url: client.user.avatarURL,
            text: '© Rich Embedded Frameworks'
        }
    }}).then(console.log(`${message.member.user.tag} requested for a general list of bot functions.`));
}

client.login(TOKEN);
