import { useState } from 'react';
import { Web3Storage } from 'web3.storage'
import { create } from 'ipfs-http-client';

function getAccessToken() {

  //const NEXT_PUBLIC_WEB3STORAGE_TOKEN ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDI4NDQyNzlkMDRmRDc2NDJDMUQyNzZhQkRmNDI3ZDBkOWJmMGU0NzkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTM0MzIxMDY3MjAsIm5hbWUiOiJkZXYifQ.gFBojcATcuBQeXse4O1OAVEIrrmdKPxyHlK83AaqZrQ'
  const NEXT_PUBLIC_WEB3STORAGE_TOKEN ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEI1NzU5RTA2ODJmNzc3MDJGMTk2MEU4N0UyRjFBYkQ0Q2Y0QkNhMWUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTk0MzIwNDA2OTUsIm5hbWUiOiJXT0YifQ.3EEoKrMEvSLxbs3rSCJf9F3mHM2tk2aD_CDsspnxvsA'
  return NEXT_PUBLIC_WEB3STORAGE_TOKEN;
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() })
}

async function listUploads() {
    const itemsArr = []
    const client = makeStorageClient()
    for await (const upload of client.list()) {
      const _res = await getLinks(upload.cid);
      itemsArr.push(_res)
    }

    return itemsArr;
}

async function getLinks(ipfsPath) {
  const url = 'https://dweb.link/api/v0';
  const ipfs = create({ url });
  const links = [];
  const metadata = [];
  for await (const link of ipfs.ls(ipfsPath)) {
    // for the index with the link path ending in 'metadata.json' we want to get the metadata, otherwise we want the link
    if (link.name.endsWith('metadata.json')) {
      const _index = link.path;
      const _metadataURL = "https://ipfs.io/ipfs/"+_index;
      const _metadata = await fetch(_metadataURL);

      if(_metadata){
        const _data = await _metadata.json();
        metadata.push(_data);
      }
    }
    else {
      links.push(link);
    }
  }
  return [links, metadata];
}

export default listUploads;