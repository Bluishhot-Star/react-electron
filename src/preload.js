const { contextBridge, ipcRenderer } = window.require('electron')

// window.electronAPI = {
//   cancelBluetoothRequest: (callback) => ipcRenderer.send('cancel-bluetooth-request', callback),
//   bluetoothPairingRequest: (callback) => ipcRenderer.on('bluetooth-pairing-request', callback),
//   bluetoothPairingResponse: (response) => ipcRenderer.send('bluetooth-pairing-response', response)
// }
contextBridge.exposeInMainWorld('electronAPI', {
  cancelBluetoothRequest: (callback) => ipcRenderer.send('cancel-bluetooth-request', callback),
  bluetoothPairingRequest: (callback) => ipcRenderer.on('bluetooth-pairing-request', callback),
  bluetoothPairingResponse: (response) => ipcRenderer.send('bluetooth-pairing-response', response)
})