const express = require("express");
const app = express();
const Stream = require('node-rtsp-stream');
const rtspList = 
[
	{ "url":"rtsp://id:pwss@ip:port/url", "port":9001, "lastDate":null},
	{ "url":"rtsp://id:pwss@ip:port/url", "port":9002, "lastDate":null}
]

/// install 항목
/// express
/// node-rtsp-stream (videoStream.js부분 prototype 추가 {restartStream})
/// ffmpeg (따로 설치해서 환경변수 등록)
/// 제발 이런거 맨땅에서 만드는데 리미트 일주일로 잡지마!

rtspList.forEach((rtsp) => 
{
	openStream(rtsp);
	let timer = setInterval((rtsp) => 
	{
		let today = new Date();
		if (rtsp.lastDate !== undefined)
		{
			let stream_date = new Date(rtsp.lastDate);
			let gap = (today.getTime() - stream_date.getTime()) / 1000;
			if (gap >= 5)
			{
				rtsp.lastDate = today;
				rtsp.stream = rtsp.stream.restartStream();
				rtsp.stream.mpeg1Muxer.on("ffmpegStderr", () => 
				{
					let today = new Date();
					rtsp.lastDate = today;
				});
			}
		}
	}, 1000, rtsp);
});

function openStream(rtspVo)
{
	let stream = new Stream({
		name: rtspVo.name,
		streamUrl: rtspVo.url,
		wsPort: rtspVo.port,
		ffmpegOptions: {
			'-stats': '',
			'-r': 30
		}
	});

	rtspVo.stream = stream;
	stream.mpeg1Muxer.on("ffmpegStderr", () => 
	{
		let today = new Date();
		rtspVo.lastDate = today;
	});
}

app.listen(80);
app.use(express.static(__dirname));
app.use("/script", express.static(__dirname));

app.get("/", (req, res) => 
{
  res.sendFile(__dirname + "/index.html");
})