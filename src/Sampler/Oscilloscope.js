// https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js
let requestFrameId

export const visualize = (canvas, canvasCtx, analyser, viewSignal) => {
  const WIDTH = canvas.width
  const HEIGHT = canvas.height

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  function drawFrequencyBars() {
    const bufferLength = 64
    const dataArray = new Uint8Array(bufferLength)

    analyser.getByteFrequencyData(dataArray)

    const w = WIDTH / dataArray.length;

    for (var i = 0, imax = dataArray.length; i < imax; i++) {
      var x = w * i;
      var y = linlin(dataArray[i], 0, 255, HEIGHT, 0);
      var r = linlin(dataArray[i], 0, 255, 100, 255)|0;
      canvasCtx.fillStyle = "rgb(" + r + ", 76, 60)";
      canvasCtx.fillRect(x, y, w - 1, HEIGHT - y);
    }
  }


  function drawSignal() {
    const bufferLength = 2048
    const dataArray = new Uint8Array(bufferLength)

    analyser.getByteTimeDomainData(dataArray)

    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = 'rgb(255,255,0)'

    canvasCtx.beginPath()

    var sliceWidth = WIDTH * 1.0 / bufferLength
    var x = 0

    for(var i = 0; i < bufferLength; i++) {

      var v = dataArray[i] / 128.0
      var y = v * HEIGHT/2

      if(i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }

      x += sliceWidth
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2)
    canvasCtx.stroke()
  }

  function draw() {
    requestFrameId = requestAnimationFrame(draw)

    canvasCtx.fillStyle = 'rgb(128,128,128)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)
    if (viewSignal) drawSignal()
    else drawFrequencyBars()
  }

  draw()

}


function linlin(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}

export const stopVisualization = (canvas, canvasCtx) => {
  cancelAnimationFrame(requestFrameId)
  requestFrameId = null
  canvasCtx.fillStyle = 'rgb(128,128,128)'
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
}
