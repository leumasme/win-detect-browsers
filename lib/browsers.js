'use strict'

const ffChannel = require('./firefox-release-channel')

exports.chrome = {
  find: function () {
    // Joined with filename (or [browser name].exe)
    this.dir('LOCALAPPDATA', 'Google\\Chrome\\Application')
    this.dir('LOCALAPPDATA', 'Google\\Chrome Beta\\Application')
    this.dir('LOCALAPPDATA', 'Google\\Chrome Dev\\Application')
    // Chrome Canary
    this.dir('LOCALAPPDATA', 'Google\\Chrome SxS\\Application')

    // programFiles() is a shortcut to dir() that checks both
    // "Program Files" and "Program Files (x86)" if on 64-bit Windows
    this.programFiles('Google\\Chrome\\Application')
    this.programFiles('Google\\Chrome Beta\\Application')
    this.programFiles('Google\\Chrome Dev\\Application')
    this.programFiles('Google\\Chrome SxS\\Application')

    // Expanded to HKEY_LOCAL_MACHINE\Software, HKEY_CURRENT_USER\Software
    // and if on a x64 machine, their 32-bit (Software\WoW6432) counterparts.
    // Should also find 64-bit Chrome if installed, because 32-bit Chrome
    // uses the 32-bit registry and 64-bit Chrome uses the regular registry,
    // with the same subkeys.
    this.registry('Google\\Update', 'LastInstallerSuccessLaunchCmdLine')

    // Note: this one (sometimes) returns the binary's parent path
    this.registry('Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe', null, true)

    this.startMenu('Google Chrome')
    this.inPath()
    this.env('CHROME_BIN')

    // Custom search methods
    this.findUpdateClients()
    this.findProgIds()
  },

  findUpdateClients: require('./chrome/find-update-clients'),
  findProgIds: require('./chrome/find-progids')
}

exports.chromium = {
  bin: 'chrome.exe',

  // Can't search for chromium in PATH, because the binary name conflicts with chrome
  find: function () {
    this.dir('LOCALAPPDATA', 'Chromium\\Application')
    this.registry('Chromium', 'InstallerSuccessLaunchCmdLine')
    this.env('CHROMIUM_BIN')
  }
}

exports.firefox = {
  find: function () {
    this.programFiles('Mozilla Firefox')
    this.programFiles('Firefox Developer Edition')
    this.programFiles('Firefox Nightly')

    this.startMenu()
    this.registry('Mozilla\\Mozilla Firefox', 'PathToExe')

    this.versionRegistry(
      // First get version, then path
      'Mozilla\\Mozilla Firefox', 'CurrentVersion',
      'Mozilla\\Mozilla Firefox\\%s\\Main', 'PathToExe'
    )

    this.inPath()
  },

  post: function (result) {
    const name = result.info.ProductName

    if (name === 'FirefoxDeveloperEdition' || name === 'Firefox Developer Edition') {
      result.channel = 'developer'
    } else if (name === 'FirefoxNightly' || name === 'Firefox Nightly') {
      result.channel = 'nightly'
    } else {
      result.channel = ffChannel(result.info.ProductVersion || '')
    }

    return result
  }
}

exports.beaker = {
  bin: 'Beaker Browser.exe',
  find: function () {
    this.dir('LOCALAPPDATA', 'Programs\\beaker-browser')
  }
}

exports.brave = {
  bin: 'brave.exe',
  find: function () {
    this.programFiles('BraveSoftware\\Brave-Browser\\Application')
    this.registry('Microsoft\\Windows\\CurrentVersion\\App Paths\\brave.exe', null, true)
  }
}

exports.ie = {
  bin: 'iexplore.exe',

  find: function () {
    this.programFiles('Internet Explorer')
    this.startMenu()
    this.inPath()
  }
}

exports.msedge = {
  bin: 'msedge.exe',

  find: function () {
    this.programFiles('Microsoft\\Edge Beta\\Application')
    this.programFiles('Microsoft\\Edge Dev\\Application')
    this.programFiles('Microsoft\\Edge\\Application')
    this.startMenu('Microsoft Edge')
    this.startMenu('Microsoft Edge Dev')
    this.startMenu('Microsoft Edge Beta')
  },

  post: function (b) {
    // The channel is not actually in the metadata of the edge binary.
    // We could read the "msedge.VisualElementsManifest.xml" file to find the channel, but that may be slow.
    // Instead, we try to to find the channel from the installation folder.
    const reg = /Edge ?([a-zA-Z]*)\\Application\\msedge\.exe/
    const result = b.path.match(reg)
    if (!result) return b

    const channel = result[1].trim().toLowerCase()
    if (channel === 'beta' || channel === 'dev') b.channel = channel
    else b.channel = 'stable'

    return b
  }
}

exports.maxthon = {
  bin: 'Maxthon.exe',

  find: function () {
    this.programFiles('Maxthon\\Bin')
    this.startMenu()
    this.registry('Classes\\MaxthonAddonFile\\shell\\open\\command')
    this.inPath()
  }
}

exports.opera = {
  bin: 'Launcher.exe',

  find: function () {
    this.programFiles('Opera')
    this.registry('Clients\\StartMenuInternet\\OperaStable\\shell\\open\\command')
    this.registry('Classes\\OperaStable\\shell\\open\\command')

    this.programFiles('Opera beta')
    this.registry('Clients\\StartMenuInternet\\OperaBeta\\shell\\open\\command')
    this.registry('Classes\\OperaBeta\\shell\\open\\command')

    this.programFiles('Opera developer')
    this.registry('Clients\\StartMenuInternet\\OperaDeveloper\\shell\\open\\command')
    this.registry('Classes\\OperaDeveloper\\shell\\open\\command')

    this.inPath()
  },

  post: function (b) {
    const product = b.info.ProductName || b.info.FileDescription || ''
    const channel = product.toLowerCase().split(' ')[1]

    if (channel === 'beta') b.channel = 'beta'
    else if (channel === 'developer') b.channel = 'developer'
    else b.channel = 'stable'

    return b
  }
}

// Incomplete (Safari for Windows is dead anyway)
exports.safari = {
  find: function () {
    this.startMenu()
    this.registry('Apple Computer, Inc.\\Safari', 'BrowserExe')
    this.inPath()
  }
}

exports.yandex = {
  bin: 'browser.exe',

  find: function () {
    this.dir('LOCALAPPDATA', 'Yandex\\YandexBrowser\\Application')
    this.registry('YandexBrowser', 'InstallerSuccessLaunchCmdLine')

    this.startMenu()
    this.inPath()
  }
}
