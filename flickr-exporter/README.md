# Import Flickr ™ Photos into Textile

## Installation

* Clone the repository
```sh
git clone https://github.com/textileio/explore.git
```

* Install dependencies and add it to your path
```sh
cd explore/flickr-exporter
yarn install

# Add it to your path
yarn link
```

## Usage

Connect the tool to your account...

> This will bring you to the Flickr site where you will need to authorize
> the application in a web browser.

```sh
flickr-exporter init -k MY_FLICKR_API_KEY -s MY_FLICKR_SECRET
```

Run the sync process:

```sh
flickr-exporter sync
```

## Advanced Usage

```sh
Usage: flickr-export [options] [command]

Transfer personal photos from your Flickr (TM) account into your Textile wallet

Options:
  -V, --version   output the version number
  -h, --help      output usage information

Commands:
  init [options]  initialize the exporter by authorizing your flickr account. (Only needs to be done once.)
  sync [options]  export and then add your photos and comments to a local textile node


Usage: init [options]

initialize the exporter by authorizing your flickr account. (Only needs to be done once.)

Options:
  -k, --api-key [key]        Your Flickr (TM) API key
  -s, --api-secret [secret]  Your Flickr (TM) API secret
  -o, --output-dir [dir]     The directory in which to save your Flickr (TM) data
  -p, --auth-port [port]     The authorization callback port. Defaults to 7777
  -v, --verbose              Output more verbose info to the log
  -h, --help                 output usage information


Usage: sync [options]

export and then add your photos and comments to a local textile node

Options:
  -o, --output-dir [dir]   The directory in which to save your Flickr (TM) data
  -b, --batch-size [size]  Size of the batches to download
  -v, --verbose            Output more verbose info to the log
  -h, --help               output usage information
```

## Development

```sh
# Lint everything
# NOTE: Linting uses 'prettier' to auto-fix styling issues when possible
yarn lint

# Watch the folder and run the linter when changes happen
yarn lint-watch
```
