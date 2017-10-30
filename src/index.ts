import * as ws from "ws";
import { ButtplugServer, ButtplugMessage, FromJSON } from "buttplug";
import { NobleBluetoothDeviceManager } from "./NobleBluetoothDeviceManager";

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
});

const bs = new ButtplugServer();
bs.AddDeviceManager(new NobleBluetoothDeviceManager());

const wss = new ws.Server({ port: 12345 });

wss.on("connection", function connection(client) {
  client.on("message", async (message) => {
    const msg = FromJSON(message);
    for (const m of msg) {
      const outgoing = await bs.SendMessage(m);
      client.send("[" + outgoing.toJSON() + "]");
    }
  });

  bs.on("message", function outgoing(message) {
    client.send("[" + message.toJSON() + "]");
  });
});
