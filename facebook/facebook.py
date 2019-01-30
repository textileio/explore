import os
import click
from subprocess import check_output
import zipfile
try:
    from tempfile import TemporaryDirectory
except:
    from backports.tempfile import TemporaryDirectory
from glob import glob
import json
from pprint import pprint


def create_thread(exec_, name):
    res = check_output(
        [exec_, "threads", "add", name, "--type", "open", "--sharing", "shared", "--media"]
    ).decode("utf-8")
    return json.loads(res)


def add_photo(exec_, uri, caption, comments, thread):
    res = check_output(
            [exec_, "files", "add", uri, "--thread", thread["id"], "--caption", caption,
             "--verbose"]
        ).decode("utf-8").split("\n")
    hacky = "".join(res[:-3]).replace("}{", "}\n{").split("\n")[-1]
    add = json.loads(hacky)
    id_ = add["id"]
    comms = [
        json.loads(
            check_output(
                [exec_, "comments", "add", "{}".format(comment), "--block", id_]
            ).decode("utf-8")
        ) for comment in comments
    ]
    return add, comms


@click.command()
@click.option("-e", "--exec", "exec_",
    default="textile",
    help="Path to your Textile executable (default:textile).",
    type=click.Path()
)
@click.argument("path",
    type=click.Path(exists=True, resolve_path=True)
)
def savebook(exec_, path):
    """
    Takes a Facebook backup archive <PATH> and creates Textile photo groups.
    """
    with zipfile.ZipFile(path, "r") as archive:
        with TemporaryDirectory() as tmp:
            for f in archive.namelist():
                if f.startswith("photos_and_videos"):
                    archive.extract(f, tmp)
            data_path = os.path.join(tmp, "photos_and_videos", "album")
            for json_file in glob(os.path.join(data_path, "*.json")):
                with open(json_file) as data:
                    album = json.load(data)
                    name = album["name"]
                    thread = create_thread(exec_, name)
                    for photo in album["photos"]:
                        caption = photo.get("description", "")
                        uri = os.path.join(tmp, photo["uri"])
                        comments = [
                            "{} said \"{}\"".format(c["author"], c["comment"]) 
                            for c in photo.get("comments", [])
                        ]
                        add_photo(exec_, uri, caption, comments, thread)


if __name__ == "__main__":
    savebook()
