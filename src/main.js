const { app, BrowserWindow, ipcMain,session } = require('electron')

const { Menu, MenuItem, dialog } = require('@electron/remote/main');
const path = require('path')
const url = require('url')
const Store = require('electron-store');

let bluetoothPinCallback = () =>{};
let selectBluetoothCallback = ()=>{};

// new
let BLEDevicesWindow;
let BLEDevicesList=[];
let connectedBLEDevice;
let callbackForBluetoothEvent = ()=>{};

let mainWindow;
let splash;
let internet;
function createInternet (){
  let size = mainWindow.getSize();
  internet = new BrowserWindow({
    
    width: size[0],
    height: size[1]-2,
    parent: mainWindow,
    modal: true,
    frame: false, 
    alwaysOnTop: true,
    resizable: false,
    show: false,
      // devTools: true,
    // webviewTag: true,
  });
  const pos = mainWindow.getPosition();
  internet.setPosition(pos[0],pos[1]);
  internet.loadURL(`file://${__dirname}/../public/disconnectInternet.html`);

}
function createWindow () {
  return new Promise((resolve, reject) => {
    try{
      
      
      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        show: false,
        icon: path.join(__dirname, "/spirokit_icon_foreground.ico"),
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          transparent: false,
          frame: true,
          resizable: true,
          hasShadow: false,
          alwaysOnTop: false,
          nodeIntegration: true,
          contextIsolation: true,
          enableRemoteModule: true,
          // devTools: false,
          webviewTag: true,
          // preload: path.join(__dirname, '/preload.js')
          preload: path.join(__dirname, "/BLEDevicesPreload.js")
        }
      })
      mainWindow.setMenuBarVisibility(false);
      splash = new BrowserWindow({
        width: 510, 
        height: 310, 
        transparent: true, 
        frame: false, 
        alwaysOnTop: true,
        resizable: false,
          // devTools: true,
        // webviewTag: true,
      });
      splash.loadURL(`file://${__dirname}/../public/splash.html`);
      splash.center();
      //******************************past START******************************************
      // mainWindow.webContents.on("select-bluetooth-device", (event, deviceList, callback) => {
      //   event.preventDefault();
      //   selectBluetoothCallback = callback
      //   console.log(deviceList);
      //   const result = deviceList.find((device)=>{
      //     if ((device.deviceName).split('-')[0] == "SpiroKit"){
      //       mainWindow.webContents.send("xyz", deviceList);
      //       return device
      //     }
      //   })
      //   if (result) {
      //     callback(result.deviceId);
      //   }else{
          
      //   }
      // });
    
      // ipcMain.on('cancel-bluetooth-request', (event) => {
      //   selectBluetoothCallback('');
      // })
    
      // // Listen for a message from the renderer to get the response for the Bluetooth pairing.
      // ipcMain.on('bluetooth-pairing-response', (event, response) => {
      //   bluetoothPinCallback(response)
      // })
      // const ses = mainWindow.webContents.session
      // ses.setBluetoothPairingHandler((details, callback) => {
      //   bluetoothPinCallback = callback
      //   // Send a message to the renderer to prompt the user to confirm the pairing.
      //   mainWindow.webContents.send('bluetooth-pairing-request', details)
      // })
      //******************************past FINISH******************************************
      
      // NEW START
      mainWindow.webContents.on(
        "select-bluetooth-device",
        (event, deviceList, callback) => 
        {
          event.preventDefault(); // do not choose the first one
    
          if (deviceList && deviceList.length > 0) {  // find devices?
            deviceList.forEach((element) => {  
              if (!BLEDevicesWindow) {
                createBLEDevicesWindow(); // open new window to show devices
              }
              if (element.deviceName.includes("Spiro")&&
                !element.deviceName.includes("알 수 없거나 지원되지 않는 기기") &&
                !element.deviceName.includes("Unknown or Unsupported Device")) 
              {
                if (BLEDevicesList.length > 0) {
                  if (BLEDevicesList.findIndex((object) => object.deviceId === element.deviceId) === -1) {
                    BLEDevicesList.push(element);
                  }
                } 
                else {
                  BLEDevicesList.push(element);
                }
                // console.log(BLEDevicesList,"HELL", deviceList);
              }              
            });
          }
          console.log("YO:",deviceList)
    
          callbackForBluetoothEvent = callback; // to make it accessible outside https://technoteshelp.com/electron-web-bluetooth-api-requestdevice-error/
        }
      );
      


      mainWindow.addListener("resize",(event)=>{
        if(BLEDevicesWindow){
          let size = mainWindow.getSize();
          let x = size[0];
          let y = size[1]-30;
          BLEDevicesWindow.setSize(x, y);
        }
        if(internet){
          let size = mainWindow.getSize();
          let x = size[0];
          let y = size[1]-30;
          internet.setSize(x, y);
        }
      })
      mainWindow.loadURL("http://localhost:3000") 
    }
    catch(error){
      reject(error);
    }
    
  })
}

