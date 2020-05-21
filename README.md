# arweave-downloader
Easily download data from the Arweave blockchain!

You can download all the stored data from any address or only a single tx, it's your choice.
It tries to detect content type by reading the tags, if a common content type is found, the file will be saved with its corresponding extension otherwise it won't have an extension.

All txs from an address are saved individually and packed in a .zip file to be downloaded.
