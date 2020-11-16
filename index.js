const Path = require('path')
const FS = require('fs')


const activePath = []
let distPath = 'dist'

const getModulePath = realPath => realPath.slice(realPath.lastIndexOf('/node_modules'))
const getPkg = realPath => {
    const modulePath = getModulePath(realPath)

    const pathSplit = modulePath.split('/')
    let pkgName = pathSplit[2]
    if (pathSplit[2][0] === '@') pkgName = pathSplit.slice(2, 4).join('/')

    return pkgName
}

/**
 * 入口文件
 * @return 变更后的引用地址
 */
const entry = (request, basePath = '', parentIsNpm = true) => {
    let realPath = ''

    if (request[0] !== '.') {
        try {
            realPath = require.resolve(request, { paths: [basePath] })
        } catch (e) {
            // MODULE_NOT_FOUND，注释或者try-catch引入的包
            // console.error(request, e.code)
            return ''
        }
        // Node.js系统包
        if (realPath === request) return ''
    } else {
        realPath = require.resolve(Path.resolve(basePath, '..', request))
    }

    // 重复则跳过
    if (!activePath.includes(realPath)) {
        activePath.push(realPath)
        changeRef(request, realPath)
    }

    // 仅返回相对路径变更的地址
    const modulePath = getModulePath(realPath)
    const pkgName = getPkg(realPath)

    if (request[0] === '.' && parentIsNpm) {
        let diff = Path.relative(`/node_modules/${pkgName}`, modulePath)
        if (diff[0] !== '.') diff = './' + diff

        return diff.replace(/\.js$/, '')
    }

    // 引用入口文件，要与新路径对应
    if (request[0] === '.' && !parentIsNpm && realPath === require.resolve(pkgName)) {
        let diff = Path.relative(Path.dirname(getModulePath(basePath)), `/node_modules/${pkgName}/index`)
        return diff
    }

    return ''
}

/**
 * 复制文件到目标路径
 * 包含修改引用地址
 */
const changeRef = (request, realPath) => {
    let code = FS.readFileSync(realPath, 'utf8')
    let refCount = 0

    const pkgName = getPkg(realPath)

    // 不是根目录，移到index.js
    // 修改引用地址
    let target = getModulePath(realPath)
    const notRootDir = pkgName === request && !realPath.endsWith(`${pkgName}/index.js`)
    if (notRootDir) target = `/node_modules/${pkgName}/index.js`

    code = code.replace(/(^|[^\.\w])require\(['"]([\w\d_\-\.\/@]+)['"]\)/ig, (match, char, lib) => {
        const diff = entry(lib, realPath, request === pkgName/* parentIsNpm */)
        if (diff) {
            refCount++
            return `${char}require('${diff}')`
        }
        return match
    })

    // 只有一个文件，移到根目录
    if (refCount === 0 && request[0] !== '.' && pkgName === request) {
        if (realPath.endsWith('.js')) target = `/node_modules/${pkgName}.js`
        // 只有JSON的包
        else if (realPath.endsWith('.json')) target = `/node_modules/${pkgName}.json`
    }

    // node v10+
    FS.mkdirSync(Path.dirname(distPath + target), { recursive: true })
    FS.writeFileSync(distPath + target, code)
}


module.exports = (pkgName, dist = 'dist') => {
    distPath = dist
    entry(pkgName)
}
