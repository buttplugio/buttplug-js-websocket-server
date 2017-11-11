import * as commander from "commander";
import * as ws from "ws";
import * as https from "https";
import { ButtplugServer, ButtplugMessage, FromJSON } from "buttplug";
import { NobleBluetoothDeviceManager } from "./NobleBluetoothDeviceManager";
const selfsigned = require("selfsigned");

const attrs = [{
  name: "commonName",
  value: "buttplug.localhost",
}, {
  name: "organizationName",
  value: "Metafetish",
}];

const pems = selfsigned.generate(undefined, { days: 365 });
console.log(pems);

const server = https.createServer({
  cert: pems.cert,
  key: pems.private,
}).listen(12345);

commander
  .version("0.0.1")
  .option("-h, --host", "host address to listen on, defaults to localhost.", "localhost")
  .option("-p, --port", "port to listen on, defaults to 12345", 12345)
  .parse(process.argv);

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
});

const bs = new ButtplugServer();
bs.AddDeviceManager(new NobleBluetoothDeviceManager());

const wss = new ws.Server({server});

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
