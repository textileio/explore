import { runInAction, action, configure, observable } from "mobx"
import { Textile } from "@textileio/js-http-client"
import { toast } from "react-semantic-toasts"
import { utc } from 'moment'

const THREAD_KEY = "avatarThreadKey"

const textile = new Textile({
  url: 'http://127.0.0.1',
  port: 40602
});

// don't allow state modifications outside actions
configure({ enforceActions: 'always' });

class Store {
  gateway = 'http://127.0.0.1:5052'
  @observable status = 'offline'
  @observable profile = {
    username: null,
    avatar: null
  };
  @action async getProfile() {
    try {
      const profile = await textile.profile.get()
      if (!profile.username) {
        profile.username = profile.address.slice(-8);
      }
      runInAction('getProfile', () => {
        this.status = 'online'
        this.profile = profile;
      });
    } catch(err) {
      runInAction('getStatus', () => {
        this.status = 'offline'
      });
      toast({
        title: 'Offline?',
        description: 'Looks like your Textile peer is offline 😔',
        time: 0
      });
    }
  }
  @action async setProfile(userString, avatarFile) {
    if (userString) {
      textile.profile.setUsername(userString).then(() => {
        runInAction('setUsername', () => {
          this.profile.username = userString;
          this.profile.updated = utc().format()
        });
      });
    }
    if (avatarFile) {
      let avatarThread
      const threads = await textile.threads.list()
      for (const thread of threads.items) {
        if (thread.key === THREAD_KEY) {
          avatarThread = thread
          break
        }
      }
      if (!avatarThread) {
        const avatarSchema = textile.schemas.defaults().avatar
        const file = await textile.schemas.add(avatarSchema)
        avatarThread = await textile.threads.add('avatars', {
          key: THREAD_KEY,
          type: 'public',
          sharing: 'notshared',
          schema: file.hash
        })
      }
      const addedFile = await textile.files.addFile(avatarThread.id, avatarFile, "avatar")
      await textile.profile.setAvatar(addedFile.files[0].links.large.hash)
      runInAction('setAvatar', () => {
        this.profile.avatar = addedFile.target
        this.profile.updated = utc().format()
      });
    }
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated!'
    });
  }
}

export default Store
