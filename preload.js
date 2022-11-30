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

  const prog = document.getElementById('progress');

  document.getElementById('dldanother').addEventListener('click', () => {

    document.getElementById('progress').style.display = "block";
    document.getElementById('twobutton').style.display = "none";
    document.getElementById("convert").style.display = "block";
    prog.setAttribute("value", 0);
    document.getElementById("convert").innerText = "";
  });

  ipc.on('down', (event, arg) => {
  console.log(arg)
    prog.setAttribute("value", parseInt(arg,10));

  });

  ipc.on('total', (event, arg) => {
    console.log(arg)
    prog.setAttribute("max", arg);

    document.getElementById('progress').style.display = "block";
    document.getElementById('twobutton').style.display = "none";
    document.getElementById("convert").style.display = "block";

  });

  ipc.on('finish', (event, arg) => {

    prog.setAttribute("max", (prog.getAttribute("max")));

    document.getElementById("convert").style.display = "none";
    document.getElementById('twobutton').style.display = "block";

    alert("Download finished")
    document.getElementById('progress').style.display = "none";
  });


})