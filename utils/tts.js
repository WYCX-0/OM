function speak(text) {
	// 构建请求URL
	const url = 'https://tts.baidu.com/text2audio.mp3?tex=' + text +
		'&cuid=baike&amp&lan=ZH&amp&ctp=1&amp&pdt=301&amp&vol=100&amp&rate=32&amp&per=0&spd=10&pit=undefined';

	if (typeof Audio !== 'undefined') {
		// H5 平台
		const audio = new Audio(url);
		audio.play();
	} else if (typeof wx !== 'undefined' && wx.createInnerAudioContext) {
		// 微信小程序平台
		const innerAudioContext = wx.createInnerAudioContext();
		innerAudioContext.src = url;
		innerAudioContext.play();
	} else if (typeof plus !== 'undefined' && plus.audio) {
		// App（原生）平台
		const player = plus.audio.createPlayer(url);
		player.play(function() {
			console.log('Play success');
		}, function(e) {
			console.log('Play failed: ' + e.message);
		});
	} else if (typeof my !== 'undefined' && my.createInnerAudioContext) {
		// 支付宝小程序平台
		const innerAudioContext = my.createInnerAudioContext();
		innerAudioContext.src = url;
		innerAudioContext.play();
	} else if (typeof swan !== 'undefined' && swan.createInnerAudioContext) {
		// 百度小程序平台
		const innerAudioContext = swan.createInnerAudioContext();
		innerAudioContext.src = url;
		innerAudioContext.play();
	} else if (typeof tt !== 'undefined' && tt.createInnerAudioContext) {
		// 字节跳动小程序平台
		const innerAudioContext = tt.createInnerAudioContext();
		innerAudioContext.src = url;
		innerAudioContext.play();
	} else {
		console.error('Unsupported platform or Audio object is not defined');
	}

}

export default {
	speak
}