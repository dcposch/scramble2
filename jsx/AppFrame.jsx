var path = require('path')
var remote = require('remote')
var React = require('react')
var Login = require('./Login')
var Inbox = require('./Inbox')

module.exports = React.createClass({
  displayName: 'AppFrame',
  getInitialState: function () {
    return {
      screen: 'login',
      keybase: null
    }
  },
  onLogin: function (result) {
    console.log('Successfully logged in with Keybase')
    // Here's an excerpt of the interesting things in `result`:
    //
    // .me - a Keybase user object https://keybase.io/docs/api/1.0/user_objects
    // .me.id
    // .me.basics.username
    // .me.profile.full_name
    // .me.emails.primary.email
    // .me.public_keys.primary.kid
    // .me.public_keys.primary.key_fingerprint
    // .me.public_keys.primary.bundle
    // .me.private_keys.primary
    // .me.invitation_stats.available
    //
    // .session
    // .csrf_token
    // .guest_id
    this.setState({
      screen: 'inbox',
      keybase: result
    })
  },
  render: function () {
    if (this.state.screen === 'inbox') {
      console.log('Rendering inbox')
      return (<Inbox
        accounts={[]}
        searchMessages={searchMessages}
        loadMessageCleanHTML={loadCleanHTML} />)
    } else if (this.state.screen === 'login') {
      return (<Login onLogin={this.onLogin} />)
    } else {
      throw 'Invalid state ' + this.state.screen
    }
  }
})

// TODO: factor out store
var ScrambleMailRepo = remote.require('scramble-mail-repo')
var mailRepoDir = path.join(process.env.HOME, 'scramble-test-dir')
var mailRepo = new ScrambleMailRepo(mailRepoDir)
var messages = []
function searchMessages (query, cb) {
  mailRepo.search(query, function (err, msgs) {
    messages = msgs
    cb(err, msgs)
  })
}

function loadCleanHTML (scrambleMailId) {
  // TODO: read from disk, use MailParser, then use CAJA to sanitize HTML
  // TODO: refactor to use a callback rather than returning directly
  for (var i = 0; i < messages.length; i++) {
    var message = messages[i]
    if (message.scrambleMailId === scrambleMailId) {
      return '<pre> ' + message.snippet + ' </pre>'
    }
  }
  return '<div class="text-error">Not found</div>'
}
