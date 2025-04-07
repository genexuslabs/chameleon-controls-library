export interface IStorageItem {
  key: string;
  value: any;
}

export class StorageItem {
  key: string;
  value: any;

  constructor(data: IStorageItem) {
    this.key = data.key;
    this.value = data.value;
  }
}

// class for working with session storage in browser (common that can use other classes for store some data)
export class SessionStorageWorker {
  sessionStorageSupported: boolean;

  constructor() {
    this.sessionStorageSupported =
      typeof window.sessionStorage !== "undefined" &&
      window.sessionStorage != null;
  }

  // add value to storage
  add(key: string, item: string) {
    if (this.sessionStorageSupported) {
      sessionStorage.setItem(key, item);
    }
  }

  // get all values from storage (all items)
  getAllItems(): Array<StorageItem> {
    const list = new Array<StorageItem>();
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);

      list.push(
        new StorageItem({
          key: key,
          value: value
        })
      );
    }
    return list;
  }

  // get only all values from sessionStorage
  getAllValues(): Array<any> {
    const list = new Array<any>();
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);

      list.push(value);
    }
    return list;
  }

  // get one item by key from storage
  get(key: string): string {
    if (this.sessionStorageSupported) {
      const item = sessionStorage.getItem(key);
      return item;
    }
    return null;
  }

  // remove value from storage
  remove(key: string) {
    if (this.sessionStorageSupported) {
      sessionStorage.removeItem(key);
    }
  }

  // clear storage (remove all items from it)
  clear() {
    if (this.sessionStorageSupported) {
      sessionStorage.clear();
    }
  }
}
