import { Emitter } from "@socket.io/component-emitter";
import { Packr } from "msgpackr";

export const protocol = 5;

enum PacketType {
  CONNECT,
  DISCONNECT,
  EVENT,
  ACK,
  CONNECT_ERROR,
  BINARY_EVENT,
  BINARY_ACK,
}

interface Packet {
  type: PacketType;
  nsp: string;
  data?: unknown;
  id?: number;
  attachments?: number;
}

interface DecoderReservedEvents {
  decoded: (packet: Packet) => void;
}

export class Encoder {
  public encode(obj: Packet) {
    const p = new Packr({ moreTypes: true });

    console.log("Encoder - unpacked", obj); // TODO: remove

    const packed = p.pack(obj);
    console.log("Encoder - packed", packed); // TODO: remove

    const buffer = new Uint8Array(packed);
    console.log("Encoder - uint", buffer); // TODO: remove

    return [buffer];
  }
}

export class Decoder extends Emitter<
  Record<string, unknown>,
  Record<string, unknown>,
  DecoderReservedEvents
> {
  public add(obj: ArrayBuffer) {
    const p = new Packr({ moreTypes: true });

    console.log("Decoder - packed", obj); // TODO: remove

    try {
      const data = p.unpack(new Uint8Array(obj));
      console.log("Decoder - unpacked", data); // TODO: remove

      super._emitReserved("decoded", data);
    } catch (error) {
      console.log("Decoder - error", error); // TODO: remove
    }
  }

  public destroy() {}
}
