import bencode from "bencode";
import magnet, { encode } from "magnet-uri";
import { hash, arr2hex, text2arr, arr2text } from "uint8-util";

interface ParsedTorrent {
  info: any;
  infoBuffer: Uint8Array;
  name: string;
  announce: string[];
  infoHashBuffer: Uint8Array;
  infoHash: string;
  private?: boolean;
  created?: Date;
  createdBy?: string;
  comment?: string;
  urlList: string[];
  files: {
    path: string;
    name: string;
    length: number;
    offset: number;
  }[];
  length: number;
  pieceLength: number;
  lastPieceLength: number;
  pieces: string[];
}

async function parseTorrent(torrentId: string | ArrayBufferView | ParsedTorrent) {
  if (typeof torrentId === "string" && /^(stream-)?magnet:/.test(torrentId)) {
    // if magnet uri (string)
    const torrentObj = magnet(torrentId);

    // infoHash won't be defined if a non-bittorrent magnet is passed
    if (!torrentObj.infoHash) {
      throw new Error("Invalid torrent identifier");
    }

    return torrentObj;
  }
  if (
    typeof torrentId === "string" &&
    (/^[a-f0-9]{40}$/i.test(torrentId) || /^[a-z2-7]{32}$/i.test(torrentId))
  ) {
    // if info hash (hex/base-32 string)
    return magnet(`magnet:?xt=urn:btih:${torrentId}`);
  }
  if (ArrayBuffer.isView(torrentId) && torrentId.byteLength === 20) {
    // if info hash (buffer)
    return magnet(`magnet:?xt=urn:btih:${arr2hex(torrentId)}`);
  }
  if (ArrayBuffer.isView(torrentId)) {
    // if .torrent file (buffer)
    return await decodeTorrentFile(new Uint8Array(torrentId.buffer)); // might throw
  }
  if (torrentId && (torrentId as ParsedTorrent).infoHash) {
    // if parsed torrent (from `parse-torrent` or `magnet-uri`)
    const parsed = torrentId as ParsedTorrent;
    parsed.infoHash = parsed.infoHash.toLowerCase();

    if (!parsed.announce) {
      parsed.announce = [];
    }

    if (typeof parsed.announce === "string") {
      parsed.announce = [parsed.announce];
    }

    if (!parsed.urlList) {
      parsed.urlList = [];
    }

    return parsed;
  }
  throw new Error("Invalid torrent identifier");
}

async function parseTorrentRemote(
  torrentId: string | Blob,
  opts: RequestInit,
  cb: (err: Error | null, parsedTorrent?: ParsedTorrent) => void,
): Promise<void> {
  let parsedTorrent: ParsedTorrent | undefined;
  try {
    parsedTorrent = await parseTorrent(torrentId as string);
  } catch (_err) {
    // If torrent fails to parse, it could be a Blob, http/https URL or
    // filesystem path, so don't consider it an error yet.
  }

  if (parsedTorrent?.infoHash) {
    queueMicrotask(() => {
      cb(null, parsedTorrent);
    });
  } else if (torrentId instanceof Blob) {
    try {
      const torrentBuf = new Uint8Array(await torrentId.arrayBuffer());
      parseOrThrow(torrentBuf);
    } catch (err) {
      return cb(new Error(`Error converting Blob: ${(err as Error).message}`));
    }
  } else if (typeof torrentId === "string" && /^https?:/.test(torrentId)) {
    try {
      const res = await fetch(torrentId, {
        headers: { "user-agent": "WebTorrent (https://webtorrent.io)" },
        signal: AbortSignal.timeout(30 * 1000),
        ...opts,
      });
      const torrentBuf = new Uint8Array(await res.arrayBuffer());
      parseOrThrow(torrentBuf);
    } catch (err) {
      return cb(new Error(`Error downloading torrent: ${(err as Error).message}`));
    }
  } else {
    queueMicrotask(() => {
      cb(new Error("Invalid torrent identifier"));
    });
  }

  async function parseOrThrow(torrentBuf: Uint8Array) {
    try {
      parsedTorrent = await parseTorrent(torrentBuf);
    } catch (err) {
      return cb(err as Error);
    }
    if (parsedTorrent?.infoHash) {
      cb(null, parsedTorrent);
    } else {
      cb(new Error("Invalid torrent identifier"));
    }
  }
}

