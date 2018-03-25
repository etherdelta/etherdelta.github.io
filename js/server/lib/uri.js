/* This module was module number 392 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./lib/uri.js
*/
var URI = (function() {
    function parse(uriStr) {
        var m = ('' + uriStr).match(URI_RE_);
        return m
            ? new URI(
                  nullIfAbsent(m[1]),
                  nullIfAbsent(m[2]),
                  nullIfAbsent(m[3]),
                  nullIfAbsent(m[4]),
                  nullIfAbsent(m[5]),
                  nullIfAbsent(m[6]),
                  nullIfAbsent(m[7])
              )
            : null;
    }
    function encodeIfExists(unescapedPart) {
        return 'string' == typeof unescapedPart
            ? encodeURIComponent(unescapedPart)
            : null;
    }
    function encodeIfExists2(unescapedPart, extra) {
        return 'string' == typeof unescapedPart
            ? encodeURI(unescapedPart).replace(extra, encodeOne)
            : null;
    }
    function encodeOne(ch) {
        var n = ch.charCodeAt(0);
        return (
            '%' +
            '0123456789ABCDEF'.charAt((n >> 4) & 15) +
            '0123456789ABCDEF'.charAt(15 & n)
        );
    }
    function normPath(path) {
        return path.replace(/(^|\/)\.(?:\/|$)/g, '$1').replace(/\/{2,}/g, '/');
    }
    function collapse_dots(path) {
        if (null === path) return null;
        for (
            var q, p = normPath(path), r = PARENT_DIRECTORY_HANDLER_RE;
            (q = p.replace(r, '$1')) != p;
            p = q
        );
        return p;
    }
    function resolve(baseUri, relativeUri) {
        var absoluteUri = baseUri.clone(),
            overridden = relativeUri.hasScheme();
        overridden
            ? absoluteUri.setRawScheme(relativeUri.getRawScheme())
            : (overridden = relativeUri.hasCredentials()),
            overridden
                ? absoluteUri.setRawCredentials(relativeUri.getRawCredentials())
                : (overridden = relativeUri.hasDomain()),
            overridden
                ? absoluteUri.setRawDomain(relativeUri.getRawDomain())
                : (overridden = relativeUri.hasPort());
        var rawPath = relativeUri.getRawPath(),
            simplifiedPath = collapse_dots(rawPath);
        if (overridden)
            absoluteUri.setPort(relativeUri.getPort()),
                (simplifiedPath =
                    simplifiedPath &&
                    simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, ''));
        else if ((overridden = !!rawPath)) {
            if (47 !== simplifiedPath.charCodeAt(0)) {
                var absRawPath = collapse_dots(
                        absoluteUri.getRawPath() || ''
                    ).replace(EXTRA_PARENT_PATHS_RE, ''),
                    slash = absRawPath.lastIndexOf('/') + 1;
                simplifiedPath = collapse_dots(
                    (slash ? absRawPath.substring(0, slash) : '') +
                        collapse_dots(rawPath)
                ).replace(EXTRA_PARENT_PATHS_RE, '');
            }
        } else
            (simplifiedPath =
                simplifiedPath &&
                simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '')) !==
                rawPath && absoluteUri.setRawPath(simplifiedPath);
        return (
            overridden
                ? absoluteUri.setRawPath(simplifiedPath)
                : (overridden = relativeUri.hasQuery()),
            overridden
                ? absoluteUri.setRawQuery(relativeUri.getRawQuery())
                : (overridden = relativeUri.hasFragment()),
            overridden &&
                absoluteUri.setRawFragment(relativeUri.getRawFragment()),
            absoluteUri
        );
    }
    function URI(
        rawScheme,
        rawCredentials,
        rawDomain,
        port,
        rawPath,
        rawQuery,
        rawFragment
    ) {
        (this.scheme_ = rawScheme),
            (this.credentials_ = rawCredentials),
            (this.domain_ = rawDomain),
            (this.port_ = port),
            (this.path_ = rawPath),
            (this.query_ = rawQuery),
            (this.fragment_ = rawFragment),
            (this.paramCache_ = null);
    }
    function nullIfAbsent(matchPart) {
        return 'string' == typeof matchPart && matchPart.length > 0
            ? matchPart
            : null;
    }
    var PARENT_DIRECTORY_HANDLER = new RegExp(
            '(/|^)(?:[^./][^/]*|\\.{2,}(?:[^./][^/]*)|\\.{3,}[^/]*)/\\.\\.(?:/|$)'
        ),
        PARENT_DIRECTORY_HANDLER_RE = new RegExp(PARENT_DIRECTORY_HANDLER),
        EXTRA_PARENT_PATHS_RE = /^(?:\.\.\/)*(?:\.\.$)?/;
    (URI.prototype.toString = function() {
        var out = [];
        return (
            null !== this.scheme_ && out.push(this.scheme_, ':'),
            null !== this.domain_ &&
                (out.push('//'),
                null !== this.credentials_ && out.push(this.credentials_, '@'),
                out.push(this.domain_),
                null !== this.port_ && out.push(':', this.port_.toString())),
            null !== this.path_ && out.push(this.path_),
            null !== this.query_ && out.push('?', this.query_),
            null !== this.fragment_ && out.push('#', this.fragment_),
            out.join('')
        );
    }),
        (URI.prototype.clone = function() {
            return new URI(
                this.scheme_,
                this.credentials_,
                this.domain_,
                this.port_,
                this.path_,
                this.query_,
                this.fragment_
            );
        }),
        (URI.prototype.getScheme = function() {
            return (
                this.scheme_ && decodeURIComponent(this.scheme_).toLowerCase()
            );
        }),
        (URI.prototype.getRawScheme = function() {
            return this.scheme_;
        }),
        (URI.prototype.setScheme = function(newScheme) {
            return (
                (this.scheme_ = encodeIfExists2(
                    newScheme,
                    URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_
                )),
                this
            );
        }),
        (URI.prototype.setRawScheme = function(newScheme) {
            return (this.scheme_ = newScheme || null), this;
        }),
        (URI.prototype.hasScheme = function() {
            return null !== this.scheme_;
        }),
        (URI.prototype.getCredentials = function() {
            return this.credentials_ && decodeURIComponent(this.credentials_);
        }),
        (URI.prototype.getRawCredentials = function() {
            return this.credentials_;
        }),
        (URI.prototype.setCredentials = function(newCredentials) {
            return (
                (this.credentials_ = encodeIfExists2(
                    newCredentials,
                    URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_
                )),
                this
            );
        }),
        (URI.prototype.setRawCredentials = function(newCredentials) {
            return (this.credentials_ = newCredentials || null), this;
        }),
        (URI.prototype.hasCredentials = function() {
            return null !== this.credentials_;
        }),
        (URI.prototype.getDomain = function() {
            return this.domain_ && decodeURIComponent(this.domain_);
        }),
        (URI.prototype.getRawDomain = function() {
            return this.domain_;
        }),
        (URI.prototype.setDomain = function(newDomain) {
            return this.setRawDomain(
                newDomain && encodeURIComponent(newDomain)
            );
        }),
        (URI.prototype.setRawDomain = function(newDomain) {
            return (
                (this.domain_ = newDomain || null), this.setRawPath(this.path_)
            );
        }),
        (URI.prototype.hasDomain = function() {
            return null !== this.domain_;
        }),
        (URI.prototype.getPort = function() {
            return this.port_ && decodeURIComponent(this.port_);
        }),
        (URI.prototype.setPort = function(newPort) {
            if (newPort) {
                if ((newPort = Number(newPort)) !== (65535 & newPort))
                    throw new Error('Bad port number ' + newPort);
                this.port_ = '' + newPort;
            } else this.port_ = null;
            return this;
        }),
        (URI.prototype.hasPort = function() {
            return null !== this.port_;
        }),
        (URI.prototype.getPath = function() {
            return this.path_ && decodeURIComponent(this.path_);
        }),
        (URI.prototype.getRawPath = function() {
            return this.path_;
        }),
        (URI.prototype.setPath = function(newPath) {
            return this.setRawPath(
                encodeIfExists2(newPath, URI_DISALLOWED_IN_PATH_)
            );
        }),
        (URI.prototype.setRawPath = function(newPath) {
            return (
                newPath
                    ? ((newPath = String(newPath)),
                      (this.path_ =
                          !this.domain_ || /^\//.test(newPath)
                              ? newPath
                              : '/' + newPath))
                    : (this.path_ = null),
                this
            );
        }),
        (URI.prototype.hasPath = function() {
            return null !== this.path_;
        }),
        (URI.prototype.getQuery = function() {
            return (
                this.query_ &&
                decodeURIComponent(this.query_).replace(/\+/g, ' ')
            );
        }),
        (URI.prototype.getRawQuery = function() {
            return this.query_;
        }),
        (URI.prototype.setQuery = function(newQuery) {
            return (
                (this.paramCache_ = null),
                (this.query_ = encodeIfExists(newQuery)),
                this
            );
        }),
        (URI.prototype.setRawQuery = function(newQuery) {
            return (
                (this.paramCache_ = null),
                (this.query_ = newQuery || null),
                this
            );
        }),
        (URI.prototype.hasQuery = function() {
            return null !== this.query_;
        }),
        (URI.prototype.setAllParameters = function(params) {
            if (
                'object' == typeof params &&
                !(params instanceof Array) &&
                (params instanceof Object ||
                    '[object Array]' !== Object.prototype.toString.call(params))
            ) {
                var newParams = [],
                    i = -1;
                for (var k in params)
                    'string' == typeof (v = params[k]) &&
                        ((newParams[++i] = k), (newParams[++i] = v));
                params = newParams;
            }
            this.paramCache_ = null;
            for (
                var queryBuf = [], separator = '', j = 0;
                j < params.length;

            ) {
                var k = params[j++],
                    v = params[j++];
                queryBuf.push(separator, encodeURIComponent(k.toString())),
                    (separator = '&'),
                    v && queryBuf.push('=', encodeURIComponent(v.toString()));
            }
            return (this.query_ = queryBuf.join('')), this;
        }),
        (URI.prototype.checkParameterCache_ = function() {
            if (!this.paramCache_) {
                var q = this.query_;
                if (q) {
                    for (
                        var cgiParams = q.split(/[&\?]/),
                            out = [],
                            k = -1,
                            i = 0;
                        i < cgiParams.length;
                        ++i
                    ) {
                        var m = cgiParams[i].match(/^([^=]*)(?:=(.*))?$/);
                        (out[++k] = decodeURIComponent(m[1]).replace(
                            /\+/g,
                            ' '
                        )),
                            (out[++k] = decodeURIComponent(m[2] || '').replace(
                                /\+/g,
                                ' '
                            ));
                    }
                    this.paramCache_ = out;
                } else this.paramCache_ = [];
            }
        }),
        (URI.prototype.setParameterValues = function(key, values) {
            'string' == typeof values && (values = [values]),
                this.checkParameterCache_();
            for (
                var newValueIndex = 0,
                    pc = this.paramCache_,
                    params = [],
                    i = 0;
                i < pc.length;
                i += 2
            )
                key === pc[i]
                    ? newValueIndex < values.length &&
                      params.push(key, values[newValueIndex++])
                    : params.push(pc[i], pc[i + 1]);
            for (; newValueIndex < values.length; )
                params.push(key, values[newValueIndex++]);
            return this.setAllParameters(params), this;
        }),
        (URI.prototype.removeParameter = function(key) {
            return this.setParameterValues(key, []);
        }),
        (URI.prototype.getAllParameters = function() {
            return (
                this.checkParameterCache_(),
                this.paramCache_.slice(0, this.paramCache_.length)
            );
        }),
        (URI.prototype.getParameterValues = function(paramNameUnescaped) {
            this.checkParameterCache_();
            for (var values = [], i = 0; i < this.paramCache_.length; i += 2)
                paramNameUnescaped === this.paramCache_[i] &&
                    values.push(this.paramCache_[i + 1]);
            return values;
        }),
        (URI.prototype.getParameterMap = function(paramNameUnescaped) {
            this.checkParameterCache_();
            for (
                var paramMap = {}, i = 0;
                i < this.paramCache_.length;
                i += 2
            ) {
                var key = this.paramCache_[i++],
                    value = this.paramCache_[i++];
                key in paramMap
                    ? paramMap[key].push(value)
                    : (paramMap[key] = [value]);
            }
            return paramMap;
        }),
        (URI.prototype.getParameterValue = function(paramNameUnescaped) {
            this.checkParameterCache_();
            for (var i = 0; i < this.paramCache_.length; i += 2)
                if (paramNameUnescaped === this.paramCache_[i])
                    return this.paramCache_[i + 1];
            return null;
        }),
        (URI.prototype.getFragment = function() {
            return this.fragment_ && decodeURIComponent(this.fragment_);
        }),
        (URI.prototype.getRawFragment = function() {
            return this.fragment_;
        }),
        (URI.prototype.setFragment = function(newFragment) {
            return (
                (this.fragment_ = newFragment
                    ? encodeURIComponent(newFragment)
                    : null),
                this
            );
        }),
        (URI.prototype.setRawFragment = function(newFragment) {
            return (this.fragment_ = newFragment || null), this;
        }),
        (URI.prototype.hasFragment = function() {
            return null !== this.fragment_;
        });
    var URI_RE_ = new RegExp(
            '^(?:([^:/?#]+):)?(?://(?:([^/?#]*)@)?([^/?#:@]*)(?::([0-9]+))?)?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$'
        ),
        URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_ = /[#\/\?@]/g,
        URI_DISALLOWED_IN_PATH_ = /[\#\?]/g;
    return (
        (URI.parse = parse),
        (URI.create = function(
            scheme,
            credentials,
            domain,
            port,
            path,
            query,
            fragment
        ) {
            var uri = new URI(
                encodeIfExists2(
                    scheme,
                    URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_
                ),
                encodeIfExists2(
                    credentials,
                    URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_
                ),
                encodeIfExists(domain),
                port > 0 ? port.toString() : null,
                encodeIfExists2(path, URI_DISALLOWED_IN_PATH_),
                null,
                encodeIfExists(fragment)
            );
            return (
                query &&
                    ('string' == typeof query
                        ? uri.setRawQuery(
                              query.replace(/[^?&=0-9A-Za-z_\-~.%]/g, encodeOne)
                          )
                        : uri.setAllParameters(query)),
                uri
            );
        }),
        (URI.resolve = resolve),
        (URI.collapse_dots = collapse_dots),
        (URI.utils = {
            mimeTypeOf: function(uri) {
                var uriObj = parse(uri);
                return /\.html$/.test(uriObj.getPath())
                    ? 'text/html'
                    : 'application/javascript';
            },
            resolve: function(base, uri) {
                return base
                    ? resolve(parse(base), parse(uri)).toString()
                    : '' + uri;
            },
        }),
        URI
    );
})();
void 0 !== exports
    ? (void 0 !== module && module.exports && (exports = module.exports = URI),
      (exports.URI = URI))
                : 'undefined' != typeof window && (window.URI = URI);