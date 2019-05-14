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

### Startup a Textile daemon

Follow the steps on the Textile [wiki](https://github.com/textileio/go-textile/wiki) to
get a Textile daemon up and running.

This tool was built against textile-go version **1.0.0-rc23**. Subsequent versions
might not work due to API changes in the daemon. Please create an issue if you have
any trouble.

### Get An API Key

In order to connect to your Flickr ™ account, you will need to aquire an
API access key. The process for getting a key is instantaneous.

* First, log into your Flickr ™ [account](https://www.flickr.com/).
* Next, go to [https://www.flickr.com/services/apps/create/apply/](https://www.flickr.com/services/apps/create/apply/).
  * Choose "Apply for a non-commercial key"
  * Write "Textile Sync Tool" or something like that for the name of the app.
  * Write "A tool for exporting photos and comments and importing them into Textile" in the
    description.
  * Click the required boxes and "Submit"

Once you have completed this process, you will be presented with your *Consumer Key* and
*Consumer Secret*. These are the *api-key* and *api-secret* that you will pass into the 
*init* command below.

### Connect
Connect the tool to your account...

> This will bring you to the Flickr site where you will need to authorize
> the application in a web browser.

```sh
flickr-exporter init --api-key MY_FLICKR_API_KEY --api-secret MY_FLICKR_SECRET
```

You will then be prompted with a URL. Click that URL to visit a web page which will
authorize your account.

### Sync

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