// NEW
function createBLEDevicesWindow() {
  let size = mainWindow.getSize();
  BLEDevicesWindow = new BrowserWindow({
    width: size[0],
    height: size[1],
    parent: mainWindow,
    title: "",
    modal: true,
    frame: false, 
    hasShadow: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "/BLEDevicesPreload.js"), // use a preload script
    },
  });
  const pos = mainWindow.getPosition();
  BLEDevicesWindow.setPosition(pos[0],pos[1]);
  // BLEDevicesWindow.setWindowButtonVisibility(true);


  BLEDevicesWindow.loadFile(__dirname+"/BLEDevicesWindow.html");
  BLEDevicesWindow.on('close', function () {
    BLEDevicesWindow = null;    
    callbackForBluetoothEvent("");
    BLEDevicesList = [];
  })
}
ipcMain.on("toMain", (event, args) => {
  console.log(args);
});

ipcMain.on("BLEScannFinished", (event, args) => {
  try {
    console.log("ScanDone");
    console.log(args); //MAC주소
    console.log(1);
    console.log(BLEDevicesList.find((item) => item.deviceId === args));
    let BLEDevicesChoosen = BLEDevicesList.find((item) => item.deviceId === args);
    BLEDevicesWindow = null;
    if (BLEDevicesChoosen) {
      BLEDevicesWindow = null;
      callbackForBluetoothEvent(BLEDevicesChoosen.deviceId);
      connectedBLEDevice = BLEDevicesChoosen;
    }
    else {
      BLEDevicesWindow = null;    
      callbackForBluetoothEvent("");
      console.log(2);
    }
    BLEDevicesList = [];  
  } catch (error) {
    console.log("Error:",error);
    BLEDevicesList = [];
  }
});

ipcMain.on("getBLEDeviceList", (event, args) => {
  if (BLEDevicesWindow)
  {
    BLEDevicesWindow.webContents.send("BLEDeviceList", BLEDevicesList);
  }
});
ipcMain.on("getConnectedDevice", (event, args)=>{
  console.log(connectedBLEDevice);
  mainWindow.reload();
  if(connectedBLEDevice) mainWindow.webContents.send("connectedBLEDevice", connectedBLEDevice);
})


ipcMain.on('set-cookie', async(event, data)=>{
  // console.log(data.name)
  await session.defaultSession.cookies.set({
    url : "http://localhost:3000", // 기본적으로 입력 해주어야함
    name : data.name,
    value : data.data,
    httpOnly : true, // client에서 쿠키를 접근함을 방지하기위해 설정 ( 보안 설정 )
    expriationDtae : data.date // 쿠키 만료 시간 설정
  })
  
  
})
ipcMain.on('get-cookies', (event,data) => {
  var value = {
    name: data// the request must have this format to search the cookie.
  };

  session.defaultSession.cookies.get(value).then((cookies) => {
    try {
      // console.log(cookies)
      event.returnValue = cookies[0].value
    } catch (error) {
      event.returnValue = undefined
    }

  })
})
ipcMain.on('remove-cookies', (event, data)=>{
  try {
    session.defaultSession.cookies.remove(data.url,data.name);
  } catch (error) {
    console.log(error)
  }
})
ipcMain.on('online-status-changed', (event, data)=>{
  try{
    if (data == 'offline'){
      createInternet();
      setTimeout(()=>{
        internet.show();
      },3100)
    }
    else if(data == 'online'){
      if (internet){ internet.close();}
    }
  }catch(err){
    console.log(err);
  }
})
// app.on('ready', createWindow);


app.whenReady().then(() => {
  createWindow()

  setTimeout(()=>{
    splash.close()
    mainWindow.show()
  },3000)

  //for MacOS
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
//for Window, Linux
//when close 
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.commandLine.appendSwitch("enable-experimental-web-platform-features", "true");
app.commandLine.appendSwitch('enable-web-bluetooth', "true");
app.commandLine.appendSwitch('enable-web-bluetooth-new-permissions-backend', "true");
