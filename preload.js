window.addEventListener('DOMContentLoaded', () => {

  const ipc = require('electron').ipcRenderer;

  document.getElementById('').addEventListener('click', () => {
    ipc.send('audiostart');
  });

})