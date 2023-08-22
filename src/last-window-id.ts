import { v4 as uuidv4 } from "uuid";

const id_key = "last_window_id";
const window_id = uuidv4();

function storeWindowId(): void {
  localStorage.setItem(id_key, window_id);
}

function readWindowId(): string {
  return localStorage.getItem(id_key) ?? "";
}

function getThisWindowsId(): string {
  return window_id;
}

export { storeWindowId, readWindowId, getThisWindowsId };
