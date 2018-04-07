'use strict'
const fs = require('fs')
const path = require('path')
let allModules = require('./_old_main_packed_modules')

let KNOWN_MODULES = [
  'asn1.js',
  'assert',
  'async',
  'async/dist/async.min.js',
  
  'base64-js',
  'bignumber.js',
  'bip66',
  'bn.js',
  'brorand',
  'browserify-aes',
  'browserify-aes/modes',
  'browserify-cipher',
  'browserify-des',
  'browserify-des/modes',
  'browserify-rsa',
  'browserify-sha3',
  'browserify-sign',
  'browserify-sign/algos',
  'buffer',

  'create-ecdh',
  'create-hash',
  'create-hmac',
  'cipher-base',
  'create-hash/md5',
  'crypto-js',
  'cssfilter',

  'datejs',
  'diffie-hellman',

  'elliptic',
  'ethereum-common',
  'ethereum-common/params.json',
  'ethereumjs-tx',
  'ethereumjs-util',

  'ieee754',
  'inherits',
  'isnumber',

  'js-sha256',

  'keccak',
  'keythereum',
  
  'lodash',
  'loadjs',
  
  'pbkdf2',
  'parse-asn1',
  'path',
  'punycode',

  'react',
  'react',
  'react-dom',
  'react-google-charts',
  'react-modal',
  'readable-stream',
  'readable-stream/duplex.js',
  'readable-stream/passthrough.js',
  'readable-stream/transform.js',
  'readable-stream/writable.js',
  'redux',
  'request',
  
  'safe-buffer',
  'socket.io-client',
  'socket.io-parser',
  'stats-lite',
  
  'web3',
  'web3/lib/solidity/coder.js',
  'web3/lib/utils/sha3.js',
  'web3/lib/utils/utils.js',
  'web3/lib/web3/event.js',
  'web3/lib/web3/function.js',

  'xss',

  'zlib'
]

// this is a script to unpack modules in the main-unminified module.
const outDir = 'unpacked_modules'

let moduleNameToNumberMap = buildNameToNumberMap(allModules)
let moduleNumberToNameMapOld = buildNumberToNameMap(moduleNameToNumberMap)


function main () {
  let rootModule = ModuleInfo.loadAllModules(allModules)
  cleanOutDir(outDir)
  rootModule.writeFile(outDir)
  //console.log('rootModule:', rootModule)
  console.log('potentialModules:')
  potentialModules.sort().forEach(s => console.log(`'${s}',`))
}

function isKnownModule (moduleName) {
  return KNOWN_MODULES.findIndex(s => s === moduleName) >= 0
}

let potentialModules = []
function warnPotentialNpmModule (moduleName) {
  potentialModules.push(moduleName)
  //console.log('potential npm module:', moduleName)
}

function cleanOutDir (outDir) {
  if (fs.existsSync(outDir))
    rmdir(outDir)
  fs.mkdirSync(outDir)
}

function fixCode (code, moduleNumber, referencedByNames = []) {
  code = removeModuleWrapper(code)
  let commentPrefix = `/* This module was module number ${moduleNumber} in the old packed code. It was referenced in the old code using \`require(<module name>)\` by the following module names:\n`
  commentPrefix += referencedByNames.map(name => '* ' + name).join('\n')
  commentPrefix += '\n*/\n'
  code = commentPrefix + code
  return code
}

function removeModuleWrapper (code) {
  let lines = code.split('\n')
  lines = lines.slice(1) // remove: function (require, module, exports) {
  lines.pop() // remove: }
  removeLeadingWhitespace(lines)
  return lines.join('\n')
}

function removeLeadingWhitespace (lines) {
  let wsMatches = /^(\s+)/.exec(lines[0])
  if (wsMatches && wsMatches.length > 0) {
    let ws = wsMatches[1]
    for (let i=0; i < lines.length - 1; i++) {
      if (lines[i].startsWith(ws))
        lines[i] = lines[i].slice(ws.length)
    }
  }
}

function mkdir (dirname) {
  let dirs = dirname.split(path.sep)
  for (let i = 0; i < dirs.length; i++) {
    let dir = dirs.slice(0, i+1).join(path.sep)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }
}

function rmdir (dir) {
	var list = fs.readdirSync(dir);
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);
		
		if(filename == "." || filename == "..") {
			// pass these files
		} else if(stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename);
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
}

