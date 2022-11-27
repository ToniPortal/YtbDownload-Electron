const {
    app,
    BrowserWindow,
    ipcMain,
    nativeTheme
} = require('electron')

const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path')



function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            enableRemoteModule: true

        }
    })

    win.loadFile('./web/index.html')


    ipcMain.on('servinfo', async (event, arg) => {

        var yti = await ytdl.getBasicInfo(arg)
        console.log(`idytb: ${yti.videoDetails.videoId}\nTitre: ${yti.videoDetails.title}\nNom de la chaîne: ${yti.videoDetails.ownerChannelName}\nDate d'upload: ${yti.videoDetails.uploadDate}`)
        event.returnValue = `idytb: ${yti.videoDetails.videoId}\nTitre: ${yti.videoDetails.title}\nNom de la chaîne: ${yti.videoDetails.ownerChannelName}\nDate d'upload: ${yti.videoDetails.uploadDate}`;
        event.returnValue = "";
    });




    win.webContents.session.on('will-download', (event, item, webContents) => {
        // Set the save path, making Electron not to prompt a save dialog.

        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                console.log('Download is interrupted but can be resumed')
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    console.log('Download is paused')
                } else {
                    console.log(`Received bytes: ${item.getReceivedBytes()}`)
                }
            }
        })
        item.once('done', (event, state) => {
            if (state === 'completed') {
                console.log('Download successfully')
            } else {
                console.log(`Download failed: ${state}`)
            }
        })
    })

    ipcMain.on('servconvert', async (event, arg) => {

        await new Promise((resolve) => { // wait
            var video = ytdl(`${arg}`,{quality: 18})
            video.pipe(fs.createWriteStream('./download/video.mp4'))
            video.on('close', () => {
                resolve(); // finish
            })

            video.on('response', function (res) {
                var totalSize = parseInt(res.headers['content-length'],10);
                var dataRead = 0;
                if(dataRead == 0){
                    console.log("Total"+totalSize)
                    win.webContents.send('total', totalSize)
                }
                res.on('data', function (data) {
                    dataRead += data.length;
                    // var percent = (dataRead / totalSize * 100).toFixed(2);
                    
                   win.webContents.send('down', `${dataRead}`);

                });
                res.on('end', function () {
                    win.webContents.send('finish', 'end')
                });
            });
        })

    });

}

app.whenReady().then(() => {
    createWindow()



    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})