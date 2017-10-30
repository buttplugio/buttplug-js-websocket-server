import { DeviceAdded, IDeviceSubtypeManager, BluetoothDevices, BluetoothDeviceInfo } from "buttplug";
import { EventEmitter } from "events";
import * as noble from "noble";
import { NobleBluetoothDevice } from "./NobleBluetoothDevice";

export class NobleBluetoothDeviceManager extends EventEmitter implements IDeviceSubtypeManager {

  private isScanning: boolean = false;

  constructor() {
    super();
    noble.on("stateChange", function(state) {
      if (state === "poweredOn") {
        console.log("bluetooth on!");
      } else {
        console.log("bluetooth off!");
      }
    });
    noble.on("discover", (d: noble.Peripheral) => {
      this.OpenDevice(d);
    });
  }

  public StartScanning() {
    noble.startScanning();
  }

  public StopScanning() {
    noble.stopScanning();
  }

  public IsScanning(): boolean {
    return false;
  }

  private OpenDevice = async (aDevice: noble.Peripheral): Promise<void> => {
    if (aDevice === undefined) {
      // TODO Throw here?
      return;
    }
    for (const deviceInfo of BluetoothDevices.GetDeviceInfo()) {
      if (deviceInfo.Names.indexOf(aDevice.advertisement.localName) > -1) {
        const device = await NobleBluetoothDevice.CreateDevice(deviceInfo, aDevice);
        this.emit("deviceadded", device);
        return;
      }
    }
  }
}
