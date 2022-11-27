window.addEventListener('DOMContentLoaded', () => {

  const ipc = require('electron').ipcRenderer;
  var received = document.getElementById('received')
  var infoytid = document.getElementById('infoyt')

  document.getElementById('convert').addEventListener('click', () => {
    var input = document.getElementById("ytlink");
    var inputvalue = input.value

    var infoyt = ipc.sendSync("servinfo", inputvalue);

    infoytid.innerHTML = infoyt;

    var data = ipc.sendSync('servconvert', (input.value));

    received.innerHTML = data;


  });

  function timer() {
    var texttimer = document.getElementById("timer");
    var timer = 0;

    setInterval(function () {
      timer++;
      texttimer.innerHTML = timer;
      console.log(data)
    }, 1000);
  }


})