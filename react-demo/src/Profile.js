import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Card, Icon, Image, Input, Form } from 'semantic-ui-react'
import Moment from 'react-moment'

@inject('store') @observer
class Profile extends Component {
  handleUsername = e => {
    e.preventDefault()
    this.props.store.setProfile(this.inputRef.value, null)
  }
  handleAvatar = e => {
    e.preventDefault()
    const file = e.target.files[0]
    const form = new FormData();
    form.append("file", file, file.name);
    this.props.store.setProfile(null, form)
  }
  render () {
    const { gateway, profile } = this.props.store
    return (
      <div>
        <Card style={{ width: '100%' }}>
          <Card.Content>
            <div style={{ textAlign: 'center' }}>
              <input
                type="file"
                id="file"
                ref="fileUploader"
                style={{ display: "none" }} 
                onChange={this.handleAvatar}
              />
              <Image
                as='a'
                size='medium'
                circular
                src={
                  profile.avatar ?
                    `${gateway}/ipfs/${profile.avatar}/0/large/d` :
                    'https://react.semantic-ui.com/images/wireframe/square-image.png'
                }
                onClick={() => { this.refs.fileUploader.click() }}
                style={{ minHeight: '250px' }}
              />
            </div>
            <Card.Header style={{ paddingTop: '1em'}}>
              <Form onSubmit={this.handleUsername}>
                <Form.Field>
                  <Input iconPosition='left' defaultValue={profile.username}>
                    <Icon name='user' />
                      <input ref={c => { this.inputRef = c }} />
                  </Input>
                </Form.Field>
              </Form>
            </Card.Header>  
            <Card.Description>
              <p title='peer id'>
                <Icon name='user secret' />{profile.id}
              </p>
              <p title='address'>
                <Icon name='linkify' />{profile.address}
              </p>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            Updated <Moment fromNow>{profile.updated}</Moment>
          </Card.Content>
        </Card>
      </div>
    )
  }
}

export default Profile
