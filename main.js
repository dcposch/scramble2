var path = require('path')
var Keybase = require('node-keybase')
var App = require('app')
var BrowserWindow = require('browser-window')
var ScrambleMailRepo = require('scramble-mail-repo')

var mainWindow = null

// Quit when all windows are closed, even on Darwin
App.on('window-all-closed', App.quit.bind(App))

// Wait for atom-shell to initialize
App.commandLine.appendSwitch('js-flags', '--harmony')
App.on('ready', function () {
  console.log('Starting Scramble. process.version is ' + process.version)

  mainWindow = new BrowserWindow({'width': 1000, 'height': 700})
  mainWindow.loadUrl('file://' + __dirname + '/build/index.html')
  mainWindow.openDevTools()

  mainWindow.webContents.on('did-finish-load', function () {
    demoMailRepo()
    demoKeybase()
  })
})

// Demo: searchable mail repo
function demoMailRepo () {
  var mailRepo = new ScrambleMailRepo(path.join(process.env.HOME, 'scramble-test-dir'))
  mailRepo.search('hello', function (err, msgs) {
    if (err) return console.error(err)
    console.log('Sending ' + msgs.length + ' msgs from browser to renderer')
    mainWindow.webContents.send('inbox', msgs)
  })
}

// Demo: Keybase
function demoKeybase () {
  var keybaseUser = process.argv[2]
  var keybasePassphrase = process.argv[3]
  if (!keybaseUser || !keybasePassphrase) {
    console.log('To test Keybase: node <...> <keybase user> <keybase passphrase>')
  } else {
    var keybase = new Keybase(keybaseUser, keybasePassphrase)
    keybase.user_autocomplete('dc', function (err, result) {
      if (err) {
        return console.warn('Keybase autocomplete error', err)
      }
      console.log('Autocomplete', result)
    })
    keybase.login(function (err, result) {
      if (err) {
        return console.warn('Keybase login error', err)
      }
      console.log('Keybase login: ', result.status.name)
    })
  }
}
