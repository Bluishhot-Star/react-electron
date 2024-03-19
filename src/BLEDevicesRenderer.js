// Empty
const BLEDevicesList = document.getElementById("DeviceList");
const closeBtn = document.getElementById("closeModal");
closeBtn.addEventListener("click", ()=>{
  // window.electronAPI.cancelBluetoothRequest()
  window.api.send("BLEScannFinished", "");
  window.close();
});
const closeButton = document.getElementsByClassName("close");
for (let i = 0; i < closeButton.length; i++) {
  closeButton[i].addEventListener("click", ()=>{
    // window.electronAPI.cancelBluetoothRequest()
    window.api.send("BLEScannFinished", "");
    window.close();
  });
}
let BLEDevicesListarray = [];

// close windows if user does not choose a device
setInterval(() => {
  window.api.send("BLEScannFinished", "");
  window.close();
}, 120000);

function itemDone(element) {
  console.log(element.id);
  window.api.send("BLEScannFinished", element.id); // write back the device ID
  window.close();
}

// Called when message received from main process
window.api.receive("BLEDeviceList", (data) => {

  

  let oldLength = BLEDevicesListarray.length;
  let diff = data.length - BLEDevicesListarray.length;

  if (diff > 0) {
    BLEDevicesListarray = [...data];
  }

  for (let i = 0; i < diff; i++) {
    let index = oldLength + i;
    var item = document.createElement("div");
    item.addEventListener("click", function () {itemDone(this);});
    console.log(BLEDevicesListarray[index]);
    item.id = BLEDevicesListarray[index].deviceId;
    item.className = "device-item";

    let deviceName = document.createElement("div");
    console.log(deviceName)
    let deviceId = document.createElement("div");
    let deviceNameContents = document.createElement("p");
    let deviceIdContents = document.createElement("p");
    deviceNameContents.appendChild(document.createTextNode(BLEDevicesListarray[index].deviceName)) 
    deviceIdContents.appendChild(document.createTextNode(BLEDevicesListarray[index].deviceId)) 

    deviceName.appendChild(deviceNameContents);
    deviceId.appendChild(deviceIdContents);
    item.appendChild(deviceName);
    item.appendChild(deviceId);
    // item.appendChild(deviceId);

    // Set its contents:
    // item.appendChild(
    //   document.createTextNode(BLEDevicesListarray[index].deviceName + " (" + BLEDevicesListarray[index].deviceId + ")")
    // );

    // Add it to the list:
    BLEDevicesList.appendChild(item);
  }

});

window.api.receive("BLEScannElement", (data) => {
  console.log(data);
});

// poll for new devices
// just push them from inside mainWindow.webContents.on("select-bluetooth-device", ...
// can cause problems if there is only one device and it was pushed to the window 
// faster than the window is created, can be solved with a promise?
setInterval(() => {
  window.api.send("getBLEDeviceList", "getDevices");
}, 1000);