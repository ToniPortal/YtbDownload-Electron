window.addEventListener('DOMContentLoaded', () => {

  const ipc = require('electron').ipcRenderer;
  var received = document.getElementById('received')
  var infoytid = document.getElementById('infoyt')

  document.getElementById('convert').addEventListener('click', () => {
    var input = document.getElementById("ytlink");

    const json = {
      "url": input.value,
      "quality": localStorage.getItem('choix')
    };

    var infoyt = ipc.sendSync("servinfo", input.value);

    infoytid.innerHTML = infoyt;

    var data = ipc.send('servconvert', json);

  });

  const prog = document.getElementById('progress');

  document.getElementById('dldanother').addEventListener('click', () => {

    document.getElementById('progress').style.display = "block";
    document.getElementById('twobutton').style.display = "none";
    document.getElementById("convert").style.display = "block";
    prog.setAttribute("value", 0);
    // document.getElementById("convert").innerText = "";
  });

  ipc.on('down', (event, arg) => {
    //parseInt(arg, 10)
    console.log(arg)
    prog.setAttribute("value", arg);

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

    // alert("Download finished")
    document.getElementById('progress').style.display = "none";
  });


  //Select quality video
  const sel = document.getElementById('choix');

  // Charger la valeur précédemment enregistrée, si disponible
  const choixPrecedent = localStorage.getItem('choix');
  if (!choixPrecedent) {
    sel.value = choixPrecedent;
  }

  sel.addEventListener('change', () => {
    const choix = sel.value;

    // Enregistrer le choix dans le localStorage
    localStorage.setItem('choix', choix);
    console.log(`Choix enregistré : ${choix}`);
  });


})