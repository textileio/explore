# Import Facebook :tm: & Instagram :tm: Photos into Textile

All you need to get this tool working is a recent version of Textile, your Facebook :tm: data dump, and this simple Python script. We'll go through the steps to getting all these things setup below, but for the impatient, here’s the tool:

```
$ python3 facebook.py --help
Usage: facebook.py [OPTIONS] PATH

  Takes a Facebook backup archive <PATH> and creates Textile photo groups.

Options:
  -e, --exec PATH  Path to your Textile executable (default:textile).
  --help           Show this message and exit.
```

## Install Textile

If you don't already have Textile installed, you can [follow this guide](https://github.com/textileio/textile-go/wiki/Getting-Started). Really, all you need for this tool to work is the right [Textile binary for your system](https://github.com/textileio/textile-go/releases). With that, you can install it, initialize a new Textile repo, and then just point the above Python script to your Textile binary to get importing. Pretty easy.

## #DeleteFacebook

Deleting your Facebook account is a serious decision, so make sure it’s something you really want to do. Whether you like it or not, social media is ingrained in society… you have been warned. With that in mind, you can go ahead and navigate to the [delete account help page on Facebook](https://www.facebook.com/help/delete_account). Here you'll see options to deactivate your account, download your data, and even delete your account permanently. Let’s download your data before doing anything drastic...

![](https://cdn-images-1.medium.com/max/2000/1*9Q5PVS37KseB-Z8vh6N6Nw.png)

After clicking `Download Info`, you’ll be presented with a page with some options. I've opted for the **JSON** download of everything, which is what the Python tool is expecting.

Because this download contains your profile information, you should keep it secure and be careful when storing, sending, or uploading it to any other services. If you have any concerns, be sure to take a look at the Python script to make sure we aren’t trying to steal your data, and get in touch if you have any questions!
Import Data

Now the easy part, assuming you have Textile installed somewhere reasonable, all you need to do is install one Python dependency ([`click`](https://github.com/pallets/click), which makes for a nice command-line interface), and point the script at your data dump. If you have Textile installed somewhere different, you can specify its location with the script using the `-e` option (see `python3 facebook.py --help` for some details):

```
textile daemon
pip install click backports.tempfile
python3 facebook.py /path/to/facebook-name.zip
```

The script basically just wraps the `textile` binary calls with `subprocess`, so its quite simple and not very 'smart'. But it does the trick, and provides a nice way to wrap up a series of clunky manual commands into a single tool. I’ve really only tested the tool with Python 3.2+, but it should work with Python 2.7–3.1 (you’ll need to `pip install backports.tempfile`). Your mileage may vary of course...

Once the import is done, you can check that you have a bunch of new Threads with photos in them using the Textile command-line tools:

```
textile threads ls # List threads
textile ls # List photos/files
```

It even imports and adds comments! How fun is that?