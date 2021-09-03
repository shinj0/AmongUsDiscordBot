const http = require('http');
const querystring = require('querystring');
const discord = require('discord.js');
const client = new discord.Client();

http.createServer(function(req, res){
  if (req.method == 'POST'){
    var data = "";
    req.on('data', function(chunk){
      data += chunk;
    });
    req.on('end', function(){
      if(!data){
        res.end("No post data");
        return;
      }
      var dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if(dataObject.type == "wake"){
        console.log("Woke up in post");
        res.end();
        return;
      }
      res.end();
    });
  }
  else if (req.method == 'GET'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

client.on('ready', message =>{
 console.log('Bot準備完了～');
 client.user.setPresence({ activity: { name: 'げーむ' } });
});

client.on('message', (message) => {
    if (message.content == '1') {
        let channel = message.member.voiceChannel;
        for (let member of channel.members) {
            member[1].setMute(true)
        }
      console.log("mute");
     }
  
  if (message.content == '2') {
    console.log("a");
        let channel = message.member.voiceChannel;
        for (let member of channel.members) {
            member[1].setMute(false)
        }
    console.log("unmute");
     }
});

const gvcName = "一般";

const {Readable}=require('stream');

class Silence extends Readable{
  _read(){this.push(Buffer.from([0xF8,0xFF,0xFE]))}
};
/**
 * discord の client が ready 状態になってないと、
 * client.channels..... を行えない。
*/
client.on("ready",()=>{
console.info("ready...")
client.channels.filter
//グローバルボイスチャットが変数gvcNameと同じチャンネルを抽出
(ch=>ch.type === "voice" && ch.name === gvcName)
.forEach(ch=>
{
ch.join()//vcに参加
.then(conn => {//connに参加したvcのデータが含まれる。

      //音の流れない音データを配信 
      //(最初にbotがVCで音データを流さないと音の取得ができないため。)
      conn.playFile(new Silence,{ type: 'opus' });
      let receiver = conn.receiver;
      //だれかがVCで発言したら。
      conn.on('speaking', (user, speaking) => {
        //botだったら放送しない。
        if(user.bot)return; 
        //音を取得
        const UserVoice = receiver.createStream(user);
        const broadcast = client.voice.createBroadcast();
        //流す音
        broadcast.play(UserVoice,{ type: 'opus' });
    //一斉にbotが接続中のVCに取得した音声を配信。
    for (const connection of client.voice.connections.values()) {
         connection.play(broadcast);
    };
        });
    });
});
});


if(process.env.DISCORD_BOT_TOKEN == undefined){
 console.log('DISCORD_BOT_TOKENが設定されていません。');
 process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );

function sendReply(message, text){
  message.reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(console.error);
}

function sendMsg(channelId, text, option={}){
  client.channels.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}
