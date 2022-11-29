window.addEventListener('DOMContentLoaded', () => {

  const ipc = require('electron').ipcRenderer;
  var received = document.getElementById('received')
  var infoytid = document.getElementById('infoyt')

  document.getElementById('convert').addEventListener('click', () => {
    var input = document.getElementById("ytlink");
    var inputvalue = input.value

    var infoyt = ipc.sendSync("servinfo", inputvalue);

    infoytid.innerHTML = infoyt;

    var data = ipc.send('servconvert', (input.value));

  });

  var nb = 0;
  const prog = document.getElementById('progress');
  
  ipc.on('down', (event, arg) => {
  console.log(arg)
    prog.setAttribute("value", parseInt(arg,10));

  });

  ipc.on('total', (event, arg) => {
    console.log(arg)
    prog.setAttribute("max", arg);
  });

  ipc.on('finish', (event, arg) => {

    prog.setAttribute("max", (prog.getAttribute("max")));
    alert("Download finished")

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