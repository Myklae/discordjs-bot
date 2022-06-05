const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');
const { buildText } = require('../../functions/language');
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    play: async function(message, song) {
        const queue = message.client.queue;
        const guild = message.guild;
        const serverQueue = queue.get(message.guild.id);
    
        if (!song) {
            queue.delete(guild.id);
            return;
        }
    
        const resource = createAudioResource(ytdl(song.url, { filter: "audioonly", quality: "highest" }), {
            metadata: {
                title: song.title,
            }
        });

        await serverQueue.player.play(resource);
        await serverQueue.player.on(AudioPlayerStatus.Idle, () => {
            if (serverQueue.songs.length > 0) if (!serverQueue.songs[0].loop) serverQueue.songs.shift();
            module.exports.play(message, serverQueue.songs[0]);
        });

        await serverQueue.player.on('error', error => {
            message.client.log.sendError(message.client, error, message);
        });
    
        const videoEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setDescription(`[${song.title}](${song.url})`)
            .setAuthor({ name: `${song.timestamp[0]} - Şu anda oynatılıyor`, iconURL: 'https://i.imgur.com/5ZbX7RV.png' })
            .setTimestamp()
            .setFooter({ text: message.author.username + '#' + message.author.discriminator });
    
        if (serverQueue.songs.length > 0) if (!serverQueue.songs[0].loop) serverQueue.textChannel.send({ embeds: [videoEmbed] });
    },
}