async function decodeTorrentFile(torrent: Uint8Array | { [key: string]: any }) {
  if (torrent instanceof Uint8Array) {
    torrent = bencode.decode(torrent) as { [key: string]: any };
  }

  // sanity check
  ensure(torrent.info, "info");
  ensure(torrent.info["name.utf-8"] || torrent.info.name, "info.name");
  ensure(torrent.info["piece length"], "info['piece length']");
  ensure(torrent.info.pieces, "info.pieces");

  if (torrent.info.files) {
    torrent.info.files.forEach((file: any) => {
      ensure(typeof file.length === "number", "info.files[0].length");
      ensure(file["path.utf-8"] || file.path, "info.files[0].path");
    });
  } else {
    ensure(typeof torrent.info.length === "number", "info.length");
  }

  const result: ParsedTorrent = {
    info: torrent.info,
    infoBuffer: bencode.encode(torrent.info),
    name: arr2text(torrent.info["name.utf-8"] || torrent.info.name),
    announce: [],
    infoHashBuffer: new Uint8Array(0),
    infoHash: "",
    urlList: [],
    files: [],
    length: 0,
    pieceLength: 0,
    lastPieceLength: 0,
    pieces: [],
  };

  result.infoHashBuffer = await hash(result.infoBuffer);
  result.infoHash = arr2hex(result.infoHashBuffer);

  if (torrent.info.private !== undefined) {
    result.private = !!torrent.info.private;
  }

  if (torrent["creation date"]) {
    result.created = new Date(torrent["creation date"] * 1000);
  }
  if (torrent["created by"]) {
    result.createdBy = arr2text(torrent["created by"]);
  }

  if (torrent.comment instanceof Uint8Array) {
    result.comment = arr2text(torrent.comment);
  }

  // announce and announce-list will be missing if metadata fetched via ut_metadata
  if (Array.isArray(torrent["announce-list"]) && torrent["announce-list"].length > 0) {
    torrent["announce-list"].forEach((urls: any[]) => {
      urls.forEach((url) => {
        result.announce.push(arr2text(url));
      });
    });
  } else if (torrent.announce) {
    result.announce.push(arr2text(torrent.announce));
  }

  // handle url-list (BEP19 / web seeding)
  if (torrent["url-list"] instanceof Uint8Array) {
    // some clients set url-list to empty string
    torrent["url-list"] = torrent["url-list"].length > 0 ? [torrent["url-list"]] : [];
  }
  result.urlList = (torrent["url-list"] || []).map((url) => arr2text(url));

  // remove duplicates by converting to Set and back
  result.announce = Array.from(new Set(result.announce));
  result.urlList = Array.from(new Set(result.urlList));

  const files = torrent.info.files || [torrent.info];
  result.files = files.map((file: any, i: number) => {
    const parts = []
      .concat(result.name, file["path.utf-8"] || file.path || [])
      .map((p) => (p instanceof Uint8Array ? arr2text(p) : p));
    return {
      path: parts.join("/"),
      name: parts[parts.length - 1],
      length: file.length,
      offset: files.slice(0, i).reduce(sumLength, 0),
    };
  });

  result.length = files.reduce(sumLength, 0);

  const lastFile = result.files[result.files.length - 1];

  result.pieceLength = torrent.info["piece length"];
  result.lastPieceLength =
    (lastFile.offset + lastFile.length) % result.pieceLength || result.pieceLength;
  result.pieces = splitPieces(torrent.info.pieces);

  return result;
}

function encodeTorrentFile(parsed: ParsedTorrent): Uint8Array {
  const torrent: { [key: string]: any } = {
    info: parsed.info,
  };

  torrent["announce-list"] = (parsed.announce || []).map((url) => {
    if (!torrent.announce) {
      torrent.announce = url;
    }
    const urlArray = text2arr(url);
    return [urlArray];
  });

  torrent["url-list"] = parsed.urlList || [];

  if (parsed.private !== undefined) {
    torrent.private = Number(parsed.private);
  }

  if (parsed.created) {
    torrent["creation date"] = (parsed.created.getTime() / 1000) | 0;
  }

  if (parsed.createdBy) {
    torrent["created by"] = parsed.createdBy;
  }

  if (parsed.comment) {
    torrent.comment = parsed.comment;
  }

  return bencode.encode(torrent);
}

function sumLength(sum: number, file: { length: number }): number {
  return sum + file.length;
}

function splitPieces(buf: Uint8Array): string[] {
  const pieces: string[] = [];
  for (let i = 0; i < buf.length; i += 20) {
    pieces.push(arr2hex(buf.slice(i, i + 20)));
  }
  return pieces;
}

function ensure(bool: any, fieldName: string): void {
  if (!bool) {
    throw new Error(`Torrent is missing required field: ${fieldName}`);
  }
}

export default parseTorrent;
const toMagnetURI = encode;
export {
  parseTorrentRemote as remote,
  encodeTorrentFile as toTorrentFile,
  toMagnetURI,
  decodeTorrentFile,
};
