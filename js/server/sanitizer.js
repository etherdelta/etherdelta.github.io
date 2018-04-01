/* This module was module number 393 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* sanitizer
*/
var html4 = require('./lib/html4.js'),
    URI = require('./lib/uri.js');
if ('i' !== 'I'.toLowerCase()) throw 'I/i problem';
var html = (function(html4) {
        function lookupEntity(name) {
            if (ENTITIES.hasOwnProperty(name)) return ENTITIES[name];
            var m = name.match(decimalEscapeRe);
            if (m) return String.fromCharCode(parseInt(m[1], 10));
            if ((m = name.match(hexEscapeRe)))
                return String.fromCharCode(parseInt(m[1], 16));
            if (entityLookupElement && safeEntityNameRe.test(name)) {
                entityLookupElement.innerHTML = '&' + name + ';';
                var text = entityLookupElement.textContent;
                return (ENTITIES[name] = text), text;
            }
            return '&' + name + ';';
        }
        function decodeOneEntity(_, name) {
            return lookupEntity(name);
        }
        function stripNULs(s) {
            return s.replace(nulRe, '');
        }
        function unescapeEntities(s) {
            return s ? s.replace(ENTITY_RE_1, decodeOneEntity) : s;
        }
        function escapeAttrib(s) {
            return s
                ? ('' + s)
                      .replace(ampRe, '&amp;')
                      .replace(ltRe, '&lt;')
                      .replace(gtRe, '&gt;')
                      .replace(quotRe, '&#34;')
                : s;
        }
        function normalizeRCData(rcdata) {
            return rcdata
                ? rcdata
                      .replace(looseAmpRe, '&amp;$1')
                      .replace(ltRe, '&lt;')
                      .replace(gtRe, '&gt;')
                : rcdata;
        }
        function makeSaxParser(handler) {
            var hcopy = {
                cdata: handler.cdata || handler.cdata,
                comment: handler.comment || handler.comment,
                endDoc: handler.endDoc || handler.endDoc,
                endTag: handler.endTag || handler.endTag,
                pcdata: handler.pcdata || handler.pcdata,
                rcdata: handler.rcdata || handler.rcdata,
                startDoc: handler.startDoc || handler.startDoc,
                startTag: handler.startTag || handler.startTag,
            };
            return function(htmlText, param) {
                return parse(htmlText, hcopy, param);
            };
        }
        function parse(htmlText, handler, param) {
            parseCPS(
                handler,
                htmlSplit(htmlText),
                0,
                { noMoreGT: !1, noMoreEndComments: !1 },
                param
            );
        }
        function continuationMaker(h, parts, initial, state, param) {
            return function() {
                parseCPS(h, parts, initial, state, param);
            };
        }
        function parseCPS(h, parts, initial, state, param) {
            try {
                h.startDoc && 0 == initial && h.startDoc(param);
                for (
                    var m, p, tagName, pos = initial, end = parts.length;
                    pos < end;

                ) {
                    var current = parts[pos++],
                        next = parts[pos];
                    switch (current) {
                        case '&':
                            ENTITY_RE_2.test(next)
                                ? (h.pcdata &&
                                      h.pcdata(
                                          '&' + next,
                                          param,
                                          continuationMarker,
                                          continuationMaker(
                                              h,
                                              parts,
                                              pos,
                                              state,
                                              param
                                          )
                                      ),
                                  pos++)
                                : h.pcdata &&
                                  h.pcdata(
                                      '&amp;',
                                      param,
                                      continuationMarker,
                                      continuationMaker(
                                          h,
                                          parts,
                                          pos,
                                          state,
                                          param
                                      )
                                  );
                            break;
                        case '</':
                            (m = /^([-\w:]+)[^\'\"]*/.exec(next))
                                ? m[0].length === next.length &&
                                  '>' === parts[pos + 1]
                                  ? ((pos += 2),
                                    (tagName = m[1].toLowerCase()),
                                    h.endTag &&
                                        h.endTag(
                                            tagName,
                                            param,
                                            continuationMarker,
                                            continuationMaker(
                                                h,
                                                parts,
                                                pos,
                                                state,
                                                param
                                            )
                                        ))
                                  : (pos = parseEndTag(
                                        parts,
                                        pos,
                                        h,
                                        param,
                                        continuationMarker,
                                        state
                                    ))
                                : h.pcdata &&
                                  h.pcdata(
                                      '&lt;/',
                                      param,
                                      continuationMarker,
                                      continuationMaker(
                                          h,
                                          parts,
                                          pos,
                                          state,
                                          param
                                      )
                                  );
                            break;
                        case '<':
                            if ((m = /^([-\w:]+)\s*\/?/.exec(next)))
                                if (
                                    m[0].length === next.length &&
                                    '>' === parts[pos + 1]
                                ) {
                                    (pos += 2),
                                        (tagName = m[1].toLowerCase()),
                                        h.startTag &&
                                            h.startTag(
                                                tagName,
                                                [],
                                                param,
                                                continuationMarker,
                                                continuationMaker(
                                                    h,
                                                    parts,
                                                    pos,
                                                    state,
                                                    param
                                                )
                                            );
                                    var eflags = html4.ELEMENTS[tagName];
                                    eflags & EFLAGS_TEXT &&
                                        (pos = parseText(
                                            parts,
                                            {
                                                name: tagName,
                                                next: pos,
                                                eflags: eflags,
                                            },
                                            h,
                                            param,
                                            continuationMarker,
                                            state
                                        ));
                                } else
                                    pos = parseStartTag(
                                        parts,
                                        pos,
                                        h,
                                        param,
                                        continuationMarker,
                                        state
                                    );
                            else
                                h.pcdata &&
                                    h.pcdata(
                                        '&lt;',
                                        param,
                                        continuationMarker,
                                        continuationMaker(
                                            h,
                                            parts,
                                            pos,
                                            state,
                                            param
                                        )
                                    );
                            break;
                        case '\x3c!--':
                            if (!state.noMoreEndComments) {
                                for (
                                    p = pos + 1;
                                    p < end &&
                                    ('>' !== parts[p] ||
                                        !/--$/.test(parts[p - 1]));
                                    p++
                                );
                                if (p < end) {
                                    if (h.comment) {
                                        var comment = parts
                                            .slice(pos, p)
                                            .join('');
                                        h.comment(
                                            comment.substr(
                                                0,
                                                comment.length - 2
                                            ),
                                            param,
                                            continuationMarker,
                                            continuationMaker(
                                                h,
                                                parts,
                                                p + 1,
                                                state,
                                                param
                                            )
                                        );
                                    }
                                    pos = p + 1;
                                } else state.noMoreEndComments = !0;
                            }
                            state.noMoreEndComments &&
                                h.pcdata &&
                                h.pcdata(
                                    '&lt;!--',
                                    param,
                                    continuationMarker,
                                    continuationMaker(
                                        h,
                                        parts,
                                        pos,
                                        state,
                                        param
                                    )
                                );
                            break;
                        case '<!':
                            if (/^\w/.test(next)) {
                                if (!state.noMoreGT) {
                                    for (
                                        p = pos + 1;
                                        p < end && '>' !== parts[p];
                                        p++
                                    );
                                    p < end
                                        ? (pos = p + 1)
                                        : (state.noMoreGT = !0);
                                }
                                state.noMoreGT &&
                                    h.pcdata &&
                                    h.pcdata(
                                        '&lt;!',
                                        param,
                                        continuationMarker,
                                        continuationMaker(
                                            h,
                                            parts,
                                            pos,
                                            state,
                                            param
                                        )
                                    );
                            } else
                                h.pcdata &&
                                    h.pcdata(
                                        '&lt;!',
                                        param,
                                        continuationMarker,
                                        continuationMaker(
                                            h,
                                            parts,
                                            pos,
                                            state,
                                            param
                                        )
                                    );
                            break;
                        case '<?':
                            if (!state.noMoreGT) {
                                for (
                                    p = pos + 1;
                                    p < end && '>' !== parts[p];
                                    p++
                                );
                                p < end ? (pos = p + 1) : (state.noMoreGT = !0);
                            }
                            state.noMoreGT &&
                                h.pcdata &&
                                h.pcdata(
                                    '&lt;?',
                                    param,
                                    continuationMarker,
                                    continuationMaker(
                                        h,
                                        parts,
                                        pos,
                                        state,
                                        param
                                    )
                                );
                            break;
                        case '>':
                            h.pcdata &&
                                h.pcdata(
                                    '&gt;',
                                    param,
                                    continuationMarker,
                                    continuationMaker(
                                        h,
                                        parts,
                                        pos,
                                        state,
                                        param
                                    )
                                );
                            break;
                        case '':
                            break;
                        default:
                            h.pcdata &&
                                h.pcdata(
                                    current,
                                    param,
                                    continuationMarker,
                                    continuationMaker(
                                        h,
                                        parts,
                                        pos,
                                        state,
                                        param
                                    )
                                );
                    }
                }
                h.endDoc && h.endDoc(param);
            } catch (e) {
                if (e !== continuationMarker) throw e;
            }
        }
        function htmlSplit(str) {
            var re = /(<\/|<\!--|<[!?]|[&<>])/g;
            if (((str += ''), splitWillCapture)) return str.split(re);
            for (var m, parts = [], lastPos = 0; null !== (m = re.exec(str)); )
                parts.push(str.substring(lastPos, m.index)),
                    parts.push(m[0]),
                    (lastPos = m.index + m[0].length);
            return parts.push(str.substring(lastPos)), parts;
        }
        function parseEndTag(parts, pos, h, param, continuationMarker, state) {
            var tag = parseTagAndAttrs(parts, pos);
            return tag
                ? (h.endTag &&
                      h.endTag(
                          tag.name,
                          param,
                          continuationMarker,
                          continuationMaker(h, parts, pos, state, param)
                      ),
                  tag.next)
                : parts.length;
        }
        function parseStartTag(
            parts,
            pos,
            h,
            param,
            continuationMarker,
            state
        ) {
            var tag = parseTagAndAttrs(parts, pos);
            return tag
                ? (h.startTag &&
                      h.startTag(
                          tag.name,
                          tag.attrs,
                          param,
                          continuationMarker,
                          continuationMaker(h, parts, tag.next, state, param)
                      ),
                  tag.eflags & EFLAGS_TEXT
                      ? parseText(
                            parts,
                            tag,
                            h,
                            param,
                            continuationMarker,
                            state
                        )
                      : tag.next)
                : parts.length;
        }
        function parseText(parts, tag, h, param, continuationMarker, state) {
            var end = parts.length;
            endTagRe.hasOwnProperty(tag.name) ||
                (endTagRe[tag.name] = new RegExp(
                    '^' + tag.name + '(?:[\\s\\/]|$)',
                    'i'
                ));
            for (
                var re = endTagRe[tag.name], first = tag.next, p = tag.next + 1;
                p < end && ('</' !== parts[p - 1] || !re.test(parts[p]));
                p++
            );
            p < end && (p -= 1);
            var buf = parts.slice(first, p).join('');
            if (tag.eflags & html4.eflags.CDATA)
                h.cdata &&
                    h.cdata(
                        buf,
                        param,
                        continuationMarker,
                        continuationMaker(h, parts, p, state, param)
                    );
            else {
                if (!(tag.eflags & html4.eflags.RCDATA)) throw new Error('bug');
                h.rcdata &&
                    h.rcdata(
                        normalizeRCData(buf),
                        param,
                        continuationMarker,
                        continuationMaker(h, parts, p, state, param)
                    );
            }
            return p;
        }
        function parseTagAndAttrs(parts, pos) {
            var m = /^([-\w:]+)/.exec(parts[pos]),
                tag = {};
            (tag.name = m[1].toLowerCase()),
                (tag.eflags = html4.ELEMENTS[tag.name]);
            for (
                var buf = parts[pos].substr(m[0].length),
                    p = pos + 1,
                    end = parts.length;
                p < end && '>' !== parts[p];
                p++
            )
                buf += parts[p];
            if (!(end <= p)) {
                for (var attrs = []; '' !== buf; )
                    if ((m = ATTR_RE.exec(buf))) {
                        if ((m[4] && !m[5]) || (m[6] && !m[7])) {
                            for (
                                var quote = m[4] || m[6],
                                    sawQuote = !1,
                                    abuf = [buf, parts[p++]];
                                p < end;
                                p++
                            ) {
                                if (sawQuote) {
                                    if ('>' === parts[p]) break;
                                } else
                                    0 <= parts[p].indexOf(quote) &&
                                        (sawQuote = !0);
                                abuf.push(parts[p]);
                            }
                            if (end <= p) break;
                            buf = abuf.join('');
                            continue;
                        }
                        var aName = m[1].toLowerCase(),
                            aValue = m[2] ? decodeValue(m[3]) : '';
                        attrs.push(aName, aValue),
                            (buf = buf.substr(m[0].length));
                    } else buf = buf.replace(/^[\s\S][^a-z\s]*/, '');
                return (tag.attrs = attrs), (tag.next = p + 1), tag;
            }
        }
        function decodeValue(v) {
            var q = v.charCodeAt(0);
            return (
                (34 !== q && 39 !== q) || (v = v.substr(1, v.length - 2)),
                unescapeEntities(stripNULs(v))
            );
        }
        function makeHtmlSanitizer(tagPolicy) {
            var stack,
                ignoring,
                emit = function(text, out) {
                    ignoring || out.push(text);
                };
            return makeSaxParser({
                startDoc: function(_) {
                    (stack = []), (ignoring = !1);
                },
                startTag: function(tagNameOrig, attribs, out) {
                    if (
                        !ignoring &&
                        html4.ELEMENTS.hasOwnProperty(tagNameOrig)
                    ) {
                        var eflagsOrig = html4.ELEMENTS[tagNameOrig];
                        if (!(eflagsOrig & html4.eflags.FOLDABLE)) {
                            var decision = tagPolicy(tagNameOrig, attribs);
                            if (decision) {
                                if ('object' != typeof decision)
                                    throw new Error(
                                        'tagPolicy did not return object (old API?)'
                                    );
                                if (!('attribs' in decision))
                                    throw new Error(
                                        'tagPolicy gave no attribs'
                                    );
                                attribs = decision.attribs;
                                var eflagsRep, tagNameRep;
                                if (
                                    ('tagName' in decision
                                        ? ((tagNameRep = decision.tagName),
                                          (eflagsRep =
                                              html4.ELEMENTS[tagNameRep]))
                                        : ((tagNameRep = tagNameOrig),
                                          (eflagsRep = eflagsOrig)),
                                    eflagsOrig & html4.eflags.OPTIONAL_ENDTAG)
                                ) {
                                    var onStack = stack[stack.length - 1];
                                    !onStack ||
                                        onStack.orig !== tagNameOrig ||
                                        (onStack.rep === tagNameRep &&
                                            tagNameOrig === tagNameRep) ||
                                        out.push('</', onStack.rep, '>');
                                }
                                eflagsOrig & html4.eflags.EMPTY ||
                                    stack.push({
                                        orig: tagNameOrig,
                                        rep: tagNameRep,
                                    }),
                                    out.push('<', tagNameRep);
                                for (
                                    var i = 0, n = attribs.length;
                                    i < n;
                                    i += 2
                                ) {
                                    var attribName = attribs[i],
                                        value = attribs[i + 1];
                                    null !== value &&
                                        void 0 !== value &&
                                        out.push(
                                            ' ',
                                            attribName,
                                            '="',
                                            escapeAttrib(value),
                                            '"'
                                        );
                                }
                                out.push('>'),
                                    eflagsOrig & html4.eflags.EMPTY &&
                                        !(eflagsRep & html4.eflags.EMPTY) &&
                                        out.push('</', tagNameRep, '>');
                            } else
                                ignoring = !(eflagsOrig & html4.eflags.EMPTY);
                        }
                    }
                },
                endTag: function(tagName, out) {
                    if (ignoring) ignoring = !1;
                    else if (html4.ELEMENTS.hasOwnProperty(tagName)) {
                        var eflags = html4.ELEMENTS[tagName];
                        if (
                            !(
                                eflags &
                                (html4.eflags.EMPTY | html4.eflags.FOLDABLE)
                            )
                        ) {
                            var index;
                            if (eflags & html4.eflags.OPTIONAL_ENDTAG)
                                for (index = stack.length; --index >= 0; ) {
                                    var stackElOrigTag = stack[index].orig;
                                    if (stackElOrigTag === tagName) break;
                                    if (
                                        !(
                                            html4.ELEMENTS[stackElOrigTag] &
                                            html4.eflags.OPTIONAL_ENDTAG
                                        )
                                    )
                                        return;
                                }
                            else
                                for (
                                    index = stack.length;
                                    --index >= 0 &&
                                    stack[index].orig !== tagName;

                                );
                            if (index < 0) return;
                            for (var i = stack.length; --i > index; ) {
                                var stackElRepTag = stack[i].rep;
                                html4.ELEMENTS[stackElRepTag] &
                                    html4.eflags.OPTIONAL_ENDTAG ||
                                    out.push('</', stackElRepTag, '>');
                            }
                            index < stack.length &&
                                (tagName = stack[index].rep),
                                (stack.length = index),
                                out.push('</', tagName, '>');
                        }
                    }
                },
                pcdata: emit,
                rcdata: emit,
                cdata: emit,
                endDoc: function(out) {
                    for (; stack.length; stack.length--)
                        out.push('</', stack[stack.length - 1].rep, '>');
                },
            });
        }
        function safeUri(uri, effect, ltype, hints, naiveUriRewriter) {
            if (!naiveUriRewriter) return null;
            try {
                var parsed = URI.parse('' + uri);
                if (
                    parsed &&
                    (!parsed.hasScheme() ||
                        ALLOWED_URI_SCHEMES.test(parsed.getScheme()))
                ) {
                    var safe = naiveUriRewriter(parsed, effect, ltype, hints);
                    return safe ? safe.toString() : null;
                }
            } catch (e) {
                return null;
            }
            return null;
        }
        function log(logger, tagName, attribName, oldValue, newValue) {
            if (
                (attribName ||
                    logger(tagName + ' removed', {
                        change: 'removed',
                        tagName: tagName,
                    }),
                oldValue !== newValue)
            ) {
                var changed = 'changed';
                oldValue && !newValue
                    ? (changed = 'removed')
                    : !oldValue && newValue && (changed = 'added'),
                    logger(tagName + '.' + attribName + ' ' + changed, {
                        change: changed,
                        tagName: tagName,
                        attribName: attribName,
                        oldValue: oldValue,
                        newValue: newValue,
                    });
            }
        }
        function lookupAttribute(map, tagName, attribName) {
            var attribKey;
            return (
                (attribKey = tagName + '::' + attribName),
                map.hasOwnProperty(attribKey)
                    ? map[attribKey]
                    : ((attribKey = '*::' + attribName),
                      map.hasOwnProperty(attribKey) ? map[attribKey] : void 0)
            );
        }
        function getLoaderType(tagName, attribName) {
            return lookupAttribute(html4.LOADERTYPES, tagName, attribName);
        }
        function getUriEffect(tagName, attribName) {
            return lookupAttribute(html4.URIEFFECTS, tagName, attribName);
        }
        function sanitizeAttribs(
            tagName,
            attribs,
            opt_naiveUriRewriter,
            opt_nmTokenPolicy,
            opt_logger
        ) {
            for (var i = 0; i < attribs.length; i += 2) {
                var attribKey,
                    attribName = attribs[i],
                    value = attribs[i + 1],
                    oldValue = value,
                    atype = null;
                if (
                    ((attribKey = tagName + '::' + attribName),
                    (html4.ATTRIBS.hasOwnProperty(attribKey) ||
                        ((attribKey = '*::' + attribName),
                        html4.ATTRIBS.hasOwnProperty(attribKey))) &&
                        (atype = html4.ATTRIBS[attribKey]),
                    null !== atype)
                )
                    switch (atype) {
                        case html4.atype.NONE:
                            break;
                        case html4.atype.SCRIPT:
                            (value = null),
                                opt_logger &&
                                    log(
                                        opt_logger,
                                        tagName,
                                        attribName,
                                        oldValue,
                                        value
                                    );
                            break;
                        case html4.atype.STYLE:
                            if (void 0 === parseCssDeclarations) {
                                (value = null),
                                    opt_logger &&
                                        log(
                                            opt_logger,
                                            tagName,
                                            attribName,
                                            oldValue,
                                            value
                                        );
                                break;
                            }
                            var sanitizedDeclarations = [];
                            parseCssDeclarations(value, {
                                declaration: function(property, tokens) {
                                    var normProp = property.toLowerCase();
                                    sanitizeCssProperty(
                                        normProp,
                                        tokens,
                                        opt_naiveUriRewriter
                                            ? function(url) {
                                                  return safeUri(
                                                      url,
                                                      html4.ueffects
                                                          .SAME_DOCUMENT,
                                                      html4.ltypes.SANDBOXED,
                                                      {
                                                          TYPE: 'CSS',
                                                          CSS_PROP: normProp,
                                                      },
                                                      opt_naiveUriRewriter
                                                  );
                                              }
                                            : null
                                    ),
                                        tokens.length &&
                                            sanitizedDeclarations.push(
                                                normProp +
                                                    ': ' +
                                                    tokens.join(' ')
                                            );
                                },
                            }),
                                (value =
                                    sanitizedDeclarations.length > 0
                                        ? sanitizedDeclarations.join(' ; ')
                                        : null),
                                opt_logger &&
                                    log(
                                        opt_logger,
                                        tagName,
                                        attribName,
                                        oldValue,
                                        value
                                    );
                            break;
                        case html4.atype.ID:
                        case html4.atype.IDREF:
                        case html4.atype.IDREFS:
                        case html4.atype.GLOBAL_NAME:
                        case html4.atype.LOCAL_NAME:
                        case html4.atype.CLASSES:
                            (value = opt_nmTokenPolicy
                                ? opt_nmTokenPolicy(value)
                                : value),
                                opt_logger &&
                                    log(
                                        opt_logger,
                                        tagName,
                                        attribName,
                                        oldValue,
                                        value
                                    );
                            break;
                        case html4.atype.URI:
                            (value = safeUri(
                                value,
                                getUriEffect(tagName, attribName),
                                getLoaderType(tagName, attribName),
                                {
                                    TYPE: 'MARKUP',
                                    XML_ATTR: attribName,
                                    XML_TAG: tagName,
                                },
                                opt_naiveUriRewriter
                            )),
                                opt_logger &&
                                    log(
                                        opt_logger,
                                        tagName,
                                        attribName,
                                        oldValue,
                                        value
                                    );
                            break;
                        case html4.atype.URI_FRAGMENT:
                            value && '#' === value.charAt(0)
                                ? ((value = value.substring(1)),
                                  null !==
                                      (value = opt_nmTokenPolicy
                                          ? opt_nmTokenPolicy(value)
                                          : value) &&
                                      void 0 !== value &&
                                      (value = '#' + value))
                                : (value = null),
                                opt_logger &&
                                    log(
                                        opt_logger,
                                        tagName,
                                        attribName,
                                        oldValue,
                                        value
                                    );
                            break;
                        default:
                            (value = null),
                                opt_logger &&
                                    log(
                                        opt_logger,
                                        tagName,
                                        attribName,
                                        oldValue,
                                        value
                                    );
                    }
                else
                    (value = null),
                        opt_logger &&
                            log(
                                opt_logger,
                                tagName,
                                attribName,
                                oldValue,
                                value
                            );
                attribs[i + 1] = value;
            }
            return attribs;
        }
        function makeTagPolicy(
            opt_naiveUriRewriter,
            opt_nmTokenPolicy,
            opt_logger
        ) {
            return function(tagName, attribs) {
                if (!(html4.ELEMENTS[tagName] & html4.eflags.UNSAFE))
                    return {
                        attribs: sanitizeAttribs(
                            tagName,
                            attribs,
                            opt_naiveUriRewriter,
                            opt_nmTokenPolicy,
                            opt_logger
                        ),
                    };
                opt_logger && log(opt_logger, tagName, void 0, void 0, void 0);
            };
        }
        function sanitizeWithPolicy(inputHtml, tagPolicy) {
            var outputArray = [];
            return (
                makeHtmlSanitizer(tagPolicy)(inputHtml, outputArray),
                outputArray.join('')
            );
        }
        var parseCssDeclarations, sanitizeCssProperty;
        'undefined' != typeof window &&
            ((parseCssDeclarations = window.parseCssDeclarations),
            (sanitizeCssProperty = window.sanitizeCssProperty),
            window.cssSchema);
        var ENTITIES = {
                lt: '<',
                LT: '<',
                gt: '>',
                GT: '>',
                amp: '&',
                AMP: '&',
                quot: '"',
                apos: "'",
                nbsp: ' ',
            },
            decimalEscapeRe = /^#(\d+)$/,
            hexEscapeRe = /^#x([0-9A-Fa-f]+)$/,
            safeEntityNameRe = /^[A-Za-z][A-za-z0-9]+$/,
            entityLookupElement =
                'undefined' != typeof window && window.document
                    ? window.document.createElement('textarea')
                    : null,
            nulRe = /\0/g,
            ENTITY_RE_1 = /&(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/g,
            ENTITY_RE_2 = /^(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/,
            ampRe = /&/g,
            looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi,
            ltRe = /[<]/g,
            gtRe = />/g,
            quotRe = /\"/g,
            ATTR_RE = new RegExp(
                '^\\s*([-.:\\w]+)(?:\\s*(=)\\s*((")[^"]*("|$)|(\')[^\']*(\'|$)|(?=[a-z][-\\w]*\\s*=)|[^"\'\\s]*))?',
                'i'
            ),
            splitWillCapture = 3 === 'a,b'.split(/(,)/).length,
            EFLAGS_TEXT = html4.eflags.CDATA | html4.eflags.RCDATA,
            continuationMarker = {},
            endTagRe = {},
            ALLOWED_URI_SCHEMES = /^(?:https?|mailto)$/i,
            html = {};
        return (
            (html.escapeAttrib = html.escapeAttrib = escapeAttrib),
            (html.makeHtmlSanitizer = html.makeHtmlSanitizer = makeHtmlSanitizer),
            (html.makeSaxParser = html.makeSaxParser = makeSaxParser),
            (html.makeTagPolicy = html.makeTagPolicy = makeTagPolicy),
            (html.normalizeRCData = html.normalizeRCData = normalizeRCData),
            (html.sanitize = html.sanitize = function(
                inputHtml,
                opt_naiveUriRewriter,
                opt_nmTokenPolicy,
                opt_logger
            ) {
                return sanitizeWithPolicy(
                    inputHtml,
                    makeTagPolicy(
                        opt_naiveUriRewriter,
                        opt_nmTokenPolicy,
                        opt_logger
                    )
                );
            }),
            (html.sanitizeAttribs = html.sanitizeAttribs = sanitizeAttribs),
            (html.sanitizeWithPolicy = html.sanitizeWithPolicy = sanitizeWithPolicy),
            (html.unescapeEntities = html.unescapeEntities = unescapeEntities),
            html
        );
    })(html4),
    html_sanitize = html.sanitize;
'undefined' != typeof window &&
    ((window.html = html), (window.html_sanitize = html_sanitize));
var Sanitizer = {};
(Sanitizer.escapeAttrib = html.escapeAttrib),
    (Sanitizer.makeHtmlSanitizer = html.makeHtmlSanitizer),
    (Sanitizer.makeSaxParser = html.makeSaxParser),
    (Sanitizer.makeTagPolicy = html.makeTagPolicy),
    (Sanitizer.normalizeRCData = html.normalizeRCData),
    (Sanitizer.sanitizeAttribs = html.sanitizeAttribs),
    (Sanitizer.sanitizeWithPolicy = html.sanitizeWithPolicy),
    (Sanitizer.unescapeEntities = html.unescapeEntities),
    (Sanitizer.escape = html.escapeAttrib),
    (Sanitizer.sanitize = function(
        inputHtml,
        opt_naiveUriRewriter,
        opt_nmTokenPolicy,
        opt_logger
    ) {
        return (
            'string' == typeof inputHtml &&
                (inputHtml = inputHtml.replace(
                    /<([a-zA-Z]+)([^>]*)\/>/g,
                    '<$1$2></$1>'
                )),
            inputHtml
                ? html.sanitize(
                      inputHtml,
                      opt_naiveUriRewriter,
                      opt_nmTokenPolicy,
                      opt_logger
                  )
                : inputHtml
        );
    }),
    void 0 !== exports
        ? (void 0 !== module &&
              module.exports &&
              (exports = module.exports = Sanitizer),
          (exports.Sanitizer = Sanitizer))
                    : (this.Sanitizer = Sanitizer);