function buildNameToNumberMap (allModules) {
  // build module name => ID map from dependencies
  let moduleNameToNumberMap = {}
  for (let k in allModules) {
    let moduleDependencies = allModules[k][1]
    // moduleDependencies is an object with keys as module names and values as module numbers (which are keys in allModules:
    moduleNameToNumberMap = Object.assign(moduleNameToNumberMap, moduleDependencies)
  }
  moduleNameToNumberMap['main.js'] = 555 // because main.js was never referenced so we have to hack it in here
  return moduleNameToNumberMap
}

function buildNumberToNameMap (moduleNameToNumberMap) {
  let moduleNumberToNameMap = {}
  for (let k in moduleNameToNumberMap) {
    let newKey = moduleNameToNumberMap[k]
    let newValue = k
    if (!(newKey in moduleNumberToNameMap))
      moduleNumberToNameMap[newKey] = new Array()
    moduleNumberToNameMap[newKey].push(newValue)
  }
  return moduleNumberToNameMap
}

class ModuleInfo {
  /**
   * Initializes a moduleInfo
   */
  constructor (number, code, rawDependencyMap) {
    this.number = number
    this.code = code
    // this is a name => number mapping of dependencies used by this module;
    this.rawDependencyMap = rawDependencyMap
    this.path = ''
    this.referencedBy = []
  }

  static loadAllModules (allRawModules) {
    // allRawModules is the raw modules from the original packed main-unminified.js.
    let moduleInfos = {}

    for (let modNum in allRawModules) {
      let m = new ModuleInfo(modNum, allRawModules[modNum][0], allRawModules[modNum][1])
      moduleInfos[modNum] = m
    }

    // all modules loaded, now hydrate dependencies of each
    for (let modNum in moduleInfos) {
      moduleInfos[modNum].hydrateChildren(moduleInfos)
    }

    // now tell each module all the names it was referenced by (this is only used to add a comment to each outputted module for FYI/troubleshooting)
    for (let modNum in moduleNumberToNameMapOld) {
      moduleInfos[modNum].setReferencedBy(moduleNumberToNameMapOld[modNum])
    }

    // set the main module's path (which will recursively set everyone else's path:
    let root = moduleInfos[555]

    root.setPath('/main.js', true, {})
    return root
  }

  setReferencedBy (arrayOfReferencedByNames) {
    this.referencedBy = arrayOfReferencedByNames
  }

  hydrateChildren (allModuleInfos) {
    this.children = []
    for (let modName in this.rawDependencyMap) {
      let modNumber = this.rawDependencyMap[modName]
      let child = allModuleInfos[modNumber]
      child.setParent(this)
      child.setPath(modName, false)
      this.children.push(child)
    }
  }

  setParent (parent) {
    this.parent = parent
  }

  hasAncestor (moduleInfo) {
    if (this.parent == null) {
      console.log('ROOT:', this.number)
    }
    let parent = this
    while (parent != null) {
      if (parent == moduleInfo) {
        return true
      }
      parent = parent.parent
    }
    return false
  }

  /**
   * Used to set the path of this module as it was originally used in require(..). This is inferred from a dependent's dependencyMap/require.
   */
  setPath (thePath, setRecursively, callers) {
    if (callers && callers[this.number.toString()] != null) {
      console.log('callers!')
      return
    } else if (callers) {
      callers[this.number.toString()] = this
    }
    
    this.path = thePath
    if (setRecursively) {
      for (let child of this.children) {
        let childPath = path.resolve(path.dirname(this.path), child.path)
        if (child.path !== childPath) {
          if (!isKnownModule(child.path)) {
            //console.log(`(${this.path}) inferring path:`, child.path, '>', childPath)
            if (!child.path.startsWith('./') && !child.path.startsWith('../'))
              warnPotentialNpmModule(child.path)
            child.setPath(childPath, setRecursively, callers)
          }
        }
      }
    }
    if (callers)
      callers[this.number.toString()] = null
  }

  writeFile (outDir) {
    if (this.didWriteFile)
      return
    this.didWriteFile = true
    if (isKnownModule(this.path)) {
      return
    }
    let code = fixCode(this.code.toString(), this.number, this.referencedBy)
    let fname = this.path
    if (!fname.endsWith('.js')) {
      fname = fname + '.js'
    }
    let dirname = path.dirname(path.join(outDir, fname))
    mkdir(dirname)
    fs.writeFileSync(path.join(outDir, fname), code)
    for (let c of this.children) {
      c.writeFile(outDir)
    }
  }
}

main()