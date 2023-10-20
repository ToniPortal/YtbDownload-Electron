const {
    app,
    BrowserWindow,
    ipcMain,
    nativeTheme
} = require('electron'),
    fs = require('fs'),
    ytdl = require('ytdl-core'),
    path = require('path'),
    ffmpeg = require('ffmpeg-static'),
    cp = require('child_process'),
    DiscordRPC = require('discord-rpc');


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



    win.loadFile('./web/index.html');

    ipcMain.on('servinfo', async (event, arg) => {

        var yti = await ytdl.getBasicInfo(arg);
        console.log(`Titre: ${yti.videoDetails.title}\nNom de la chaîne: ${yti.videoDetails.ownerChannelName}\nDate d'upload: ${yti.videoDetails.uploadDate}`)
        event.returnValue = `<h1>Title: ${yti.videoDetails.title}</h1><br><p>Name of the channel: ${yti.videoDetails.ownerChannelName}</p><br><p>Date of upload: ${yti.videoDetails.uploadDate}</p>`;

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

    const basepath = app.getAppPath();

    ipcMain.on('servconvert', async (event, json) => {
        console.log(json)
        await new Promise(async (resolve) => { // wait
            if (json.quality == 18) {
                console.log("360p !")
                var video = ytdl(`${json.url}`, { quality: json.quality })
                video.pipe(fs.createWriteStream(`${basepath}/download/video.mp4`))



                video.on('close', async () => {
                    resolve(); // finish
                })

                video.on('response', function (res) {
                    var totalSize = parseInt(res.headers['content-length'], 10);
                    var dataRead = 0;
                    if (dataRead == 0) {
                        console.log("Total" + totalSize)
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
            } else if (json.quality == "audio") {

                console.log("AUDIO")
                const video = ytdl(json.url, {
                    quality: 'highestaudio', // Sélectionnez le meilleur format audio disponible
                    filter: 'audioonly', // Filtrez uniquement l'audio
                });
                video.pipe(fs.createWriteStream(`${basepath}/download/audio.mp3`))



                video.on('close', async () => {
                    resolve(); // finish
                })

                video.on('response', function (res) {
                    var totalSize = parseInt(res.headers['content-length'], 10);
                    var dataRead = 0;
                    if (dataRead == 0) {
                        console.log("Total" + totalSize)
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
                })

            } else {
                const ref = json.url;
                const tracker = {
                    start: Date.now(),
                    audio: { downloaded: 0, total: Infinity },
                    video: { downloaded: 0, total: Infinity },
                };

                const audio = ytdl(ref, { filter: 'audioonly', quality: 'highestaudio' })
                    .on('progress', (_, downloaded, total) => {
                        tracker.audio = { downloaded, total };
                    });

                const video = ytdl(ref, { filter: 'videoonly', quality: json.quality })
                    .on('progress', (_, downloaded, total) => {
                        tracker.video = { downloaded, total };
                    });

                const progressbar = setInterval(async () => {
                    if ((tracker.video.total != Infinity) && (tracker.video.total != Infinity)) {

                        const dow = await tracker.video.downloaded + tracker.audio.downloaded;
                        win.webContents.send('down', dow);

                        const tota = await tracker.video.total + tracker.audio.total;
                        win.webContents.send('total', tota)

                        if (dow >= tota) {
                            win.webContents.send('finish', 'end')
                        }

                    }



                }, 100)

                let videoPipeOptions = ['-i', 'pipe:4'];

                if (json.quality == 137) {
                    videoPipeOptions.unshift('-vf', 'scale=1920:1080');
                } else if (json.quality == 136) {
                    videoPipeOptions.unshift('-vf', 'scale=1280:720');
                } else if (json.quality == 135) {
                    videoPipeOptions.unshift('-vf', 'scale=640:420');
                } else {
                    console.error('Invalid quality code');
                    return;
                }

                const ffmpegProcess = cp.spawn(ffmpeg, [
                    '-loglevel', '0', '-hide_banner',
                    '-itsoffset', '0.0', '-i', 'pipe:3',
                    ...videoPipeOptions,
                    '-c:v', 'libx265', '-x265-params', 'log-level=0',
                    '-c:a', 'flac',
                    '-f', 'matroska', 'pipe:5',
                ], {
                    windowsHide: true,
                    stdio: [
                        'inherit', 'inherit', 'inherit',
                        'pipe', 'pipe', 'pipe',
                    ],
                });

                audio.pipe(ffmpegProcess.stdio[3]);
                video.pipe(ffmpegProcess.stdio[4]);
                const mkvFilePath = `${basepath}/download/video.mp4`;
                ffmpegProcess.stdio[5].pipe(fs.createWriteStream(mkvFilePath));

                await ffmpegProcess.on('close', async () => {
                    process.stdout.write('\n\n\n');
                    clearInterval(progressbar);
                    console.log("done");
                    resolve()
                });




            }



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

    //Rpc discord
    const clientId = '1123571969208623244';
    DiscordRPC.register(clientId);

    const rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        rpc.setActivity({
            details: `En train d'utiliser HBC Pass`,
            startTimestamp: new Date(),
            largeImageKey: 'blackezlogo',
            instance: false,
        });
    });

})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})