///#source 1 1 /Scripts/modernizr-2.7.2.js
/*!
 * Modernizr v2.7.2
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.7.2',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   goo.gl/v3V4Gp
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /**
     * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
        /*jshint evil:true */
        /** version */
        var version = '3.7.0';

        /** Preset options */
        var options = window.html5 || {};

        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;

        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = '_html5shiv';

        /** The id for the the documents expando */
        var expanID = 0;

        /** Cached data for each document */
        var expandoData = {};

        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
            // assign a false positive if detection fails => unable to shiv
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

        /*--------------------------------------------------------------------------*/

        /**
         * Creates a style sheet with the given CSS text and adds it to the document.
         * @private
         * @param {Document} ownerDocument The document.
         * @param {String} cssText The CSS text.
         * @returns {StyleSheet} The style element.
         */
        function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

        /**
         * Returns the value of `html5.elements` as an array.
         * @private
         * @returns {Array} An array of shived element node names.
         */
        function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

        /**
         * Returns the data associated to the given document
         * @private
         * @param {Document} ownerDocument The document.
         * @returns {Object} An object of data.
         */
        function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

        /**
         * returns a shived element for the given nodeName and document
         * @memberOf html5
         * @param {String} nodeName name of the element
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived element.
         */
        function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

          // Avoid adding some elements to fragments in IE < 9 because
          // * Attributes like `name` or `type` cannot be set/changed once an element
          //   is inserted into a document/fragment
          // * Link elements with `src` attributes that are inaccessible, as with
          //   a 403 response, will cause the tab/window to crash
          // * Script elements appended to fragments will execute when their `src`
          //   or `text` property is set
          return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

        /**
         * returns a shived DocumentFragment for the given document
         * @memberOf html5
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived DocumentFragment.
         */
        function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

        /**
         * Shivs the `createElement` and `createDocumentFragment` methods of the document.
         * @private
         * @param {Document|DocumentFragment} ownerDocument The document.
         * @param {Object} data of the document.
         */
        function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                          // unroll the `createElement` calls
                                                          getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

        /*--------------------------------------------------------------------------*/

        /**
         * Shivs the given document.
         * @memberOf html5
         * @param {Document} ownerDocument The document to shiv.
         * @returns {Document} The shived document.
         */
        function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                          // corrects block display not defined in IE6/7/8/9
                                          'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                            // adds styling not present in IE6/7/8/9
                                            'mark{background:#FF0;color:#000}' +
                                            // hides non-rendered elements
                                            'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

        /*--------------------------------------------------------------------------*/

        /**
         * The `html5` object is exposed so that more elements can be shived and
         * existing shiving can be detected on iframes.
         * @type Object
         * @example
         *
         * // options can be changed before the script is included
         * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
         */
        var html5 = {

          /**
           * An array or space separated string of node names of the elements to shiv.
           * @memberOf html5
           * @type Array|String
           */
          'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

          /**
           * current version of html5shiv
           */
          'version': version,

          /**
           * A flag to indicate that the HTML5 style sheet should be inserted.
           * @memberOf html5
           * @type Boolean
           */
          'shivCSS': (options.shivCSS !== false),

          /**
           * Is equal to true if a browser supports creating unknown/HTML5 elements
           * @memberOf html5
           * @type boolean
           */
          'supportsUnknownElements': supportsUnknownElements,

          /**
           * A flag to indicate that the document's `createElement` and `createDocumentFragment`
           * methods should be overwritten.
           * @memberOf html5
           * @type Boolean
           */
          'shivMethods': (options.shivMethods !== false),

          /**
           * A string to describe the type of `html5` object ("default" or "default print").
           * @memberOf html5
           * @type String
           */
          'type': 'default',

          // shivs the document according to the specified `html5` object options
          'shivDocument': shivDocument,

          //creates a shived element
          createElement: createElement,

          //creates a shived documentFragment
          createDocumentFragment: createDocumentFragment
        };

        /*--------------------------------------------------------------------------*/

        // expose html5
        window.html5 = html5;

        // shiv the document
        shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

///#source 1 1 /Scripts/jquery-2.1.1.min.js
/*!
 * jQuery JavaScript Library v2.1.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-05-01T17:11Z
 */
(function(n,t){typeof module=="object"&&typeof module.exports=="object"?module.exports=n.document?t(n,!0):function(n){if(!n.document)throw new Error("jQuery requires a window with a document");return t(n)}:t(n)})(typeof window!="undefined"?window:this,function(n,t){function ui(n){var t=n.length,r=i.type(n);return r==="function"||i.isWindow(n)?!1:n.nodeType===1&&t?!0:r==="array"||t===0||typeof t=="number"&&t>0&&t-1 in n}function fi(n,t,r){if(i.isFunction(t))return i.grep(n,function(n,i){return!!t.call(n,i,n)!==r});if(t.nodeType)return i.grep(n,function(n){return n===t!==r});if(typeof t=="string"){if(ef.test(t))return i.filter(t,n,r);t=i.filter(t,n)}return i.grep(n,function(n){return et.call(t,n)>=0!==r})}function ur(n,t){while((n=n[t])&&n.nodeType!==1);return n}function of(n){var t=ei[n]={};return i.each(n.match(c)||[],function(n,i){t[i]=!0}),t}function ct(){u.removeEventListener("DOMContentLoaded",ct,!1);n.removeEventListener("load",ct,!1);i.ready()}function p(){Object.defineProperty(this.cache={},0,{get:function(){return{}}});this.expando=i.expando+Math.random()}function fr(n,t,r){var u;if(r===undefined&&n.nodeType===1)if(u="data-"+t.replace(hf,"-$1").toLowerCase(),r=n.getAttribute(u),typeof r=="string"){try{r=r==="true"?!0:r==="false"?!1:r==="null"?null:+r+""===r?+r:sf.test(r)?i.parseJSON(r):r}catch(f){}e.set(n,t,r)}else r=undefined;return r}function at(){return!0}function g(){return!1}function hr(){try{return u.activeElement}catch(n){}}function vr(n,t){return i.nodeName(n,"table")&&i.nodeName(t.nodeType!==11?t:t.firstChild,"tr")?n.getElementsByTagName("tbody")[0]||n.appendChild(n.ownerDocument.createElement("tbody")):n}function bf(n){return n.type=(n.getAttribute("type")!==null)+"/"+n.type,n}function kf(n){var t=pf.exec(n.type);return t?n.type=t[1]:n.removeAttribute("type"),n}function oi(n,t){for(var i=0,u=n.length;i<u;i++)r.set(n[i],"globalEval",!t||r.get(t[i],"globalEval"))}function yr(n,t){var f,c,o,s,h,l,a,u;if(t.nodeType===1){if(r.hasData(n)&&(s=r.access(n),h=r.set(t,s),u=s.events,u)){delete h.handle;h.events={};for(o in u)for(f=0,c=u[o].length;f<c;f++)i.event.add(t,o,u[o][f])}e.hasData(n)&&(l=e.access(n),a=i.extend({},l),e.set(t,a))}}function o(n,t){var r=n.getElementsByTagName?n.getElementsByTagName(t||"*"):n.querySelectorAll?n.querySelectorAll(t||"*"):[];return t===undefined||t&&i.nodeName(n,t)?i.merge([n],r):r}function df(n,t){var i=t.nodeName.toLowerCase();i==="input"&&er.test(n.type)?t.checked=n.checked:(i==="input"||i==="textarea")&&(t.defaultValue=n.defaultValue)}function pr(t,r){var f,u=i(r.createElement(t)).appendTo(r.body),e=n.getDefaultComputedStyle&&(f=n.getDefaultComputedStyle(u[0]))?f.display:i.css(u[0],"display");return u.detach(),e}function hi(n){var r=u,t=si[n];return t||(t=pr(n,r),t!=="none"&&t||(vt=(vt||i("<iframe frameborder='0' width='0' height='0'/>")).appendTo(r.documentElement),r=vt[0].contentDocument,r.write(),r.close(),t=pr(n,r),vt.detach()),si[n]=t),t}function rt(n,t,r){var e,o,s,u,f=n.style;return r=r||yt(n),r&&(u=r.getPropertyValue(t)||r[t]),r&&(u!==""||i.contains(n.ownerDocument,n)||(u=i.style(n,t)),ci.test(u)&&wr.test(t)&&(e=f.width,o=f.minWidth,s=f.maxWidth,f.minWidth=f.maxWidth=f.width=u,u=r.width,f.width=e,f.minWidth=o,f.maxWidth=s)),u!==undefined?u+"":u}function br(n,t){return{get:function(){if(n()){delete this.get;return}return(this.get=t).apply(this,arguments)}}}function gr(n,t){if(t in n)return t;for(var r=t[0].toUpperCase()+t.slice(1),u=t,i=dr.length;i--;)if(t=dr[i]+r,t in n)return t;return u}function nu(n,t,i){var r=ne.exec(t);return r?Math.max(0,r[1]-(i||0))+(r[2]||"px"):t}function tu(n,t,r,u,f){for(var e=r===(u?"border":"content")?4:t==="width"?1:0,o=0;e<4;e+=2)r==="margin"&&(o+=i.css(n,r+w[e],!0,f)),u?(r==="content"&&(o-=i.css(n,"padding"+w[e],!0,f)),r!=="margin"&&(o-=i.css(n,"border"+w[e]+"Width",!0,f))):(o+=i.css(n,"padding"+w[e],!0,f),r!=="padding"&&(o+=i.css(n,"border"+w[e]+"Width",!0,f)));return o}function iu(n,t,r){var o=!0,u=t==="width"?n.offsetWidth:n.offsetHeight,e=yt(n),s=i.css(n,"boxSizing",!1,e)==="border-box";if(u<=0||u==null){if(u=rt(n,t,e),(u<0||u==null)&&(u=n.style[t]),ci.test(u))return u;o=s&&(f.boxSizingReliable()||u===n.style[t]);u=parseFloat(u)||0}return u+tu(n,t,r||(s?"border":"content"),o,e)+"px"}function ru(n,t){for(var e,u,s,o=[],f=0,h=n.length;f<h;f++)(u=n[f],u.style)&&(o[f]=r.get(u,"olddisplay"),e=u.style.display,t?(o[f]||e!=="none"||(u.style.display=""),u.style.display===""&&it(u)&&(o[f]=r.access(u,"olddisplay",hi(u.nodeName)))):(s=it(u),e==="none"&&s||r.set(u,"olddisplay",s?e:i.css(u,"display"))));for(f=0;f<h;f++)(u=n[f],u.style)&&(t&&u.style.display!=="none"&&u.style.display!==""||(u.style.display=t?o[f]||"":"none"));return n}function s(n,t,i,r,u){return new s.prototype.init(n,t,i,r,u)}function fu(){return setTimeout(function(){nt=undefined}),nt=i.now()}function bt(n,t){var r,u=0,i={height:n};for(t=t?1:0;u<4;u+=2-t)r=w[u],i["margin"+r]=i["padding"+r]=n;return t&&(i.opacity=i.width=n),i}function eu(n,t,i){for(var u,f=(ut[t]||[]).concat(ut["*"]),r=0,e=f.length;r<e;r++)if(u=f[r].call(i,t,n))return u}function fe(n,t,u){var f,a,p,v,o,w,h,b,l=this,y={},s=n.style,c=n.nodeType&&it(n),e=r.get(n,"fxshow");u.queue||(o=i._queueHooks(n,"fx"),o.unqueued==null&&(o.unqueued=0,w=o.empty.fire,o.empty.fire=function(){o.unqueued||w()}),o.unqueued++,l.always(function(){l.always(function(){o.unqueued--;i.queue(n,"fx").length||o.empty.fire()})}));n.nodeType===1&&("height"in t||"width"in t)&&(u.overflow=[s.overflow,s.overflowX,s.overflowY],h=i.css(n,"display"),b=h==="none"?r.get(n,"olddisplay")||hi(n.nodeName):h,b==="inline"&&i.css(n,"float")==="none"&&(s.display="inline-block"));u.overflow&&(s.overflow="hidden",l.always(function(){s.overflow=u.overflow[0];s.overflowX=u.overflow[1];s.overflowY=u.overflow[2]}));for(f in t)if(a=t[f],re.exec(a)){if(delete t[f],p=p||a==="toggle",a===(c?"hide":"show"))if(a==="show"&&e&&e[f]!==undefined)c=!0;else continue;y[f]=e&&e[f]||i.style(n,f)}else h=undefined;if(i.isEmptyObject(y))(h==="none"?hi(n.nodeName):h)==="inline"&&(s.display=h);else{e?"hidden"in e&&(c=e.hidden):e=r.access(n,"fxshow",{});p&&(e.hidden=!c);c?i(n).show():l.done(function(){i(n).hide()});l.done(function(){var t;r.remove(n,"fxshow");for(t in y)i.style(n,t,y[t])});for(f in y)v=eu(c?e[f]:0,f,l),f in e||(e[f]=v.start,c&&(v.end=v.start,v.start=f==="width"||f==="height"?1:0))}}function ee(n,t){var r,f,e,u,o;for(r in n)if(f=i.camelCase(r),e=t[f],u=n[r],i.isArray(u)&&(e=u[1],u=n[r]=u[0]),r!==f&&(n[f]=u,delete n[r]),o=i.cssHooks[f],o&&"expand"in o){u=o.expand(u);delete n[f];for(r in u)r in n||(n[r]=u[r],t[r]=e)}else t[f]=e}function ou(n,t,r){var e,o,s=0,l=wt.length,f=i.Deferred().always(function(){delete c.elem}),c=function(){if(o)return!1;for(var s=nt||fu(),t=Math.max(0,u.startTime+u.duration-s),h=t/u.duration||0,i=1-h,r=0,e=u.tweens.length;r<e;r++)u.tweens[r].run(i);return f.notifyWith(n,[u,i,t]),i<1&&e?t:(f.resolveWith(n,[u]),!1)},u=f.promise({elem:n,props:i.extend({},t),opts:i.extend(!0,{specialEasing:{}},r),originalProperties:t,originalOptions:r,startTime:nt||fu(),duration:r.duration,tweens:[],createTween:function(t,r){var f=i.Tween(n,u.opts,t,r,u.opts.specialEasing[t]||u.opts.easing);return u.tweens.push(f),f},stop:function(t){var i=0,r=t?u.tweens.length:0;if(o)return this;for(o=!0;i<r;i++)u.tweens[i].run(1);return t?f.resolveWith(n,[u,t]):f.rejectWith(n,[u,t]),this}}),h=u.props;for(ee(h,u.opts.specialEasing);s<l;s++)if(e=wt[s].call(u,n,h,u.opts),e)return e;return i.map(h,eu,u),i.isFunction(u.opts.start)&&u.opts.start.call(n,u),i.fx.timer(i.extend(c,{elem:n,anim:u,queue:u.opts.queue})),u.progress(u.opts.progress).done(u.opts.done,u.opts.complete).fail(u.opts.fail).always(u.opts.always)}function pu(n){return function(t,r){typeof t!="string"&&(r=t,t="*");var u,f=0,e=t.toLowerCase().match(c)||[];if(i.isFunction(r))while(u=e[f++])u[0]==="+"?(u=u.slice(1)||"*",(n[u]=n[u]||[]).unshift(r)):(n[u]=n[u]||[]).push(r)}}function wu(n,t,r,u){function e(s){var h;return f[s]=!0,i.each(n[s]||[],function(n,i){var s=i(t,r,u);if(typeof s!="string"||o||f[s]){if(o)return!(h=s)}else return t.dataTypes.unshift(s),e(s),!1}),h}var f={},o=n===li;return e(t.dataTypes[0])||!f["*"]&&e("*")}function ai(n,t){var r,u,f=i.ajaxSettings.flatOptions||{};for(r in t)t[r]!==undefined&&((f[r]?n:u||(u={}))[r]=t[r]);return u&&i.extend(!0,n,u),n}function ae(n,t,i){for(var e,u,f,o,s=n.contents,r=n.dataTypes;r[0]==="*";)r.shift(),e===undefined&&(e=n.mimeType||t.getResponseHeader("Content-Type"));if(e)for(u in s)if(s[u]&&s[u].test(e)){r.unshift(u);break}if(r[0]in i)f=r[0];else{for(u in i){if(!r[0]||n.converters[u+" "+r[0]]){f=u;break}o||(o=u)}f=f||o}if(f)return f!==r[0]&&r.unshift(f),i[f]}function ve(n,t,i,r){var h,u,f,s,e,o={},c=n.dataTypes.slice();if(c[1])for(f in n.converters)o[f.toLowerCase()]=n.converters[f];for(u=c.shift();u;)if(n.responseFields[u]&&(i[n.responseFields[u]]=t),!e&&r&&n.dataFilter&&(t=n.dataFilter(t,n.dataType)),e=u,u=c.shift(),u)if(u==="*")u=e;else if(e!=="*"&&e!==u){if(f=o[e+" "+u]||o["* "+u],!f)for(h in o)if(s=h.split(" "),s[1]===u&&(f=o[e+" "+s[0]]||o["* "+s[0]],f)){f===!0?f=o[h]:o[h]!==!0&&(u=s[0],c.unshift(s[1]));break}if(f!==!0)if(f&&n.throws)t=f(t);else try{t=f(t)}catch(l){return{state:"parsererror",error:f?l:"No conversion from "+e+" to "+u}}}return{state:"success",data:t}}function vi(n,t,r,u){var f;if(i.isArray(t))i.each(t,function(t,i){r||pe.test(n)?u(n,i):vi(n+"["+(typeof i=="object"?t:"")+"]",i,r,u)});else if(r||i.type(t)!=="object")u(n,t);else for(f in t)vi(n+"["+f+"]",t[f],r,u)}function ku(n){return i.isWindow(n)?n:n.nodeType===9&&n.defaultView}var k=[],a=k.slice,bi=k.concat,ii=k.push,et=k.indexOf,ot={},nf=ot.toString,ri=ot.hasOwnProperty,f={},u=n.document,ki="2.1.1",i=function(n,t){return new i.fn.init(n,t)},tf=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,rf=/^-ms-/,uf=/-([\da-z])/gi,ff=function(n,t){return t.toUpperCase()},y,st,nr,tr,ir,rr,c,ei,ht,l,d,vt,si,oe,su,tt,hu,kt,cu,dt,gt,yi,ti,pi,wi,du,gu;i.fn=i.prototype={jquery:ki,constructor:i,selector:"",length:0,toArray:function(){return a.call(this)},get:function(n){return n!=null?n<0?this[n+this.length]:this[n]:a.call(this)},pushStack:function(n){var t=i.merge(this.constructor(),n);return t.prevObject=this,t.context=this.context,t},each:function(n,t){return i.each(this,n,t)},map:function(n){return this.pushStack(i.map(this,function(t,i){return n.call(t,i,t)}))},slice:function(){return this.pushStack(a.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(n){var i=this.length,t=+n+(n<0?i:0);return this.pushStack(t>=0&&t<i?[this[t]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:ii,sort:k.sort,splice:k.splice};i.extend=i.fn.extend=function(){var e,f,r,t,o,s,n=arguments[0]||{},u=1,c=arguments.length,h=!1;for(typeof n=="boolean"&&(h=n,n=arguments[u]||{},u++),typeof n=="object"||i.isFunction(n)||(n={}),u===c&&(n=this,u--);u<c;u++)if((e=arguments[u])!=null)for(f in e)(r=n[f],t=e[f],n!==t)&&(h&&t&&(i.isPlainObject(t)||(o=i.isArray(t)))?(o?(o=!1,s=r&&i.isArray(r)?r:[]):s=r&&i.isPlainObject(r)?r:{},n[f]=i.extend(h,s,t)):t!==undefined&&(n[f]=t));return n};i.extend({expando:"jQuery"+(ki+Math.random()).replace(/\D/g,""),isReady:!0,error:function(n){throw new Error(n);},noop:function(){},isFunction:function(n){return i.type(n)==="function"},isArray:Array.isArray,isWindow:function(n){return n!=null&&n===n.window},isNumeric:function(n){return!i.isArray(n)&&n-parseFloat(n)>=0},isPlainObject:function(n){return i.type(n)!=="object"||n.nodeType||i.isWindow(n)?!1:n.constructor&&!ri.call(n.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(n){for(var t in n)return!1;return!0},type:function(n){return n==null?n+"":typeof n=="object"||typeof n=="function"?ot[nf.call(n)]||"object":typeof n},globalEval:function(n){var t,r=eval;n=i.trim(n);n&&(n.indexOf("use strict")===1?(t=u.createElement("script"),t.text=n,u.head.appendChild(t).parentNode.removeChild(t)):r(n))},camelCase:function(n){return n.replace(rf,"ms-").replace(uf,ff)},nodeName:function(n,t){return n.nodeName&&n.nodeName.toLowerCase()===t.toLowerCase()},each:function(n,t,i){var u,r=0,f=n.length,e=ui(n);if(i){if(e){for(;r<f;r++)if(u=t.apply(n[r],i),u===!1)break}else for(r in n)if(u=t.apply(n[r],i),u===!1)break}else if(e){for(;r<f;r++)if(u=t.call(n[r],r,n[r]),u===!1)break}else for(r in n)if(u=t.call(n[r],r,n[r]),u===!1)break;return n},trim:function(n){return n==null?"":(n+"").replace(tf,"")},makeArray:function(n,t){var r=t||[];return n!=null&&(ui(Object(n))?i.merge(r,typeof n=="string"?[n]:n):ii.call(r,n)),r},inArray:function(n,t,i){return t==null?-1:et.call(t,n,i)},merge:function(n,t){for(var u=+t.length,i=0,r=n.length;i<u;i++)n[r++]=t[i];return n.length=r,n},grep:function(n,t,i){for(var u,f=[],r=0,e=n.length,o=!i;r<e;r++)u=!t(n[r],r),u!==o&&f.push(n[r]);return f},map:function(n,t,i){var u,r=0,e=n.length,o=ui(n),f=[];if(o)for(;r<e;r++)u=t(n[r],r,i),u!=null&&f.push(u);else for(r in n)u=t(n[r],r,i),u!=null&&f.push(u);return bi.apply([],f)},guid:1,proxy:function(n,t){var u,f,r;return(typeof t=="string"&&(u=n[t],t=n,n=u),!i.isFunction(n))?undefined:(f=a.call(arguments,2),r=function(){return n.apply(t||this,f.concat(a.call(arguments)))},r.guid=n.guid=n.guid||i.guid++,r)},now:Date.now,support:f});i.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(n,t){ot["[object "+t+"]"]=t.toLowerCase()});y=function(n){function r(n,t,i,r){var w,h,c,v,k,y,d,l,nt,g;if((t?t.ownerDocument||t:s)!==e&&p(t),t=t||e,i=i||[],!n||typeof n!="string")return i;if((v=t.nodeType)!==1&&v!==9)return[];if(a&&!r){if(w=sr.exec(n))if(c=w[1]){if(v===9)if(h=t.getElementById(c),h&&h.parentNode){if(h.id===c)return i.push(h),i}else return i;else if(t.ownerDocument&&(h=t.ownerDocument.getElementById(c))&&ot(t,h)&&h.id===c)return i.push(h),i}else{if(w[2])return b.apply(i,t.getElementsByTagName(n)),i;if((c=w[3])&&u.getElementsByClassName&&t.getElementsByClassName)return b.apply(i,t.getElementsByClassName(c)),i}if(u.qsa&&(!o||!o.test(n))){if(l=d=f,nt=t,g=v===9&&n,v===1&&t.nodeName.toLowerCase()!=="object"){for(y=et(n),(d=t.getAttribute("id"))?l=d.replace(hr,"\\$&"):t.setAttribute("id",l),l="[id='"+l+"'] ",k=y.length;k--;)y[k]=l+yt(y[k]);nt=gt.test(n)&&ii(t.parentNode)||t;g=y.join(",")}if(g)try{return b.apply(i,nt.querySelectorAll(g)),i}catch(tt){}finally{d||t.removeAttribute("id")}}}return si(n.replace(at,"$1"),t,i,r)}function ni(){function n(r,u){return i.push(r+" ")>t.cacheLength&&delete n[i.shift()],n[r+" "]=u}var i=[];return n}function h(n){return n[f]=!0,n}function c(n){var t=e.createElement("div");try{return!!n(t)}catch(i){return!1}finally{t.parentNode&&t.parentNode.removeChild(t);t=null}}function ti(n,i){for(var u=n.split("|"),r=n.length;r--;)t.attrHandle[u[r]]=i}function wi(n,t){var i=t&&n,r=i&&n.nodeType===1&&t.nodeType===1&&(~t.sourceIndex||ai)-(~n.sourceIndex||ai);if(r)return r;if(i)while(i=i.nextSibling)if(i===t)return-1;return n?1:-1}function cr(n){return function(t){var i=t.nodeName.toLowerCase();return i==="input"&&t.type===n}}function lr(n){return function(t){var i=t.nodeName.toLowerCase();return(i==="input"||i==="button")&&t.type===n}}function tt(n){return h(function(t){return t=+t,h(function(i,r){for(var u,f=n([],i.length,t),e=f.length;e--;)i[u=f[e]]&&(i[u]=!(r[u]=i[u]))})})}function ii(n){return n&&typeof n.getElementsByTagName!==ut&&n}function bi(){}function yt(n){for(var t=0,r=n.length,i="";t<r;t++)i+=n[t].value;return i}function ri(n,t,i){var r=t.dir,u=i&&r==="parentNode",e=ki++;return t.first?function(t,i,f){while(t=t[r])if(t.nodeType===1||u)return n(t,i,f)}:function(t,i,o){var s,h,c=[v,e];if(o){while(t=t[r])if((t.nodeType===1||u)&&n(t,i,o))return!0}else while(t=t[r])if(t.nodeType===1||u){if(h=t[f]||(t[f]={}),(s=h[r])&&s[0]===v&&s[1]===e)return c[2]=s[2];if(h[r]=c,c[2]=n(t,i,o))return!0}}}function ui(n){return n.length>1?function(t,i,r){for(var u=n.length;u--;)if(!n[u](t,i,r))return!1;return!0}:n[0]}function ar(n,t,i){for(var u=0,f=t.length;u<f;u++)r(n,t[u],i);return i}function pt(n,t,i,r,u){for(var e,o=[],f=0,s=n.length,h=t!=null;f<s;f++)(e=n[f])&&(!i||i(e,r,u))&&(o.push(e),h&&t.push(f));return o}function fi(n,t,i,r,u,e){return r&&!r[f]&&(r=fi(r)),u&&!u[f]&&(u=fi(u,e)),h(function(f,e,o,s){var l,c,a,p=[],y=[],w=e.length,k=f||ar(t||"*",o.nodeType?[o]:o,[]),v=n&&(f||!t)?pt(k,p,n,o,s):k,h=i?u||(f?n:w||r)?[]:e:v;if(i&&i(v,h,o,s),r)for(l=pt(h,y),r(l,[],o,s),c=l.length;c--;)(a=l[c])&&(h[y[c]]=!(v[y[c]]=a));if(f){if(u||n){if(u){for(l=[],c=h.length;c--;)(a=h[c])&&l.push(v[c]=a);u(null,h=[],l,s)}for(c=h.length;c--;)(a=h[c])&&(l=u?nt.call(f,a):p[c])>-1&&(f[l]=!(e[l]=a))}}else h=pt(h===e?h.splice(w,h.length):h),u?u(null,e,h,s):b.apply(e,h)})}function ei(n){for(var s,u,r,o=n.length,h=t.relative[n[0].type],c=h||t.relative[" "],i=h?1:0,l=ri(function(n){return n===s},c,!0),a=ri(function(n){return nt.call(s,n)>-1},c,!0),e=[function(n,t,i){return!h&&(i||t!==ct)||((s=t).nodeType?l(n,t,i):a(n,t,i))}];i<o;i++)if(u=t.relative[n[i].type])e=[ri(ui(e),u)];else{if(u=t.filter[n[i].type].apply(null,n[i].matches),u[f]){for(r=++i;r<o;r++)if(t.relative[n[r].type])break;return fi(i>1&&ui(e),i>1&&yt(n.slice(0,i-1).concat({value:n[i-2].type===" "?"*":""})).replace(at,"$1"),u,i<r&&ei(n.slice(i,r)),r<o&&ei(n=n.slice(r)),r<o&&yt(n))}e.push(u)}return ui(e)}function vr(n,i){var u=i.length>0,f=n.length>0,o=function(o,s,h,c,l){var y,d,w,k=0,a="0",g=o&&[],p=[],nt=ct,tt=o||f&&t.find.TAG("*",l),it=v+=nt==null?1:Math.random()||.1,rt=tt.length;for(l&&(ct=s!==e&&s);a!==rt&&(y=tt[a])!=null;a++){if(f&&y){for(d=0;w=n[d++];)if(w(y,s,h)){c.push(y);break}l&&(v=it)}u&&((y=!w&&y)&&k--,o&&g.push(y))}if(k+=a,u&&a!==k){for(d=0;w=i[d++];)w(g,p,s,h);if(o){if(k>0)while(a--)g[a]||p[a]||(p[a]=gi.call(c));p=pt(p)}b.apply(c,p);l&&!o&&p.length>0&&k+i.length>1&&r.uniqueSort(c)}return l&&(v=it,ct=nt),g};return u?h(o):o}var it,u,t,ht,oi,et,wt,si,ct,y,rt,p,e,l,a,o,g,lt,ot,f="sizzle"+-new Date,s=n.document,v=0,ki=0,hi=ni(),ci=ni(),li=ni(),bt=function(n,t){return n===t&&(rt=!0),0},ut=typeof undefined,ai=-2147483648,di={}.hasOwnProperty,w=[],gi=w.pop,nr=w.push,b=w.push,vi=w.slice,nt=w.indexOf||function(n){for(var t=0,i=this.length;t<i;t++)if(this[t]===n)return t;return-1},kt="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",i="[\\x20\\t\\r\\n\\f]",ft="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",yi=ft.replace("w","w#"),pi="\\["+i+"*("+ft+")(?:"+i+"*([*^$|!~]?=)"+i+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+yi+"))|)"+i+"*\\]",dt=":("+ft+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+pi+")*)|.*)\\)|)",at=new RegExp("^"+i+"+|((?:^|[^\\\\])(?:\\\\.)*)"+i+"+$","g"),tr=new RegExp("^"+i+"*,"+i+"*"),ir=new RegExp("^"+i+"*([>+~]|"+i+")"+i+"*"),rr=new RegExp("="+i+"*([^\\]'\"]*?)"+i+"*\\]","g"),ur=new RegExp(dt),fr=new RegExp("^"+yi+"$"),vt={ID:new RegExp("^#("+ft+")"),CLASS:new RegExp("^\\.("+ft+")"),TAG:new RegExp("^("+ft.replace("w","w*")+")"),ATTR:new RegExp("^"+pi),PSEUDO:new RegExp("^"+dt),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+i+"*(even|odd|(([+-]|)(\\d*)n|)"+i+"*(?:([+-]|)"+i+"*(\\d+)|))"+i+"*\\)|)","i"),bool:new RegExp("^(?:"+kt+")$","i"),needsContext:new RegExp("^"+i+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+i+"*((?:-\\d)?\\d*)"+i+"*\\)|)(?=[^-]|$)","i")},er=/^(?:input|select|textarea|button)$/i,or=/^h\d$/i,st=/^[^{]+\{\s*\[native \w/,sr=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,gt=/[+~]/,hr=/'|\\/g,k=new RegExp("\\\\([\\da-f]{1,6}"+i+"?|("+i+")|.)","ig"),d=function(n,t,i){var r="0x"+t-65536;return r!==r||i?t:r<0?String.fromCharCode(r+65536):String.fromCharCode(r>>10|55296,r&1023|56320)};try{b.apply(w=vi.call(s.childNodes),s.childNodes);w[s.childNodes.length].nodeType}catch(yr){b={apply:w.length?function(n,t){nr.apply(n,vi.call(t))}:function(n,t){for(var i=n.length,r=0;n[i++]=t[r++];);n.length=i-1}}}u=r.support={};oi=r.isXML=function(n){var t=n&&(n.ownerDocument||n).documentElement;return t?t.nodeName!=="HTML":!1};p=r.setDocument=function(n){var v,r=n?n.ownerDocument||n:s,h=r.defaultView;return r===e||r.nodeType!==9||!r.documentElement?e:(e=r,l=r.documentElement,a=!oi(r),h&&h!==h.top&&(h.addEventListener?h.addEventListener("unload",function(){p()},!1):h.attachEvent&&h.attachEvent("onunload",function(){p()})),u.attributes=c(function(n){return n.className="i",!n.getAttribute("className")}),u.getElementsByTagName=c(function(n){return n.appendChild(r.createComment("")),!n.getElementsByTagName("*").length}),u.getElementsByClassName=st.test(r.getElementsByClassName)&&c(function(n){return n.innerHTML="<div class='a'><\/div><div class='a i'><\/div>",n.firstChild.className="i",n.getElementsByClassName("i").length===2}),u.getById=c(function(n){return l.appendChild(n).id=f,!r.getElementsByName||!r.getElementsByName(f).length}),u.getById?(t.find.ID=function(n,t){if(typeof t.getElementById!==ut&&a){var i=t.getElementById(n);return i&&i.parentNode?[i]:[]}},t.filter.ID=function(n){var t=n.replace(k,d);return function(n){return n.getAttribute("id")===t}}):(delete t.find.ID,t.filter.ID=function(n){var t=n.replace(k,d);return function(n){var i=typeof n.getAttributeNode!==ut&&n.getAttributeNode("id");return i&&i.value===t}}),t.find.TAG=u.getElementsByTagName?function(n,t){if(typeof t.getElementsByTagName!==ut)return t.getElementsByTagName(n)}:function(n,t){var i,r=[],f=0,u=t.getElementsByTagName(n);if(n==="*"){while(i=u[f++])i.nodeType===1&&r.push(i);return r}return u},t.find.CLASS=u.getElementsByClassName&&function(n,t){if(typeof t.getElementsByClassName!==ut&&a)return t.getElementsByClassName(n)},g=[],o=[],(u.qsa=st.test(r.querySelectorAll))&&(c(function(n){n.innerHTML="<select msallowclip=''><option selected=''><\/option><\/select>";n.querySelectorAll("[msallowclip^='']").length&&o.push("[*^$]="+i+"*(?:''|\"\")");n.querySelectorAll("[selected]").length||o.push("\\["+i+"*(?:value|"+kt+")");n.querySelectorAll(":checked").length||o.push(":checked")}),c(function(n){var t=r.createElement("input");t.setAttribute("type","hidden");n.appendChild(t).setAttribute("name","D");n.querySelectorAll("[name=d]").length&&o.push("name"+i+"*[*^$|!~]?=");n.querySelectorAll(":enabled").length||o.push(":enabled",":disabled");n.querySelectorAll("*,:x");o.push(",.*:")})),(u.matchesSelector=st.test(lt=l.matches||l.webkitMatchesSelector||l.mozMatchesSelector||l.oMatchesSelector||l.msMatchesSelector))&&c(function(n){u.disconnectedMatch=lt.call(n,"div");lt.call(n,"[s!='']:x");g.push("!=",dt)}),o=o.length&&new RegExp(o.join("|")),g=g.length&&new RegExp(g.join("|")),v=st.test(l.compareDocumentPosition),ot=v||st.test(l.contains)?function(n,t){var r=n.nodeType===9?n.documentElement:n,i=t&&t.parentNode;return n===i||!!(i&&i.nodeType===1&&(r.contains?r.contains(i):n.compareDocumentPosition&&n.compareDocumentPosition(i)&16))}:function(n,t){if(t)while(t=t.parentNode)if(t===n)return!0;return!1},bt=v?function(n,t){if(n===t)return rt=!0,0;var i=!n.compareDocumentPosition-!t.compareDocumentPosition;return i?i:(i=(n.ownerDocument||n)===(t.ownerDocument||t)?n.compareDocumentPosition(t):1,i&1||!u.sortDetached&&t.compareDocumentPosition(n)===i)?n===r||n.ownerDocument===s&&ot(s,n)?-1:t===r||t.ownerDocument===s&&ot(s,t)?1:y?nt.call(y,n)-nt.call(y,t):0:i&4?-1:1}:function(n,t){if(n===t)return rt=!0,0;var i,u=0,o=n.parentNode,h=t.parentNode,f=[n],e=[t];if(o&&h){if(o===h)return wi(n,t)}else return n===r?-1:t===r?1:o?-1:h?1:y?nt.call(y,n)-nt.call(y,t):0;for(i=n;i=i.parentNode;)f.unshift(i);for(i=t;i=i.parentNode;)e.unshift(i);while(f[u]===e[u])u++;return u?wi(f[u],e[u]):f[u]===s?-1:e[u]===s?1:0},r)};r.matches=function(n,t){return r(n,null,null,t)};r.matchesSelector=function(n,t){if((n.ownerDocument||n)!==e&&p(n),t=t.replace(rr,"='$1']"),u.matchesSelector&&a&&(!g||!g.test(t))&&(!o||!o.test(t)))try{var i=lt.call(n,t);if(i||u.disconnectedMatch||n.document&&n.document.nodeType!==11)return i}catch(f){}return r(t,e,null,[n]).length>0};r.contains=function(n,t){return(n.ownerDocument||n)!==e&&p(n),ot(n,t)};r.attr=function(n,i){(n.ownerDocument||n)!==e&&p(n);var f=t.attrHandle[i.toLowerCase()],r=f&&di.call(t.attrHandle,i.toLowerCase())?f(n,i,!a):undefined;return r!==undefined?r:u.attributes||!a?n.getAttribute(i):(r=n.getAttributeNode(i))&&r.specified?r.value:null};r.error=function(n){throw new Error("Syntax error, unrecognized expression: "+n);};r.uniqueSort=function(n){var r,f=[],t=0,i=0;if(rt=!u.detectDuplicates,y=!u.sortStable&&n.slice(0),n.sort(bt),rt){while(r=n[i++])r===n[i]&&(t=f.push(i));while(t--)n.splice(f[t],1)}return y=null,n};ht=r.getText=function(n){var r,i="",u=0,t=n.nodeType;if(t){if(t===1||t===9||t===11){if(typeof n.textContent=="string")return n.textContent;for(n=n.firstChild;n;n=n.nextSibling)i+=ht(n)}else if(t===3||t===4)return n.nodeValue}else while(r=n[u++])i+=ht(r);return i};t=r.selectors={cacheLength:50,createPseudo:h,match:vt,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(n){return n[1]=n[1].replace(k,d),n[3]=(n[3]||n[4]||n[5]||"").replace(k,d),n[2]==="~="&&(n[3]=" "+n[3]+" "),n.slice(0,4)},CHILD:function(n){return n[1]=n[1].toLowerCase(),n[1].slice(0,3)==="nth"?(n[3]||r.error(n[0]),n[4]=+(n[4]?n[5]+(n[6]||1):2*(n[3]==="even"||n[3]==="odd")),n[5]=+(n[7]+n[8]||n[3]==="odd")):n[3]&&r.error(n[0]),n},PSEUDO:function(n){var i,t=!n[6]&&n[2];return vt.CHILD.test(n[0])?null:(n[3]?n[2]=n[4]||n[5]||"":t&&ur.test(t)&&(i=et(t,!0))&&(i=t.indexOf(")",t.length-i)-t.length)&&(n[0]=n[0].slice(0,i),n[2]=t.slice(0,i)),n.slice(0,3))}},filter:{TAG:function(n){var t=n.replace(k,d).toLowerCase();return n==="*"?function(){return!0}:function(n){return n.nodeName&&n.nodeName.toLowerCase()===t}},CLASS:function(n){var t=hi[n+" "];return t||(t=new RegExp("(^|"+i+")"+n+"("+i+"|$)"))&&hi(n,function(n){return t.test(typeof n.className=="string"&&n.className||typeof n.getAttribute!==ut&&n.getAttribute("class")||"")})},ATTR:function(n,t,i){return function(u){var f=r.attr(u,n);return f==null?t==="!=":t?(f+="",t==="="?f===i:t==="!="?f!==i:t==="^="?i&&f.indexOf(i)===0:t==="*="?i&&f.indexOf(i)>-1:t==="$="?i&&f.slice(-i.length)===i:t==="~="?(" "+f+" ").indexOf(i)>-1:t==="|="?f===i||f.slice(0,i.length+1)===i+"-":!1):!0}},CHILD:function(n,t,i,r,u){var s=n.slice(0,3)!=="nth",o=n.slice(-4)!=="last",e=t==="of-type";return r===1&&u===0?function(n){return!!n.parentNode}:function(t,i,h){var a,k,c,l,y,w,b=s!==o?"nextSibling":"previousSibling",p=t.parentNode,g=e&&t.nodeName.toLowerCase(),d=!h&&!e;if(p){if(s){while(b){for(c=t;c=c[b];)if(e?c.nodeName.toLowerCase()===g:c.nodeType===1)return!1;w=b=n==="only"&&!w&&"nextSibling"}return!0}if(w=[o?p.firstChild:p.lastChild],o&&d){for(k=p[f]||(p[f]={}),a=k[n]||[],y=a[0]===v&&a[1],l=a[0]===v&&a[2],c=y&&p.childNodes[y];c=++y&&c&&c[b]||(l=y=0)||w.pop();)if(c.nodeType===1&&++l&&c===t){k[n]=[v,y,l];break}}else if(d&&(a=(t[f]||(t[f]={}))[n])&&a[0]===v)l=a[1];else while(c=++y&&c&&c[b]||(l=y=0)||w.pop())if((e?c.nodeName.toLowerCase()===g:c.nodeType===1)&&++l&&(d&&((c[f]||(c[f]={}))[n]=[v,l]),c===t))break;return l-=u,l===r||l%r==0&&l/r>=0}}},PSEUDO:function(n,i){var e,u=t.pseudos[n]||t.setFilters[n.toLowerCase()]||r.error("unsupported pseudo: "+n);return u[f]?u(i):u.length>1?(e=[n,n,"",i],t.setFilters.hasOwnProperty(n.toLowerCase())?h(function(n,t){for(var r,f=u(n,i),e=f.length;e--;)r=nt.call(n,f[e]),n[r]=!(t[r]=f[e])}):function(n){return u(n,0,e)}):u}},pseudos:{not:h(function(n){var i=[],r=[],t=wt(n.replace(at,"$1"));return t[f]?h(function(n,i,r,u){for(var e,o=t(n,null,u,[]),f=n.length;f--;)(e=o[f])&&(n[f]=!(i[f]=e))}):function(n,u,f){return i[0]=n,t(i,null,f,r),!r.pop()}}),has:h(function(n){return function(t){return r(n,t).length>0}}),contains:h(function(n){return function(t){return(t.textContent||t.innerText||ht(t)).indexOf(n)>-1}}),lang:h(function(n){return fr.test(n||"")||r.error("unsupported lang: "+n),n=n.replace(k,d).toLowerCase(),function(t){var i;do if(i=a?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return i=i.toLowerCase(),i===n||i.indexOf(n+"-")===0;while((t=t.parentNode)&&t.nodeType===1);return!1}}),target:function(t){var i=n.location&&n.location.hash;return i&&i.slice(1)===t.id},root:function(n){return n===l},focus:function(n){return n===e.activeElement&&(!e.hasFocus||e.hasFocus())&&!!(n.type||n.href||~n.tabIndex)},enabled:function(n){return n.disabled===!1},disabled:function(n){return n.disabled===!0},checked:function(n){var t=n.nodeName.toLowerCase();return t==="input"&&!!n.checked||t==="option"&&!!n.selected},selected:function(n){return n.parentNode&&n.parentNode.selectedIndex,n.selected===!0},empty:function(n){for(n=n.firstChild;n;n=n.nextSibling)if(n.nodeType<6)return!1;return!0},parent:function(n){return!t.pseudos.empty(n)},header:function(n){return or.test(n.nodeName)},input:function(n){return er.test(n.nodeName)},button:function(n){var t=n.nodeName.toLowerCase();return t==="input"&&n.type==="button"||t==="button"},text:function(n){var t;return n.nodeName.toLowerCase()==="input"&&n.type==="text"&&((t=n.getAttribute("type"))==null||t.toLowerCase()==="text")},first:tt(function(){return[0]}),last:tt(function(n,t){return[t-1]}),eq:tt(function(n,t,i){return[i<0?i+t:i]}),even:tt(function(n,t){for(var i=0;i<t;i+=2)n.push(i);return n}),odd:tt(function(n,t){for(var i=1;i<t;i+=2)n.push(i);return n}),lt:tt(function(n,t,i){for(var r=i<0?i+t:i;--r>=0;)n.push(r);return n}),gt:tt(function(n,t,i){for(var r=i<0?i+t:i;++r<t;)n.push(r);return n})}};t.pseudos.nth=t.pseudos.eq;for(it in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})t.pseudos[it]=cr(it);for(it in{submit:!0,reset:!0})t.pseudos[it]=lr(it);return bi.prototype=t.filters=t.pseudos,t.setFilters=new bi,et=r.tokenize=function(n,i){var e,f,s,o,u,h,c,l=ci[n+" "];if(l)return i?0:l.slice(0);for(u=n,h=[],c=t.preFilter;u;){(!e||(f=tr.exec(u)))&&(f&&(u=u.slice(f[0].length)||u),h.push(s=[]));e=!1;(f=ir.exec(u))&&(e=f.shift(),s.push({value:e,type:f[0].replace(at," ")}),u=u.slice(e.length));for(o in t.filter)(f=vt[o].exec(u))&&(!c[o]||(f=c[o](f)))&&(e=f.shift(),s.push({value:e,type:o,matches:f}),u=u.slice(e.length));if(!e)break}return i?u.length:u?r.error(n):ci(n,h).slice(0)},wt=r.compile=function(n,t){var r,u=[],e=[],i=li[n+" "];if(!i){for(t||(t=et(n)),r=t.length;r--;)i=ei(t[r]),i[f]?u.push(i):e.push(i);i=li(n,vr(e,u));i.selector=n}return i},si=r.select=function(n,i,r,f){var s,e,o,l,v,c=typeof n=="function"&&n,h=!f&&et(n=c.selector||n);if(r=r||[],h.length===1){if(e=h[0]=h[0].slice(0),e.length>2&&(o=e[0]).type==="ID"&&u.getById&&i.nodeType===9&&a&&t.relative[e[1].type]){if(i=(t.find.ID(o.matches[0].replace(k,d),i)||[])[0],i)c&&(i=i.parentNode);else return r;n=n.slice(e.shift().value.length)}for(s=vt.needsContext.test(n)?0:e.length;s--;){if(o=e[s],t.relative[l=o.type])break;if((v=t.find[l])&&(f=v(o.matches[0].replace(k,d),gt.test(e[0].type)&&ii(i.parentNode)||i))){if(e.splice(s,1),n=f.length&&yt(e),!n)return b.apply(r,f),r;break}}}return(c||wt(n,h))(f,i,!a,r,gt.test(n)&&ii(i.parentNode)||i),r},u.sortStable=f.split("").sort(bt).join("")===f,u.detectDuplicates=!!rt,p(),u.sortDetached=c(function(n){return n.compareDocumentPosition(e.createElement("div"))&1}),c(function(n){return n.innerHTML="<a href='#'><\/a>",n.firstChild.getAttribute("href")==="#"})||ti("type|href|height|width",function(n,t,i){if(!i)return n.getAttribute(t,t.toLowerCase()==="type"?1:2)}),u.attributes&&c(function(n){return n.innerHTML="<input/>",n.firstChild.setAttribute("value",""),n.firstChild.getAttribute("value")===""})||ti("value",function(n,t,i){if(!i&&n.nodeName.toLowerCase()==="input")return n.defaultValue}),c(function(n){return n.getAttribute("disabled")==null})||ti(kt,function(n,t,i){var r;if(!i)return n[t]===!0?t.toLowerCase():(r=n.getAttributeNode(t))&&r.specified?r.value:null}),r}(n);i.find=y;i.expr=y.selectors;i.expr[":"]=i.expr.pseudos;i.unique=y.uniqueSort;i.text=y.getText;i.isXMLDoc=y.isXML;i.contains=y.contains;var di=i.expr.match.needsContext,gi=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,ef=/^.[^:#\[\.,]*$/;i.filter=function(n,t,r){var u=t[0];return r&&(n=":not("+n+")"),t.length===1&&u.nodeType===1?i.find.matchesSelector(u,n)?[u]:[]:i.find.matches(n,i.grep(t,function(n){return n.nodeType===1}))};i.fn.extend({find:function(n){var t,u=this.length,r=[],f=this;if(typeof n!="string")return this.pushStack(i(n).filter(function(){for(t=0;t<u;t++)if(i.contains(f[t],this))return!0}));for(t=0;t<u;t++)i.find(n,f[t],r);return r=this.pushStack(u>1?i.unique(r):r),r.selector=this.selector?this.selector+" "+n:n,r},filter:function(n){return this.pushStack(fi(this,n||[],!1))},not:function(n){return this.pushStack(fi(this,n||[],!0))},is:function(n){return!!fi(this,typeof n=="string"&&di.test(n)?i(n):n||[],!1).length}});nr=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;tr=i.fn.init=function(n,t){var r,f;if(!n)return this;if(typeof n=="string"){if(r=n[0]==="<"&&n[n.length-1]===">"&&n.length>=3?[null,n,null]:nr.exec(n),r&&(r[1]||!t)){if(r[1]){if(t=t instanceof i?t[0]:t,i.merge(this,i.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:u,!0)),gi.test(r[1])&&i.isPlainObject(t))for(r in t)i.isFunction(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return f=u.getElementById(r[2]),f&&f.parentNode&&(this.length=1,this[0]=f),this.context=u,this.selector=n,this}return!t||t.jquery?(t||st).find(n):this.constructor(t).find(n)}return n.nodeType?(this.context=this[0]=n,this.length=1,this):i.isFunction(n)?typeof st.ready!="undefined"?st.ready(n):n(i):(n.selector!==undefined&&(this.selector=n.selector,this.context=n.context),i.makeArray(n,this))};tr.prototype=i.fn;st=i(u);ir=/^(?:parents|prev(?:Until|All))/;rr={children:!0,contents:!0,next:!0,prev:!0};i.extend({dir:function(n,t,r){for(var u=[],f=r!==undefined;(n=n[t])&&n.nodeType!==9;)if(n.nodeType===1){if(f&&i(n).is(r))break;u.push(n)}return u},sibling:function(n,t){for(var i=[];n;n=n.nextSibling)n.nodeType===1&&n!==t&&i.push(n);return i}});i.fn.extend({has:function(n){var t=i(n,this),r=t.length;return this.filter(function(){for(var n=0;n<r;n++)if(i.contains(this,t[n]))return!0})},closest:function(n,t){for(var r,f=0,o=this.length,u=[],e=di.test(n)||typeof n!="string"?i(n,t||this.context):0;f<o;f++)for(r=this[f];r&&r!==t;r=r.parentNode)if(r.nodeType<11&&(e?e.index(r)>-1:r.nodeType===1&&i.find.matchesSelector(r,n))){u.push(r);break}return this.pushStack(u.length>1?i.unique(u):u)},index:function(n){return n?typeof n=="string"?et.call(i(n),this[0]):et.call(this,n.jquery?n[0]:n):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(n,t){return this.pushStack(i.unique(i.merge(this.get(),i(n,t))))},addBack:function(n){return this.add(n==null?this.prevObject:this.prevObject.filter(n))}});i.each({parent:function(n){var t=n.parentNode;return t&&t.nodeType!==11?t:null},parents:function(n){return i.dir(n,"parentNode")},parentsUntil:function(n,t,r){return i.dir(n,"parentNode",r)},next:function(n){return ur(n,"nextSibling")},prev:function(n){return ur(n,"previousSibling")},nextAll:function(n){return i.dir(n,"nextSibling")},prevAll:function(n){return i.dir(n,"previousSibling")},nextUntil:function(n,t,r){return i.dir(n,"nextSibling",r)},prevUntil:function(n,t,r){return i.dir(n,"previousSibling",r)},siblings:function(n){return i.sibling((n.parentNode||{}).firstChild,n)},children:function(n){return i.sibling(n.firstChild)},contents:function(n){return n.contentDocument||i.merge([],n.childNodes)}},function(n,t){i.fn[n]=function(r,u){var f=i.map(this,t,r);return n.slice(-5)!=="Until"&&(u=r),u&&typeof u=="string"&&(f=i.filter(u,f)),this.length>1&&(rr[n]||i.unique(f),ir.test(n)&&f.reverse()),this.pushStack(f)}});c=/\S+/g;ei={};i.Callbacks=function(n){n=typeof n=="string"?ei[n]||of(n):i.extend({},n);var u,h,o,c,f,e,t=[],r=!n.once&&[],l=function(i){for(u=n.memory&&i,h=!0,e=c||0,c=0,f=t.length,o=!0;t&&e<f;e++)if(t[e].apply(i[0],i[1])===!1&&n.stopOnFalse){u=!1;break}o=!1;t&&(r?r.length&&l(r.shift()):u?t=[]:s.disable())},s={add:function(){if(t){var r=t.length;(function e(r){i.each(r,function(r,u){var f=i.type(u);f==="function"?n.unique&&s.has(u)||t.push(u):u&&u.length&&f!=="string"&&e(u)})})(arguments);o?f=t.length:u&&(c=r,l(u))}return this},remove:function(){return t&&i.each(arguments,function(n,r){for(var u;(u=i.inArray(r,t,u))>-1;)t.splice(u,1),o&&(u<=f&&f--,u<=e&&e--)}),this},has:function(n){return n?i.inArray(n,t)>-1:!!(t&&t.length)},empty:function(){return t=[],f=0,this},disable:function(){return t=r=u=undefined,this},disabled:function(){return!t},lock:function(){return r=undefined,u||s.disable(),this},locked:function(){return!r},fireWith:function(n,i){return t&&(!h||r)&&(i=i||[],i=[n,i.slice?i.slice():i],o?r.push(i):l(i)),this},fire:function(){return s.fireWith(this,arguments),this},fired:function(){return!!h}};return s};i.extend({Deferred:function(n){var u=[["resolve","done",i.Callbacks("once memory"),"resolved"],["reject","fail",i.Callbacks("once memory"),"rejected"],["notify","progress",i.Callbacks("memory")]],f="pending",r={state:function(){return f},always:function(){return t.done(arguments).fail(arguments),this},then:function(){var n=arguments;return i.Deferred(function(f){i.each(u,function(u,e){var o=i.isFunction(n[u])&&n[u];t[e[1]](function(){var n=o&&o.apply(this,arguments);n&&i.isFunction(n.promise)?n.promise().done(f.resolve).fail(f.reject).progress(f.notify):f[e[0]+"With"](this===r?f.promise():this,o?[n]:arguments)})});n=null}).promise()},promise:function(n){return n!=null?i.extend(n,r):r}},t={};return r.pipe=r.then,i.each(u,function(n,i){var e=i[2],o=i[3];r[i[1]]=e.add;o&&e.add(function(){f=o},u[n^1][2].disable,u[2][2].lock);t[i[0]]=function(){return t[i[0]+"With"](this===t?r:this,arguments),this};t[i[0]+"With"]=e.fireWith}),r.promise(t),n&&n.call(t,t),t},when:function(n){var t=0,u=a.call(arguments),r=u.length,e=r!==1||n&&i.isFunction(n.promise)?r:0,f=e===1?n:i.Deferred(),h=function(n,t,i){return function(r){t[n]=this;i[n]=arguments.length>1?a.call(arguments):r;i===o?f.notifyWith(t,i):--e||f.resolveWith(t,i)}},o,c,s;if(r>1)for(o=new Array(r),c=new Array(r),s=new Array(r);t<r;t++)u[t]&&i.isFunction(u[t].promise)?u[t].promise().done(h(t,s,u)).fail(f.reject).progress(h(t,c,o)):--e;return e||f.resolveWith(s,u),f.promise()}});i.fn.ready=function(n){return i.ready.promise().done(n),this};i.extend({isReady:!1,readyWait:1,holdReady:function(n){n?i.readyWait++:i.ready(!0)},ready:function(n){(n===!0?--i.readyWait:i.isReady)||(i.isReady=!0,n!==!0&&--i.readyWait>0)||(ht.resolveWith(u,[i]),i.fn.triggerHandler&&(i(u).triggerHandler("ready"),i(u).off("ready")))}});i.ready.promise=function(t){return ht||(ht=i.Deferred(),u.readyState==="complete"?setTimeout(i.ready):(u.addEventListener("DOMContentLoaded",ct,!1),n.addEventListener("load",ct,!1))),ht.promise(t)};i.ready.promise();l=i.access=function(n,t,r,u,f,e,o){var s=0,c=n.length,h=r==null;if(i.type(r)==="object"){f=!0;for(s in r)i.access(n,t,s,r[s],!0,e,o)}else if(u!==undefined&&(f=!0,i.isFunction(u)||(o=!0),h&&(o?(t.call(n,u),t=null):(h=t,t=function(n,t,r){return h.call(i(n),r)})),t))for(;s<c;s++)t(n[s],r,o?u:u.call(n[s],s,t(n[s],r)));return f?n:h?t.call(n):c?t(n[0],r):e};i.acceptData=function(n){return n.nodeType===1||n.nodeType===9||!+n.nodeType};p.uid=1;p.accepts=i.acceptData;p.prototype={key:function(n){if(!p.accepts(n))return 0;var r={},t=n[this.expando];if(!t){t=p.uid++;try{r[this.expando]={value:t};Object.defineProperties(n,r)}catch(u){r[this.expando]=t;i.extend(n,r)}}return this.cache[t]||(this.cache[t]={}),t},set:function(n,t,r){var f,e=this.key(n),u=this.cache[e];if(typeof t=="string")u[t]=r;else if(i.isEmptyObject(u))i.extend(this.cache[e],t);else for(f in t)u[f]=t[f];return u},get:function(n,t){var i=this.cache[this.key(n)];return t===undefined?i:i[t]},access:function(n,t,r){var u;return t===undefined||t&&typeof t=="string"&&r===undefined?(u=this.get(n,t),u!==undefined?u:this.get(n,i.camelCase(t))):(this.set(n,t,r),r!==undefined?r:t)},remove:function(n,t){var u,r,f,o=this.key(n),e=this.cache[o];if(t===undefined)this.cache[o]={};else for(i.isArray(t)?r=t.concat(t.map(i.camelCase)):(f=i.camelCase(t),t in e?r=[t,f]:(r=f,r=r in e?[r]:r.match(c)||[])),u=r.length;u--;)delete e[r[u]]},hasData:function(n){return!i.isEmptyObject(this.cache[n[this.expando]]||{})},discard:function(n){n[this.expando]&&delete this.cache[n[this.expando]]}};var r=new p,e=new p,sf=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,hf=/([A-Z])/g;i.extend({hasData:function(n){return e.hasData(n)||r.hasData(n)},data:function(n,t,i){return e.access(n,t,i)},removeData:function(n,t){e.remove(n,t)},_data:function(n,t,i){return r.access(n,t,i)},_removeData:function(n,t){r.remove(n,t)}});i.fn.extend({data:function(n,t){var o,f,s,u=this[0],h=u&&u.attributes;if(n===undefined){if(this.length&&(s=e.get(u),u.nodeType===1&&!r.get(u,"hasDataAttrs"))){for(o=h.length;o--;)h[o]&&(f=h[o].name,f.indexOf("data-")===0&&(f=i.camelCase(f.slice(5)),fr(u,f,s[f])));r.set(u,"hasDataAttrs",!0)}return s}return typeof n=="object"?this.each(function(){e.set(this,n)}):l(this,function(t){var r,f=i.camelCase(n);if(u&&t===undefined)return(r=e.get(u,n),r!==undefined)?r:(r=e.get(u,f),r!==undefined)?r:(r=fr(u,f,undefined),r!==undefined)?r:void 0;this.each(function(){var i=e.get(this,f);e.set(this,f,t);n.indexOf("-")!==-1&&i!==undefined&&e.set(this,n,t)})},null,t,arguments.length>1,null,!0)},removeData:function(n){return this.each(function(){e.remove(this,n)})}});i.extend({queue:function(n,t,u){var f;if(n)return t=(t||"fx")+"queue",f=r.get(n,t),u&&(!f||i.isArray(u)?f=r.access(n,t,i.makeArray(u)):f.push(u)),f||[]},dequeue:function(n,t){t=t||"fx";var r=i.queue(n,t),e=r.length,u=r.shift(),f=i._queueHooks(n,t),o=function(){i.dequeue(n,t)};u==="inprogress"&&(u=r.shift(),e--);u&&(t==="fx"&&r.unshift("inprogress"),delete f.stop,u.call(n,o,f));!e&&f&&f.empty.fire()},_queueHooks:function(n,t){var u=t+"queueHooks";return r.get(n,u)||r.access(n,u,{empty:i.Callbacks("once memory").add(function(){r.remove(n,[t+"queue",u])})})}});i.fn.extend({queue:function(n,t){var r=2;return(typeof n!="string"&&(t=n,n="fx",r--),arguments.length<r)?i.queue(this[0],n):t===undefined?this:this.each(function(){var r=i.queue(this,n,t);i._queueHooks(this,n);n==="fx"&&r[0]!=="inprogress"&&i.dequeue(this,n)})},dequeue:function(n){return this.each(function(){i.dequeue(this,n)})},clearQueue:function(n){return this.queue(n||"fx",[])},promise:function(n,t){var u,e=1,o=i.Deferred(),f=this,s=this.length,h=function(){--e||o.resolveWith(f,[f])};for(typeof n!="string"&&(t=n,n=undefined),n=n||"fx";s--;)u=r.get(f[s],n+"queueHooks"),u&&u.empty&&(e++,u.empty.add(h));return h(),o.promise(t)}});var lt=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,w=["Top","Right","Bottom","Left"],it=function(n,t){return n=t||n,i.css(n,"display")==="none"||!i.contains(n.ownerDocument,n)},er=/^(?:checkbox|radio)$/i;(function(){var i=u.createDocumentFragment(),n=i.appendChild(u.createElement("div")),t=u.createElement("input");t.setAttribute("type","radio");t.setAttribute("checked","checked");t.setAttribute("name","t");n.appendChild(t);f.checkClone=n.cloneNode(!0).cloneNode(!0).lastChild.checked;n.innerHTML="<textarea>x<\/textarea>";f.noCloneChecked=!!n.cloneNode(!0).lastChild.defaultValue})();d=typeof undefined;f.focusinBubbles="onfocusin"in n;var cf=/^key/,lf=/^(?:mouse|pointer|contextmenu)|click/,or=/^(?:focusinfocus|focusoutblur)$/,sr=/^([^.]*)(?:\.(.+)|)$/;i.event={global:{},add:function(n,t,u,f,e){var v,y,w,p,b,h,s,l,o,k,g,a=r.get(n);if(a)for(u.handler&&(v=u,u=v.handler,e=v.selector),u.guid||(u.guid=i.guid++),(p=a.events)||(p=a.events={}),(y=a.handle)||(y=a.handle=function(t){return typeof i!==d&&i.event.triggered!==t.type?i.event.dispatch.apply(n,arguments):undefined}),t=(t||"").match(c)||[""],b=t.length;b--;)(w=sr.exec(t[b])||[],o=g=w[1],k=(w[2]||"").split(".").sort(),o)&&(s=i.event.special[o]||{},o=(e?s.delegateType:s.bindType)||o,s=i.event.special[o]||{},h=i.extend({type:o,origType:g,data:f,handler:u,guid:u.guid,selector:e,needsContext:e&&i.expr.match.needsContext.test(e),namespace:k.join(".")},v),(l=p[o])||(l=p[o]=[],l.delegateCount=0,s.setup&&s.setup.call(n,f,k,y)!==!1||n.addEventListener&&n.addEventListener(o,y,!1)),s.add&&(s.add.call(n,h),h.handler.guid||(h.handler.guid=u.guid)),e?l.splice(l.delegateCount++,0,h):l.push(h),i.event.global[o]=!0)},remove:function(n,t,u,f,e){var p,k,h,v,w,s,l,a,o,b,d,y=r.hasData(n)&&r.get(n);if(y&&(v=y.events)){for(t=(t||"").match(c)||[""],w=t.length;w--;){if(h=sr.exec(t[w])||[],o=d=h[1],b=(h[2]||"").split(".").sort(),!o){for(o in v)i.event.remove(n,o+t[w],u,f,!0);continue}for(l=i.event.special[o]||{},o=(f?l.delegateType:l.bindType)||o,a=v[o]||[],h=h[2]&&new RegExp("(^|\\.)"+b.join("\\.(?:.*\\.|)")+"(\\.|$)"),k=p=a.length;p--;)s=a[p],(e||d===s.origType)&&(!u||u.guid===s.guid)&&(!h||h.test(s.namespace))&&(!f||f===s.selector||f==="**"&&s.selector)&&(a.splice(p,1),s.selector&&a.delegateCount--,l.remove&&l.remove.call(n,s));k&&!a.length&&(l.teardown&&l.teardown.call(n,b,y.handle)!==!1||i.removeEvent(n,o,y.handle),delete v[o])}i.isEmptyObject(v)&&(delete y.handle,r.remove(n,"events"))}},trigger:function(t,f,e,o){var w,s,c,b,a,v,l,p=[e||u],h=ri.call(t,"type")?t.type:t,y=ri.call(t,"namespace")?t.namespace.split("."):[];if((s=c=e=e||u,e.nodeType!==3&&e.nodeType!==8)&&!or.test(h+i.event.triggered)&&(h.indexOf(".")>=0&&(y=h.split("."),h=y.shift(),y.sort()),a=h.indexOf(":")<0&&"on"+h,t=t[i.expando]?t:new i.Event(h,typeof t=="object"&&t),t.isTrigger=o?2:3,t.namespace=y.join("."),t.namespace_re=t.namespace?new RegExp("(^|\\.)"+y.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=undefined,t.target||(t.target=e),f=f==null?[t]:i.makeArray(f,[t]),l=i.event.special[h]||{},o||!l.trigger||l.trigger.apply(e,f)!==!1)){if(!o&&!l.noBubble&&!i.isWindow(e)){for(b=l.delegateType||h,or.test(b+h)||(s=s.parentNode);s;s=s.parentNode)p.push(s),c=s;c===(e.ownerDocument||u)&&p.push(c.defaultView||c.parentWindow||n)}for(w=0;(s=p[w++])&&!t.isPropagationStopped();)t.type=w>1?b:l.bindType||h,v=(r.get(s,"events")||{})[t.type]&&r.get(s,"handle"),v&&v.apply(s,f),v=a&&s[a],v&&v.apply&&i.acceptData(s)&&(t.result=v.apply(s,f),t.result===!1&&t.preventDefault());return t.type=h,o||t.isDefaultPrevented()||(!l._default||l._default.apply(p.pop(),f)===!1)&&i.acceptData(e)&&a&&i.isFunction(e[h])&&!i.isWindow(e)&&(c=e[a],c&&(e[a]=null),i.event.triggered=h,e[h](),i.event.triggered=undefined,c&&(e[a]=c)),t.result}},dispatch:function(n){n=i.event.fix(n);var o,s,e,u,t,h=[],c=a.call(arguments),l=(r.get(this,"events")||{})[n.type]||[],f=i.event.special[n.type]||{};if(c[0]=n,n.delegateTarget=this,!f.preDispatch||f.preDispatch.call(this,n)!==!1){for(h=i.event.handlers.call(this,n,l),o=0;(u=h[o++])&&!n.isPropagationStopped();)for(n.currentTarget=u.elem,s=0;(t=u.handlers[s++])&&!n.isImmediatePropagationStopped();)(!n.namespace_re||n.namespace_re.test(t.namespace))&&(n.handleObj=t,n.data=t.data,e=((i.event.special[t.origType]||{}).handle||t.handler).apply(u.elem,c),e!==undefined&&(n.result=e)===!1&&(n.preventDefault(),n.stopPropagation()));return f.postDispatch&&f.postDispatch.call(this,n),n.result}},handlers:function(n,t){var e,u,f,o,h=[],s=t.delegateCount,r=n.target;if(s&&r.nodeType&&(!n.button||n.type!=="click"))for(;r!==this;r=r.parentNode||this)if(r.disabled!==!0||n.type!=="click"){for(u=[],e=0;e<s;e++)o=t[e],f=o.selector+" ",u[f]===undefined&&(u[f]=o.needsContext?i(f,this).index(r)>=0:i.find(f,this,null,[r]).length),u[f]&&u.push(o);u.length&&h.push({elem:r,handlers:u})}return s<t.length&&h.push({elem:this,handlers:t.slice(s)}),h},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(n,t){return n.which==null&&(n.which=t.charCode!=null?t.charCode:t.keyCode),n}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(n,t){var e,i,r,f=t.button;return n.pageX==null&&t.clientX!=null&&(e=n.target.ownerDocument||u,i=e.documentElement,r=e.body,n.pageX=t.clientX+(i&&i.scrollLeft||r&&r.scrollLeft||0)-(i&&i.clientLeft||r&&r.clientLeft||0),n.pageY=t.clientY+(i&&i.scrollTop||r&&r.scrollTop||0)-(i&&i.clientTop||r&&r.clientTop||0)),n.which||f===undefined||(n.which=f&1?1:f&2?3:f&4?2:0),n}},fix:function(n){if(n[i.expando])return n;var f,e,o,r=n.type,s=n,t=this.fixHooks[r];for(t||(this.fixHooks[r]=t=lf.test(r)?this.mouseHooks:cf.test(r)?this.keyHooks:{}),o=t.props?this.props.concat(t.props):this.props,n=new i.Event(s),f=o.length;f--;)e=o[f],n[e]=s[e];return n.target||(n.target=u),n.target.nodeType===3&&(n.target=n.target.parentNode),t.filter?t.filter(n,s):n},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==hr()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===hr()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if(this.type==="checkbox"&&this.click&&i.nodeName(this,"input"))return this.click(),!1},_default:function(n){return i.nodeName(n.target,"a")}},beforeunload:{postDispatch:function(n){n.result!==undefined&&n.originalEvent&&(n.originalEvent.returnValue=n.result)}}},simulate:function(n,t,r,u){var f=i.extend(new i.Event,r,{type:n,isSimulated:!0,originalEvent:{}});u?i.event.trigger(f,null,t):i.event.dispatch.call(t,f);f.isDefaultPrevented()&&r.preventDefault()}};i.removeEvent=function(n,t,i){n.removeEventListener&&n.removeEventListener(t,i,!1)};i.Event=function(n,t){if(!(this instanceof i.Event))return new i.Event(n,t);n&&n.type?(this.originalEvent=n,this.type=n.type,this.isDefaultPrevented=n.defaultPrevented||n.defaultPrevented===undefined&&n.returnValue===!1?at:g):this.type=n;t&&i.extend(this,t);this.timeStamp=n&&n.timeStamp||i.now();this[i.expando]=!0};i.Event.prototype={isDefaultPrevented:g,isPropagationStopped:g,isImmediatePropagationStopped:g,preventDefault:function(){var n=this.originalEvent;this.isDefaultPrevented=at;n&&n.preventDefault&&n.preventDefault()},stopPropagation:function(){var n=this.originalEvent;this.isPropagationStopped=at;n&&n.stopPropagation&&n.stopPropagation()},stopImmediatePropagation:function(){var n=this.originalEvent;this.isImmediatePropagationStopped=at;n&&n.stopImmediatePropagation&&n.stopImmediatePropagation();this.stopPropagation()}};i.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(n,t){i.event.special[n]={delegateType:t,bindType:t,handle:function(n){var u,f=this,r=n.relatedTarget,e=n.handleObj;return r&&(r===f||i.contains(f,r))||(n.type=e.origType,u=e.handler.apply(this,arguments),n.type=t),u}}});f.focusinBubbles||i.each({focus:"focusin",blur:"focusout"},function(n,t){var u=function(n){i.event.simulate(t,n.target,i.event.fix(n),!0)};i.event.special[t]={setup:function(){var i=this.ownerDocument||this,f=r.access(i,t);f||i.addEventListener(n,u,!0);r.access(i,t,(f||0)+1)},teardown:function(){var i=this.ownerDocument||this,f=r.access(i,t)-1;f?r.access(i,t,f):(i.removeEventListener(n,u,!0),r.remove(i,t))}}});i.fn.extend({on:function(n,t,r,u,f){var e,o;if(typeof n=="object"){typeof t!="string"&&(r=r||t,t=undefined);for(o in n)this.on(o,t,r,n[o],f);return this}if(r==null&&u==null?(u=t,r=t=undefined):u==null&&(typeof t=="string"?(u=r,r=undefined):(u=r,r=t,t=undefined)),u===!1)u=g;else if(!u)return this;return f===1&&(e=u,u=function(n){return i().off(n),e.apply(this,arguments)},u.guid=e.guid||(e.guid=i.guid++)),this.each(function(){i.event.add(this,n,u,r,t)})},one:function(n,t,i,r){return this.on(n,t,i,r,1)},off:function(n,t,r){var u,f;if(n&&n.preventDefault&&n.handleObj)return u=n.handleObj,i(n.delegateTarget).off(u.namespace?u.origType+"."+u.namespace:u.origType,u.selector,u.handler),this;if(typeof n=="object"){for(f in n)this.off(f,t,n[f]);return this}return(t===!1||typeof t=="function")&&(r=t,t=undefined),r===!1&&(r=g),this.each(function(){i.event.remove(this,n,r,t)})},trigger:function(n,t){return this.each(function(){i.event.trigger(n,t,this)})},triggerHandler:function(n,t){var r=this[0];if(r)return i.event.trigger(n,t,r,!0)}});var cr=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,lr=/<([\w:]+)/,af=/<|&#?\w+;/,vf=/<(?:script|style|link)/i,yf=/checked\s*(?:[^=]|=\s*.checked.)/i,ar=/^$|\/(?:java|ecma)script/i,pf=/^true\/(.*)/,wf=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,h={option:[1,"<select multiple='multiple'>","<\/select>"],thead:[1,"<table>","<\/table>"],col:[2,"<table><colgroup>","<\/colgroup><\/table>"],tr:[2,"<table><tbody>","<\/tbody><\/table>"],td:[3,"<table><tbody><tr>","<\/tr><\/tbody><\/table>"],_default:[0,"",""]};h.optgroup=h.option;h.tbody=h.tfoot=h.colgroup=h.caption=h.thead;h.th=h.td;i.extend({clone:function(n,t,r){var u,c,s,e,h=n.cloneNode(!0),l=i.contains(n.ownerDocument,n);if(!f.noCloneChecked&&(n.nodeType===1||n.nodeType===11)&&!i.isXMLDoc(n))for(e=o(h),s=o(n),u=0,c=s.length;u<c;u++)df(s[u],e[u]);if(t)if(r)for(s=s||o(n),e=e||o(h),u=0,c=s.length;u<c;u++)yr(s[u],e[u]);else yr(n,h);return e=o(h,"script"),e.length>0&&oi(e,!l&&o(n,"script")),h},buildFragment:function(n,t,r,u){for(var f,e,y,l,p,a,s=t.createDocumentFragment(),v=[],c=0,w=n.length;c<w;c++)if(f=n[c],f||f===0)if(i.type(f)==="object")i.merge(v,f.nodeType?[f]:f);else if(af.test(f)){for(e=e||s.appendChild(t.createElement("div")),y=(lr.exec(f)||["",""])[1].toLowerCase(),l=h[y]||h._default,e.innerHTML=l[1]+f.replace(cr,"<$1><\/$2>")+l[2],a=l[0];a--;)e=e.lastChild;i.merge(v,e.childNodes);e=s.firstChild;e.textContent=""}else v.push(t.createTextNode(f));for(s.textContent="",c=0;f=v[c++];)if((!u||i.inArray(f,u)===-1)&&(p=i.contains(f.ownerDocument,f),e=o(s.appendChild(f),"script"),p&&oi(e),r))for(a=0;f=e[a++];)ar.test(f.type||"")&&r.push(f);return s},cleanData:function(n){for(var f,t,o,u,h=i.event.special,s=0;(t=n[s])!==undefined;s++){if(i.acceptData(t)&&(u=t[r.expando],u&&(f=r.cache[u]))){if(f.events)for(o in f.events)h[o]?i.event.remove(t,o):i.removeEvent(t,o,f.handle);r.cache[u]&&delete r.cache[u]}delete e.cache[t[e.expando]]}}});i.fn.extend({text:function(n){return l(this,function(n){return n===undefined?i.text(this):this.empty().each(function(){(this.nodeType===1||this.nodeType===11||this.nodeType===9)&&(this.textContent=n)})},null,n,arguments.length)},append:function(){return this.domManip(arguments,function(n){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var t=vr(this,n);t.appendChild(n)}})},prepend:function(){return this.domManip(arguments,function(n){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var t=vr(this,n);t.insertBefore(n,t.firstChild)}})},before:function(){return this.domManip(arguments,function(n){this.parentNode&&this.parentNode.insertBefore(n,this)})},after:function(){return this.domManip(arguments,function(n){this.parentNode&&this.parentNode.insertBefore(n,this.nextSibling)})},remove:function(n,t){for(var r,f=n?i.filter(n,this):this,u=0;(r=f[u])!=null;u++)t||r.nodeType!==1||i.cleanData(o(r)),r.parentNode&&(t&&i.contains(r.ownerDocument,r)&&oi(o(r,"script")),r.parentNode.removeChild(r));return this},empty:function(){for(var n,t=0;(n=this[t])!=null;t++)n.nodeType===1&&(i.cleanData(o(n,!1)),n.textContent="");return this},clone:function(n,t){return n=n==null?!1:n,t=t==null?n:t,this.map(function(){return i.clone(this,n,t)})},html:function(n){return l(this,function(n){var t=this[0]||{},r=0,u=this.length;if(n===undefined&&t.nodeType===1)return t.innerHTML;if(typeof n=="string"&&!vf.test(n)&&!h[(lr.exec(n)||["",""])[1].toLowerCase()]){n=n.replace(cr,"<$1><\/$2>");try{for(;r<u;r++)t=this[r]||{},t.nodeType===1&&(i.cleanData(o(t,!1)),t.innerHTML=n);t=0}catch(f){}}t&&this.empty().append(n)},null,n,arguments.length)},replaceWith:function(){var n=arguments[0];return this.domManip(arguments,function(t){n=this.parentNode;i.cleanData(o(this));n&&n.replaceChild(t,this)}),n&&(n.length||n.nodeType)?this:this.remove()},detach:function(n){return this.remove(n,!0)},domManip:function(n,t){n=bi.apply([],n);var h,v,s,c,u,y,e=0,l=this.length,w=this,b=l-1,a=n[0],p=i.isFunction(a);if(p||l>1&&typeof a=="string"&&!f.checkClone&&yf.test(a))return this.each(function(i){var r=w.eq(i);p&&(n[0]=a.call(this,i,r.html()));r.domManip(n,t)});if(l&&(h=i.buildFragment(n,this[0].ownerDocument,!1,this),v=h.firstChild,h.childNodes.length===1&&(h=v),v)){for(s=i.map(o(h,"script"),bf),c=s.length;e<l;e++)u=h,e!==b&&(u=i.clone(u,!0,!0),c&&i.merge(s,o(u,"script"))),t.call(this[e],u,e);if(c)for(y=s[s.length-1].ownerDocument,i.map(s,kf),e=0;e<c;e++)u=s[e],ar.test(u.type||"")&&!r.access(u,"globalEval")&&i.contains(y,u)&&(u.src?i._evalUrl&&i._evalUrl(u.src):i.globalEval(u.textContent.replace(wf,"")))}return this}});i.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(n,t){i.fn[n]=function(n){for(var u,f=[],e=i(n),o=e.length-1,r=0;r<=o;r++)u=r===o?this:this.clone(!0),i(e[r])[t](u),ii.apply(f,u.get());return this.pushStack(f)}});si={};var wr=/^margin/,ci=new RegExp("^("+lt+")(?!px)[a-z%]+$","i"),yt=function(n){return n.ownerDocument.defaultView.getComputedStyle(n,null)};(function(){function h(){t.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute";t.innerHTML="";e.appendChild(r);var i=n.getComputedStyle(t,null);s=i.top!=="1%";o=i.width==="4px";e.removeChild(r)}var s,o,e=u.documentElement,r=u.createElement("div"),t=u.createElement("div");t.style&&(t.style.backgroundClip="content-box",t.cloneNode(!0).style.backgroundClip="",f.clearCloneStyle=t.style.backgroundClip==="content-box",r.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",r.appendChild(t),n.getComputedStyle&&i.extend(f,{pixelPosition:function(){return h(),s},boxSizingReliable:function(){return o==null&&h(),o},reliableMarginRight:function(){var f,i=t.appendChild(u.createElement("div"));return i.style.cssText=t.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",i.style.marginRight=i.style.width="0",t.style.width="1px",e.appendChild(r),f=!parseFloat(n.getComputedStyle(i,null).marginRight),e.removeChild(r),f}}))})();i.swap=function(n,t,i,r){var f,u,e={};for(u in t)e[u]=n.style[u],n.style[u]=t[u];f=i.apply(n,r||[]);for(u in t)n.style[u]=e[u];return f};var gf=/^(none|table(?!-c[ea]).+)/,ne=new RegExp("^("+lt+")(.*)$","i"),te=new RegExp("^([+-])=("+lt+")","i"),ie={position:"absolute",visibility:"hidden",display:"block"},kr={letterSpacing:"0",fontWeight:"400"},dr=["Webkit","O","Moz","ms"];i.extend({cssHooks:{opacity:{get:function(n,t){if(t){var i=rt(n,"opacity");return i===""?"1":i}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{float:"cssFloat"},style:function(n,t,r,u){if(n&&n.nodeType!==3&&n.nodeType!==8&&n.style){var o,h,e,s=i.camelCase(t),c=n.style;if(t=i.cssProps[s]||(i.cssProps[s]=gr(c,s)),e=i.cssHooks[t]||i.cssHooks[s],r!==undefined){if(h=typeof r,h==="string"&&(o=te.exec(r))&&(r=(o[1]+1)*o[2]+parseFloat(i.css(n,t)),h="number"),r==null||r!==r)return;h!=="number"||i.cssNumber[s]||(r+="px");f.clearCloneStyle||r!==""||t.indexOf("background")!==0||(c[t]="inherit");e&&"set"in e&&(r=e.set(n,r,u))===undefined||(c[t]=r)}else return e&&"get"in e&&(o=e.get(n,!1,u))!==undefined?o:c[t]}},css:function(n,t,r,u){var f,s,e,o=i.camelCase(t);return(t=i.cssProps[o]||(i.cssProps[o]=gr(n.style,o)),e=i.cssHooks[t]||i.cssHooks[o],e&&"get"in e&&(f=e.get(n,!0,r)),f===undefined&&(f=rt(n,t,u)),f==="normal"&&t in kr&&(f=kr[t]),r===""||r)?(s=parseFloat(f),r===!0||i.isNumeric(s)?s||0:f):f}});i.each(["height","width"],function(n,t){i.cssHooks[t]={get:function(n,r,u){if(r)return gf.test(i.css(n,"display"))&&n.offsetWidth===0?i.swap(n,ie,function(){return iu(n,t,u)}):iu(n,t,u)},set:function(n,r,u){var f=u&&yt(n);return nu(n,r,u?tu(n,t,u,i.css(n,"boxSizing",!1,f)==="border-box",f):0)}}});i.cssHooks.marginRight=br(f.reliableMarginRight,function(n,t){if(t)return i.swap(n,{display:"inline-block"},rt,[n,"marginRight"])});i.each({margin:"",padding:"",border:"Width"},function(n,t){i.cssHooks[n+t]={expand:function(i){for(var r=0,f={},u=typeof i=="string"?i.split(" "):[i];r<4;r++)f[n+w[r]+t]=u[r]||u[r-2]||u[0];return f}};wr.test(n)||(i.cssHooks[n+t].set=nu)});i.fn.extend({css:function(n,t){return l(this,function(n,t,r){var f,e,o={},u=0;if(i.isArray(t)){for(f=yt(n),e=t.length;u<e;u++)o[t[u]]=i.css(n,t[u],!1,f);return o}return r!==undefined?i.style(n,t,r):i.css(n,t)},n,t,arguments.length>1)},show:function(){return ru(this,!0)},hide:function(){return ru(this)},toggle:function(n){return typeof n=="boolean"?n?this.show():this.hide():this.each(function(){it(this)?i(this).show():i(this).hide()})}});i.Tween=s;s.prototype={constructor:s,init:function(n,t,r,u,f,e){this.elem=n;this.prop=r;this.easing=f||"swing";this.options=t;this.start=this.now=this.cur();this.end=u;this.unit=e||(i.cssNumber[r]?"":"px")},cur:function(){var n=s.propHooks[this.prop];return n&&n.get?n.get(this):s.propHooks._default.get(this)},run:function(n){var t,r=s.propHooks[this.prop];return this.pos=this.options.duration?t=i.easing[this.easing](n,this.options.duration*n,0,1,this.options.duration):t=n,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),r&&r.set?r.set(this):s.propHooks._default.set(this),this}};s.prototype.init.prototype=s.prototype;s.propHooks={_default:{get:function(n){var t;return n.elem[n.prop]!=null&&(!n.elem.style||n.elem.style[n.prop]==null)?n.elem[n.prop]:(t=i.css(n.elem,n.prop,""),!t||t==="auto"?0:t)},set:function(n){i.fx.step[n.prop]?i.fx.step[n.prop](n):n.elem.style&&(n.elem.style[i.cssProps[n.prop]]!=null||i.cssHooks[n.prop])?i.style(n.elem,n.prop,n.now+n.unit):n.elem[n.prop]=n.now}}};s.propHooks.scrollTop=s.propHooks.scrollLeft={set:function(n){n.elem.nodeType&&n.elem.parentNode&&(n.elem[n.prop]=n.now)}};i.easing={linear:function(n){return n},swing:function(n){return.5-Math.cos(n*Math.PI)/2}};i.fx=s.prototype.init;i.fx.step={};var nt,pt,re=/^(?:toggle|show|hide)$/,uu=new RegExp("^(?:([+-])=|)("+lt+")([a-z%]*)$","i"),ue=/queueHooks$/,wt=[fe],ut={"*":[function(n,t){var f=this.createTween(n,t),s=f.cur(),u=uu.exec(t),e=u&&u[3]||(i.cssNumber[n]?"":"px"),r=(i.cssNumber[n]||e!=="px"&&+s)&&uu.exec(i.css(f.elem,n)),o=1,h=20;if(r&&r[3]!==e){e=e||r[3];u=u||[];r=+s||1;do o=o||".5",r=r/o,i.style(f.elem,n,r+e);while(o!==(o=f.cur()/s)&&o!==1&&--h)}return u&&(r=f.start=+r||+s||0,f.unit=e,f.end=u[1]?r+(u[1]+1)*u[2]:+u[2]),f}]};i.Animation=i.extend(ou,{tweener:function(n,t){i.isFunction(n)?(t=n,n=["*"]):n=n.split(" ");for(var r,u=0,f=n.length;u<f;u++)r=n[u],ut[r]=ut[r]||[],ut[r].unshift(t)},prefilter:function(n,t){t?wt.unshift(n):wt.push(n)}});i.speed=function(n,t,r){var u=n&&typeof n=="object"?i.extend({},n):{complete:r||!r&&t||i.isFunction(n)&&n,duration:n,easing:r&&t||t&&!i.isFunction(t)&&t};return u.duration=i.fx.off?0:typeof u.duration=="number"?u.duration:u.duration in i.fx.speeds?i.fx.speeds[u.duration]:i.fx.speeds._default,(u.queue==null||u.queue===!0)&&(u.queue="fx"),u.old=u.complete,u.complete=function(){i.isFunction(u.old)&&u.old.call(this);u.queue&&i.dequeue(this,u.queue)},u};i.fn.extend({fadeTo:function(n,t,i,r){return this.filter(it).css("opacity",0).show().end().animate({opacity:t},n,i,r)},animate:function(n,t,u,f){var s=i.isEmptyObject(n),o=i.speed(t,u,f),e=function(){var t=ou(this,i.extend({},n),o);(s||r.get(this,"finish"))&&t.stop(!0)};return e.finish=e,s||o.queue===!1?this.each(e):this.queue(o.queue,e)},stop:function(n,t,u){var f=function(n){var t=n.stop;delete n.stop;t(u)};return typeof n!="string"&&(u=t,t=n,n=undefined),t&&n!==!1&&this.queue(n||"fx",[]),this.each(function(){var s=!0,t=n!=null&&n+"queueHooks",o=i.timers,e=r.get(this);if(t)e[t]&&e[t].stop&&f(e[t]);else for(t in e)e[t]&&e[t].stop&&ue.test(t)&&f(e[t]);for(t=o.length;t--;)o[t].elem===this&&(n==null||o[t].queue===n)&&(o[t].anim.stop(u),s=!1,o.splice(t,1));(s||!u)&&i.dequeue(this,n)})},finish:function(n){return n!==!1&&(n=n||"fx"),this.each(function(){var t,e=r.get(this),u=e[n+"queue"],o=e[n+"queueHooks"],f=i.timers,s=u?u.length:0;for(e.finish=!0,i.queue(this,n,[]),o&&o.stop&&o.stop.call(this,!0),t=f.length;t--;)f[t].elem===this&&f[t].queue===n&&(f[t].anim.stop(!0),f.splice(t,1));for(t=0;t<s;t++)u[t]&&u[t].finish&&u[t].finish.call(this);delete e.finish})}});i.each(["toggle","show","hide"],function(n,t){var r=i.fn[t];i.fn[t]=function(n,i,u){return n==null||typeof n=="boolean"?r.apply(this,arguments):this.animate(bt(t,!0),n,i,u)}});i.each({slideDown:bt("show"),slideUp:bt("hide"),slideToggle:bt("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(n,t){i.fn[n]=function(n,i,r){return this.animate(t,n,i,r)}});i.timers=[];i.fx.tick=function(){var r,n=0,t=i.timers;for(nt=i.now();n<t.length;n++)r=t[n],r()||t[n]!==r||t.splice(n--,1);t.length||i.fx.stop();nt=undefined};i.fx.timer=function(n){i.timers.push(n);n()?i.fx.start():i.timers.pop()};i.fx.interval=13;i.fx.start=function(){pt||(pt=setInterval(i.fx.tick,i.fx.interval))};i.fx.stop=function(){clearInterval(pt);pt=null};i.fx.speeds={slow:600,fast:200,_default:400};i.fn.delay=function(n,t){return n=i.fx?i.fx.speeds[n]||n:n,t=t||"fx",this.queue(t,function(t,i){var r=setTimeout(t,n);i.stop=function(){clearTimeout(r)}})},function(){var n=u.createElement("input"),t=u.createElement("select"),i=t.appendChild(u.createElement("option"));n.type="checkbox";f.checkOn=n.value!=="";f.optSelected=i.selected;t.disabled=!0;f.optDisabled=!i.disabled;n=u.createElement("input");n.value="t";n.type="radio";f.radioValue=n.value==="t"}();tt=i.expr.attrHandle;i.fn.extend({attr:function(n,t){return l(this,i.attr,n,t,arguments.length>1)},removeAttr:function(n){return this.each(function(){i.removeAttr(this,n)})}});i.extend({attr:function(n,t,r){var u,f,e=n.nodeType;if(n&&e!==3&&e!==8&&e!==2){if(typeof n.getAttribute===d)return i.prop(n,t,r);if(e===1&&i.isXMLDoc(n)||(t=t.toLowerCase(),u=i.attrHooks[t]||(i.expr.match.bool.test(t)?su:oe)),r!==undefined)if(r===null)i.removeAttr(n,t);else return u&&"set"in u&&(f=u.set(n,r,t))!==undefined?f:(n.setAttribute(t,r+""),r);else return u&&"get"in u&&(f=u.get(n,t))!==null?f:(f=i.find.attr(n,t),f==null?undefined:f)}},removeAttr:function(n,t){var r,u,e=0,f=t&&t.match(c);if(f&&n.nodeType===1)while(r=f[e++])u=i.propFix[r]||r,i.expr.match.bool.test(r)&&(n[u]=!1),n.removeAttribute(r)},attrHooks:{type:{set:function(n,t){if(!f.radioValue&&t==="radio"&&i.nodeName(n,"input")){var r=n.value;return n.setAttribute("type",t),r&&(n.value=r),t}}}}});su={set:function(n,t,r){return t===!1?i.removeAttr(n,r):n.setAttribute(r,r),r}};i.each(i.expr.match.bool.source.match(/\w+/g),function(n,t){var r=tt[t]||i.find.attr;tt[t]=function(n,t,i){var u,f;return i||(f=tt[t],tt[t]=u,u=r(n,t,i)!=null?t.toLowerCase():null,tt[t]=f),u}});hu=/^(?:input|select|textarea|button)$/i;i.fn.extend({prop:function(n,t){return l(this,i.prop,n,t,arguments.length>1)},removeProp:function(n){return this.each(function(){delete this[i.propFix[n]||n]})}});i.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(n,t,r){var f,u,o,e=n.nodeType;if(n&&e!==3&&e!==8&&e!==2)return o=e!==1||!i.isXMLDoc(n),o&&(t=i.propFix[t]||t,u=i.propHooks[t]),r!==undefined?u&&"set"in u&&(f=u.set(n,r,t))!==undefined?f:n[t]=r:u&&"get"in u&&(f=u.get(n,t))!==null?f:n[t]},propHooks:{tabIndex:{get:function(n){return n.hasAttribute("tabindex")||hu.test(n.nodeName)||n.href?n.tabIndex:-1}}}});f.optSelected||(i.propHooks.selected={get:function(n){var t=n.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null}});i.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){i.propFix[this.toLowerCase()]=this});kt=/[\t\r\n\f]/g;i.fn.extend({addClass:function(n){var o,t,r,u,s,f,h=typeof n=="string"&&n,e=0,l=this.length;if(i.isFunction(n))return this.each(function(t){i(this).addClass(n.call(this,t,this.className))});if(h)for(o=(n||"").match(c)||[];e<l;e++)if(t=this[e],r=t.nodeType===1&&(t.className?(" "+t.className+" ").replace(kt," "):" "),r){for(s=0;u=o[s++];)r.indexOf(" "+u+" ")<0&&(r+=u+" ");f=i.trim(r);t.className!==f&&(t.className=f)}return this},removeClass:function(n){var o,t,r,u,s,f,h=arguments.length===0||typeof n=="string"&&n,e=0,l=this.length;if(i.isFunction(n))return this.each(function(t){i(this).removeClass(n.call(this,t,this.className))});if(h)for(o=(n||"").match(c)||[];e<l;e++)if(t=this[e],r=t.nodeType===1&&(t.className?(" "+t.className+" ").replace(kt," "):""),r){for(s=0;u=o[s++];)while(r.indexOf(" "+u+" ")>=0)r=r.replace(" "+u+" "," ");f=n?i.trim(r):"";t.className!==f&&(t.className=f)}return this},toggleClass:function(n,t){var u=typeof n;return typeof t=="boolean"&&u==="string"?t?this.addClass(n):this.removeClass(n):i.isFunction(n)?this.each(function(r){i(this).toggleClass(n.call(this,r,this.className,t),t)}):this.each(function(){if(u==="string")for(var t,e=0,f=i(this),o=n.match(c)||[];t=o[e++];)f.hasClass(t)?f.removeClass(t):f.addClass(t);else(u===d||u==="boolean")&&(this.className&&r.set(this,"__className__",this.className),this.className=this.className||n===!1?"":r.get(this,"__className__")||"")})},hasClass:function(n){for(var i=" "+n+" ",t=0,r=this.length;t<r;t++)if(this[t].nodeType===1&&(" "+this[t].className+" ").replace(kt," ").indexOf(i)>=0)return!0;return!1}});cu=/\r/g;i.fn.extend({val:function(n){var t,r,f,u=this[0];return arguments.length?(f=i.isFunction(n),this.each(function(r){var u;this.nodeType===1&&(u=f?n.call(this,r,i(this).val()):n,u==null?u="":typeof u=="number"?u+="":i.isArray(u)&&(u=i.map(u,function(n){return n==null?"":n+""})),t=i.valHooks[this.type]||i.valHooks[this.nodeName.toLowerCase()],t&&"set"in t&&t.set(this,u,"value")!==undefined||(this.value=u))})):u?(t=i.valHooks[u.type]||i.valHooks[u.nodeName.toLowerCase()],t&&"get"in t&&(r=t.get(u,"value"))!==undefined)?r:(r=u.value,typeof r=="string"?r.replace(cu,""):r==null?"":r):void 0}});i.extend({valHooks:{option:{get:function(n){var t=i.find.attr(n,"value");return t!=null?t:i.trim(i.text(n))}},select:{get:function(n){for(var o,t,s=n.options,r=n.selectedIndex,u=n.type==="select-one"||r<0,h=u?null:[],c=u?r+1:s.length,e=r<0?c:u?r:0;e<c;e++)if(t=s[e],(t.selected||e===r)&&(f.optDisabled?!t.disabled:t.getAttribute("disabled")===null)&&(!t.parentNode.disabled||!i.nodeName(t.parentNode,"optgroup"))){if(o=i(t).val(),u)return o;h.push(o)}return h},set:function(n,t){for(var u,r,f=n.options,e=i.makeArray(t),o=f.length;o--;)r=f[o],(r.selected=i.inArray(r.value,e)>=0)&&(u=!0);return u||(n.selectedIndex=-1),e}}}});i.each(["radio","checkbox"],function(){i.valHooks[this]={set:function(n,t){if(i.isArray(t))return n.checked=i.inArray(i(n).val(),t)>=0}};f.checkOn||(i.valHooks[this].get=function(n){return n.getAttribute("value")===null?"on":n.value})});i.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(n,t){i.fn[t]=function(n,i){return arguments.length>0?this.on(t,null,n,i):this.trigger(t)}});i.fn.extend({hover:function(n,t){return this.mouseenter(n).mouseleave(t||n)},bind:function(n,t,i){return this.on(n,null,t,i)},unbind:function(n,t){return this.off(n,null,t)},delegate:function(n,t,i,r){return this.on(t,n,i,r)},undelegate:function(n,t,i){return arguments.length===1?this.off(n,"**"):this.off(t,n||"**",i)}});dt=i.now();gt=/\?/;i.parseJSON=function(n){return JSON.parse(n+"")};i.parseXML=function(n){var t,r;if(!n||typeof n!="string")return null;try{r=new DOMParser;t=r.parseFromString(n,"text/xml")}catch(u){t=undefined}return(!t||t.getElementsByTagName("parsererror").length)&&i.error("Invalid XML: "+n),t};var b,v,se=/#.*$/,lu=/([?&])_=[^&]*/,he=/^(.*?):[ \t]*([^\r\n]*)$/mg,ce=/^(?:GET|HEAD)$/,le=/^\/\//,au=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,vu={},li={},yu="*/".concat("*");try{v=location.href}catch(ge){v=u.createElement("a");v.href="";v=v.href}b=au.exec(v.toLowerCase())||[];i.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:v,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(b[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":yu,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":i.parseJSON,"text xml":i.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(n,t){return t?ai(ai(n,i.ajaxSettings),t):ai(i.ajaxSettings,n)},ajaxPrefilter:pu(vu),ajaxTransport:pu(li),ajax:function(n,t){function w(n,t,h,c){var v,it,b,y,w,l=t;e!==2&&(e=2,d&&clearTimeout(d),s=undefined,k=c||"",u.readyState=n>0?4:0,v=n>=200&&n<300||n===304,h&&(y=ae(r,u,h)),y=ve(r,y,u,v),v?(r.ifModified&&(w=u.getResponseHeader("Last-Modified"),w&&(i.lastModified[f]=w),w=u.getResponseHeader("etag"),w&&(i.etag[f]=w)),n===204||r.type==="HEAD"?l="nocontent":n===304?l="notmodified":(l=y.state,it=y.data,b=y.error,v=!b)):(b=l,(n||!l)&&(l="error",n<0&&(n=0))),u.status=n,u.statusText=(t||l)+"",v?nt.resolveWith(o,[it,l,u]):nt.rejectWith(o,[u,l,b]),u.statusCode(p),p=undefined,a&&g.trigger(v?"ajaxSuccess":"ajaxError",[u,r,v?it:b]),tt.fireWith(o,[u,l]),a&&(g.trigger("ajaxComplete",[u,r]),--i.active||i.event.trigger("ajaxStop")))}typeof n=="object"&&(t=n,n=undefined);t=t||{};var s,f,k,y,d,h,a,l,r=i.ajaxSetup({},t),o=r.context||r,g=r.context&&(o.nodeType||o.jquery)?i(o):i.event,nt=i.Deferred(),tt=i.Callbacks("once memory"),p=r.statusCode||{},it={},rt={},e=0,ut="canceled",u={readyState:0,getResponseHeader:function(n){var t;if(e===2){if(!y)for(y={};t=he.exec(k);)y[t[1].toLowerCase()]=t[2];t=y[n.toLowerCase()]}return t==null?null:t},getAllResponseHeaders:function(){return e===2?k:null},setRequestHeader:function(n,t){var i=n.toLowerCase();return e||(n=rt[i]=rt[i]||n,it[n]=t),this},overrideMimeType:function(n){return e||(r.mimeType=n),this},statusCode:function(n){var t;if(n)if(e<2)for(t in n)p[t]=[p[t],n[t]];else u.always(n[u.status]);return this},abort:function(n){var t=n||ut;return s&&s.abort(t),w(0,t),this}};if(nt.promise(u).complete=tt.add,u.success=u.done,u.error=u.fail,r.url=((n||r.url||v)+"").replace(se,"").replace(le,b[1]+"//"),r.type=t.method||t.type||r.method||r.type,r.dataTypes=i.trim(r.dataType||"*").toLowerCase().match(c)||[""],r.crossDomain==null&&(h=au.exec(r.url.toLowerCase()),r.crossDomain=!!(h&&(h[1]!==b[1]||h[2]!==b[2]||(h[3]||(h[1]==="http:"?"80":"443"))!==(b[3]||(b[1]==="http:"?"80":"443"))))),r.data&&r.processData&&typeof r.data!="string"&&(r.data=i.param(r.data,r.traditional)),wu(vu,r,t,u),e===2)return u;a=r.global;a&&i.active++==0&&i.event.trigger("ajaxStart");r.type=r.type.toUpperCase();r.hasContent=!ce.test(r.type);f=r.url;r.hasContent||(r.data&&(f=r.url+=(gt.test(f)?"&":"?")+r.data,delete r.data),r.cache===!1&&(r.url=lu.test(f)?f.replace(lu,"$1_="+dt++):f+(gt.test(f)?"&":"?")+"_="+dt++));r.ifModified&&(i.lastModified[f]&&u.setRequestHeader("If-Modified-Since",i.lastModified[f]),i.etag[f]&&u.setRequestHeader("If-None-Match",i.etag[f]));(r.data&&r.hasContent&&r.contentType!==!1||t.contentType)&&u.setRequestHeader("Content-Type",r.contentType);u.setRequestHeader("Accept",r.dataTypes[0]&&r.accepts[r.dataTypes[0]]?r.accepts[r.dataTypes[0]]+(r.dataTypes[0]!=="*"?", "+yu+"; q=0.01":""):r.accepts["*"]);for(l in r.headers)u.setRequestHeader(l,r.headers[l]);if(r.beforeSend&&(r.beforeSend.call(o,u,r)===!1||e===2))return u.abort();ut="abort";for(l in{success:1,error:1,complete:1})u[l](r[l]);if(s=wu(li,r,t,u),s){u.readyState=1;a&&g.trigger("ajaxSend",[u,r]);r.async&&r.timeout>0&&(d=setTimeout(function(){u.abort("timeout")},r.timeout));try{e=1;s.send(it,w)}catch(ft){if(e<2)w(-1,ft);else throw ft;}}else w(-1,"No Transport");return u},getJSON:function(n,t,r){return i.get(n,t,r,"json")},getScript:function(n,t){return i.get(n,undefined,t,"script")}});i.each(["get","post"],function(n,t){i[t]=function(n,r,u,f){return i.isFunction(r)&&(f=f||u,u=r,r=undefined),i.ajax({url:n,type:t,dataType:f,data:r,success:u})}});i.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(n,t){i.fn[t]=function(n){return this.on(t,n)}});i._evalUrl=function(n){return i.ajax({url:n,type:"GET",dataType:"script",async:!1,global:!1,throws:!0})};i.fn.extend({wrapAll:function(n){var t;return i.isFunction(n)?this.each(function(t){i(this).wrapAll(n.call(this,t))}):(this[0]&&(t=i(n,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){for(var n=this;n.firstElementChild;)n=n.firstElementChild;return n}).append(this)),this)},wrapInner:function(n){return i.isFunction(n)?this.each(function(t){i(this).wrapInner(n.call(this,t))}):this.each(function(){var t=i(this),r=t.contents();r.length?r.wrapAll(n):t.append(n)})},wrap:function(n){var t=i.isFunction(n);return this.each(function(r){i(this).wrapAll(t?n.call(this,r):n)})},unwrap:function(){return this.parent().each(function(){i.nodeName(this,"body")||i(this).replaceWith(this.childNodes)}).end()}});i.expr.filters.hidden=function(n){return n.offsetWidth<=0&&n.offsetHeight<=0};i.expr.filters.visible=function(n){return!i.expr.filters.hidden(n)};var ye=/%20/g,pe=/\[\]$/,bu=/\r?\n/g,we=/^(?:submit|button|image|reset|file)$/i,be=/^(?:input|select|textarea|keygen)/i;i.param=function(n,t){var r,u=[],f=function(n,t){t=i.isFunction(t)?t():t==null?"":t;u[u.length]=encodeURIComponent(n)+"="+encodeURIComponent(t)};if(t===undefined&&(t=i.ajaxSettings&&i.ajaxSettings.traditional),i.isArray(n)||n.jquery&&!i.isPlainObject(n))i.each(n,function(){f(this.name,this.value)});else for(r in n)vi(r,n[r],t,f);return u.join("&").replace(ye,"+")};i.fn.extend({serialize:function(){return i.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var n=i.prop(this,"elements");return n?i.makeArray(n):this}).filter(function(){var n=this.type;return this.name&&!i(this).is(":disabled")&&be.test(this.nodeName)&&!we.test(n)&&(this.checked||!er.test(n))}).map(function(n,t){var r=i(this).val();return r==null?null:i.isArray(r)?i.map(r,function(n){return{name:t.name,value:n.replace(bu,"\r\n")}}):{name:t.name,value:r.replace(bu,"\r\n")}}).get()}});i.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(n){}};var ke=0,ni={},de={0:200,1223:204},ft=i.ajaxSettings.xhr();if(n.ActiveXObject)i(n).on("unload",function(){for(var n in ni)ni[n]()});return f.cors=!!ft&&"withCredentials"in ft,f.ajax=ft=!!ft,i.ajaxTransport(function(n){var t;if(f.cors||ft&&!n.crossDomain)return{send:function(i,r){var f,u=n.xhr(),e=++ke;if(u.open(n.type,n.url,n.async,n.username,n.password),n.xhrFields)for(f in n.xhrFields)u[f]=n.xhrFields[f];n.mimeType&&u.overrideMimeType&&u.overrideMimeType(n.mimeType);n.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest");for(f in i)u.setRequestHeader(f,i[f]);t=function(n){return function(){t&&(delete ni[e],t=u.onload=u.onerror=null,n==="abort"?u.abort():n==="error"?r(u.status,u.statusText):r(de[u.status]||u.status,u.statusText,typeof u.responseText=="string"?{text:u.responseText}:undefined,u.getAllResponseHeaders()))}};u.onload=t();u.onerror=t("error");t=ni[e]=t("abort");try{u.send(n.hasContent&&n.data||null)}catch(o){if(t)throw o;}},abort:function(){t&&t()}}}),i.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(n){return i.globalEval(n),n}}}),i.ajaxPrefilter("script",function(n){n.cache===undefined&&(n.cache=!1);n.crossDomain&&(n.type="GET")}),i.ajaxTransport("script",function(n){if(n.crossDomain){var r,t;return{send:function(f,e){r=i("<script>").prop({async:!0,charset:n.scriptCharset,src:n.url}).on("load error",t=function(n){r.remove();t=null;n&&e(n.type==="error"?404:200,n.type)});u.head.appendChild(r[0])},abort:function(){t&&t()}}}}),yi=[],ti=/(=)\?(?=&|$)|\?\?/,i.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var n=yi.pop()||i.expando+"_"+dt++;return this[n]=!0,n}}),i.ajaxPrefilter("json jsonp",function(t,r,u){var f,o,e,s=t.jsonp!==!1&&(ti.test(t.url)?"url":typeof t.data=="string"&&!(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&ti.test(t.data)&&"data");if(s||t.dataTypes[0]==="jsonp")return f=t.jsonpCallback=i.isFunction(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,s?t[s]=t[s].replace(ti,"$1"+f):t.jsonp!==!1&&(t.url+=(gt.test(t.url)?"&":"?")+t.jsonp+"="+f),t.converters["script json"]=function(){return e||i.error(f+" was not called"),e[0]},t.dataTypes[0]="json",o=n[f],n[f]=function(){e=arguments},u.always(function(){n[f]=o;t[f]&&(t.jsonpCallback=r.jsonpCallback,yi.push(f));e&&i.isFunction(o)&&o(e[0]);e=o=undefined}),"script"}),i.parseHTML=function(n,t,r){if(!n||typeof n!="string")return null;typeof t=="boolean"&&(r=t,t=!1);t=t||u;var f=gi.exec(n),e=!r&&[];return f?[t.createElement(f[1])]:(f=i.buildFragment([n],t,e),e&&e.length&&i(e).remove(),i.merge([],f.childNodes))},pi=i.fn.load,i.fn.load=function(n,t,r){if(typeof n!="string"&&pi)return pi.apply(this,arguments);var u,o,s,f=this,e=n.indexOf(" ");return e>=0&&(u=i.trim(n.slice(e)),n=n.slice(0,e)),i.isFunction(t)?(r=t,t=undefined):t&&typeof t=="object"&&(o="POST"),f.length>0&&i.ajax({url:n,type:o,dataType:"html",data:t}).done(function(n){s=arguments;f.html(u?i("<div>").append(i.parseHTML(n)).find(u):n)}).complete(r&&function(n,t){f.each(r,s||[n.responseText,t,n])}),this},i.expr.filters.animated=function(n){return i.grep(i.timers,function(t){return n===t.elem}).length},wi=n.document.documentElement,i.offset={setOffset:function(n,t,r){var e,o,s,h,u,c,v,l=i.css(n,"position"),a=i(n),f={};l==="static"&&(n.style.position="relative");u=a.offset();s=i.css(n,"top");c=i.css(n,"left");v=(l==="absolute"||l==="fixed")&&(s+c).indexOf("auto")>-1;v?(e=a.position(),h=e.top,o=e.left):(h=parseFloat(s)||0,o=parseFloat(c)||0);i.isFunction(t)&&(t=t.call(n,r,u));t.top!=null&&(f.top=t.top-u.top+h);t.left!=null&&(f.left=t.left-u.left+o);"using"in t?t.using.call(n,f):a.css(f)}},i.fn.extend({offset:function(n){if(arguments.length)return n===undefined?this:this.each(function(t){i.offset.setOffset(this,n,t)});var r,f,t=this[0],u={top:0,left:0},e=t&&t.ownerDocument;if(e)return(r=e.documentElement,!i.contains(r,t))?u:(typeof t.getBoundingClientRect!==d&&(u=t.getBoundingClientRect()),f=ku(e),{top:u.top+f.pageYOffset-r.clientTop,left:u.left+f.pageXOffset-r.clientLeft})},position:function(){if(this[0]){var n,r,u=this[0],t={top:0,left:0};return i.css(u,"position")==="fixed"?r=u.getBoundingClientRect():(n=this.offsetParent(),r=this.offset(),i.nodeName(n[0],"html")||(t=n.offset()),t.top+=i.css(n[0],"borderTopWidth",!0),t.left+=i.css(n[0],"borderLeftWidth",!0)),{top:r.top-t.top-i.css(u,"marginTop",!0),left:r.left-t.left-i.css(u,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var n=this.offsetParent||wi;n&&!i.nodeName(n,"html")&&i.css(n,"position")==="static";)n=n.offsetParent;return n||wi})}}),i.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,r){var u="pageYOffset"===r;i.fn[t]=function(i){return l(this,function(t,i,f){var e=ku(t);if(f===undefined)return e?e[r]:t[i];e?e.scrollTo(u?n.pageXOffset:f,u?f:n.pageYOffset):t[i]=f},t,i,arguments.length,null)}}),i.each(["top","left"],function(n,t){i.cssHooks[t]=br(f.pixelPosition,function(n,r){if(r)return r=rt(n,t),ci.test(r)?i(n).position()[t]+"px":r})}),i.each({Height:"height",Width:"width"},function(n,t){i.each({padding:"inner"+n,content:t,"":"outer"+n},function(r,u){i.fn[u]=function(u,f){var e=arguments.length&&(r||typeof u!="boolean"),o=r||(u===!0||f===!0?"margin":"border");return l(this,function(t,r,u){var f;return i.isWindow(t)?t.document.documentElement["client"+n]:t.nodeType===9?(f=t.documentElement,Math.max(t.body["scroll"+n],f["scroll"+n],t.body["offset"+n],f["offset"+n],f["client"+n])):u===undefined?i.css(t,r,o):i.style(t,r,u,o)},t,e?u:undefined,e,null)}})}),i.fn.size=function(){return this.length},i.fn.andSelf=i.fn.addBack,typeof define=="function"&&define.amd&&define("jquery",[],function(){return i}),du=n.jQuery,gu=n.$,i.noConflict=function(t){return n.$===i&&(n.$=gu),t&&n.jQuery===i&&(n.jQuery=du),i},typeof t===d&&(n.jQuery=n.$=i),i});
/*
//# sourceMappingURL=jquery-2.1.1.min.js.map
*/
///#source 1 1 /Scripts/underscore-min.js
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?void(this._wrapped=n):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.6.0";var A=j.each=j.forEach=function(n,t,e){if(null==n)return n;if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return;return n};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var O="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},j.find=j.detect=function(n,t,r){var e;return k(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var k=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:k(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,j.property(t))},j.where=function(n,t){return j.filter(n,j.matches(t))},j.findWhere=function(n,t){return j.find(n,j.matches(t))},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);var e=-1/0,u=-1/0;return A(n,function(n,i,a){var o=t?t.call(r,n,i,a):n;o>u&&(e=n,u=o)}),e},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);var e=1/0,u=1/0;return A(n,function(n,i,a){var o=t?t.call(r,n,i,a):n;u>o&&(e=n,u=o)}),e},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return null==t||r?(n.length!==+n.length&&(n=j.values(n)),n[j.random(n.length-1)]):j.shuffle(n).slice(0,Math.max(0,t))};var E=function(n){return null==n?j.identity:j.isFunction(n)?n:j.property(n)};j.sortBy=function(n,t,r){return t=E(t),j.pluck(j.map(n,function(n,e,u){return{value:n,index:e,criteria:t.call(r,n,e,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=E(r),A(t,function(i,a){var o=r.call(e,i,a,t);n(u,o,i)}),u}};j.groupBy=F(function(n,t,r){j.has(n,t)?n[t].push(r):n[t]=[r]}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=E(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:0>t?[]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.partition=function(n,t){var r=[],e=[];return A(n,function(n){(t(n)?r:e).push(n)}),[r,e]},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.contains(t,n)})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){for(var r=0,e=t.slice(),u=0,i=e.length;i>u;u++)e[u]===j&&(e[u]=arguments[r++]);for(;r<arguments.length;)e.push(arguments[r++]);return n.apply(this,e)}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:j.now(),a=null,i=n.apply(e,u),e=u=null};return function(){var l=j.now();o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u),e=u=null):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o,c=function(){var l=j.now()-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u),i=u=null))};return function(){i=this,u=arguments,a=j.now();var l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u),i=u=null),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return j.partial(t,n)},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=function(n){if(!j.isObject(n))return[];if(w)return w(n);var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o)&&"constructor"in n&&"constructor"in t)return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.constant=function(n){return function(){return n}},j.property=function(n){return function(t){return t[n]}},j.matches=function(n){return function(t){if(t===n)return!0;for(var r in n)if(n[r]!==t[r])return!1;return!0}},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},j.now=Date.now||function(){return(new Date).getTime()};var T={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};T.unescape=j.invert(T.escape);var I={escape:new RegExp("["+j.keys(T.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(T.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(I[n],function(t){return T[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}}),"function"==typeof define&&define.amd&&define("underscore",[],function(){return j})}).call(this);
//# sourceMappingURL=underscore-min.map
///#source 1 1 /Scripts/angular.min.js
/**
 * @license AngularJS v1.2.0
 * (c) 2010-2012 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(n,t,i){"use strict";function v(n){return function(){var r=arguments[0],f="["+(n?n+":":"")+r+"] ",s=arguments[1],u=arguments,c=function(n){return h(n)?n.toString().replace(/ \{[\s\S]*$/,""):o(n)?"undefined":e(n)?n:JSON.stringify(n)},t,i;for(t=f+s.replace(/\{\d+\}/g,function(n){var i=+n.slice(1,-1),t;return i+2<u.length?(t=u[i+2],h(t))?t.toString().replace(/ ?\{[\s\S]*$/,""):o(t)?"undefined":e(t)?t:ot(t):n}),t=t+"\nhttp://errors.angularjs.org/"+hu.full+"/"+(n?n+"/":"")+r,i=2;i<arguments.length;i++)t=t+(i==2?"?":"&")+"p"+(i-2)+"="+encodeURIComponent(c(arguments[i]));return new Error(t)}}function nu(n){if(n==null||ii(n))return!1;var t=n.length;return n.nodeType===1&&t?!0:e(n)||s(n)||t===0||typeof t=="number"&&t>0&&t-1 in n}function r(n,t,i){var u;if(n)if(h(n))for(u in n)u!="prototype"&&u!="length"&&u!="name"&&n.hasOwnProperty(u)&&t.call(i,n[u],u);else if(n.forEach&&n.forEach!==r)n.forEach(t,i);else if(nu(n))for(u=0;u<n.length;u++)t.call(i,n[u],u);else for(u in n)n.hasOwnProperty(u)&&t.call(i,n[u],u);return n}function cf(n){var t=[];for(var i in n)n.hasOwnProperty(i)&&t.push(i);return t.sort()}function rs(n,t,i){for(var r=cf(n),u=0;u<r.length;u++)t.call(i,n[r[u]],r[u]);return r}function lf(n){return function(t,i){n(i,t)}}function ur(){for(var n=et.length,t;n;){if(n--,t=et[n].charCodeAt(0),t==57)return et[n]="A",et.join("");if(t==90)et[n]="0";else return et[n]=String.fromCharCode(t+1),et.join("")}return et.unshift("0"),et.join("")}function af(n,t){t?n.$$hashKey=t:delete n.$$hashKey}function a(n){var t=n.$$hashKey;return r(arguments,function(t){t!==n&&r(t,function(t,i){n[i]=t})}),af(n,t),n}function k(n){return parseInt(n,10)}function vf(n,t){return a(new(a(function(){},{prototype:n})),t)}function c(){}function ti(n){return n}function nt(n){return function(){return n}}function o(n){return typeof n=="undefined"}function f(n){return typeof n!="undefined"}function p(n){return n!=null&&typeof n=="object"}function e(n){return typeof n=="string"}function tu(n){return typeof n=="number"}function li(n){return si.apply(n)=="[object Date]"}function s(n){return si.apply(n)=="[object Array]"}function h(n){return typeof n=="function"}function fr(n){return si.apply(n)=="[object RegExp]"}function ii(n){return n&&n.document&&n.location&&n.alert&&n.setInterval}function er(n){return n&&n.$evalAsync&&n.$watch}function us(n){return si.apply(n)==="[object File]"}function fs(n){return n&&(n.nodeName||n.on&&n.find)}function es(n,t,i){var u=[];return r(n,function(n,r,f){u.push(t.call(i,n,r,f))}),u}function os(n,t){return or(n,t)!=-1}function or(n,t){if(n.indexOf)return n.indexOf(t);for(var i=0;i<n.length;i++)if(t===n[i])return i;return-1}function ai(n,t){var i=or(n,t);return i>=0&&n.splice(i,1),t}function rt(n,t){var i,f,u;if(ii(n)||er(n))throw hi("cpws","Can't copy! Making copies of Window or Scope instances is not supported.");if(t){if(n===t)throw hi("cpi","Can't copy! Source and destination are identical.");if(s(n))for(t.length=0,i=0;i<n.length;i++)t.push(rt(n[i]));else{f=t.$$hashKey;r(t,function(n,i){delete t[i]});for(u in n)t[u]=rt(n[u]);af(t,f)}}else t=n,n&&(s(n)?t=rt(n,[]):li(n)?t=new Date(n.getTime()):fr(n)?t=new RegExp(n.source):p(n)&&(t=rt(n,{})));return t}function ss(n,t){t=t||{};for(var i in n)n.hasOwnProperty(i)&&i.substr(0,2)!=="$$"&&(t[i]=n[i]);return t}function ri(n,t){if(n===t)return!0;if(n===null||t===null)return!1;if(n!==n&&t!==t)return!0;var f=typeof n,o=typeof t,e,r,u;if(f==o&&f=="object")if(s(n)){if(!s(t))return!1;if((e=n.length)==t.length){for(r=0;r<e;r++)if(!ri(n[r],t[r]))return!1;return!0}}else{if(li(n))return li(t)&&n.getTime()==t.getTime();if(fr(n)&&fr(t))return n.toString()==t.toString();if(er(n)||er(t)||ii(n)||ii(t)||s(t))return!1;u={};for(r in n)if(r.charAt(0)!=="$"&&!h(n[r])){if(!ri(n[r],t[r]))return!1;u[r]=!0}for(r in t)if(!u.hasOwnProperty(r)&&r.charAt(0)!=="$"&&t[r]!==i&&!h(t[r]))return!1;return!0}return!1}function yf(){return t.securityPolicy&&t.securityPolicy.isActive||t.querySelector&&!!(t.querySelector("[ng-csp]")||t.querySelector("[data-ng-csp]"))}function iu(n,t,i){return n.concat(gr.call(t,i))}function ru(n,t){return gr.call(n,t||0)}function uu(n,t){var i=arguments.length>2?ru(arguments,2):[];return!h(t)||t instanceof RegExp?t:i.length?function(){return arguments.length?t.apply(n,i.concat(gr.call(arguments,0))):t.apply(n,i)}:function(){return arguments.length?t.apply(n,arguments):t.call(n)}}function hs(n,r){var u=r;return typeof n=="string"&&n.charAt(0)==="$"?u=i:ii(r)?u="$WINDOW":r&&t===r?u="$DOCUMENT":er(r)&&(u="$SCOPE"),u}function ot(n,t){return typeof n=="undefined"?i:JSON.stringify(n,hs,t?"  ":null)}function pf(n){return e(n)?JSON.parse(n):n}function vi(n){if(n&&n.length!==0){var t=l(""+n);n=!(t=="f"||t=="0"||t=="false"||t=="no"||t=="n"||t=="[]")}else n=!1;return n}function ut(n){n=u(n).clone();try{n.html("")}catch(i){}var t=u("<div>").append(n).html();try{return n[0].nodeType===3?l(t):t.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,function(n,t){return"<"+l(t)})}catch(i){return l(t)}}function wf(n){try{return decodeURIComponent(n)}catch(t){}}function bf(n){var i={},u,t;return r((n||"").split("&"),function(n){if(n&&(u=n.split("="),t=wf(u[0]),f(t))){var r=f(u[1])?wf(u[1]):!0;i[t]?s(i[t])?i[t].push(r):i[t]=[i[t],r]:i[t]=r}}),i}function kf(n){var t=[];return r(n,function(n,i){s(n)?r(n,function(n){t.push(kt(i,!0)+(n===!0?"":"="+kt(n,!0)))}):t.push(kt(i,!0)+(n===!0?"":"="+kt(n,!0)))}),t.length?t.join("&"):""}function fu(n){return kt(n,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function kt(n,t){return encodeURIComponent(n).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,t?"%20":"+")}function cs(n,i){function e(n){n&&s.push(n)}var s=[n],u,f,o=["ng:app","ng-app","x-ng-app","data-ng-app"],h=/\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;r(o,function(i){o[i]=!0;e(t.getElementById(i));i=i.replace(":","\\:");n.querySelectorAll&&(r(n.querySelectorAll("."+i),e),r(n.querySelectorAll("."+i+"\\:"),e),r(n.querySelectorAll("["+i+"]"),e))});r(s,function(n){if(!u){var i=" "+n.className+" ",t=h.exec(i);t?(u=n,f=(t[2]||"").replace(/\s+/g,",")):r(n.attributes,function(t){!u&&o[t.name]&&(u=n,f=t.value)})}});u&&i(u,f?[f]:[])}function df(i,f){var e=function(){var r,n;if(i=u(i),i.injector()){r=i[0]===t?"document":ut(i);throw hi("btstrpd","App Already Bootstrapped with this Element '{0}'",r);}return f=f||[],f.unshift(["$provide",function(n){n.value("$rootElement",i)}]),f.unshift("ng"),n=oe(f),n.invoke(["$rootScope","$rootElement","$compile","$injector","$animate",function(n,t,i,r){n.$apply(function(){t.data("$injector",r);i(t)(n)})}]),n},o=/^NG_DEFER_BOOTSTRAP!/;if(n&&!o.test(n.name))return e();n.name=n.name.replace(o,"");rr.resumeBootstrap=function(n){r(n,function(n){f.push(n)});e()}}function sr(n,t){return t=t||"_",n.replace(gf,function(n,i){return(i?t:"")+n.toLowerCase()})}function ls(){bt=n.jQuery;bt?(u=bt,a(bt.fn,{scope:dt.scope,isolateScope:dt.isolateScope,controller:dt.controller,injector:dt.injector,inheritedData:dt.inheritedData}),au("remove",!0,!0,!1),au("empty",!1,!1,!1),au("html",!1,!1,!0)):u=w;rr.element=u}function eu(n,t,i){if(!n)throw hi("areq","Argument '{0}' is {1}",t||"?",i||"required");return n}function yi(n,t,i){return i&&s(n)&&(n=n[n.length-1]),eu(h(n),t,"not a function, got "+(n&&typeof n=="object"?n.constructor.name||"Object":typeof n)),n}function vt(n,t){if(n==="hasOwnProperty")throw hi("badname","hasOwnProperty is not a valid {0} name",t);}function ou(n,t,i){var r;if(!t)return n;var u=t.split("."),f,e=n,o=u.length;for(r=0;r<o;r++)f=u[r],n&&(n=(e=n)[f]);return!i&&h(n)?uu(e,n):n}function su(n){if(n.startNode===n.endNode)return u(n.startNode);var t=n.startNode,i=[t];do{if(t=t.nextSibling,!t)break;i.push(t)}while(t!==n.endNode);return u(i)}function as(n){function t(n,t,i){return n[t]||(n[t]=i())}var i=v("$injector");return t(t(n,"angular",Object),"module",function(){var n={};return function(r,u,f){return vt(r,"module"),u&&n.hasOwnProperty(r)&&(n[r]=null),t(n,r,function(){function n(n,i,r){return function(){return t[r||"push"]([n,i,arguments]),s}}if(!u)throw i("nomod","Module '{0}' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.",r);var t=[],e=[],o=n("$injector","invoke"),s={_invokeQueue:t,_runBlocks:e,requires:u,name:r,provider:n("$provide","provider"),factory:n("$provide","factory"),service:n("$provide","service"),value:n("$provide","value"),constant:n("$provide","constant","unshift"),animation:n("$animateProvider","register"),filter:n("$filterProvider","register"),controller:n("$controllerProvider","register"),directive:n("$compileProvider","directive"),config:o,run:function(n){return e.push(n),this}};return f&&o(f),s})}})}function vs(t){a(t,{bootstrap:df,copy:rt,extend:a,equals:ri,element:u,forEach:r,injector:oe,noop:c,bind:uu,toJson:ot,fromJson:pf,identity:ti,isUndefined:o,isDefined:f,isString:e,isFunction:h,isObject:p,isNumber:tu,isElement:fs,isArray:s,version:hu,isDate:li,lowercase:l,uppercase:wt,callbacks:{counter:0},$$minErr:v,$$csp:yf});ci=as(n);try{ci("ngLocale")}catch(i){ci("ngLocale",[]).provider("$locale",wh)}ci("ng",["ngLocale"],["$provide",function(n){n.provider("$compile",ce).directive({a:vo,input:bo,textarea:bo,form:nl,script:wa,select:da,style:nv,option:ga,ngBind:wl,ngBindHtml:kl,ngBindTemplate:bl,ngClass:dl,ngClassEven:na,ngClassOdd:gl,ngCloak:ta,ngController:ia,ngForm:tl,ngHide:ca,ngIf:ra,ngInclude:ua,ngInit:fa,ngNonBindable:ea,ngPluralize:oa,ngRepeat:sa,ngShow:ha,ngStyle:la,ngSwitch:aa,ngSwitchWhen:va,ngSwitchDefault:ya,ngOptions:ka,ngTransclude:pa,ngModel:ll,ngList:vl,ngChange:al,required:ko,ngRequired:ko,ngValue:pl}).directive(pr).directive(go);n.provider({$anchorScroll:rh,$animate:he,$browser:fh,$cacheFactory:eh,$controller:sh,$document:hh,$exceptionHandler:ch,$filter:fo,$interpolate:yh,$interval:ph,$http:lh,$httpBackend:ah,$location:gh,$log:nc,$parse:ic,$rootScope:fc,$q:rc,$sce:hc,$sceDelegate:sc,$sniffer:cc,$templateCache:oh,$timeout:lc,$window:ac})}])}function ps(){return++ys}function wi(n){return n.replace(ws,function(n,t,i,r){return r?i.toUpperCase():i}).replace(bs,"Moz$1")}function au(n,t,i,r){function e(n){var s=i&&n?[this.filter(n)]:[this],h=t,c,e,a,l,o,v,y;if(!r||n!=null)while(s.length)for(c=s.shift(),e=0,a=c.length;e<a;e++)for(l=u(c[e]),h?l.triggerHandler("$destroy"):h=!h,o=0,v=(y=l.children()).length;o<v;o++)s.push(bt(y[o]));return f.apply(this,arguments)}var f=bt.fn[n];f=f.$original||f;e.$original=f;bt.fn[n]=e}function w(n){var i,r;if(n instanceof w)return n;if(!(this instanceof w)){if(e(n)&&n.charAt(0)!="<")throw lu("nosel","Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element");return new w(n)}e(n)?(i=t.createElement("div"),i.innerHTML="<div>&#160;<\/div>"+n,i.removeChild(i.firstChild),bu(this,i.childNodes),r=u(t.createDocumentFragment()),r.append(this)):bu(this,n)}function vu(n){return n.cloneNode(!0)}function bi(n){ie(n);for(var t=0,i=n.childNodes||[];t<i.length;t++)bi(i[t])}function te(n,t,i,u){if(f(u))throw lu("offargs","jqLite#off() does not support the `selector` argument");var e=st(n,"events"),s=st(n,"handle");s&&(o(t)?r(e,function(t,i){cu(n,i,t);delete e[i]}):r(t.split(" "),function(t){o(i)?(cu(n,t,e[t]),delete e[t]):ai(e[t]||[],i)}))}function ie(n,t){var u=n[hr],r=pi[u];if(r){if(t){delete pi[u].data[t];return}r.handle&&(r.events.$destroy&&r.handle({},"$destroy"),te(n));delete pi[u];n[hr]=i}}function st(n,t,i){var u=n[hr],r=pi[u||-1];if(f(i))r||(n[hr]=u=ps(),r=pi[u]={}),r[t]=i;else return r&&r[t]}function re(n,t,i){var r=st(n,"data"),u=f(i),e=!u&&f(t),o=e&&!p(t);if(r||o||st(n,"data",r={}),u)r[t]=i;else if(e){if(o)return r&&r[t];a(r,t)}else return r}function yu(n,t){return n.getAttribute?(" "+(n.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+t+" ")>-1:!1}function pu(n,t){t&&n.setAttribute&&r(t.split(" "),function(t){n.setAttribute("class",g((" "+(n.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").replace(" "+g(t)+" "," ")))})}function wu(n,t){if(t&&n.setAttribute){var i=(" "+(n.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");r(t.split(" "),function(n){n=g(n);i.indexOf(" "+n+" ")===-1&&(i+=n+" ")});n.setAttribute("class",g(i))}}function bu(n,t){if(t){t=!t.nodeName&&f(t.length)&&!ii(t)?t:[t];for(var i=0;i<t.length;i++)n.push(t[i])}}function ue(n,t){return cr(n,"$"+(t||"ngController")+"Controller")}function cr(n,t,r){var e,f,o;for(n=u(n),n[0].nodeType==9&&(n=n.find("html")),e=s(t)?t:[t];n.length;){for(f=0,o=e.length;f<o;f++)if((r=n.data(e[f]))!==i)return r;n=n.parent()}}function fe(n,t){var i=ki[t.toLowerCase()];return i&&ku[n.nodeName]&&i}function ks(n,i){var u=function(u,f){if(u.preventDefault||(u.preventDefault=function(){u.returnValue=!1}),u.stopPropagation||(u.stopPropagation=function(){u.cancelBubble=!0}),u.target||(u.target=u.srcElement||t),o(u.defaultPrevented)){var e=u.preventDefault;u.preventDefault=function(){u.defaultPrevented=!0;e.call(u)};u.defaultPrevented=!1}u.isDefaultPrevented=function(){return u.defaultPrevented||u.returnValue===!1};r(i[f||u.type],function(t){t.call(n,u)});y<=8?(u.preventDefault=null,u.stopPropagation=null,u.isDefaultPrevented=null):(delete u.preventDefault,delete u.stopPropagation,delete u.isDefaultPrevented)};return u.elem=n,u}function ui(n){var r=typeof n,t;return r=="object"&&n!==null?typeof(t=n.$$hashKey)=="function"?t=n.$$hashKey():t===i&&(t=n.$$hashKey=ur()):t=n,r+":"+t}function di(n){r(n,this.put,this)}function ee(n){var t,u,f,i;return typeof n=="function"?(t=n.$inject)||(t=[],n.length&&(u=n.toString().replace(ih,""),f=u.match(gs),r(f[1].split(nh),function(n){n.replace(th,function(n,i,r){t.push(r)})})),n.$inject=t):s(n)?(i=n.length-1,yi(n[i],"fn"),t=n.slice(0,i)):yi(n,"fn",!0),t}function oe(n){function f(n){return function(t,i){if(p(t))r(t,lf(n));else return n(t,i)}}function b(n,r){if(vt(n,"service"),(h(r)||s(r))&&(r=t.instantiate(r)),!r.$get)throw gi("pget","Provider '{0}' must define $get factory method.",n);return i[n+o]=r}function v(n,t){return b(n,{$get:t})}function g(n,t){return v(n,["$injector",function(n){return n.instantiate(t)}])}function tt(n,t){return v(n,nt(t))}function it(n,t){vt(n,"constant");i[n]=t;a[n]=t}function rt(n,i){var r=t.get(n+o),f=r.$get;r.$get=function(){var n=u.invoke(f,r);return u.invoke(i,null,{$delegate:n})}}function k(n){var i=[],u,o,f,c;return r(n,function(n){if(!w.get(n)){w.put(n,!0);try{if(e(n))for(u=ci(n),i=i.concat(k(u.requires)).concat(u._runBlocks),o=u._invokeQueue,f=0,c=o.length;f<c;f++){var l=o[f],a=t.get(l[0]);a[l[1]].apply(a,l[2])}else h(n)?i.push(t.invoke(n)):s(n)?i.push(t.invoke(n)):yi(n,"module")}catch(r){s(n)&&(n=n[n.length-1]);r.message&&r.stack&&r.stack.indexOf(r.message)==-1&&(r=r.message+"\n"+r.stack);throw gi("modulerr","Failed to instantiate module {0} due to:\n{1}",n,r.stack||r.message||r);}}}),i}function d(n,t){function r(i){if(n.hasOwnProperty(i)){if(n[i]===y)throw gi("cdep","Circular dependency found: {0}",l.join(" <- "));return n[i]}try{return l.unshift(i),n[i]=y,n[i]=t(i)}finally{l.shift()}}function u(n,t,i){for(var u=[],s=ee(n),f,e=0,o=s.length;e<o;e++){if(f=s[e],typeof f!="string")throw gi("itkn","Incorrect injection token! Expected service name as string, got {0}",f);u.push(i&&i.hasOwnProperty(f)?i[f]:r(f))}n.$inject||(n=n[o]);switch(t?-1:u.length){case 0:return n();case 1:return n(u[0]);case 2:return n(u[0],u[1]);case 3:return n(u[0],u[1],u[2]);case 4:return n(u[0],u[1],u[2],u[3]);case 5:return n(u[0],u[1],u[2],u[3],u[4]);case 6:return n(u[0],u[1],u[2],u[3],u[4],u[5]);case 7:return n(u[0],u[1],u[2],u[3],u[4],u[5],u[6]);case 8:return n(u[0],u[1],u[2],u[3],u[4],u[5],u[6],u[7]);case 9:return n(u[0],u[1],u[2],u[3],u[4],u[5],u[6],u[7],u[8]);case 10:return n(u[0],u[1],u[2],u[3],u[4],u[5],u[6],u[7],u[8],u[9]);default:return n.apply(t,u)}}function f(n,t){var f=function(){},r,i;return f.prototype=(s(n)?n[n.length-1]:n).prototype,r=new f,i=u(n,r,t),p(i)||h(i)?i:r}return{invoke:u,instantiate:f,get:r,annotate:ee,has:function(t){return i.hasOwnProperty(t+o)||n.hasOwnProperty(t)}}}var y={},o="Provider",l=[],w=new di,i={$provide:{provider:f(b),factory:f(v),service:f(g),value:f(tt),constant:f(it),decorator:rt}},t=i.$injector=d(i,function(){throw gi("unpr","Unknown provider: {0}",l.join(" <- "));}),a={},u=a.$injector=d(a,function(n){var i=t.get(n+o);return u.invoke(i.$get,i)});return r(k(n),function(n){u.invoke(n||c)}),u}function rh(){var n=!0;this.disableAutoScrolling=function(){n=!1};this.$get=["$window","$location","$rootScope",function(t,i,u){function o(n){var t=null;return r(n,function(n){t||l(n.nodeName)!=="a"||(t=n)}),t}function e(){var n=i.hash(),r;n?(r=f.getElementById(n))?r.scrollIntoView():(r=o(f.getElementsByName(n)))?r.scrollIntoView():n==="top"&&t.scrollTo(0,0):t.scrollTo(0,0)}var f=t.document;return n&&u.$watch(function(){return i.hash()},function(){u.$evalAsync(e)}),e}]}function uh(n,t,f,s){function d(n){try{n.apply(null,ru(arguments,1))}finally{if(a--,a===0)while(p.length)try{p.pop()()}catch(t){f.error(t)}}}function ct(n,t){(function i(){r(w,function(n){n()});ot=t(i,n)})()}function rt(){(nt=null,b!=h.url())&&(b=h.url(),r(tt,function(n){n(h.url())}))}var h=this,v=t[0],l=n.location,ft=n.history,et=n.setTimeout,ht=n.clearTimeout,y={},a,p,w,ot,tt,it;h.isMock=!1;a=0;p=[];h.$$completeOutstandingRequest=d;h.$$incOutstandingRequestCount=function(){a++};h.notifyWhenNoOutstandingRequests=function(n){r(w,function(n){n()});a===0?n():p.push(n)};w=[];h.addPollFn=function(n){return o(ot)&&ct(100,et),w.push(n),n};var b=l.href,g=t.find("base"),nt=null;h.url=function(t,i){return l!==n.location&&(l=n.location),t?b==t?void 0:(b=t,s.history?i?ft.replaceState(null,"",t):(ft.pushState(null,"",t),g.attr("href",g.attr("href"))):(nt=t,i?l.replace(t):l.href=t),h):nt||l.href.replace(/%27/g,"'")};tt=[];it=!1;h.onUrlChange=function(t){if(!it){if(s.history)u(n).on("popstate",rt);if(s.hashchange)u(n).on("hashchange",rt);else h.addPollFn(rt);it=!0}return tt.push(t),t};h.baseHref=function(){var n=g.attr("href");return n?n.replace(/^https?\:\/\/[^\/]*/,""):""};var k={},ut="",st=h.baseHref();h.cookies=function(n,t){var s,h,r,u,o;if(n)t===i?v.cookie=escape(n)+"=;path="+st+";expires=Thu, 01 Jan 1970 00:00:00 GMT":e(t)&&(s=(v.cookie=escape(n)+"="+escape(t)+";path="+st).length+1,s>4096&&f.warn("Cookie '"+n+"' possibly not set or overflowed because it was too large ("+s+" > 4096 bytes)!"));else{if(v.cookie!==ut)for(ut=v.cookie,h=ut.split("; "),k={},u=0;u<h.length;u++)r=h[u],o=r.indexOf("="),o>0&&(n=unescape(r.substring(0,o)),k[n]===i&&(k[n]=unescape(r.substring(o+1))));return k}};h.defer=function(n,t){var i;return a++,i=et(function(){delete y[i];d(n)},t||0),y[i]=!0,i};h.defer.cancel=function(n){return y[n]?(delete y[n],ht(n),d(c),!0):!1}}function fh(){this.$get=["$window","$log","$sniffer","$document",function(n,t,i,r){return new uh(n,r,t,i)}]}function eh(){this.$get=function(){function t(t,i){function l(n){n!=f&&(r?r==n&&(r=n.n):r=n,h(n.n,n.p),h(n,f),f=n,f.n=null)}function h(n,t){n!=t&&(n&&(n.p=t),t&&(t.n=n))}if(t in n)throw v("$cacheFactory")("iid","CacheId '{0}' is already taken!",t);var s=0,c=a({},i,{id:t}),e={},y=i&&i.capacity||Number.MAX_VALUE,u={},f=null,r=null;return n[t]={put:function(n,t){var i=u[n]||(u[n]={key:n});if(l(i),!o(t))return n in e||s++,e[n]=t,s>y&&this.remove(r.key),t},get:function(n){var t=u[n];if(t)return l(t),e[n]},remove:function(n){var t=u[n];t&&(t==f&&(f=t.p),t==r&&(r=t.n),h(t.n,t.p),delete u[n],delete e[n],s--)},removeAll:function(){e={};s=0;u={};f=r=null},destroy:function(){e=null;c=null;u=null;delete n[t]},info:function(){return a({},c,{size:s})}}}var n={};return t.info=function(){var t={};return r(n,function(n,i){t[i]=n.info()}),t},t.get=function(t){return n[t]},t}}function oh(){this.$get=["$cacheFactory",function(n){return n("templates")}]}function ce(n){var o={},v="Directive",w=/^\s*directive\:\s*([\d\w\-_]+)\s+(.*)$/,b=/(([\d\w\-_]+)(?:\:([^;]+))?;?)/,c=/^\s*(https?|ftp|mailto|tel|file):/,l=/^\s*(https?|ftp|file):|data:image\//,k=/^(on[a-z]+|formaction)$/;this.directive=function d(t,i){return vt(t,"directive"),e(t)?(eu(i,"directiveFactory"),o.hasOwnProperty(t)||(o[t]=[],n.factory(t+v,["$injector","$exceptionHandler",function(n,i){var u=[];return r(o[t],function(r,f){try{var e=n.invoke(r);h(e)?e={compile:nt(e)}:!e.compile&&e.link&&(e.compile=nt(e.link));e.priority=e.priority||0;e.index=f;e.name=e.name||t;e.require=e.require||e.controller&&e.name;e.restrict=e.restrict||"A";u.push(e)}catch(o){i(o)}}),u}])),o[t].push(i)):r(t,lf(d)),this};this.aHrefSanitizationWhitelist=function(n){return f(n)?(c=n,this):c};this.imgSrcSanitizationWhitelist=function(n){return f(n)?(l=n,this):l};this.$get=["$injector","$interpolate","$exceptionHandler","$http","$templateCache","$parse","$controller","$rootScope","$document","$sce","$animate",function(n,f,d,tt,rt,ft,et,ot,st,ct,lt){function bt(n,t,i,f,e){n instanceof u||(n=u(n));r(n,function(t,i){t.nodeType==3&&t.nodeValue.match(/\S+/)&&(n[i]=t=u(t).wrap("<span><\/span>").parent()[0])});var o=kt(n,t,n,i,f,e);return function(t,i){var r,u,e,f;for(eu(t,"scope"),r=i?dt.clone.call(n):n,u=0,e=r.length;u<e;u++)f=r[u],(f.nodeType==1||f.nodeType==9)&&r.eq(u).data("$scope",t);return at(r,"ng-scope"),i&&i(r,t),o&&o(t,r,r),r}}function at(n,t){try{n.addClass(t)}catch(i){}}function kt(n,t,r,f,e,o){function p(n,r,f,e){for(var s,h,l,y,a,p,w,b=[],o=0,v=r.length;o<v;o++)b.push(r[o]);for(o=0,w=0,v=c.length;o<v;w++)l=b[w],s=c[o++],h=c[o++],y=u(l),s?(s.scope?(a=n.$new(),y.data("$scope",a),at(y,"ng-scope")):a=n,p=s.transclude,p||!e&&t?s(h,a,l,f,function(t){return function(i){var r=n.$new();r.$$transcluded=!0;return t(r,i).on("$destroy",uu(r,r.$destroy))}}(p||t)):s(h,a,l,i,e)):h&&h(n,l.childNodes,i,e)}for(var c=[],h,l,a,v,y,s=0;s<n.length;s++)v=new wt,a=ii(n[s],[],v,s===0?f:i,e),h=a.length?si(a,n[s],v,t,r,null,[],[],o):null,l=h&&h.terminal||!n[s].childNodes||!n[s].childNodes.length?null:kt(n[s].childNodes,h?h.transclude:t),c.push(h),c.push(l),y=y||h||l,o=null;return y?p:null}function ii(n,t,i,r,u){var tt=n.nodeType,it=i.$attr,s,h,p,k,nt;switch(tt){case 1:yt(t,ht(ni(n).toLowerCase()),"E",r,u);for(var l,f,o,c,d,a=n.attributes,v=0,rt=a&&a.length;v<rt;v++)p=!1,k=!1,l=a[v],(!y||y>=8||l.specified)&&(f=l.name,c=ht(f),ai.test(c)&&(f=sr(c.substr(6),"-")),nt=c.replace(/(Start|End)$/,""),c===nt+"Start"&&(p=f,k=f.substr(0,f.length-5)+"end",f=f.substr(0,f.length-6)),o=ht(f.toLowerCase()),it[o]=f,i[o]=d=g(y&&f=="href"?decodeURIComponent(n.getAttribute(f,2)):l.value),fe(n,o)&&(i[o]=!0),bi(n,t,d,o),yt(t,o,"A",r,u,p,k));if(h=n.className,e(h)&&h!=="")while(s=b.exec(h))o=ht(s[2]),yt(t,o,"C",r,u)&&(i[o]=g(s[3])),h=h.substr(s.index+s[0].length);break;case 3:pi(t,n.nodeValue);break;case 8:try{s=w.exec(n.nodeValue);s&&(o=ht(s[1]),yt(t,o,"M",r,u)&&(i[o]=g(s[2])))}catch(ut){}}return t.sort(yi),t}function ri(n,t,i){var r=[],f=0,e;if(t&&n.hasAttribute&&n.hasAttribute(t)){e=n;do{if(!n)throw it("uterdir","Unterminated attribute, found '{0}' but no matching '{1}' found.",t,i);n.nodeType==1&&(n.hasAttribute(t)&&f++,n.hasAttribute(i)&&f--);r.push(n);n=n.nextSibling}while(f>0)}else r.push(n);return u(r)}function oi(n,t,i){return function(r,u,f,e){return u=ri(u[0],t,i),n(r,u,f,e)}}function si(n,o,c,l,a,v,y,w,b){function bi(n,t,i,r){n&&(i&&(n=oi(n,i,r)),n.require=k.require,(nt===k||k.$$isolateScope)&&(n=li(n,{isolateScope:!0})),y.push(n));t&&(i&&(t=oi(t,i,r)),t.require=k.require,(nt===k||k.$$isolateScope)&&(t=li(t,{isolateScope:!0})),w.push(t))}function yi(n,t){var i,f="data",u=!1;if(e(n)){while((i=n.charAt(0))=="^"||i=="?")n=n.substr(1),i=="^"&&(f="inheritedData"),u=u||i=="?";if(i=t[f]("$"+n+"Controller"),t[0].nodeType==8&&t[0].$$controller&&(i=i||t[0].$$controller,t[0].$$controller=null),!i&&!u)throw it("ctreq","Controller '{0}', required by directive '{1}', can't be found!",n,st);return i}return s(n)&&(i=[],r(n,function(n){i.push(yi(n,t))})),i}function ui(n,t,e,s,h){var a,v,b,rt,p,k,l,ot,g,tt;for(a=o===e?c:ss(c,new wt(u(e),c.$attr)),v=a.$$element,nt&&(ot=/^\s*([@=&])(\??)\s*(\w*)\s*$/,g=u(e),l=t.$new(!0),lt&&lt===nt.$$originalDirective?g.data("$isolateScope",l):g.data("$isolateScopeNoTemplate",l),at(g,"ng-isolate-scope"),r(nt.scope,function(n,i){var o=n.match(ot)||[],r=o[3]||i,c=o[2]=="?",s=o[1],e,u,h;l.$$isolateBindings[i]=s+r;switch(s){case"@":a.$observe(r,function(n){l[i]=n});a.$$observers[r].$$scope=t;a[r]&&(l[i]=f(a[r])(t));break;case"=":if(c&&!a[r])return;u=ft(a[r]);h=u.assign||function(){e=l[i]=u(t);throw it("nonassign","Expression '{0}' used with directive '{1}' is non-assignable!",a[r],nt.name);};e=l[i]=u(t);l.$watch(function(){var n=u(t);return n!==l[i]&&(n!==e?e=l[i]=n:h(t,n=e=l[i])),n});break;case"&":u=ft(a[r]);l[i]=function(n){return u(t,n)};break;default:throw it("iscp","Invalid isolate scope definition for directive '{0}'. Definition: {... {1}: '{2}' ...}",nt.name,i,n);}})),ct&&r(ct,function(n){var r={$scope:n===nt||n.$$isolateScope?l:t,$element:v,$attrs:a,$transclude:h},i;k=n.controller;k=="@"&&(k=a[n.name]);i=et(k,r);v[0].nodeType==8?v[0].$$controller=i:v.data("$"+n.name+"Controller",i);n.controllerAs&&(r.$scope[n.controllerAs]=i)}),b=0,rt=y.length;b<rt;b++)try{p=y[b];p(p.isolateScope?l:t,v,a,p.require&&yi(p.require,v))}catch(st){d(st,ut(v))}for(tt=t,nt&&(nt.template||nt.templateUrl===null)&&(tt=l),n&&n(tt,e.childNodes,i,h),b=w.length-1;b>=0;b--)try{p=w[b];p(p.isolateScope?l:t,v,a,p.require&&yi(p.require,v))}catch(st){d(st,ut(v))}}var ht,ai,kt,ti;b=b||{};var dt=-Number.MAX_VALUE,fi,ct=b.controllerDirectives,nt=b.newIsolateScopeDirective,lt=b.templateDirective,gt=b.transcludeDirective,tt=c.$$element=u(o),k,st,ot,si=v,ni=l,yt,rt;for(ht=0,ai=n.length;ht<ai;ht++){if(k=n[ht],kt=k.$$start,ti=k.$$end,kt&&(tt=ri(o,kt,ti)),ot=i,dt>k.priority)break;if((rt=k.scope)&&(fi=fi||k,k.templateUrl||(vt("new/isolated scope",nt,k,tt),p(rt)&&(nt=k))),st=k.name,!k.templateUrl&&k.controller&&(rt=k.controller,ct=ct||{},vt("'"+st+"' controller",ct[st],k,tt),ct[st]=k),(rt=k.transclude)&&(k.$$tlb||(vt("transclusion",gt,k,tt),gt=k),rt=="element"?(dt=k.priority,ot=ri(o,kt,ti),tt=c.$$element=u(t.createComment(" "+st+": "+c[st]+" ")),o=tt[0],pt(a,u(ru(ot)),o),ni=bt(ot,l,dt,si&&si.name,{transcludeDirective:gt})):(ot=u(vu(o)).contents(),tt.html(""),ni=bt(ot,l))),k.template)if(vt("template",lt,k,tt),lt=k,rt=h(k.template)?k.template(tt,c):k.template,rt=ei(rt),k.replace){if(si=k,ot=u("<div>"+g(rt)+"<\/div>").contents(),o=ot[0],ot.length!=1||o.nodeType!==1)throw it("tplrt","Template for directive '{0}' must have exactly one root element. {1}",st,"");pt(a,tt,o);var pi={$attr:{}},wi=ii(o,[],pi),ki=n.splice(ht+1,n.length-(ht+1));nt&&hi(wi);n=n.concat(wi).concat(ki);ci(c,pi);ai=n.length}else tt.html(rt);if(k.templateUrl)vt("template",lt,k,tt),lt=k,k.replace&&(si=k),ui=vi(n.splice(ht,n.length-ht),tt,c,a,ni,y,w,{controllerDirectives:ct,newIsolateScopeDirective:nt,templateDirective:lt,transcludeDirective:gt}),ai=n.length;else if(k.compile)try{yt=k.compile(tt,c,ni);h(yt)?bi(null,yt,kt,ti):yt&&bi(yt.pre,yt.post,kt,ti)}catch(di){d(di,ut(tt))}k.terminal&&(ui.terminal=!0,dt=Math.max(dt,k.priority))}return ui.scope=fi&&fi.scope===!0,ui.transclude=gt&&ni,ui}function hi(n){for(var t=0,i=n.length;t<i;t++)n[t]=vf(n[t],{$$isolateScope:!0})}function yt(t,r,u,f,e,s,h){var l;if(r===e)return null;if(l=null,o.hasOwnProperty(r))for(var c,y=n.get(r+v),a=0,p=y.length;a<p;a++)try{c=y[a];(f===i||f>c.priority)&&c.restrict.indexOf(u)!=-1&&(s&&(c=vf(c,{$$start:s,$$end:h})),t.push(c),l=c)}catch(w){d(w)}return l}function ci(n,t){var u=t.$attr,f=n.$attr,i=n.$$element;r(n,function(i,r){r.charAt(0)!="$"&&(t[r]&&(i+=(r==="style"?";":" ")+t[r]),n.$set(r,i,!0,u[r]))});r(t,function(t,r){r=="class"?(at(i,t),n["class"]=(n["class"]?n["class"]+" ":"")+t):r=="style"?i.attr("style",i.attr("style")+";"+t):r.charAt(0)=="$"||n.hasOwnProperty(r)||(n[r]=t,f[r]=u[r])})}function vi(n,t,i,f,e,o,s,c){var l=[],y,w,b=t[0],v=n.shift(),d=a({},v,{templateUrl:null,transclude:null,replace:null,$$originalDirective:v}),k=h(v.templateUrl)?v.templateUrl(t,i):v.templateUrl;return t.html(""),tt.get(ct.getTrustedResourceUrl(k),{cache:rt}).success(function(h){var a,nt,tt,rt;if(h=ei(h),v.replace){if(tt=u("<div>"+g(h)+"<\/div>").contents(),a=tt[0],tt.length!=1||a.nodeType!==1)throw it("tplrt","Template for directive '{0}' must have exactly one root element. {1}",v.name,k);nt={$attr:{}};pt(f,t,a);rt=ii(a,[],nt);p(v.scope)&&hi(rt);n=rt.concat(n);ci(i,nt)}else a=b,t.html(h);for(n.unshift(d),y=si(n,a,i,e,t,v,o,s,c),r(f,function(n,i){n==a&&(f[i]=t[0])}),w=kt(t[0].childNodes,e);l.length;){var et=l.shift(),ft=l.shift(),ot=l.shift(),st=l.shift(),ut=t[0];ft!==b&&(ut=vu(a),pt(ot,u(ft),ut));y(w,et,ut,f,st)}l=null}).error(function(n,t,i,r){throw it("tpload","Failed to load template: {0}",r.url);}),function(n,t,i,r,u){l?(l.push(t),l.push(i),l.push(r),l.push(u)):y(w,t,i,r,u)}}function yi(n,t){var i=t.priority-n.priority;return i!==0?i:n.name!==t.name?n.name<t.name?-1:1:n.index-t.index}function vt(n,t,i,r){if(t)throw it("multidir","Multiple directives [{0}, {1}] asking for {2} on: {3}",t.name,i.name,n,ut(r));}function pi(n,t){var i=f(t,!0);i&&n.push({priority:0,compile:nt(function(n,t){var r=t.parent(),u=r.data("$binding")||[];u.push(i);at(r.data("$binding",u),"ng-binding");n.$watch(i,function(n){t[0].nodeValue=n})})})}function wi(n,t){if(t=="xlinkHref"||ni(n)!="IMG"&&(t=="src"||t=="ngSrc"))return ct.RESOURCE_URL}function bi(n,t,i,r){var u=f(i,!0);if(u){if(r==="multiple"&&ni(n)==="SELECT")throw it("selmulti","Binding to the 'multiple' attribute is not supported. Element: {0}",ut(n));t.push({priority:100,compile:function(){return{pre:function(t,i,e){var o=e.$$observers||(e.$$observers={});if(k.test(r))throw it("nodomevents","Interpolations for HTML DOM event attributes are disallowed.  Please use the ng- versions (such as ng-click instead of onclick) instead.");(u=f(e[r],!0,wi(n,r)),u)&&(e[r]=u(t),(o[r]||(o[r]=[])).$$inter=!0,(e.$$observers&&e.$$observers[r].$$scope||t).$watch(u,function(n){e.$set(r,n)}))}}}})}}function pt(n,i,r){var e=i[0],a=i.length,v=e.parentNode,f,y,c,s,w,l;if(n)for(f=0,y=n.length;f<y;f++)if(n[f]==e){n[f++]=r;for(var o=f,h=o+a-1,p=n.length;o<p;o++,h++)h<p?n[o]=n[h]:delete n[o];n.length-=a-1;break}for(v&&v.replaceChild(r,e),c=t.createDocumentFragment(),c.appendChild(e),r[u.expando]=e[u.expando],s=1,w=i.length;s<w;s++)l=i[s],u(l).remove(),c.appendChild(l),delete i[s];i[0]=r;i.length=1}function li(n,t){return a(function(){return n.apply(null,arguments)},n,t)}var wt=function(n,t){this.$$element=n;this.$attr=t||{}};wt.prototype={$normalize:ht,$addClass:function(n){n&&n.length>0&&lt.addClass(this.$$element,n)},$removeClass:function(n){n&&n.length>0&&lt.removeClass(this.$$element,n)},$set:function(n,t,u,f){function v(n,t){var f=[],e=n.split(/\s+/),o=t.split(/\s+/),i,u,r;n:for(i=0;i<e.length;i++){for(u=e[i],r=0;r<o.length;r++)if(u==o[r])continue n;f.push(u)}return f}var o,s,e,h,a;n=="class"?(t=t||"",o=this.$$element.attr("class")||"",this.$removeClass(v(o,t).join(" ")),this.$addClass(v(t,o).join(" "))):(s=fe(this.$$element[0],n),s&&(this.$$element.prop(n,t),f=s),this[n]=t,f?this.$attr[n]=f:(f=this.$attr[n],f||(this.$attr[n]=f=sr(n,"-"))),h=ni(this.$$element),(h==="A"&&n==="href"||h==="IMG"&&n==="src")&&(!y||y>=8)&&(e=gt(t).href,e!==""&&((n!=="href"||e.match(c))&&(n!=="src"||e.match(l))||(this[n]=t="unsafe:"+e))),u!==!1&&(t===null||t===i?this.$$element.removeAttr(f):this.$$element.attr(f,t)));a=this.$$observers;a&&r(a[n],function(n){try{n(t)}catch(i){d(i)}})},$observe:function(n,t){var i=this,r=i.$$observers||(i.$$observers={}),u=r[n]||(r[n]=[]);return u.push(t),ot.$evalAsync(function(){u.$$inter||t(i[n])}),t}};var ui=f.startSymbol(),fi=f.endSymbol(),ei=ui=="{{"||fi=="}}"?ti:function(n){return n.replace(/\{\{/g,ui).replace(/}}/g,fi)},ai=/^ngAttr[A-Z]/;return bt}]}function ht(n){return wi(n.replace(le,""))}function sh(){var n={},t=/^(\S+)(\s+as\s+(\w+))?$/;this.register=function(t,i){vt(t,"controller");p(t)?a(n,t):n[t]=i};this.$get=["$injector","$window",function(i,r){return function(u,f){var h,c,o,s;if(e(u)&&(c=u.match(t),o=c[1],s=c[3],u=n.hasOwnProperty(o)?n[o]:ou(f.$scope,o,!0)||ou(r,o,!0),yi(u,o,!0)),h=i.instantiate(u,f),s){if(!(f&&typeof f.$scope=="object"))throw v("$controller")("noscp","Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.",o||u.name,s);f.$scope[s]=h}return h}}]}function hh(){this.$get=["$window",function(n){return u(n.document)}]}function ch(){this.$get=["$log",function(n){return function(){n.error.apply(n,arguments)}}]}function ae(n){var t={},i,u,f;return n?(r(n.split("\n"),function(n){f=n.indexOf(":");i=l(g(n.substr(0,f)));u=g(n.substr(f+1));i&&(t[i]?t[i]+=", "+u:t[i]=u)}),t):t}function ve(n){var t=p(n)?n:i;return function(i){return(t||(t=ae(n)),i)?t[l(i)]||null:t}}function ye(n,t,i){return h(i)?i(n,t):(r(i,function(i){n=i(n,t)}),n)}function du(n){return 200<=n&&n<300}function lh(){var u=/^\s*(\[|\{[^\{])/,c=/[\}\]]\s*$/,v=/^\)\]\}',?\n/,t={"Content-Type":"application/json;charset=utf-8"},n=this.defaults={transformResponse:[function(n){return e(n)&&(n=n.replace(v,""),u.test(n)&&c.test(n)&&(n=pf(n))),n}],transformRequest:[function(n){return p(n)&&!us(n)?ot(n):n}],headers:{common:{Accept:"application/json, text/plain, */*"},post:t,put:t,patch:t},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN"},y=this.interceptors=[],w=this.responseInterceptors=[];this.$get=["$httpBackend","$browser","$cacheFactory","$rootScope","$q","$injector",function(t,u,c,v,b,k){function d(t){function w(n){var t=a({},n,{data:ye(n.data,n.headers,f.transformResponse)});return du(n.status)?t:b.reject(t)}function d(t){function s(n){var t;r(n,function(i,r){h(i)&&(t=i(),t!=null?n[r]=t:delete n[r])})}var i=n.headers,u=a({},t.headers),f,e,o;i=a({},i.common,i[l(t.method)]);s(i);s(u);n:for(f in i){e=l(f);for(o in u)if(l(o)===e)continue n;u[f]=i[f]}return u}var f={transformRequest:n.transformRequest,transformResponse:n.transformResponse},s=d(t),v,y,p;a(f,t);f.headers=s;f.method=wt(f.method);v=uo(f.url)?u.cookies()[f.xsrfCookieName||n.xsrfCookieName]:i;v&&(s[f.xsrfHeaderName||n.xsrfHeaderName]=v);var k=function(t){s=t.headers;var i=ye(t.data,ve(s),t.transformRequest);return o(t.data)&&r(s,function(n,t){l(t)==="content-type"&&delete s[t]}),o(t.withCredentials)&&!o(n.withCredentials)&&(t.withCredentials=n.withCredentials),ut(t,i,s).then(w,w)},c=[k,i],e=b.when(f);for(r(g,function(n){(n.request||n.requestError)&&c.unshift(n.request,n.requestError);(n.response||n.responseError)&&c.push(n.response,n.responseError)});c.length;)y=c.shift(),p=c.shift(),e=e.then(y,p);return e.success=function(n){return e.then(function(t){n(t.data,t.status,t.headers,f)}),e},e.error=function(n){return e.then(null,function(t){n(t.data,t.status,t.headers,f)}),e},e}function tt(){r(arguments,function(n){d[n]=function(t,i){return d(a(i||{},{method:n,url:t}))}})}function it(){r(arguments,function(n){d[n]=function(t,i,r){return d(a(r||{},{method:n,url:t,data:i}))}})}function ut(i,r,u){function k(n,t,i){h&&(du(n)?h.put(c,[n,t,ae(i)]):h.remove(c));w(t,n,i);v.$$phase||v.$apply()}function w(n,t,r){t=Math.max(t,0);(du(t)?a.resolve:a.reject)({data:n,status:t,headers:ve(r),config:i})}function l(){var n=or(d.pendingRequests,i);n!==-1&&d.pendingRequests.splice(n,1)}var a=b.defer(),y=a.promise,h,e,c=ft(i.url,i.params);if(d.pendingRequests.push(i),y.then(l,l),(i.cache||n.cache)&&i.cache!==!1&&i.method=="GET"&&(h=p(i.cache)?i.cache:p(n.cache)?n.cache:nt),h)if(e=h.get(c),f(e)){if(e.then)return e.then(l,l),e;s(e)?w(e[1],e[0],rt(e[2])):w(e,200,{})}else h.put(c,y);return o(e)&&t(i.method,c,r,k,u,i.timeout,i.withCredentials,i.responseType),y}function ft(n,t){if(!t)return n;var i=[];return rs(t,function(n,t){n===null||o(n)||(s(n)||(n=[n]),r(n,function(n){p(n)&&(n=ot(n));i.push(kt(t)+"="+kt(n))}))}),n+(n.indexOf("?")==-1?"?":"&")+i.join("&")}var nt=c("$http"),g=[];return r(y,function(n){g.unshift(e(n)?k.get(n):k.invoke(n))}),r(w,function(n,t){var i=e(n)?k.get(n):k.invoke(n);g.splice(t,0,{response:function(n){return i(b.when(n))},responseError:function(n){return i(b.reject(n))}})}),d.pendingRequests=[],tt("get","delete","head","jsonp"),it("post","put"),d.defaults=n,d}]}function ah(){this.$get=["$browser","$window","$document",function(n,t,i){return vh(n,pe,n.defer,t.angular.callbacks,i[0],t.location.protocol.replace(":",""))}]}function vh(n,t,i,u,e,o){function s(n,t){var i=e.createElement("script"),r=function(){e.body.removeChild(i);t&&t()};return i.type="text/javascript",i.src=n,y?i.onreadystatechange=function(){/loaded|complete/.test(i.readyState)&&r()}:i.onload=i.onerror=r,e.body.appendChild(i),r}return function(e,h,a,v,y,p,w,b){function rt(){nt=-1;g&&g();k&&k.abort()}function it(t,r,u,f){var e=o||gt(h).protocol;tt&&i.cancel(tt);g=k=null;r=e=="file"?u?200:404:r;r=r==1223?204:r;t(r,u,f);n.$$completeOutstandingRequest(c)}var nt,d,g,k,tt;n.$$incOutstandingRequestCount();h=h||n.url();l(e)=="jsonp"?(d="_"+(u.counter++).toString(36),u[d]=function(n){u[d].data=n},g=s(h.replace("JSON_CALLBACK","angular.callbacks."+d),function(){u[d].data?it(v,200,u[d].data):it(v,nt||-2);delete u[d]})):(k=new t,k.open(e,h,!0),r(y,function(n,t){f(n)&&k.setRequestHeader(t,n)}),k.onreadystatechange=function(){if(k.readyState==4){var n=k.getAllResponseHeaders();it(v,nt||k.status,k.responseType?k.response:k.responseText,n)}},w&&(k.withCredentials=!0),b&&(k.responseType=b),k.send(a||null));p>0?tt=i(rt,p):p&&p.then&&p.then(rt)}}function yh(){var n="{{",t="}}";this.startSymbol=function(t){return t?(n=t,this):n};this.endSymbol=function(n){return n?(t=n,this):t};this.$get=["$parse","$exceptionHandler","$sce",function(i,r,u){function f(f,h,c){for(var p,w,l=0,a=[],v=f.length,k=!1,y,d,b=[];l<v;)(p=f.indexOf(n,l))!=-1&&(w=f.indexOf(t,p+e))!=-1?(l!=p&&a.push(f.substring(l,p)),a.push(y=i(d=f.substring(p+e,w))),y.exp=d,l=w+s,k=!0):(l!=v&&a.push(f.substring(l)),l=v);if((v=a.length)||(a.push(""),v=1),c&&a.length>1)throw gu("noconcat","Error while interpolating: {0}\nStrict Contextual Escaping disallows interpolations that concatenate multiple expressions when a trusted value is required.  See http://docs.angularjs.org/api/ng.$sce",f);if(!h||k)return b.length=v,y=function(n){var i,e,t,s;try{for(i=0,e=v;i<e;i++)typeof(t=a[i])=="function"&&(t=t(n),t=c?u.getTrusted(c,t):u.valueOf(t),t===null||o(t)?t="":typeof t!="string"&&(t=ot(t))),b[i]=t;return b.join("")}catch(h){s=gu("interr","Can't interpolate: {0}\n{1}",f,h.toString());r(s)}},y.exp=f,y.parts=a,y}var e=n.length,s=t.length;return f.startSymbol=function(){return n},f.endSymbol=function(){return t},f}]}function ph(){this.$get=["$rootScope","$window","$q",function(n,t,i){function u(u,e,o,s){var a=t.setInterval,v=t.clearInterval,c=i.defer(),h=c.promise,l=0,y=f(s)&&!s;return o=f(o)?o:0,h.then(null,null,u),h.$$intervalId=a(function(){c.notify(l++);o>0&&l>=o&&(c.resolve(l),v(h.$$intervalId),delete r[h.$$intervalId]);y||n.$apply()},e),r[h.$$intervalId]=c,h}var r={};return u.cancel=function(n){return n&&n.$$intervalId in r?(r[n.$$intervalId].reject("canceled"),clearInterval(n.$$intervalId),delete r[n.$$intervalId],!0):!1},u}]}function wh(){this.$get=function(){return{id:"en-us",NUMBER_FORMATS:{DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{minInt:1,minFrac:0,maxFrac:3,posPre:"",posSuf:"",negPre:"-",negSuf:"",gSize:3,lgSize:3},{minInt:1,minFrac:2,maxFrac:2,posPre:"¤",posSuf:"",negPre:"(¤",negSuf:")",gSize:3,lgSize:3}],CURRENCY_SYM:"$"},DATETIME_FORMATS:{MONTH:"January,February,March,April,May,June,July,August,September,October,November,December".split(","),SHORTMONTH:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),DAY:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),SHORTDAY:"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),AMPMS:["AM","PM"],medium:"MMM d, y h:mm:ss a",short:"M/d/yy h:mm a",fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",mediumDate:"MMM d, y",shortDate:"M/d/yy",mediumTime:"h:mm:ss a",shortTime:"h:mm a"},pluralCat:function(n){return n===1?"one":"other"}}}}function we(n){for(var t=n.split("/"),i=t.length;i--;)t[i]=fu(t[i]);return t.join("/")}function be(n,t){var i=gt(n);t.$$protocol=i.protocol;t.$$host=i.hostname;t.$$port=k(i.port)||kh[i.protocol]||null}function ke(n,t){var r=n.charAt(0)!=="/",i;r&&(n="/"+n);i=gt(n);t.$$path=decodeURIComponent(r&&i.pathname.charAt(0)==="/"?i.pathname.substring(1):i.pathname);t.$$search=bf(i.search);t.$$hash=decodeURIComponent(i.hash);t.$$path&&t.$$path.charAt(0)!="/"&&(t.$$path="/"+t.$$path)}function ct(n,t){if(t.indexOf(n)===0)return t.substr(n.length)}function nr(n){var t=n.indexOf("#");return t==-1?n:n.substr(0,t)}function tf(n){return n.substr(0,nr(n).lastIndexOf("/")+1)}function dh(n){return n.substring(0,n.indexOf("/",n.indexOf("//")+2))}function de(n,t){this.$$html5=!0;t=t||"";var r=tf(n);be(n,this);this.$$parse=function(n){var t=ct(r,n);if(!e(t))throw nf("ipthprfx",'Invalid url "{0}", missing path prefix "{1}".',n,r);ke(t,this);this.$$path||(this.$$path="/");this.$$compose()};this.$$compose=function(){var n=kf(this.$$search),t=this.$$hash?"#"+fu(this.$$hash):"";this.$$url=we(this.$$path)+(n?"?"+n:"")+t;this.$$absUrl=r+this.$$url.substr(1)};this.$$rewrite=function(u){var f,e;return(f=ct(n,u))!==i?(e=f,(f=ct(t,f))!==i?r+(ct("/",f)||f):n+e):(f=ct(r,u))!==i?r+f:r==u+"/"?r:void 0}}function rf(n,t){var i=tf(n);be(n,this);this.$$parse=function(r){var u=ct(n,r)||ct(i,r),f=u.charAt(0)=="#"?ct(t,u):this.$$html5?u:"";if(!e(f))throw nf("ihshprfx",'Invalid url "{0}", missing hash prefix "{1}".',r,t);ke(f,this);this.$$compose()};this.$$compose=function(){var i=kf(this.$$search),r=this.$$hash?"#"+fu(this.$$hash):"";this.$$url=we(this.$$path)+(i?"?"+i:"")+r;this.$$absUrl=n+(this.$$url?t+this.$$url:"")};this.$$rewrite=function(t){if(nr(n)==nr(t))return t}}function ge(n,t){this.$$html5=!0;rf.apply(this,arguments);var i=tf(n);this.$$rewrite=function(r){var u;return n==nr(r)?r:(u=ct(i,r))?n+t+u:i===r+"/"?i:void 0}}function lr(n){return function(){return this[n]}}function no(n,t){return function(i){return o(i)?this[n]:(this[n]=t(i),this.$$compose(),this)}}function gh(){var t="",i=!1;this.hashPrefix=function(n){return f(n)?(t=n,this):t};this.html5Mode=function(n){return f(n)?(i=n,this):i};this.$get=["$rootScope","$browser","$sniffer","$rootElement",function(r,f,e,o){function y(n){r.$broadcast("$locationChangeSuccess",s.absUrl(),n)}var s,a,p=f.baseHref(),h=f.url(),v,c;i?(v=dh(h)+(p||"/"),a=e.history?de:ge):(v=nr(h),a=rf);s=new a(v,"#"+t);s.$$parse(s.$$rewrite(h));o.on("click",function(t){var i,h,e;if(!t.ctrlKey&&!t.metaKey&&t.which!=2){for(i=u(t.target);l(i[0].nodeName)!=="a";)if(i[0]===o[0]||!(i=i.parent())[0])return;h=i.prop("href");e=s.$$rewrite(h);h&&!i.attr("target")&&e&&!t.isDefaultPrevented()&&(t.preventDefault(),e!=f.url()&&(s.$$parse(e),r.$apply(),n.angular["ff-684208-preventDefault"]=!0))}});s.absUrl()!=h&&f.url(s.absUrl(),!0);f.onUrlChange(function(n){if(s.absUrl()!=n){if(r.$broadcast("$locationChangeStart",n,s.absUrl()).defaultPrevented){f.url(s.absUrl());return}r.$evalAsync(function(){var t=s.absUrl();s.$$parse(n);y(t)});r.$$phase||r.$digest()}});return c=0,r.$watch(function(){var n=f.url(),t=s.$$replace;return c&&n==s.absUrl()||(c++,r.$evalAsync(function(){r.$broadcast("$locationChangeStart",s.absUrl(),n).defaultPrevented?s.$$parse(n):(f.url(s.absUrl(),t),y(n))})),s.$$replace=!1,c}),s}]}function nc(){var n=!0,t=this;this.debugEnabled=function(t){return f(t)?(n=t,this):n};this.$get=["$window",function(i){function f(n){return n instanceof Error&&(n.stack?n=n.message&&n.stack.indexOf(n.message)===-1?"Error: "+n.message+"\n"+n.stack:n.stack:n.sourceURL&&(n=n.message+"\n"+n.sourceURL+":"+n.line)),n}function u(n){var t=i.console||{},u=t[n]||t.log||c;return u.apply?function(){var n=[];return r(arguments,function(t){n.push(f(t))}),u.apply(t,n)}:function(n,t){u(n,t==null?"":t)}}return{log:u("log"),info:u("info"),warn:u("warn"),error:u("error"),debug:function(){var i=u("debug");return function(){n&&i.apply(t,arguments)}}()}}]}function ft(n,t,i){if(typeof n!="string"&&si.apply(n)!=="[object String]")return n;if(n==="constructor"&&!i)throw lt("isecfld",'Referencing "constructor" field in Angular expressions is disallowed! Expression: {0}',t);if(n.charAt(0)==="_"||n.charAt(n.length-1)==="_")throw lt("isecprv","Referencing private fields in Angular expressions is disallowed! Expression: {0}",t);return n}function tr(n,t){if(n&&n.constructor===n)throw lt("isecfn","Referencing Function in Angular expressions is disallowed! Expression: {0}",t);else if(n&&n.document&&n.location&&n.alert&&n.setInterval)throw lt("isecwindow","Referencing the Window in Angular expressions is disallowed! Expression: {0}",t);else if(n&&(n.nodeName||n.on&&n.find))throw lt("isecdom","Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}",t);else return n}function ar(n,t,r,u,f){var s,e,h,o;for(f=f||{},s=t.split("."),h=0;s.length>1;h++)e=ft(s.shift(),u),o=n[e],o||(o={},n[e]=o),n=o,n.then&&f.unwrapPromises&&(yt(u),"$$v"in n||function(n){n.then(function(t){n.$$v=t})}(n),n.$$v===i&&(n.$$v={}),n=n.$$v);return e=ft(s.shift(),u),n[e]=r,r}function to(n,t,r,u,f,e,o){return ft(n,e),ft(t,e),ft(r,e),ft(u,e),ft(f,e),o.unwrapPromises?function(o,s){var h=s&&s.hasOwnProperty(n)?s:o,c;return h===null||h===i?h:(h=h[n],h&&h.then&&(yt(e),"$$v"in h||(c=h,c.$$v=i,c.then(function(n){c.$$v=n})),h=h.$$v),!t||h===null||h===i)?h:(h=h[t],h&&h.then&&(yt(e),"$$v"in h||(c=h,c.$$v=i,c.then(function(n){c.$$v=n})),h=h.$$v),!r||h===null||h===i)?h:(h=h[r],h&&h.then&&(yt(e),"$$v"in h||(c=h,c.$$v=i,c.then(function(n){c.$$v=n})),h=h.$$v),!u||h===null||h===i)?h:(h=h[u],h&&h.then&&(yt(e),"$$v"in h||(c=h,c.$$v=i,c.then(function(n){c.$$v=n})),h=h.$$v),!f||h===null||h===i)?h:(h=h[f],h&&h.then&&(yt(e),"$$v"in h||(c=h,c.$$v=i,c.then(function(n){c.$$v=n})),h=h.$$v),h)}:function(e,o){var s=o&&o.hasOwnProperty(n)?o:e;return s===null||s===i?s:(s=s[n],!t||s===null||s===i)?s:(s=s[t],!r||s===null||s===i)?s:(s=s[r],!u||s===null||s===i)?s:(s=s[u],!f||s===null||s===i)?s:s[f]}}function io(n,t,u){var f,s,o,e,h;return vr.hasOwnProperty(n)?vr[n]:(f=n.split("."),s=f.length,t.csp?o=s<6?to(f[0],f[1],f[2],f[3],f[4],u,t):function(n,r){var e=0,o;do o=to(f[e++],f[e++],f[e++],f[e++],f[e++],u,t)(n,r),r=i,n=o;while(e<s);return o}:(e="var l, fn, p;\n",r(f,function(n,i){ft(n,u);e+="if(s === null || s === undefined) return s;\nl=s;\ns="+(i?"s":'((k&&k.hasOwnProperty("'+n+'"))?k:s)')+'["'+n+'"];\n'+(t.unwrapPromises?'if (s && s.then) {\n pw("'+u.replace(/\"/g,'\\"')+'");\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=v;});\n}\n s=s.$$v\n}\n':"")}),e+="return s;",h=new Function("s","k","pw",e),h.toString=function(){return e},o=function(n,t){return h(n,t,yt)}),n!=="hasOwnProperty"&&(vr[n]=o),o)}function ic(){var t={},n={csp:!1,unwrapPromises:!1,logPromiseWarnings:!0};this.unwrapPromises=function(t){return f(t)?(n.unwrapPromises=!!t,this):n.unwrapPromises};this.logPromiseWarnings=function(t){return f(t)?(n.logPromiseWarnings=t,this):n.logPromiseWarnings};this.$get=["$filter","$sniffer","$log",function(i,r,u){return n.csp=r.csp,yt=function(t){n.logPromiseWarnings&&!uf.hasOwnProperty(t)&&(uf[t]=!0,u.warn("[$parse] Promise found in the expression `"+t+"`. Automatic unwrapping of promises in Angular expressions is deprecated."))},function(r){var u,f,e;switch(typeof r){case"string":return t.hasOwnProperty(r)?t[r]:(f=new ff(n),e=new ei(f,i,n),u=e.parse(r,!1),r!=="hasOwnProperty"&&(t[r]=u),u);case"function":return r;default:return c}}}]}function rc(){this.$get=["$rootScope","$exceptionHandler",function(n,t){return uc(function(t){n.$evalAsync(t)},t)}]}function uc(n,t){function e(n){return n}function c(n){return f(n)}function a(n){var i=u(),f=0,t=s(n)?[]:{};return r(n,function(n,r){f++;o(n).then(function(n){t.hasOwnProperty(r)||(t[r]=n,--f||i.resolve(t))},function(n){t.hasOwnProperty(r)||i.reject(n)})}),f===0&&i.resolve(t),i.promise}var u=function(){var r=[],s,l;return l={resolve:function(t){if(r){var u=r;r=i;s=o(t);u.length&&n(function(){for(var n,t=0,i=u.length;t<i;t++)n=u[t],s.then(n[0],n[1],n[2])})}},reject:function(n){l.resolve(f(n))},notify:function(t){if(r){var i=r;r.length&&n(function(){for(var r,n=0,u=i.length;n<u;n++)r=i[n],r[2](t)})}},promise:{then:function(n,i,f){var o=u(),l=function(i){try{o.resolve((h(n)?n:e)(i))}catch(r){o.reject(r);t(r)}},a=function(n){try{o.resolve((h(i)?i:c)(n))}catch(r){o.reject(r);t(r)}},v=function(n){try{o.notify((h(f)?f:e)(n))}catch(i){t(i)}};return r?r.push([l,a,v]):s.then(l,a,v),o.promise},"catch":function(n){return this.then(null,n)},"finally":function(n){function t(n,t){var i=u();return t?i.resolve(n):i.reject(n),i.promise}function i(i,r){var u=null;try{u=(n||e)()}catch(f){return t(f,!1)}return u&&h(u.then)?u.then(function(){return t(i,r)},function(n){return t(n,!1)}):t(i,r)}return this.then(function(n){return i(n,!0)},function(n){return i(n,!1)})}}}},o=function(t){return t&&h(t.then)?t:{then:function(i){var r=u();return n(function(){r.resolve(i(t))}),r.promise}}},f=function(i){return{then:function(r,f){var e=u();return n(function(){try{e.resolve((h(f)?f:c)(i))}catch(n){e.reject(n);t(n)}}),e.promise}}},l=function(i,r,s,l){var v=u(),a,w=function(n){try{return(h(r)?r:e)(n)}catch(i){return t(i),f(i)}},y=function(n){try{return(h(s)?s:c)(n)}catch(i){return t(i),f(i)}},p=function(n){try{return(h(l)?l:e)(n)}catch(i){t(i)}};return n(function(){o(i).then(function(n){a||(a=!0,v.resolve(o(n).then(w,y,p)))},function(n){a||(a=!0,v.resolve(y(n)))},function(n){a||v.notify(p(n))})}),v.promise};return{defer:u,reject:f,when:l,all:a}}function fc(){var n=10,t=v("$rootScope");this.digestTtl=function(t){return arguments.length&&(n=t),n};this.$get=["$injector","$exceptionHandler","$parse","$browser",function(i,r,u,f){function o(){this.$id=ur();this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this["this"]=this.$root=this;this.$$destroyed=!1;this.$$asyncQueue=[];this.$$postDigestQueue=[];this.$$listeners={};this.$$isolateBindings={}}function l(n){if(e.$$phase)throw t("inprog","{0} already in progress",e.$$phase);e.$$phase=n}function s(){e.$$phase=null}function a(n,t){var i=u(n);return yi(i,t),i}function v(){}o.prototype={constructor:o,$new:function(n){var i,t;return n?(t=new o,t.$root=this.$root,t.$$asyncQueue=this.$$asyncQueue,t.$$postDigestQueue=this.$$postDigestQueue):(i=function(){},i.prototype=this,t=new i,t.$id=ur()),t["this"]=t,t.$$listeners={},t.$parent=this,t.$$watchers=t.$$nextSibling=t.$$childHead=t.$$childTail=null,t.$$prevSibling=this.$$childTail,this.$$childHead?(this.$$childTail.$$nextSibling=t,this.$$childTail=t):this.$$childHead=this.$$childTail=t,t},$watch:function(n,t,i){var f=this,e=a(n,"watch"),u=f.$$watchers,r={fn:t,last:v,get:e,exp:n,eq:!!i},o,s;return h(t)||(o=a(t||c,"listener"),r.fn=function(n,t,i){o(i)}),typeof n=="string"&&e.constant&&(s=r.fn,r.fn=function(n,t,i){s.call(this,n,t,i);ai(u,r)}),u||(u=f.$$watchers=[]),u.unshift(r),function(){ai(u,r)}},$watchCollection:function(n,t){function l(){var t,n,u;if(r=c(o),p(r))if(nu(r))for(i!==s&&(i=s,e=i.length=0,f++),t=r.length,e!==t&&(f++,i.length=e=t),u=0;u<t;u++)i[u]!==r[u]&&(f++,i[u]=r[u]);else{i!==h&&(i=h={},e=0,f++);t=0;for(n in r)r.hasOwnProperty(n)&&(t++,i.hasOwnProperty(n)?i[n]!==r[n]&&(f++,i[n]=r[n]):(e++,i[n]=r[n],f++));if(e>t){f++;for(n in i)i.hasOwnProperty(n)&&!r.hasOwnProperty(n)&&(e--,delete i[n])}}else i!==r&&(i=r,f++);return f}function a(){t(r,i,o)}var o=this,i,r,f=0,c=u(n),s=[],h={},e=0;return this.$watch(l,a)},$digest:function(){var i,f,e,y,p=this.$$asyncQueue,it=this.$$postDigestQueue,w,o,b=n,k,u,d=this,c=[],a,g,nt;l("$digest");do{for(o=!1,u=d;p.length;)try{nt=p.shift();nt.scope.$eval(nt.expression)}catch(tt){r(tt)}do{if(y=u.$$watchers)for(w=y.length;w--;)try{i=y[w];!i||(f=i.get(u))===(e=i.last)||(i.eq?ri(f,e):typeof f=="number"&&typeof e=="number"&&isNaN(f)&&isNaN(e))||(o=!0,i.last=i.eq?rt(f):f,i.fn(f,e===v?f:e,u),b<5&&(a=4-b,c[a]||(c[a]=[]),g=h(i.exp)?"fn: "+(i.exp.name||i.exp.toString()):i.exp,g+="; newVal: "+ot(f)+"; oldVal: "+ot(e),c[a].push(g)))}catch(tt){r(tt)}if(!(k=u.$$childHead||u!==d&&u.$$nextSibling))while(u!==d&&!(k=u.$$nextSibling))u=u.$parent}while(u=k);if(o&&!b--){s();throw t("infdig","{0} $digest() iterations reached. Aborting!\nWatchers fired in the last 5 iterations: {1}",n,ot(c));}}while(o||p.length);for(s();it.length;)try{it.shift()()}catch(tt){r(tt)}},$destroy:function(){if(e!=this&&!this.$$destroyed){var n=this.$parent;this.$broadcast("$destroy");this.$$destroyed=!0;n.$$childHead==this&&(n.$$childHead=this.$$nextSibling);n.$$childTail==this&&(n.$$childTail=this.$$prevSibling);this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling);this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling);this.$parent=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null}},$eval:function(n,t){return u(n)(this,t)},$evalAsync:function(n){e.$$phase||e.$$asyncQueue.length||f.defer(function(){e.$$asyncQueue.length&&e.$digest()});this.$$asyncQueue.push({scope:this,expression:n})},$$postDigest:function(n){this.$$postDigestQueue.push(n)},$apply:function(n){try{return l("$apply"),this.$eval(n)}catch(t){r(t)}finally{s();try{e.$digest()}catch(t){r(t);throw t;}}},$on:function(n,t){var i=this.$$listeners[n];return i||(this.$$listeners[n]=i=[]),i.push(t),function(){i[or(i,t)]=null}},$emit:function(n){var s=[],u,i=this,o=!1,f={name:n,targetScope:i,stopPropagation:function(){o=!0},preventDefault:function(){f.defaultPrevented=!0},defaultPrevented:!1},h=iu([f],arguments,1),t,e;do{for(u=i.$$listeners[n]||s,f.currentScope=i,t=0,e=u.length;t<e;t++){if(!u[t]){u.splice(t,1);t--;e--;continue}try{u[t].apply(null,h)}catch(c){r(c)}}if(o)return f;i=i.$parent}while(i);return f},$broadcast:function(n){var u=this,t=u,e=u,o={name:n,targetScope:u,preventDefault:function(){o.defaultPrevented=!0},defaultPrevented:!1},h=iu([o],arguments,1),f,i,s;do{for(t=e,o.currentScope=t,f=t.$$listeners[n]||[],i=0,s=f.length;i<s;i++){if(!f[i]){f.splice(i,1);i--;s--;continue}try{f[i].apply(null,h)}catch(c){r(c)}}if(!(e=t.$$childHead||t!==u&&t.$$nextSibling))while(t!==u&&!(e=t.$$nextSibling))t=t.$parent}while(t=e);return o}};var e=new o;return e}]}function ec(n){return n.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08")}function oc(n){if(n==="self")return n;if(e(n)){if(n.indexOf("***")>-1)throw at("iwcard","Illegal sequence *** in string matcher.  String: {0}",n);return n=ec(n).replace("\\*\\*",".*").replace("\\*","[^:/.?&;]*"),new RegExp("^"+n+"$")}if(fr(n))return new RegExp("^"+n.source+"$");throw at("imatcher",'Matchers may only be "self", string patterns or RegExp objects');}function ro(n){var t=[];return f(n)&&r(n,function(n){t.push(oc(n))}),t}function sc(){this.SCE_CONTEXTS=tt;var n=["self"],t=[];this.resourceUrlWhitelist=function(t){return arguments.length&&(n=ro(t)),n};this.resourceUrlBlacklist=function(n){return arguments.length&&(t=ro(n)),t};this.$get=["$log","$document","$injector",function(r,u,f){function c(n,t){return n==="self"?uo(t):!!n.exec(t.href)}function l(i){for(var e=gt(i.toString()),f=!1,r=0,u=n.length;r<u;r++)if(c(n[r],e)){f=!0;break}if(f)for(r=0,u=t.length;r<u;r++)if(c(t[r],e)){f=!1;break}return f}function o(n){var t=function(n){this.$$unwrapTrustedValue=function(){return n}};return n&&(t.prototype=new n),t.prototype.valueOf=function(){return this.$$unwrapTrustedValue()},t.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()},t}function a(n,t){var r=e.hasOwnProperty(n)?e[n]:null;if(!r)throw at("icontext","Attempted to trust a value in invalid context. Context: {0}; Value: {1}",n,t);if(t===null||t===i||t==="")return t;if(typeof t!="string")throw at("itype","Attempted to trust a non-string value in a content requiring a string: Context: {0}",n);return new r(t)}function v(n){return n instanceof s?n.$$unwrapTrustedValue():n}function y(n,t){if(t===null||t===i||t==="")return t;var r=e.hasOwnProperty(n)?e[n]:null;if(r&&t instanceof r)return t.$$unwrapTrustedValue();if(n===tt.RESOURCE_URL){if(l(t))return t;throw at("insecurl","Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}",t.toString());}else if(n===tt.HTML)return h(t);throw at("unsafe","Attempting to use an unsafe value in a safe context.");}var h=function(){throw at("unsafe","Attempting to use an unsafe value in a safe context.");},s,e;return f.has("$sanitize")&&(h=f.get("$sanitize")),s=o(),e={},e[tt.HTML]=o(s),e[tt.CSS]=o(s),e[tt.URL]=o(s),e[tt.JS]=o(s),e[tt.RESOURCE_URL]=o(e[tt.URL]),{trustAs:a,getTrusted:y,valueOf:v}}]}function hc(){var n=!0;this.enabled=function(t){return arguments.length&&(n=!!t),n};this.$get=["$parse","$document","$sceDelegate",function(t,u,f){var o,e;if(n&&y&&(o=u[0].documentMode,o!==i&&o<8))throw at("iequirks","Strict Contextual Escaping does not support Internet Explorer version < 9 in quirks mode.  You can fix this by adding the text <!doctype html> to the top of your HTML document.  See http://docs.angularjs.org/api/ng.$sce for more information.");e=rt(tt);e.isEnabled=function(){return n};e.trustAs=f.trustAs;e.getTrusted=f.getTrusted;e.valueOf=f.valueOf;n||(e.trustAs=e.getTrusted=function(n,t){return t},e.valueOf=ti);e.parseAs=function(n,i){var r=t(i);return r.literal&&r.constant?r:function(t,i){return e.getTrusted(n,r(t,i))}};var s=e.parseAs,h=e.getTrusted,c=e.trustAs;return r(tt,function(n,t){var i=l(t);e[wi("parse_as_"+i)]=function(t){return s(n,t)};e[wi("get_trusted_"+i)]=function(t){return h(n,t)};e[wi("trust_as_"+i)]=function(t){return c(n,t)}}),e}]}function cc(){this.$get=["$window","$document",function(n,t){var h={},c=k((/android (\d+)/.exec(l((n.navigator||{}).userAgent))||[])[1]),p=/Boxee/i.test((n.navigator||{}).userAgent),r=t[0]||{},i,u=r.body&&r.body.style,f=!1,s=!1,a,v;if(u){for(v in u)if(a=/^(Moz|webkit|O|ms)(?=[A-Z])/.exec(v)){i=a[0];i=i.substr(0,1).toUpperCase()+i.substr(1);break}i||(i="WebkitOpacity"in u&&"webkit");f=!!("transition"in u||i+"Transition"in u);s=!!("animation"in u||i+"Animation"in u);!c||f&&s||(f=e(r.body.style.webkitTransition),s=e(r.body.style.webkitAnimation))}return{history:!!(n.history&&n.history.pushState&&!(c<4)&&!p),hashchange:"onhashchange"in n&&(!r.documentMode||r.documentMode>7),hasEvent:function(n){if(n=="input"&&y==9)return!1;if(o(h[n])){var t=r.createElement("div");h[n]="on"+n in t}return h[n]},csp:yf(),vendorPrefix:i,transitions:f,animations:s,msie:y}}]}function lc(){this.$get=["$rootScope","$browser","$q","$exceptionHandler",function(n,t,i,r){function e(e,o,s){var h=i.defer(),c=h.promise,a=f(s)&&!s,l;return l=t.defer(function(){try{h.resolve(e())}catch(t){h.reject(t);r(t)}finally{delete u[c.$$timeoutId]}a||n.$apply()},o),c.$$timeoutId=l,u[l]=h,c}var u={};return e.cancel=function(n){return n&&n.$$timeoutId in u?(u[n.$$timeoutId].reject("canceled"),delete u[n.$$timeoutId],t.defer.cancel(n.$$timeoutId)):!1},e}]}function gt(n){var t=n;return y&&(b.setAttribute("href",t),t=b.href),b.setAttribute("href",t),{href:b.href,protocol:b.protocol?b.protocol.replace(/:$/,""):"",host:b.host,search:b.search?b.search.replace(/^\?/,""):"",hash:b.hash?b.hash.replace(/^#/,""):"",hostname:b.hostname,port:b.port,pathname:b.pathname&&b.pathname.charAt(0)==="/"?b.pathname:"/"+b.pathname}}function uo(n){var t=e(n)?gt(n):n;return t.protocol===ef.protocol&&t.host===ef.host}function ac(){this.$get=nt(n)}function fo(n){function t(u,f){if(p(u)){var e={};return r(u,function(n,i){e[i]=t(i,n)}),e}return n.factory(u+i,f)}var i="Filter";this.register=t;this.$get=["$injector",function(n){return function(t){return n.get(t+i)}}];t("currency",eo);t("date",ho);t("filter",vc);t("json",dc);t("limitTo",gc);t("lowercase",co);t("number",oo);t("orderBy",ao);t("uppercase",lo)}function vc(){return function(n,t,i){var o,r,u,f,h,e,c;if(!s(n))return n;o=typeof i;r=[];r.check=function(n){for(var t=0;t<r.length;t++)if(!r[t](n))return!1;return!0};o!=="function"&&(i=o==="boolean"&&i?function(n,t){return rr.equals(n,t)}:function(n,t){return t=(""+t).toLowerCase(),(""+n).toLowerCase().indexOf(t)>-1});u=function(n,t){var f,r;if(typeof t=="string"&&t.charAt(0)==="!")return!u(n,t.substr(1));switch(typeof n){case"boolean":case"number":case"string":return i(n,t);case"object":switch(typeof t){case"object":return i(n,t);default:for(f in n)if(f.charAt(0)!=="$"&&u(n[f],t))return!0}return!1;case"array":for(r=0;r<n.length;r++)if(u(n[r],t))return!0;return!1;default:return!1}};switch(typeof t){case"boolean":case"number":case"string":t={$:t};case"object":for(f in t)f=="$"?function(){if(t[f]){var n=f;r.push(function(i){return u(i,t[n])})}}():function(){if(typeof t[f]!="undefined"){var n=f;r.push(function(i){return u(ou(i,n),t[n])})}}();break;case"function":r.push(t);break;default:return n}for(h=[],e=0;e<n.length;e++)c=n[e],r.check(c)&&h.push(c);return h}}function eo(n){var t=n.NUMBER_FORMATS;return function(n,i){return o(i)&&(i=t.CURRENCY_SYM),so(n,t.PATTERNS[1],t.GROUP_SEP,t.DECIMAL_SEP,2).replace(/\u00A4/g,i)}}function oo(n){var t=n.NUMBER_FORMATS;return function(n,i){return so(n,t.PATTERNS[0],t.GROUP_SEP,t.DECIMAL_SEP,i)}}function so(n,t,i,r,u){var y,a,k,p,s,h;if(isNaN(n)||!isFinite(n))return"";y=n<0;n=Math.abs(n);var c=n+"",e="",l=[],b=!1;if(c.indexOf("e")!==-1&&(a=c.match(/([\d\.]+)e(-?)(\d+)/),a&&a[2]=="-"&&a[3]>u+1?c="0":(e=c,b=!0)),b)u>0&&n>-1&&n<1&&(e=n.toFixed(u));else{k=(c.split(of)[1]||"").length;o(u)&&(u=Math.min(Math.max(t.minFrac,k),t.maxFrac));p=Math.pow(10,u);n=Math.round(n*p)/p;s=(""+n).split(of);h=s[0];s=s[1]||"";var f,v=0,w=t.lgSize,d=t.gSize;if(h.length>=w+d)for(v=h.length-w,f=0;f<v;f++)(v-f)%d==0&&f!==0&&(e+=i),e+=h.charAt(f);for(f=v;f<h.length;f++)(h.length-f)%w==0&&f!==0&&(e+=i),e+=h.charAt(f);while(s.length<u)s+="0";u&&u!=="0"&&(e+=r+s.substr(0,u))}return l.push(y?t.negPre:t.posPre),l.push(e),l.push(y?t.negSuf:t.posSuf),l.join("")}function sf(n,t,i){var r="";for(n<0&&(r="-",n=-n),n=""+n;n.length<t;)n="0"+n;return i&&(n=n.substr(n.length-t)),r+n}function d(n,t,i,r){return i=i||0,function(u){var f=u["get"+n]();return(i>0||f>-i)&&(f+=i),f===0&&i==-12&&(f=12),sf(f,t,r)}}function yr(n,t){return function(i,r){var u=i["get"+n](),f=wt(t?"SHORT"+n:n);return r[f][u]}}function yc(n){var t=-1*n.getTimezoneOffset(),i=t>=0?"+":"";return i+(sf(Math[t>0?"floor":"ceil"](t/60),2)+sf(Math.abs(t%60),2))}function pc(n,t){return n.getHours()<12?t.AMPMS[0]:t.AMPMS[1]}function ho(n){function i(n){var i;if(i=n.match(t)){var r=new Date(0),u=0,f=0,e=i[8]?r.setUTCFullYear:r.setFullYear,o=i[8]?r.setUTCHours:r.setHours;i[9]&&(u=k(i[9]+i[10]),f=k(i[9]+i[11]));e.call(r,k(i[1]),k(i[2])-1,k(i[3]));var s=k(i[4]||0)-u,h=k(i[5]||0)-f,c=k(i[6]||0),l=Math.round(parseFloat("0."+(i[7]||0))*1e3);return o.call(r,s,h,c,l),r}return n}var t=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;return function(t,u){var h="",f=[],o,s;if(u=u||"mediumDate",u=n.DATETIME_FORMATS[u]||u,e(t)&&(t=kc.test(t)?k(t):i(t)),tu(t)&&(t=new Date(t)),!li(t))return t;while(u)s=bc.exec(u),s?(f=iu(f,s,1),u=f.pop()):(f.push(u),u=null);return r(f,function(i){o=wc[i];h+=o?o(t,n.DATETIME_FORMATS):i.replace(/(^'|'$)/g,"").replace(/''/g,"'")}),h}}function dc(){return function(n){return ot(n,!0)}}function gc(){return function(n,t){if(!s(n)&&!e(n))return n;if(t=k(t),e(n))return t?t>=0?n.slice(0,t):n.slice(t,n.length):"";var u=[],i,r;for(t>n.length?t=n.length:t<-n.length&&(t=-n.length),t>0?(i=0,r=t):(i=n.length+t,r=n.length);i<r;i++)u.push(n[i]);return u}}function ao(n){return function(t,i,r){function h(n,t){for(var u,r=0;r<i.length;r++)if(u=i[r](n,t),u!==0)return u;return 0}function o(n,t){return vi(t)?function(t,i){return n(i,t)}:n}function c(n,t){var i=typeof n,r=typeof t;return i==r?(i=="string"&&(n=n.toLowerCase(),t=t.toLowerCase()),n===t)?0:n<t?-1:1:i<r?-1:1}var f,u;if(!s(t)||!i)return t;for(i=s(i)?i:[i],i=es(i,function(t){var r=!1,i=t||ti;return e(t)&&((t.charAt(0)=="+"||t.charAt(0)=="-")&&(r=t.charAt(0)=="-",t=t.substring(1)),i=n(t)),o(function(n,t){return c(i(n),i(t))},r)}),f=[],u=0;u<t.length;u++)f.push(t[u]);return f.sort(o(h,r))}}function pt(n){return h(n)&&(n={link:n}),n.restrict=n.restrict||"AC",nt(n)}function yo(n,t){function u(t,i){i=i?"-"+sr(i,"-"):"";n.removeClass((t?kr:br)+i).addClass((t?br:kr)+i)}var i=this,f=n.parent().controller("form")||ir,e=0,o=i.$error={},s=[];i.$name=t.name||t.ngForm;i.$dirty=!1;i.$pristine=!0;i.$valid=!0;i.$invalid=!1;f.$addControl(i);n.addClass(oi);u(!0);i.$addControl=function(n){vt(n.$name,"input");s.push(n);n.$name&&(i[n.$name]=n)};i.$removeControl=function(n){n.$name&&i[n.$name]===n&&delete i[n.$name];r(o,function(t,r){i.$setValidity(r,!0,n)});ai(s,n)};i.$setValidity=function(n,t,r){var s=o[n];if(t)s&&(ai(s,r),s.length||(e--,e||(u(t),i.$valid=!0,i.$invalid=!1),o[n]=!1,u(!0,n),f.$setValidity(n,!0,i)));else{if(e||u(t),s){if(os(s,r))return}else o[n]=s=[],e++,u(!1,n),f.$setValidity(n,!1,i);s.push(r);i.$valid=!1;i.$invalid=!0}};i.$setDirty=function(){n.removeClass(oi).addClass(dr);i.$dirty=!0;i.$pristine=!1;f.$setDirty()};i.$setPristine=function(){n.removeClass(dr).addClass(oi);i.$dirty=!1;i.$pristine=!0;r(s,function(n){n.$setPristine()})}}function wr(n,t,r,u,f,e){var c=function(){var i=t.val();vi(r.ngTrim||"T")&&(i=g(i));u.$viewValue!==i&&n.$apply(function(){u.$setViewValue(i)})},l,a,o,s,h,y,b,p,d,w;if(f.hasEvent("input"))t.on("input",c);else{a=function(){l||(l=e.defer(function(){c();l=null}))};t.on("keydown",function(n){var t=n.keyCode;t===91||15<t&&t<19||37<=t&&t<=40||a()});t.on("change",c);if(f.hasEvent("paste"))t.on("paste cut",a)}u.$render=function(){t.val(u.$isEmpty(u.$viewValue)?"":u.$viewValue)};o=r.ngPattern;y=function(n,t){return u.$isEmpty(t)||n.test(t)?(u.$setValidity("pattern",!0),t):(u.$setValidity("pattern",!1),i)};o&&(h=o.match(/^\/(.*)\/([gim]*)$/),h?(o=new RegExp(h[1],h[2]),s=function(n){return y(o,n)}):s=function(i){var r=n.$eval(o);if(!r||!r.test)throw v("ngPattern")("noregexp","Expected {0} to be a RegExp but was {1}. Element: {2}",o,r,ut(t));return y(r,i)},u.$formatters.push(s),u.$parsers.push(s));r.ngMinlength&&(b=k(r.ngMinlength),p=function(n){return!u.$isEmpty(n)&&n.length<b?(u.$setValidity("minlength",!1),i):(u.$setValidity("minlength",!0),n)},u.$parsers.push(p),u.$formatters.push(p));r.ngMaxlength&&(d=k(r.ngMaxlength),w=function(n){return!u.$isEmpty(n)&&n.length>d?(u.$setValidity("maxlength",!1),i):(u.$setValidity("maxlength",!0),n)},u.$parsers.push(w),u.$formatters.push(w))}function fl(n,t,r,u,f,e){var o,s;wr(n,t,r,u,f,e);u.$parsers.push(function(n){var t=u.$isEmpty(n);return t||ul.test(n)?(u.$setValidity("number",!0),n===""?null:t?n:parseFloat(n)):(u.$setValidity("number",!1),i)});u.$formatters.push(function(n){return u.$isEmpty(n)?"":""+n});r.min&&(o=function(n){var t=parseFloat(r.min);return!u.$isEmpty(n)&&n<t?(u.$setValidity("min",!1),i):(u.$setValidity("min",!0),n)},u.$parsers.push(o),u.$formatters.push(o));r.max&&(s=function(n){var t=parseFloat(r.max);return!u.$isEmpty(n)&&n>t?(u.$setValidity("max",!1),i):(u.$setValidity("max",!0),n)},u.$parsers.push(s),u.$formatters.push(s));u.$formatters.push(function(n){return u.$isEmpty(n)||tu(n)?(u.$setValidity("number",!0),n):(u.$setValidity("number",!1),i)})}function el(n,t,r,u,f,e){wr(n,t,r,u,f,e);var o=function(n){return u.$isEmpty(n)||il.test(n)?(u.$setValidity("url",!0),n):(u.$setValidity("url",!1),i)};u.$formatters.push(o);u.$parsers.push(o)}function ol(n,t,r,u,f,e){wr(n,t,r,u,f,e);var o=function(n){return u.$isEmpty(n)||rl.test(n)?(u.$setValidity("email",!0),n):(u.$setValidity("email",!1),i)};u.$formatters.push(o);u.$parsers.push(o)}function sl(n,t,i,r){o(i.name)&&t.attr("name",ur());t.on("click",function(){t[0].checked&&n.$apply(function(){r.$setViewValue(i.value)})});r.$render=function(){var n=i.value;t[0].checked=n==r.$viewValue};i.$observe("value",r.$render)}function hl(n,t,i,r){var u=i.ngTrueValue,f=i.ngFalseValue;e(u)||(u=!0);e(f)||(f=!1);t.on("click",function(){n.$apply(function(){r.$setViewValue(t[0].checked)})});r.$render=function(){t[0].checked=r.$viewValue};r.$isEmpty=function(n){return n!==u};r.$formatters.push(function(n){return n===u});r.$parsers.push(function(n){return n?u:f})}function hf(n,t){return n="ngClass"+n,function(){return{restrict:"AC",link:function(i,u,f){function o(n){(t===!0||i.$index%2===t)&&(e&&!ri(n,e)&&h(e),c(n));e=rt(n)}function h(n){f.$removeClass(l(n))}function c(n){f.$addClass(l(n))}function l(n){if(s(n))return n.join(" ");if(p(n)){var t=[];return r(n,function(n,i){n&&t.push(i)}),t.join(" ")}return n}var e;i.$watch(f[n],o,!0);f.$observe("class",function(){o(i.$eval(f[n]))});n!=="ngClass"&&i.$watch("$index",function(r,u){var e=r&1;e!==u&1&&(e===t?c(i.$eval(f[n])):h(i.$eval(f[n])))})}}}}var l=function(n){return e(n)?n.toLowerCase():n},wt=function(n){return e(n)?n.toUpperCase():n},ns=function(n){return e(n)?n.replace(/[A-Z]/g,function(n){return String.fromCharCode(n.charCodeAt(0)|32)}):n},ts=function(n){return e(n)?n.replace(/[a-z]/g,function(n){return String.fromCharCode(n.charCodeAt(0)&-33)}):n},g,gf,hu,dt,ki,ku,se,he,it,le,pe,gu,lt,uf,yt,ei,vr,at,tt,b,ef,of,co,lo,vo,pr,ir;"i"!=="I".toLowerCase()&&(l=ns,wt=ts);var y,u,bt,gr=[].slice,is=[].push,si=Object.prototype.toString,hi=v("ng"),tv=n.angular,rr=n.angular||(n.angular={}),ci,ni,et=["0","0","0"];y=k((/msie (\d+)/.exec(l(navigator.userAgent))||[])[1]);isNaN(y)&&(y=k((/trident\/.*; rv:(\d+)/.exec(l(navigator.userAgent))||[])[1]));c.$inject=[];ti.$inject=[];g=function(){return String.prototype.trim?function(n){return e(n)?n.trim():n}:function(n){return e(n)?n.replace(/^\s*/,"").replace(/\s*$/,""):n}}();ni=y<9?function(n){return n=n.nodeName?n:n[0],n.scopeName&&n.scopeName!="HTML"?wt(n.scopeName+":"+n.nodeName):n.nodeName}:function(n){return n.nodeName?n.nodeName:n[0].nodeName};gf=/[A-Z]/g;hu={full:"1.2.0",major:1,minor:"NG_VERSION_MINOR",dot:0,codeName:"timely-delivery"};var pi=w.cache={},hr=w.expando="ng-"+(new Date).getTime(),ys=1,ne=n.document.addEventListener?function(n,t,i){n.addEventListener(t,i,!1)}:function(n,t,i){n.attachEvent("on"+t,i)},cu=n.document.removeEventListener?function(n,t,i){n.removeEventListener(t,i,!1)}:function(n,t,i){n.detachEvent("on"+t,i)};var ws=/([\:\-\_]+(.))/g,bs=/^moz([A-Z])/,lu=v("jqLite");dt=w.prototype={ready:function(i){function r(){u||(u=!0,i())}var u=!1;if(t.readyState==="complete")setTimeout(r);else{this.on("DOMContentLoaded",r);w(n).on("load",r)}},toString:function(){var n=[];return r(this,function(t){n.push(""+t)}),"["+n.join(", ")+"]"},eq:function(n){return n>=0?u(this[n]):u(this[this.length+n])},length:0,push:is,sort:[].sort,splice:[].splice};ki={};r("multiple,selected,checked,disabled,readOnly,required,open".split(","),function(n){ki[l(n)]=n});ku={};r("input,select,option,textarea,button,form,details".split(","),function(n){ku[wt(n)]=!0});r({data:re,inheritedData:cr,scope:function(n){return u(n).data("$scope")||cr(n.parentNode||n,["$isolateScope","$scope"])},isolateScope:function(n){return u(n).data("$isolateScope")||u(n).data("$isolateScopeNoTemplate")},controller:ue,injector:function(n){return cr(n,"$injector")},removeAttr:function(n,t){n.removeAttribute(t)},hasClass:yu,css:function(n,t,r){if(t=wi(t),f(r))n.style[t]=r;else{var u;return y<=8&&(u=n.currentStyle&&n.currentStyle[t],u===""&&(u="auto")),u=u||n.style[t],y<=8&&(u=u===""?i:u),u}},attr:function(n,t,r){var u=l(t),e;if(ki[u])if(f(r))r?(n[t]=!0,n.setAttribute(t,u)):(n[t]=!1,n.removeAttribute(u));else return n[t]||(n.attributes.getNamedItem(t)||c).specified?u:i;else if(f(r))n.setAttribute(t,r);else if(n.getAttribute)return e=n.getAttribute(t,2),e===null?i:e},prop:function(n,t,i){if(f(i))n[t]=i;else return n[t]},text:function(){function t(t,i){var r=n[t.nodeType];if(o(i))return r?t[r]:"";t[r]=i}var n=[];return y<9?(n[1]="innerText",n[3]="nodeValue"):n[1]=n[3]="textContent",t.$dv="",t}(),val:function(n,t){if(o(t)){if(ni(n)==="SELECT"&&n.multiple){var i=[];return r(n.options,function(n){n.selected&&i.push(n.value||n.text)}),i.length===0?null:i}return n.value}n.value=t},html:function(n,t){if(o(t))return n.innerHTML;for(var i=0,r=n.childNodes;i<r.length;i++)bi(r[i]);n.innerHTML=t}},function(n,t){w.prototype[t]=function(t,r){var u,o,f,h,e,s;if((n.length==2&&n!==yu&&n!==ue?t:r)===i){if(p(t)){for(u=0;u<this.length;u++)if(n===re)n(this[u],t);else for(o in t)n(this[u],o,t[o]);return this}for(f=n.$dv,h=f===i?Math.min(this.length,1):this.length,e=0;e<h;e++)s=n(this[e],t,r),f=f?f+s:s;return f}for(u=0;u<this.length;u++)n(this[u],t,r);return this}});r({removeData:ie,dealoc:bi,on:function ds(n,i,u,e){if(f(e))throw lu("onargs","jqLite#on() does not support the `selector` or `eventData` parameters");var o=st(n,"events"),s=st(n,"handle");o||st(n,"events",o={});s||st(n,"handle",s=ks(n,o));r(i.split(" "),function(i){var r=o[i],f,e;r||(i=="mouseenter"||i=="mouseleave"?(f=t.body.contains||t.body.compareDocumentPosition?function(n,t){var r=n.nodeType===9?n.documentElement:n,i=t&&t.parentNode;return n===i||!!(i&&i.nodeType===1&&(r.contains?r.contains(i):n.compareDocumentPosition&&n.compareDocumentPosition(i)&16))}:function(n,t){if(t)while(t=t.parentNode)if(t===n)return!0;return!1},o[i]=[],e={mouseleave:"mouseout",mouseenter:"mouseover"},ds(n,e[i],function(n){var r=this,t=n.relatedTarget;t&&(t===r||f(r,t))||s(n,i)})):(ne(n,i,s),o[i]=[]),r=o[i]);r.push(u)})},off:te,replaceWith:function(n,t){var i,u=n.parentNode;bi(n);r(new w(t),function(t){i?u.insertBefore(t,i.nextSibling):u.replaceChild(t,n);i=t})},children:function(n){var t=[];return r(n.childNodes,function(n){n.nodeType===1&&t.push(n)}),t},contents:function(n){return n.childNodes||[]},append:function(n,t){r(new w(t),function(t){(n.nodeType===1||n.nodeType===11)&&n.appendChild(t)})},prepend:function(n,t){if(n.nodeType===1){var i=n.firstChild;r(new w(t),function(t){n.insertBefore(t,i)})}},wrap:function(n,t){t=u(t)[0];var i=n.parentNode;i&&i.replaceChild(t,n);t.appendChild(n)},remove:function(n){bi(n);var t=n.parentNode;t&&t.removeChild(n)},after:function(n,t){var i=n,u=n.parentNode;r(new w(t),function(n){u.insertBefore(n,i.nextSibling);i=n})},addClass:wu,removeClass:pu,toggleClass:function(n,t,i){o(i)&&(i=!yu(n,t));(i?wu:pu)(n,t)},parent:function(n){var t=n.parentNode;return t&&t.nodeType!==11?t:null},next:function(n){if(n.nextElementSibling)return n.nextElementSibling;for(var t=n.nextSibling;t!=null&&t.nodeType!==1;)t=t.nextSibling;return t},find:function(n,t){return n.getElementsByTagName(t)},clone:vu,triggerHandler:function(n,t,i){var f=(st(n,"events")||{})[t],u;i=i||[];u=[{preventDefault:c,stopPropagation:c}];r(f,function(t){t.apply(n,u.concat(i))})}},function(n,t){w.prototype[t]=function(t,i,r){for(var e,s=0;s<this.length;s++)o(e)?(e=n(this[s],t,i,r),f(e)&&(e=u(e))):bu(e,n(this[s],t,i,r));return f(e)?e:this};w.prototype.bind=w.prototype.on;w.prototype.unbind=w.prototype.off});di.prototype={put:function(n,t){this[ui(n)]=t},get:function(n){return this[ui(n)]},remove:function(n){var t=this[n=ui(n)];return delete this[n],t}};var gs=/^function\s*[^\(]*\(\s*([^\)]*)\)/m,nh=/,/,th=/^\s*(_?)(\S+?)\1\s*$/,ih=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,gi=v("$injector");se=v("$animate");he=["$provide",function(n){this.$$selectors={};this.register=function(t,i){var r=t+"-animation";if(t&&t.charAt(0)!=".")throw se("notcsel","Expecting class selector starting with '.' got '{0}'.",t);this.$$selectors[t.substr(1)]=r;n.factory(r,i)};this.$get=["$timeout",function(n){return{enter:function(t,i,u,f){var e=u&&u[u.length-1],o=i&&i[0]||e&&e.parentNode,s=e&&e.nextSibling||null;r(t,function(n){o.insertBefore(n,s)});f&&n(f,0,!1)},leave:function(t,i){t.remove();i&&n(i,0,!1)},move:function(n,t,i,r){this.enter(n,t,i,r)},addClass:function(t,i,u){i=e(i)?i:s(i)?i.join(" "):"";r(t,function(n){wu(n,i)});u&&n(u,0,!1)},removeClass:function(t,i,u){i=e(i)?i:s(i)?i.join(" "):"";r(t,function(n){pu(n,i)});u&&n(u,0,!1)},enabled:c}}]}];it=v("$compile");ce.$inject=["$provide"];le=/^(x[\:\-_]|data[\:\-_])/i;pe=n.XMLHttpRequest||function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(n){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(t){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(i){}throw v("$httpBackend")("noxhr","This browser does not support XMLHttpRequest.");};gu=v("$interpolate");var bh=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,kh={http:80,https:443,ftp:21},nf=v("$location");ge.prototype=rf.prototype=de.prototype={$$html5:!1,$$replace:!1,absUrl:lr("$$absUrl"),url:function(n,t){if(o(n))return this.$$url;var i=bh.exec(n);return i[1]&&this.path(decodeURIComponent(i[1])),(i[2]||i[1])&&this.search(i[3]||""),this.hash(i[5]||"",t),this},protocol:lr("$$protocol"),host:lr("$$host"),port:lr("$$port"),path:no("$$path",function(n){return n.charAt(0)=="/"?n:"/"+n}),search:function(n,t){switch(arguments.length){case 0:return this.$$search;case 1:if(e(n))this.$$search=bf(n);else if(p(n))this.$$search=n;else throw nf("isrcharg","The first argument of the `$location#search()` call must be a string or an object.");break;default:o(t)||t===null?delete this.$$search[n]:this.$$search[n]=t}return this.$$compose(),this},hash:no("$$hash",ti),replace:function(){return this.$$replace=!0,this}};lt=v("$parse");uf={};var fi={"null":function(){return null},"true":function(){return!0},"false":function(){return!1},undefined:c,"+":function(n,t,r,u){return(r=r(n,t),u=u(n,t),f(r))?f(u)?r+u:r:f(u)?u:i},"-":function(n,t,i,r){return i=i(n,t),r=r(n,t),(f(i)?i:0)-(f(r)?r:0)},"*":function(n,t,i,r){return i(n,t)*r(n,t)},"/":function(n,t,i,r){return i(n,t)/r(n,t)},"%":function(n,t,i,r){return i(n,t)%r(n,t)},"^":function(n,t,i,r){return i(n,t)^r(n,t)},"=":c,"===":function(n,t,i,r){return i(n,t)===r(n,t)},"!==":function(n,t,i,r){return i(n,t)!==r(n,t)},"==":function(n,t,i,r){return i(n,t)==r(n,t)},"!=":function(n,t,i,r){return i(n,t)!=r(n,t)},"<":function(n,t,i,r){return i(n,t)<r(n,t)},">":function(n,t,i,r){return i(n,t)>r(n,t)},"<=":function(n,t,i,r){return i(n,t)<=r(n,t)},">=":function(n,t,i,r){return i(n,t)>=r(n,t)},"&&":function(n,t,i,r){return i(n,t)&&r(n,t)},"||":function(n,t,i,r){return i(n,t)||r(n,t)},"&":function(n,t,i,r){return i(n,t)&r(n,t)},"|":function(n,t,i,r){return r(n,t)(n,t,i(n,t))},"!":function(n,t,i){return!i(n,t)}},tc={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},ff=function(n){this.options=n};ff.prototype={constructor:ff,lex:function(n){var r,t;for(this.text=n,this.index=0,this.ch=i,this.lastCh=":",this.tokens=[],t=[];this.index<this.text.length;){if(this.ch=this.text.charAt(this.index),this.is("\"'"))this.readString(this.ch);else if(this.isNumber(this.ch)||this.is(".")&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdent(this.ch))this.readIdent(),this.was("{,")&&t[0]==="{"&&(r=this.tokens[this.tokens.length-1])&&(r.json=r.text.indexOf(".")===-1);else if(this.is("(){}[].,;:?"))this.tokens.push({index:this.index,text:this.ch,json:this.was(":[,")&&this.is("{[")||this.is("}]:,")}),this.is("{[")&&t.unshift(this.ch),this.is("}]")&&t.shift(),this.index++;else if(this.isWhitespace(this.ch)){this.index++;continue}else{var u=this.ch+this.peek(),f=u+this.peek(2),e=fi[this.ch],o=fi[u],s=fi[f];s?(this.tokens.push({index:this.index,text:f,fn:s}),this.index+=3):o?(this.tokens.push({index:this.index,text:u,fn:o}),this.index+=2):e?(this.tokens.push({index:this.index,text:this.ch,fn:e,json:this.was("[,:")&&this.is("+-")}),this.index+=1):this.throwError("Unexpected next character ",this.index,this.index+1)}this.lastCh=this.ch}return this.tokens},is:function(n){return n.indexOf(this.ch)!==-1},was:function(n){return n.indexOf(this.lastCh)!==-1},peek:function(n){var t=n||1;return this.index+t<this.text.length?this.text.charAt(this.index+t):!1},isNumber:function(n){return"0"<=n&&n<="9"},isWhitespace:function(n){return n===" "||n==="\r"||n==="\t"||n==="\n"||n==='\v'||n===" "},isIdent:function(n){return"a"<=n&&n<="z"||"A"<=n&&n<="Z"||"_"===n||n==="$"},isExpOperator:function(n){return n==="-"||n==="+"||this.isNumber(n)},throwError:function(n,t,i){i=i||this.index;var r=f(t)?"s "+t+"-"+this.index+" ["+this.text.substring(t,i)+"]":" "+i;throw lt("lexerr","Lexer Error: {0} at column{1} in expression [{2}].",n,r,this.text);},readNumber:function(){for(var n="",r=this.index,t,i;this.index<this.text.length;){if(t=l(this.text.charAt(this.index)),t=="."||this.isNumber(t))n+=t;else if(i=this.peek(),t=="e"&&this.isExpOperator(i))n+=t;else if(this.isExpOperator(t)&&i&&this.isNumber(i)&&n.charAt(n.length-1)=="e")n+=t;else if(!this.isExpOperator(t)||i&&this.isNumber(i)||n.charAt(n.length-1)!="e")break;else this.throwError("Invalid exponent");this.index++}n=1*n;this.tokens.push({index:r,text:n,json:!0,fn:function(){return n}})},readIdent:function(){for(var o=this,n="",f=this.index,i,r,e,t,u,s;this.index<this.text.length;){if(t=this.text.charAt(this.index),t==="."||this.isIdent(t)||this.isNumber(t))t==="."&&(i=this.index),n+=t;else break;this.index++}if(i)for(r=this.index;r<this.text.length;){if(t=this.text.charAt(r),t==="("){e=n.substr(i-f+1);n=n.substr(0,i-f);this.index=r;break}if(this.isWhitespace(t))r++;else break}u={index:f,text:n};fi.hasOwnProperty(n)?(u.fn=fi[n],u.json=fi[n]):(s=io(n,this.options,this.text),u.fn=a(function(n,t){return s(n,t)},{assign:function(t,i){return ar(t,n,i,o.text,o.options)}}));this.tokens.push(u);e&&(this.tokens.push({index:i,text:".",json:!1}),this.tokens.push({index:i+1,text:e,json:!1}))},readString:function(n){var e=this.index,t,r,f;this.index++;for(var i="",o=n,u=!1;this.index<this.text.length;){if(t=this.text.charAt(this.index),o+=t,u)t==="u"?(r=this.text.substring(this.index+1,this.index+5),r.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+r+"]"),this.index+=4,i+=String.fromCharCode(parseInt(r,16))):(f=tc[t],i+=f?f:t),u=!1;else if(t==="\\")u=!0;else{if(t===n){this.index++;this.tokens.push({index:e,text:o,string:i,json:!0,fn:function(){return i}});return}i+=t}this.index++}this.throwError("Unterminated quote",e)}};ei=function(n,t,i){this.lexer=n;this.$filter=t;this.options=i};ei.ZERO=function(){return 0};ei.prototype={constructor:ei,parse:function(n,t){this.text=n;this.json=t;this.tokens=this.lexer.lex(n);t&&(this.assignment=this.logicalOR,this.functionCall=this.fieldAccess=this.objectIndex=this.filterChain=function(){this.throwError("is not valid json",{text:n,index:0})});var i=t?this.primary():this.statements();return this.tokens.length!==0&&this.throwError("is an unexpected token",this.tokens[0]),i.literal=!!i.literal,i.constant=!!i.constant,i},primary:function(){var n,t,i,r;for(this.expect("(")?(n=this.filterChain(),this.consume(")")):this.expect("[")?n=this.arrayDeclaration():this.expect("{")?n=this.object():(t=this.expect(),n=t.fn,n||this.throwError("not a primary expression",t),t.json&&(n.constant=!0,n.literal=!0));i=this.expect("(","[",".");)i.text==="("?(n=this.functionCall(n,r),r=null):i.text==="["?(r=n,n=this.objectIndex(n)):i.text==="."?(r=n,n=this.fieldAccess(n)):this.throwError("IMPOSSIBLE");return n},throwError:function(n,t){throw lt("syntax","Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].",t.text,n,t.index+1,this.text,this.text.substring(t.index));},peekToken:function(){if(this.tokens.length===0)throw lt("ueoe","Unexpected end of expression: {0}",this.text);return this.tokens[0]},peek:function(n,t,i,r){if(this.tokens.length>0){var f=this.tokens[0],u=f.text;if(u===n||u===t||u===i||u===r||!n&&!t&&!i&&!r)return f}return!1},expect:function(n,t,i,r){var u=this.peek(n,t,i,r);return u?(this.json&&!u.json&&this.throwError("is not valid json",u),this.tokens.shift(),u):!1},consume:function(n){this.expect(n)||this.throwError("is unexpected, expecting ["+n+"]",this.peek())},unaryFn:function(n,t){return a(function(i,r){return n(i,r,t)},{constant:t.constant})},ternaryFn:function(n,t,i){return a(function(r,u){return n(r,u)?t(r,u):i(r,u)},{constant:n.constant&&t.constant&&i.constant})},binaryFn:function(n,t,i){return a(function(r,u){return t(r,u,n,i)},{constant:n.constant&&i.constant})},statements:function(){for(var n=[];;)if(this.tokens.length>0&&!this.peek("}",")",";","]")&&n.push(this.filterChain()),!this.expect(";"))return n.length===1?n[0]:function(t,i){for(var u,f,r=0;r<n.length;r++)u=n[r],u&&(f=u(t,i));return f}},filterChain:function(){for(var n=this.expression(),t;;)if(t=this.expect("|"))n=this.binaryFn(n,t.fn,this.filter());else return n},filter:function(){for(var t=this.expect(),r=this.$filter(t.text),n=[],i;;)if(t=this.expect(":"))n.push(this.expression());else return i=function(t,i,u){for(var e=[u],f=0;f<n.length;f++)e.push(n[f](t,i));return r.apply(t,e)},function(){return i}},expression:function(){return this.assignment()},assignment:function(){var n=this.ternary(),i,t;return(t=this.expect("="))?(n.assign||this.throwError("implies assignment but ["+this.text.substring(0,t.index)+"] can not be assigned to",t),i=this.ternary(),function(t,r){return n.assign(t,i(t,r),r)}):n},ternary:function(){var t=this.logicalOR(),i,n;if(n=this.expect("?")){if(i=this.ternary(),n=this.expect(":"))return this.ternaryFn(t,i,this.ternary());this.throwError("expected :",n)}else return t},logicalOR:function(){for(var n=this.logicalAND(),t;;)if(t=this.expect("||"))n=this.binaryFn(n,t.fn,this.logicalAND());else return n},logicalAND:function(){var n=this.equality(),t;return(t=this.expect("&&"))&&(n=this.binaryFn(n,t.fn,this.logicalAND())),n},equality:function(){var n=this.relational(),t;return(t=this.expect("==","!=","===","!=="))&&(n=this.binaryFn(n,t.fn,this.equality())),n},relational:function(){var n=this.additive(),t;return(t=this.expect("<",">","<=",">="))&&(n=this.binaryFn(n,t.fn,this.relational())),n},additive:function(){for(var n=this.multiplicative(),t;t=this.expect("+","-");)n=this.binaryFn(n,t.fn,this.multiplicative());return n},multiplicative:function(){for(var n=this.unary(),t;t=this.expect("*","/","%");)n=this.binaryFn(n,t.fn,this.unary());return n},unary:function(){var n;return this.expect("+")?this.primary():(n=this.expect("-"))?this.binaryFn(ei.ZERO,n.fn,this.unary()):(n=this.expect("!"))?this.unaryFn(n.fn,this.unary()):this.primary()},fieldAccess:function(n){var t=this,i=this.expect().text,r=io(i,this.options,this.text);return a(function(t,i,u){return r(u||n(t,i),i)},{assign:function(r,u,f){return ar(n(r,f),i,u,t.text,t.options)}})},objectIndex:function(n){var t=this,r=this.expression();return this.consume("]"),a(function(u,f){var s=n(u,f),h=ft(r(u,f),t.text,!0),e,o;return s?(e=tr(s[h],t.text),e&&e.then&&t.options.unwrapPromises&&(o=e,"$$v"in e||(o.$$v=i,o.then(function(n){o.$$v=n})),e=e.$$v),e):i},{assign:function(i,u,f){var e=ft(r(i,f),t.text),o=tr(n(i,f),t.text);return o[e]=u}})},functionCall:function(n,t){var r=[],i;if(this.peekToken().text!==")")do r.push(this.expression());while(this.expect(","));return this.consume(")"),i=this,function(u,f){for(var o,l,e=[],s=t?t(u,f):u,h=0;h<r.length;h++)e.push(r[h](u,f));return o=n(u,f,s)||c,tr(s,i.text),tr(o,i.text),l=o.apply?o.apply(s,e):o(e[0],e[1],e[2],e[3],e[4]),tr(l,i.text)}},arrayDeclaration:function(){var n=[],i=!0,t;if(this.peekToken().text!=="]")do t=this.expression(),n.push(t),t.constant||(i=!1);while(this.expect(","));return this.consume("]"),a(function(t,i){for(var u=[],r=0;r<n.length;r++)u.push(n[r](t,i));return u},{literal:!0,constant:i})},object:function(){var n=[],r=!0,t,u,i;if(this.peekToken().text!=="}")do t=this.expect(),u=t.string||t.text,this.consume(":"),i=this.expression(),n.push({key:u,value:i}),i.constant||(r=!1);while(this.expect(","));return this.consume("}"),a(function(t,i){for(var u,f={},r=0;r<n.length;r++)u=n[r],f[u.key]=u.value(t,i);return f},{literal:!0,constant:r})}};vr={};at=v("$sce");tt={HTML:"html",CSS:"css",URL:"url",RESOURCE_URL:"resourceUrl",JS:"js"};b=t.createElement("a");ef=gt(n.location.href,!0);fo.$inject=["$provide"];eo.$inject=["$locale"];oo.$inject=["$locale"];of=".";var wc={yyyy:d("FullYear",4),yy:d("FullYear",2,0,!0),y:d("FullYear",1),MMMM:yr("Month"),MMM:yr("Month",!0),MM:d("Month",2,1),M:d("Month",1,1),dd:d("Date",2),d:d("Date",1),HH:d("Hours",2),H:d("Hours",1),hh:d("Hours",2,-12),h:d("Hours",1,-12),mm:d("Minutes",2),m:d("Minutes",1),ss:d("Seconds",2),s:d("Seconds",1),sss:d("Milliseconds",3),EEEE:yr("Day"),EEE:yr("Day",!0),a:pc,Z:yc},bc=/((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,kc=/^\-?\d+$/;ho.$inject=["$locale"];co=nt(l);lo=nt(wt);ao.$inject=["$parse"];vo=nt({restrict:"E",compile:function(n,i){return y<=8&&(i.href||i.name||i.$set("href",""),n.append(t.createComment("IE fix"))),function(n,t){t.on("click",function(n){t.attr("href")||n.preventDefault()})}}});pr={};r(ki,function(n,t){if(n!="multiple"){var i=ht("ng-"+t);pr[i]=function(){return{priority:100,compile:function(){return function(n,r,u){n.$watch(u[i],function(n){u.$set(t,!!n)})}}}}}});r(["src","srcset","href"],function(n){var t=ht("ng-"+n);pr[t]=function(){return{priority:99,link:function(i,r,u){u.$observe(t,function(t){t&&(u.$set(n,t),y&&r.prop(n,u[n]))})}}}});ir={$addControl:c,$removeControl:c,$setValidity:c,$setDirty:c,$setPristine:c};yo.$inject=["$element","$attrs","$scope"];var po=function(n){return["$timeout",function(t){return{name:"form",restrict:n?"EAC":"E",controller:yo,compile:function(){return{pre:function(n,r,u,f){var o,s,e;if(!u.action){o=function(n){n.preventDefault?n.preventDefault():n.returnValue=!1};ne(r[0],"submit",o);r.on("$destroy",function(){t(function(){cu(r[0],"submit",o)},0,!1)})}if(s=r.parent().controller("form"),e=u.name||u.ngForm,e&&ar(n,e,f,e),s)r.on("$destroy",function(){s.$removeControl(f);e&&ar(n,e,i,e);a(f,ir)})}}}}}]},nl=po(),tl=po(!0),il=/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,rl=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/,ul=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,wo={text:wr,number:fl,url:el,email:ol,radio:sl,checkbox:hl,hidden:c,button:c,submit:c,reset:c};var bo=["$browser","$sniffer",function(n,t){return{restrict:"E",require:"?ngModel",link:function(i,r,u,f){f&&(wo[l(u.type)]||wo.text)(i,r,u,f,t,n)}}}],br="ng-valid",kr="ng-invalid",oi="ng-pristine",dr="ng-dirty",cl=["$scope","$exceptionHandler","$attrs","$element","$parse",function(n,t,i,u,f){function s(n,t){t=t?"-"+sr(t,"-"):"";u.removeClass((n?kr:br)+t).addClass((n?br:kr)+t)}var h,l,e;if(this.$viewValue=Number.NaN,this.$modelValue=Number.NaN,this.$parsers=[],this.$formatters=[],this.$viewChangeListeners=[],this.$pristine=!0,this.$dirty=!1,this.$valid=!0,this.$invalid=!1,this.$name=i.name,h=f(i.ngModel),l=h.assign,!l)throw v("ngModel")("nonassign","Expression '{0}' is non-assignable. Element: {1}",i.ngModel,ut(u));this.$render=c;this.$isEmpty=function(n){return o(n)||n===""||n===null||n!==n};var p=u.inheritedData("$formController")||ir,a=0,y=this.$error={};u.addClass(oi);s(!0);this.$setValidity=function(n,t){y[n]!==!t&&(t?(y[n]&&a--,a||(s(!0),this.$valid=!0,this.$invalid=!1)):(s(!1),this.$invalid=!0,this.$valid=!1,a++),y[n]=!t,s(t,n),p.$setValidity(n,t,this))};this.$setPristine=function(){this.$dirty=!1;this.$pristine=!0;u.removeClass(dr).addClass(oi)};this.$setViewValue=function(i){this.$viewValue=i;this.$pristine&&(this.$dirty=!0,this.$pristine=!1,u.removeClass(oi).addClass(dr),p.$setDirty());r(this.$parsers,function(n){i=n(i)});this.$modelValue!==i&&(this.$modelValue=i,l(n,i),r(this.$viewChangeListeners,function(n){try{n()}catch(i){t(i)}}))};e=this;n.$watch(function(){var t=h(n),i,r;if(e.$modelValue!==t){for(i=e.$formatters,r=i.length,e.$modelValue=t;r--;)t=i[r](t);e.$viewValue!==t&&(e.$viewValue=t,e.$render())}})}],ll=function(){return{require:["ngModel","^?form"],controller:cl,link:function(n,t,i,r){var u=r[0],f=r[1]||ir;f.$addControl(u);n.$on("$destroy",function(){f.$removeControl(u)})}}},al=nt({require:"ngModel",link:function(n,t,i,r){r.$viewChangeListeners.push(function(){n.$eval(i.ngChange)})}}),ko=function(){return{require:"?ngModel",link:function(n,t,i,r){if(r){i.required=!0;var u=function(n){if(i.required&&r.$isEmpty(n)){r.$setValidity("required",!1);return}return r.$setValidity("required",!0),n};r.$formatters.push(u);r.$parsers.unshift(u);i.$observe("required",function(){u(r.$viewValue)})}}}},vl=function(){return{require:"ngModel",link:function(n,t,u,f){var e=/\/(.*)\//.exec(u.ngList),h=e&&new RegExp(e[1])||u.ngList||",",c=function(n){if(!o(n)){var t=[];return n&&r(n.split(h),function(n){n&&t.push(g(n))}),t}};f.$parsers.push(c);f.$formatters.push(function(n){return s(n)?n.join(", "):i});f.$isEmpty=function(n){return!n||!n.length}}}},yl=/^(true|false|\d+)$/,pl=function(){return{priority:100,compile:function(n,t){return yl.test(t.ngValue)?function(n,t,i){i.$set("value",n.$eval(i.ngValue))}:function(n,t,i){n.$watch(i.ngValue,function(n){i.$set("value",n)})}}}},wl=pt(function(n,t,r){t.addClass("ng-binding").data("$binding",r.ngBind);n.$watch(r.ngBind,function(n){t.text(n==i?"":n)})}),bl=["$interpolate",function(n){return function(t,i,r){var u=n(i.attr(r.$attr.ngBindTemplate));i.addClass("ng-binding").data("$binding",u);r.$observe("ngBindTemplate",function(n){i.text(n)})}}],kl=["$sce","$parse",function(n,t){return function(i,r,u){function e(){return(f(i)||"").toString()}r.addClass("ng-binding").data("$binding",u.ngBindHtml);var f=t(u.ngBindHtml);i.$watch(e,function(){r.html(n.getTrustedHtml(f(i))||"")})}}];var dl=hf("",!0),gl=hf("Odd",0),na=hf("Even",1),ta=pt({compile:function(n,t){t.$set("ngCloak",i);n.removeClass("ng-cloak")}}),ia=[function(){return{scope:!0,controller:"@"}}],go={};r("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(n){var t=ht("ng-"+n);go[t]=["$parse",function(i){return{compile:function(r,u){var f=i(u[t]);return function(t,i){i.on(l(n),function(n){t.$apply(function(){f(t,{$event:n})})})}}}}]});var ra=["$animate",function(n){return{transclude:"element",priority:600,terminal:!0,restrict:"A",$$tlb:!0,compile:function(i,r,u){return function(i,r,f){var o,e;i.$watch(f.ngIf,function(s){vi(s)?(e=i.$new(),u(e,function(i){o={startNode:i[0],endNode:i[i.length++]=t.createComment(" end ngIf: "+f.ngIf+" ")};n.enter(i,r.parent(),r)})):(e&&(e.$destroy(),e=null),o&&(n.leave(su(o)),o=null))})}}}}],ua=["$http","$templateCache","$anchorScroll","$compile","$animate","$sce",function(n,t,i,r,u,e){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",compile:function(o,s,h){var l=s.ngInclude||s.src,a=s.onload||"",c=s.autoscroll;return function(o,s){var p=0,y,v,w=function(){y&&(y.$destroy(),y=null);v&&(u.leave(v),v=null)};o.$watch(e.parseAsResourceUrl(l),function(e){var b=function(){f(c)&&(!c||o.$eval(c))&&i()},l=++p;e?(n.get(e,{cache:t}).success(function(n){if(l===p){var t=o.$new();h(t,function(i){w();y=t;v=i;v.html(n);u.enter(v,null,s,b);r(v.contents())(y);y.$emit("$includeContentLoaded");o.$eval(a)})}}).error(function(){l===p&&w()}),o.$emit("$includeContentRequested")):w()})}}}}],fa=pt({compile:function(){return{pre:function(n,t,i){n.$eval(i.ngInit)}}}}),ea=pt({terminal:!0,priority:1e3}),oa=["$locale","$interpolate",function(n,t){var i=/{}/g;return{restrict:"EA",link:function(u,f,e){var s=e.count,a=e.$attr.when&&f.attr(e.$attr.when),h=e.offset||0,o=u.$eval(a)||{},c={},v=t.startSymbol(),y=t.endSymbol(),p=/^when(Minus)?(.+)$/;r(e,function(n,t){p.test(t)&&(o[l(t.replace("when","").replace("Minus","-"))]=f.attr(e.$attr[t]))});r(o,function(n,r){c[r]=t(n.replace(i,v+s+"-"+h+y))});u.$watch(function(){var t=parseFloat(u.$eval(s));return isNaN(t)?"":(t in o||(t=n.pluralCat(t-h)),c[t](u,f,!0))},function(n){f.text(n)})}}}],sa=["$parse","$animate",function(n,i){var e="$$NG_REMOVED",f=v("ngRepeat");return{transclude:"element",priority:1e3,terminal:!0,$$tlb:!0,compile:function(o,s,h){return function(o,s,c){var y=c.ngRepeat,l=y.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),w,g,b,nt,tt,k,it,d,v,p={$id:ui},a;if(!l)throw f("iexp","Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",y);if(k=l[1],it=l[2],w=l[4],w?(g=n(w),b=function(n,t,i){return v&&(p[v]=n),p[d]=t,p.$index=i,g(o,p)}):(nt=function(n,t){return ui(t)},tt=function(n){return n}),l=k.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/),!l)throw f("iidexp","'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.",k);d=l[3]||l[1];v=l[2];a={};o.$watchCollection(it,function(n){var c,et,it=s[0],ut,ft={},ct,p,w,ot,g,st,k,l,rt=[],ht;if(nu(n))k=n,st=b||nt;else{st=b||tt;k=[];for(w in n)n.hasOwnProperty(w)&&w.charAt(0)!="$"&&k.push(w);k.sort()}for(ct=k.length,et=rt.length=k.length,c=0;c<et;c++)if(w=n===k?c:k[c],ot=n[w],g=st(w,ot,c),vt(g,"`track by` id"),a.hasOwnProperty(g))l=a[g],delete a[g],ft[g]=l,rt[c]=l;else if(ft.hasOwnProperty(g)){r(rt,function(n){n&&n.startNode&&(a[n.id]=n)});throw f("dupes","Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}",y,g);}else rt[c]={id:g},ft[g]=!1;for(w in a)a.hasOwnProperty(w)&&(l=a[w],ht=su(l),i.leave(ht),r(ht,function(n){n[e]=!0}),l.scope.$destroy());for(c=0,et=k.length;c<et;c++){if(w=n===k?c:k[c],ot=n[w],l=rt[c],rt[c-1]&&(it=rt[c-1].endNode),l.startNode){p=l.scope;ut=it;do ut=ut.nextSibling;while(ut&&ut[e]);l.startNode!=ut&&i.move(su(l),null,u(it));it=l.endNode}else p=o.$new();p[d]=ot;v&&(p[v]=w);p.$index=c;p.$first=c===0;p.$last=c===ct-1;p.$middle=!(p.$first||p.$last);p.$odd=!(p.$even=(c&1)==0);l.startNode||h(p,function(n){n[n.length++]=t.createComment(" end ngRepeat: "+y+" ");i.enter(n,null,u(it));it=n;l.scope=p;l.startNode=it&&it.endNode?it.endNode:n[0];l.endNode=n[n.length-1];ft[l.id]=l})}a=ft})}}}}],ha=["$animate",function(n){return function(t,i,r){t.$watch(r.ngShow,function(t){n[vi(t)?"removeClass":"addClass"](i,"ng-hide")})}}],ca=["$animate",function(n){return function(t,i,r){t.$watch(r.ngHide,function(t){n[vi(t)?"addClass":"removeClass"](i,"ng-hide")})}}],la=pt(function(n,t,i){n.$watch(i.ngStyle,function(n,i){i&&n!==i&&r(i,function(n,i){t.css(i,"")});n&&t.css(n)},!0)}),aa=["$animate",function(n){return{restrict:"EA",require:"ngSwitch",controller:["$scope",function(){this.cases={}}],link:function(t,i,u,f){var h=u.ngSwitch||u.on,s,o,e=[];t.$watch(h,function(i){for(var h=0,c=e.length;h<c;h++)e[h].$destroy(),n.leave(o[h]);o=[];e=[];(s=f.cases["!"+i]||f.cases["?"])&&(t.$eval(u.change),r(s,function(i){var r=t.$new();e.push(r);i.transclude(r,function(t){var r=i.element;o.push(t);n.enter(t,r.parent(),r)})}))})}}}],va=pt({transclude:"element",priority:800,require:"^ngSwitch",compile:function(n,t,i){return function(n,r,u,f){f.cases["!"+t.ngSwitchWhen]=f.cases["!"+t.ngSwitchWhen]||[];f.cases["!"+t.ngSwitchWhen].push({transclude:i,element:r})}}}),ya=pt({transclude:"element",priority:800,require:"^ngSwitch",compile:function(n,t,i){return function(n,t,r,u){u.cases["?"]=u.cases["?"]||[];u.cases["?"].push({transclude:i,element:t})}}}),pa=pt({controller:["$element","$transclude",function(n,t){if(!t)throw v("ngTransclude")("orphan","Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found. Element: {0}",ut(n));this.$transclude=t}],link:function(n,t,i,r){r.$transclude(function(n){t.html("");t.append(n)})}}),wa=["$templateCache",function(n){return{restrict:"E",terminal:!0,compile:function(t,i){if(i.type=="text/ng-template"){var r=i.id,u=t[0].text;n.put(r,u)}}}}],ba=v("ngOptions"),ka=nt({terminal:!0}),da=["$compile","$parse",function(n,e){var h=/^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/,l={$setViewValue:c};return{restrict:"E",require:["select","?ngModel"],controller:["$element","$scope","$attrs",function(n,t,i){var r=this,f={},e=l,o,u;r.databound=i.ngModel;r.init=function(n,t,i){e=n;o=t;u=i};r.addOption=function(t){vt(t,'"option value"');f[t]=!0;e.$viewValue==t&&(n.val(t),u.parent()&&u.remove())};r.removeOption=function(n){this.hasOption(n)&&(delete f[n],e.$viewValue==n&&this.renderUnknownOption(n))};r.renderUnknownOption=function(t){var i="? "+ui(t)+" ?";u.val(i);n.prepend(u);n.val(i);u.prop("selected",!0)};r.hasOption=function(n){return f.hasOwnProperty(n)};t.$on("$destroy",function(){r.renderUnknownOption=c})}],link:function(c,l,a,v){function st(n,t,i,r){i.$render=function(){var n=i.$viewValue;r.hasOption(n)?(b.parent()&&b.remove(),t.val(n),n===""&&nt.prop("selected",!0)):o(n)&&nt?t.val(""):r.renderUnknownOption(n)};t.on("change",function(){n.$apply(function(){b.parent()&&b.remove();i.$setViewValue(t.val())})})}function ht(n,t,i){var u;i.$render=function(){var n=new di(i.$viewValue);r(t.find("option"),function(t){t.selected=f(n.get(t.value))})};n.$watch(function(){ri(u,i.$viewValue)||(u=rt(i.$viewValue),i.$render())});t.on("change",function(){n.$apply(function(){var n=[];r(t.find("option"),function(t){t.selected&&n.push(t.value)});i.$setViewValue(n)})})}function ct(t,r,u){function k(){var ht={"":[]},pt=[""],h,ut,n,k,g,tt,it=u.$modelValue,wt=b(t)||[],bt=a?cf(wt):wt,ct,dt,yt,ot,i,e={},lt,rt=!1,c,st,at,vt,kt;if(w)if(o&&s(it))for(rt=new di([]),vt=0;vt<it.length;vt++)e[l]=it[vt],rt.put(o(t,e),it[vt]);else rt=new di(it);for(i=0;yt=bt.length,i<yt;i++){if(ct=i,a){if(ct=bt[i],ct.charAt(0)==="$")continue;e[a]=ct}e[l]=wt[ct];h=nt(t,e)||"";(ut=ht[h])||(ut=ht[h]=[],pt.push(h));w?lt=f(rt.remove(o?o(t,e):p(t,e))):(o?(kt={},kt[l]=it,lt=o(t,kt)===o(t,e)):lt=it===p(t,e),rt=rt||lt);at=d(t,e);at=f(at)?at:"";ut.push({id:o?o(t,e):a?bt[i]:i,label:at,selected:lt})}for(w||(y||it===null?ht[""].unshift({id:"",label:"",selected:!rt}):rt||ht[""].unshift({id:"?",label:"",selected:!0})),ot=0,dt=pt.length;ot<dt;ot++){for(h=pt[ot],ut=ht[h],v.length<=ot?(k={element:et.clone().attr("label",h),label:ut.label},g=[k],v.push(g),r.append(k.element)):(g=v[ot],k=g[0],k.label!=h&&k.element.attr("label",k.label=h)),c=null,i=0,yt=ut.length;i<yt;i++)n=ut[i],(tt=g[i+1])?(c=tt.element,tt.label!==n.label&&c.text(tt.label=n.label),tt.id!==n.id&&c.val(tt.id=n.id),c[0].selected!==n.selected&&c.prop("selected",tt.selected=n.selected)):(n.id===""&&y?st=y:(st=ft.clone()).val(n.id).attr("selected",n.selected).text(n.label),g.push(tt={element:st,label:n.label,id:n.id,selected:n.selected}),c?c.after(st):k.element.append(st),c=st);for(i++;g.length>i;)g.pop().element.remove()}while(v.length>ot)v.pop()[0].element.remove()}var c;if(!(c=g.match(h)))throw ba("iexp","Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_' but got '{0}'. Element: {1}",g,ut(r));var d=e(c[2]||c[1]),l=c[4]||c[6],a=c[5],nt=e(c[3]||""),p=e(c[2]?c[1]:l),b=e(c[7]),tt=c[8],o=tt?e(c[8]):null,v=[[{element:r,label:""}]];y&&(n(y)(t),y.removeClass("ng-scope"),y.remove());r.html("");r.on("change",function(){t.$apply(function(){var k,h=b(t)||[],n={},f,s,d,c,y,g,nt,e;if(w){for(s=[],y=0,nt=v.length;y<nt;y++)for(k=v[y],c=1,g=k.length;c<g;c++)if((d=k[c].element)[0].selected){if(f=d.val(),a&&(n[a]=f),o){for(e=0;e<h.length;e++)if(n[l]=h[e],o(t,n)==f)break}else n[l]=h[f];s.push(p(t,n))}}else if(f=r.val(),f=="?")s=i;else if(f==="")s=null;else if(o){for(e=0;e<h.length;e++)if(n[l]=h[e],o(t,n)==f){s=p(t,n);break}}else n[l]=h[f],a&&(n[a]=f),s=p(t,n);u.$setViewValue(s)})});u.$render=k;t.$watch(k)}var d;if(v[1]){for(var it=v[0],p=v[1],w=a.multiple,g=a.ngOptions,y=!1,nt,ft=u(t.createElement("option")),et=u(t.createElement("optgroup")),b=ft.clone(),k=0,tt=l.children(),ot=tt.length;k<ot;k++)if(tt[k].value===""){nt=y=tt.eq(k);break}it.init(p,y,b);w&&(a.required||a.ngRequired)&&(d=function(n){return p.$setValidity("required",!a.required||n&&n.length),n},p.$parsers.push(d),p.$formatters.unshift(d),a.$observe("required",function(){d(p.$viewValue)}));g?ct(c,l,p):w?ht(c,l,p):st(c,l,p,it)}}}}],ga=["$interpolate",function(n){var t={addOption:c,removeOption:c};return{restrict:"E",priority:100,compile:function(i,r){if(o(r.value)){var u=n(i.text(),!0);u||r.$set("value",i.text())}return function(n,i,r){var e="$selectController",o=i.parent(),f=o.data(e)||o.parent().data(e);f&&f.databound?i.prop("selected",!1):f=t;u?n.$watch(u,function(n,t){r.$set("value",n);n!==t&&f.removeOption(t);f.addOption(n)}):f.addOption(r.value);i.on("$destroy",function(){f.removeOption(r.value)})}}}}],nv=nt({restrict:"E",terminal:!0});ls();vs(rr);u(t).ready(function(){cs(t,df)})})(window,document);angular.$$csp()||angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}.ng-animate-start{clip:rect(0,auto,auto,0);-ms-zoom:1.0001;}.ng-animate-active{clip:rect(-1px,auto,auto,0);-ms-zoom:1;}<\/style>');
/*
//# sourceMappingURL=angular.min.js.map
*/
///#source 1 1 /Scripts/es5-shim.min.js
/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */
(function(n,t){typeof define=="function"&&define.amd?define(t):typeof exports=="object"?module.exports=t():n.returnExports=t()})(this,function(){function s(){}function it(n){return n=+n,n!==n?n=0:n!==0&&n!==1/0&&n!==-(1/0)&&(n=(n>0||-1)*Math.floor(Math.abs(n))),n}function w(n){var t=typeof n;return n===null||t==="undefined"||t==="boolean"||t==="number"||t==="string"}function vt(n){var t,i,r;if(w(n))return n;if((i=n.valueOf,typeof i=="function"&&(t=i.call(n),w(t)))||(r=n.toString,typeof r=="function"&&(t=r.call(n),w(t))))return t;throw new TypeError;}var l,at,a,v,y,p,g,t,nt,tt,i;Function.prototype.bind||(Function.prototype.bind=function(n){var t=this,i,r;if(typeof t!="function")throw new TypeError("Function.prototype.bind called on incompatible "+t);var f=u.call(arguments,1),o=function(){if(this instanceof r){var i=t.apply(this,f.concat(u.call(arguments)));return Object(i)===i?i:this}return t.apply(n,f.concat(u.call(arguments)))},h=Math.max(0,t.length-f.length),e=[];for(i=0;i<h;i++)e.push("$"+i);return r=Function("binder","return function("+e.join(",")+"){return binder.apply(this,arguments)}")(o),t.prototype&&(s.prototype=t.prototype,r.prototype=new s,s.prototype=null),r});var e=Function.prototype.call,rt=Array.prototype,f=Object.prototype,u=rt.slice,n=e.bind(f.toString),h=e.bind(f.hasOwnProperty),ut,ft,et,ot,st;if((st=h(f,"__defineGetter__"))&&(ut=e.bind(f.__defineGetter__),ft=e.bind(f.__defineSetter__),et=e.bind(f.__lookupGetter__),ot=e.bind(f.__lookupSetter__)),[1,2].splice(0).length!=2){var c=Array.prototype.splice,ht=Array.prototype.push,l=Array.prototype.unshift;Array.prototype.splice=function(){function t(n){for(var t=[];n--;)t.unshift(n);return t}var n=[],i;return n.splice.bind(n,0,0).apply(null,t(20)),n.splice.bind(n,0,0).apply(null,t(26)),i=n.length,n.splice(5,0,"XXX"),i+1==n.length?!0:void 0}()?function(n,t){return arguments.length?c.apply(this,[n===void 0?0:n,t===void 0?this.length-n:t].concat(u.call(arguments,2))):[]}:function(n,t){var r,i=u.call(arguments,2),f=i.length;if(!arguments.length)return[];if(n===void 0&&(n=0),t===void 0&&(t=this.length-n),f>0){if(t<=0){if(n==this.length)return ht.apply(this,i),[];if(n==0)return l.apply(this,i),[]}return r=u.call(this,n,n+t),i.push.apply(i,u.call(this,n+t,this.length)),i.unshift.apply(i,u.call(this,0,n)),i.unshift(0,this.length),c.apply(this,i),r}return c.call(this,n,t)}}[].unshift(0)!=1&&(l=Array.prototype.unshift,Array.prototype.unshift=function(){return l.apply(this,arguments),this.length});Array.isArray||(Array.isArray=function(t){return n(t)=="[object Array]"});var b=Object("a"),r=b[0]!="a"||!(0 in b),o=function(n){var t=!0;return n&&n.call("foo",function(n,i,r){typeof r!="object"&&(t=!1)}),!!n&&t};if(Array.prototype.forEach&&o(Array.prototype.forEach)||(Array.prototype.forEach=function(t){var e=i(this),f=r&&n(this)=="[object String]"?this.split(""):e,o=arguments[1],u=-1,s=f.length>>>0;if(n(t)!="[object Function]")throw new TypeError;while(++u<s)u in f&&t.call(o,f[u],u,e)}),Array.prototype.map&&o(Array.prototype.map)||(Array.prototype.map=function(t){var e=i(this),f=r&&n(this)=="[object String]"?this.split(""):e,o=f.length>>>0,s=Array(o),h=arguments[1],u;if(n(t)!="[object Function]")throw new TypeError(t+" is not a function");for(u=0;u<o;u++)u in f&&(s[u]=t.call(h,f[u],u,e));return s}),Array.prototype.filter&&o(Array.prototype.filter)||(Array.prototype.filter=function(t){var o=i(this),f=r&&n(this)=="[object String]"?this.split(""):o,h=f.length>>>0,s=[],e,c=arguments[1],u;if(n(t)!="[object Function]")throw new TypeError(t+" is not a function");for(u=0;u<h;u++)u in f&&(e=f[u],t.call(c,e,u,o)&&s.push(e));return s}),Array.prototype.every&&o(Array.prototype.every)||(Array.prototype.every=function(t){var e=i(this),f=r&&n(this)=="[object String]"?this.split(""):e,o=f.length>>>0,s=arguments[1],u;if(n(t)!="[object Function]")throw new TypeError(t+" is not a function");for(u=0;u<o;u++)if(u in f&&!t.call(s,f[u],u,e))return!1;return!0}),Array.prototype.some&&o(Array.prototype.some)||(Array.prototype.some=function(t){var e=i(this),f=r&&n(this)=="[object String]"?this.split(""):e,o=f.length>>>0,s=arguments[1],u;if(n(t)!="[object Function]")throw new TypeError(t+" is not a function");for(u=0;u<o;u++)if(u in f&&t.call(s,f[u],u,e))return!0;return!1}),Array.prototype.reduce||(Array.prototype.reduce=function(t){var s=i(this),f=r&&n(this)=="[object String]"?this.split(""):s,o=f.length>>>0,u,e;if(n(t)!="[object Function]")throw new TypeError(t+" is not a function");if(!o&&arguments.length==1)throw new TypeError("reduce of empty array with no initial value");if(u=0,arguments.length>=2)e=arguments[1];else do{if(u in f){e=f[u++];break}if(++u>=o)throw new TypeError("reduce of empty array with no initial value");}while(1);for(;u<o;u++)u in f&&(e=t.call(void 0,e,f[u],u,s));return e}),Array.prototype.reduceRight||(Array.prototype.reduceRight=function(t){var o=i(this),e=r&&n(this)=="[object String]"?this.split(""):o,s=e.length>>>0,f,u;if(n(t)!="[object Function]")throw new TypeError(t+" is not a function");if(!s&&arguments.length==1)throw new TypeError("reduceRight of empty array with no initial value");if(u=s-1,arguments.length>=2)f=arguments[1];else do{if(u in e){f=e[u--];break}if(--u<0)throw new TypeError("reduceRight of empty array with no initial value");}while(1);if(u<0)return f;do u in this&&(f=t.call(void 0,f,e[u],u,o));while(u--);return f}),Array.prototype.indexOf&&[0,1].indexOf(1,2)==-1||(Array.prototype.indexOf=function(t){var f=r&&n(this)=="[object String]"?this.split(""):i(this),e=f.length>>>0,u;if(!e)return-1;for(u=0,arguments.length>1&&(u=it(arguments[1])),u=u>=0?u:Math.max(0,e+u);u<e;u++)if(u in f&&f[u]===t)return u;return-1}),Array.prototype.lastIndexOf&&[0,1].lastIndexOf(0,-3)==-1||(Array.prototype.lastIndexOf=function(t){var f=r&&n(this)=="[object String]"?this.split(""):i(this),e=f.length>>>0,u;if(!e)return-1;for(u=e-1,arguments.length>1&&(u=Math.min(u,it(arguments[1]))),u=u>=0?u:e-Math.abs(u);u>=0;u--)if(u in f&&t===f[u])return u;return-1}),!Object.keys){var k=!0,ct=function(){}.propertyIsEnumerable("prototype"),d=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],lt=d.length;for(at in{toString:null})k=!1;Object.keys=function(t){var o=n(t)==="[object Function]",l=t!==null&&typeof t=="object",i,s,r,e,c,u,f;if(!l&&!o)throw new TypeError("Object.keys called on a non-object");i=[];s=ct&&o;for(r in t)s&&r==="prototype"||!h(t,r)||i.push(r);if(k)for(e=t.constructor,c=e&&e.prototype===t,u=0;u<lt;u++)f=d[u],c&&f==="constructor"||!h(t,f)||i.push(f);return i}}a=-621987552e5;v="-000001";Date.prototype.toISOString&&new Date(a).toISOString().indexOf(v)!==-1||(Date.prototype.toISOString=function(){var t,r,u,n,i;if(!isFinite(this))throw new RangeError("Date.prototype.toISOString called on non-finite value.");for(n=this.getUTCFullYear(),i=this.getUTCMonth(),n+=Math.floor(i/12),i=(i%12+12)%12,t=[i+1,this.getUTCDate(),this.getUTCHours(),this.getUTCMinutes(),this.getUTCSeconds()],n=(n<0?"-":n>9999?"+":"")+("00000"+Math.abs(n)).slice(0<=n&&n<=9999?-4:-6),r=t.length;r--;)u=t[r],u<10&&(t[r]="0"+u);return n+"-"+t.slice(0,2).join("-")+"T"+t.slice(2).join(":")+"."+("000"+this.getUTCMilliseconds()).slice(-3)+"Z"});y=!1;try{y=Date.prototype.toJSON&&new Date(NaN).toJSON()===null&&new Date(a).toJSON().indexOf(v)!==-1&&Date.prototype.toJSON.call({toISOString:function(){return!0}})}catch(oi){}y||(Date.prototype.toJSON=function(){var n=Object(this),i=vt(n),t;if(typeof i=="number"&&!isFinite(i))return null;if(t=n.toISOString,typeof t!="function")throw new TypeError("toISOString property is not callable");return t.call(n)});(!Date.parse||"Date.parse is buggy")&&(Date=function(n){function t(i,r,u,f,e,o,s){var h=arguments.length,c;return this instanceof n?(c=h==1&&String(i)===i?new n(t.parse(i)):h>=7?new n(i,r,u,f,e,o,s):h>=6?new n(i,r,u,f,e,o):h>=5?new n(i,r,u,f,e):h>=4?new n(i,r,u,f):h>=3?new n(i,r,u):h>=2?new n(i,r):h>=1?new n(i):new n,c.constructor=t,c):n.apply(this,arguments)}function i(n,t){var i=t>1?1:0;return f[t]+Math.floor((n-1969+i)/4)-Math.floor((n-1901+i)/100)+Math.floor((n-1601+i)/400)+365*(n-1970)}function e(t){return Number(new n(1970,0,1,0,0,0,t))}var u=new RegExp("^(\\d{4}|[+-]\\d{6})(?:-(\\d{2})(?:-(\\d{2})(?:T(\\d{2}):(\\d{2})(?::(\\d{2})(?:(\\.\\d{1,}))?)?(Z|(?:([-+])(\\d{2}):(\\d{2})))?)?)?)?$"),f=[0,31,59,90,120,151,181,212,243,273,304,334,365];for(var r in n)t[r]=n[r];return t.now=n.now,t.UTC=n.UTC,t.prototype=n.prototype,t.prototype.constructor=t,t.parse=function(t){var r=u.exec(t);if(r){var s=Number(r[1]),o=Number(r[2]||1)-1,h=Number(r[3]||1)-1,v=Number(r[4]||0),c=Number(r[5]||0),l=Number(r[6]||0),a=Math.floor(Number(r[7]||0)*1e3),b=Boolean(r[4]&&!r[8]),y=r[9]==="-"?1:-1,p=Number(r[10]||0),w=Number(r[11]||0),f;return v<(c>0||l>0||a>0?24:25)&&c<60&&l<60&&a<1e3&&o>-1&&o<12&&p<24&&w<60&&h>-1&&h<i(s,o+1)-i(s,o)&&(f=((i(s,o)+h)*24+v+p*y)*60,f=((f+c+w*y)*60+l)*1e3+a,b&&(f=e(f)),-864e13<=f&&f<=864e13)?f:NaN}return n.parse.apply(this,arguments)},t}(Date));Date.now||(Date.now=function(){return(new Date).getTime()});Number.prototype.toFixed&&8e-5.toFixed(3)==="0.000"&&.9.toFixed(0)!=="0"&&1.255.toFixed(2)==="1.25"&&1000000000000000128..toFixed(0)==="1000000000000000128"||function(){function t(t,i){for(var f=-1;++f<u;)i+=t*n[f],n[f]=i%r,i=Math.floor(i/r)}function f(t){for(var f=u,i=0;--f>=0;)i+=n[f],n[f]=Math.floor(i/t),i=i%t*r}function e(){for(var i=u,t="",r;--i>=0;)(t!==""||i===0||n[i]!==0)&&(r=String(n[i]),t===""?t=r:t+="0000000".slice(0,7-r.length)+r);return t}function i(n,t,r){return t===0?r:t%2==1?i(n,t-1,r*n):i(n*n,t/2,r)}function o(n){for(var t=0;n>=4096;)t+=12,n/=4096;while(n>=2)t+=1,n/=2;return t}var r,u,n;r=1e7;u=6;n=[0,0,0,0,0,0];Number.prototype.toFixed=function(n){var r,u,l,s,h,v,c,a;if(r=Number(n),r=r!==r?0:Math.floor(r),r<0||r>20)throw new RangeError("Number.toFixed called with invalid number of decimals");if(u=Number(this),u!==u)return"NaN";if(u<=-1e21||u>=1e21)return String(u);if(l="",u<0&&(l="-",u=-u),s="0",u>1e-21)if(h=o(u*i(2,69,1))-69,v=h<0?u*i(2,-h,1):u/i(2,h,1),v*=4503599627370496,h=52-h,h>0){for(t(0,v),c=r;c>=7;)t(1e7,0),c-=7;for(t(i(10,c,1),0),c=h-1;c>=23;)f(8388608),c-=23;f(1<<c);t(1,1);f(2);s=e()}else t(0,v),t(1<<-h,0),s=e()+"0.00000000000000000000".slice(2,2+r);return r>0?(a=s.length,s=a<=r?l+"0.0000000000000000000".slice(0,r-a+2)+s:l+s.slice(0,a-r)+"."+s.slice(a-r)):s=l+s,s}}();p=String.prototype.split;"ab".split(/(?:ab)*/).length!==2||".".split(/(.?)(.?)/).length!==4||"tesst".split(/(s)*/)[1]==="t"||"".split(/.?/).length||".".split(/()()/).length>1?function(){var n=/()??/.exec("")[1]===void 0;String.prototype.split=function(t,i){var f=this;if(t===void 0&&i===0)return[];if(Object.prototype.toString.call(t)!=="[object RegExp]")return p.apply(this,arguments);var u=[],s=(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.extended?"x":"")+(t.sticky?"y":""),e=0,t=new RegExp(t.source,s+"g"),h,r,o,c;for(f+="",n||(h=new RegExp("^"+t.source+"$(?!\\s)",s)),i=i===void 0?-1>>>0:i>>>0;r=t.exec(f);){if(o=r.index+r[0].length,o>e&&(u.push(f.slice(e,r.index)),!n&&r.length>1&&r[0].replace(h,function(){for(var n=1;n<arguments.length-2;n++)arguments[n]===void 0&&(r[n]=void 0)}),r.length>1&&r.index<f.length&&Array.prototype.push.apply(u,r.slice(1)),c=r[0].length,e=o,u.length>=i))break;t.lastIndex===r.index&&t.lastIndex++}return e===f.length?(c||!t.test(""))&&u.push(""):u.push(f.slice(e)),u.length>i?u.slice(0,i):u}}():"0".split(void 0,0).length&&(String.prototype.split=function(n,t){return n===void 0&&t===0?[]:p.apply(this,arguments)});"".substr&&"0b".substr(-1)!=="b"&&(g=String.prototype.substr,String.prototype.substr=function(n,t){return g.call(this,n<0?(n=this.length+n)<0?0:n:n,t)});t="\t\n\x0b\f\r   ᠎             　\u2028\u2029﻿";(!String.prototype.trim||t.trim())&&(t="["+t+"]",nt=new RegExp("^"+t+t+"*"),tt=new RegExp(t+t+"*$"),String.prototype.trim=function(){if(this===void 0||this===null)throw new TypeError("can't convert "+this+" to object");return String(this).replace(nt,"").replace(tt,"")});(parseInt(t+"08")!==8||parseInt(t+"0x16")!==22)&&(parseInt=function(n){var t=/^0[xX]/;return function(i,r){return i=String(i).trim(),+r||(r=t.test(i)?16:10),n(i,r)}}(parseInt));i=function(n){if(n==null)throw new TypeError("can't convert "+n+" to object");return Object(n)}});
/*
//# sourceMappingURL=es5-shim.min.js.map
*/
///#source 1 1 /Scripts/angular-ui-router.js
/**
 * State-based routing for AngularJS
 * @version v0.2.10
 * @link http://angular-ui.github.com/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
  module.exports = 'ui.router';
}

(function (window, angular, undefined) {
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var isDefined = angular.isDefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject,
    isArray = angular.isArray,
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy;

function inherit(parent, extra) {
  return extend(new (extend(function() {}, { prototype: parent }))(), extra);
}

function merge(dst) {
  forEach(arguments, function(obj) {
    if (obj !== dst) {
      forEach(obj, function(value, key) {
        if (!dst.hasOwnProperty(key)) dst[key] = value;
      });
    }
  });
  return dst;
}

/**
 * Finds the common ancestor path between two states.
 *
 * @param {Object} first The first state.
 * @param {Object} second The second state.
 * @return {Array} Returns an array of state names in descending order, not including the root.
 */
function ancestors(first, second) {
  var path = [];

  for (var n in first.path) {
    if (first.path[n] !== second.path[n]) break;
    path.push(first.path[n]);
  }
  return path;
}

/**
 * IE8-safe wrapper for `Object.keys()`.
 *
 * @param {Object} object A JavaScript object.
 * @return {Array} Returns the keys of the object as an array.
 */
function keys(object) {
  if (Object.keys) {
    return Object.keys(object);
  }
  var result = [];

  angular.forEach(object, function(val, key) {
    result.push(key);
  });
  return result;
}

/**
 * IE8-safe wrapper for `Array.prototype.indexOf()`.
 *
 * @param {Array} array A JavaScript array.
 * @param {*} value A value to search the array for.
 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
 */
function arraySearch(array, value) {
  if (Array.prototype.indexOf) {
    return array.indexOf(value, Number(arguments[2]) || 0);
  }
  var len = array.length >>> 0, from = Number(arguments[2]) || 0;
  from = (from < 0) ? Math.ceil(from) : Math.floor(from);

  if (from < 0) from += len;

  for (; from < len; from++) {
    if (from in array && array[from] === value) return from;
  }
  return -1;
}

/**
 * Merges a set of parameters with all parameters inherited between the common parents of the
 * current state and a given destination state.
 *
 * @param {Object} currentParams The value of the current state parameters ($stateParams).
 * @param {Object} newParams The set of parameters which will be composited with inherited params.
 * @param {Object} $current Internal definition of object representing the current state.
 * @param {Object} $to Internal definition of object representing state to transition to.
 */
function inheritParams(currentParams, newParams, $current, $to) {
  var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

  for (var i in parents) {
    if (!parents[i].params || !parents[i].params.length) continue;
    parentParams = parents[i].params;

    for (var j in parentParams) {
      if (arraySearch(inheritList, parentParams[j]) >= 0) continue;
      inheritList.push(parentParams[j]);
      inherited[parentParams[j]] = currentParams[parentParams[j]];
    }
  }
  return extend({}, inherited, newParams);
}

/**
 * Normalizes a set of values to string or `null`, filtering them by a list of keys.
 *
 * @param {Array} keys The list of keys to normalize/return.
 * @param {Object} values An object hash of values to normalize.
 * @return {Object} Returns an object hash of normalized string values.
 */
function normalize(keys, values) {
  var normalized = {};

  forEach(keys, function (name) {
    var value = values[name];
    normalized[name] = (value != null) ? String(value) : null;
  });
  return normalized;
}

/**
 * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
 *
 * @param {Object} a The first object.
 * @param {Object} b The second object.
 * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
 *                     it defaults to the list of keys in `a`.
 * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
 */
function equalForKeys(a, b, keys) {
  if (!keys) {
    keys = [];
    for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
  }

  for (var i=0; i<keys.length; i++) {
    var k = keys[i];
    if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
  }
  return true;
}

/**
 * Returns the subset of an object, based on a list of keys.
 *
 * @param {Array} keys
 * @param {Object} values
 * @return {Boolean} Returns a subset of `values`.
 */
function filterByKeys(keys, values) {
  var filtered = {};

  forEach(keys, function (name) {
    filtered[name] = values[name];
  });
  return filtered;
}
/**
 * @ngdoc overview
 * @name ui.router.util
 *
 * @description
 * # ui.router.util sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 *
 */
angular.module('ui.router.util', ['ng']);

/**
 * @ngdoc overview
 * @name ui.router.router
 * 
 * @requires ui.router.util
 *
 * @description
 * # ui.router.router sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 */
angular.module('ui.router.router', ['ui.router.util']);

/**
 * @ngdoc overview
 * @name ui.router.state
 * 
 * @requires ui.router.router
 * @requires ui.router.util
 *
 * @description
 * # ui.router.state sub-module
 *
 * This module is a dependency of the main ui.router module. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 * 
 */
angular.module('ui.router.state', ['ui.router.router', 'ui.router.util']);

/**
 * @ngdoc overview
 * @name ui.router
 *
 * @requires ui.router.state
 *
 * @description
 * # ui.router
 * 
 * ## The main module for ui.router 
 * There are several sub-modules included with the ui.router module, however only this module is needed
 * as a dependency within your angular app. The other modules are for organization purposes. 
 *
 * The modules are:
 * * ui.router - the main "umbrella" module
 * * ui.router.router - 
 * 
 * *You'll need to include **only** this module as the dependency within your angular app.*
 * 
 * <pre>
 * <!doctype html>
 * <html ng-app="myApp">
 * <head>
 *   <script src="js/angular.js"></script>
 *   <!-- Include the ui-router script -->
 *   <script src="js/angular-ui-router.min.js"></script>
 *   <script>
 *     // ...and add 'ui.router' as a dependency
 *     var myApp = angular.module('myApp', ['ui.router']);
 *   </script>
 * </head>
 * <body>
 * </body>
 * </html>
 * </pre>
 */
angular.module('ui.router', ['ui.router.state']);

angular.module('ui.router.compat', ['ui.router']);

/**
 * @ngdoc object
 * @name ui.router.util.$resolve
 *
 * @requires $q
 * @requires $injector
 *
 * @description
 * Manages resolution of (acyclic) graphs of promises.
 */
$Resolve.$inject = ['$q', '$injector'];
function $Resolve(  $q,    $injector) {
  
  var VISIT_IN_PROGRESS = 1,
      VISIT_DONE = 2,
      NOTHING = {},
      NO_DEPENDENCIES = [],
      NO_LOCALS = NOTHING,
      NO_PARENT = extend($q.when(NOTHING), { $$promises: NOTHING, $$values: NOTHING });
  

  /**
   * @ngdoc function
   * @name ui.router.util.$resolve#study
   * @methodOf ui.router.util.$resolve
   *
   * @description
   * Studies a set of invocables that are likely to be used multiple times.
   * <pre>
   * $resolve.study(invocables)(locals, parent, self)
   * </pre>
   * is equivalent to
   * <pre>
   * $resolve.resolve(invocables, locals, parent, self)
   * </pre>
   * but the former is more efficient (in fact `resolve` just calls `study` 
   * internally).
   *
   * @param {object} invocables Invocable objects
   * @return {function} a function to pass in locals, parent and self
   */
  this.study = function (invocables) {
    if (!isObject(invocables)) throw new Error("'invocables' must be an object");
    
    // Perform a topological sort of invocables to build an ordered plan
    var plan = [], cycle = [], visited = {};
    function visit(value, key) {
      if (visited[key] === VISIT_DONE) return;
      
      cycle.push(key);
      if (visited[key] === VISIT_IN_PROGRESS) {
        cycle.splice(0, cycle.indexOf(key));
        throw new Error("Cyclic dependency: " + cycle.join(" -> "));
      }
      visited[key] = VISIT_IN_PROGRESS;
      
      if (isString(value)) {
        plan.push(key, [ function() { return $injector.get(value); }], NO_DEPENDENCIES);
      } else {
        var params = $injector.annotate(value);
        forEach(params, function (param) {
          if (param !== key && invocables.hasOwnProperty(param)) visit(invocables[param], param);
        });
        plan.push(key, value, params);
      }
      
      cycle.pop();
      visited[key] = VISIT_DONE;
    }
    forEach(invocables, visit);
    invocables = cycle = visited = null; // plan is all that's required
    
    function isResolve(value) {
      return isObject(value) && value.then && value.$$promises;
    }
    
    return function (locals, parent, self) {
      if (isResolve(locals) && self === undefined) {
        self = parent; parent = locals; locals = null;
      }
      if (!locals) locals = NO_LOCALS;
      else if (!isObject(locals)) {
        throw new Error("'locals' must be an object");
      }       
      if (!parent) parent = NO_PARENT;
      else if (!isResolve(parent)) {
        throw new Error("'parent' must be a promise returned by $resolve.resolve()");
      }
      
      // To complete the overall resolution, we have to wait for the parent
      // promise and for the promise for each invokable in our plan.
      var resolution = $q.defer(),
          result = resolution.promise,
          promises = result.$$promises = {},
          values = extend({}, locals),
          wait = 1 + plan.length/3,
          merged = false;
          
      function done() {
        // Merge parent values we haven't got yet and publish our own $$values
        if (!--wait) {
          if (!merged) merge(values, parent.$$values); 
          result.$$values = values;
          result.$$promises = true; // keep for isResolve()
          resolution.resolve(values);
        }
      }
      
      function fail(reason) {
        result.$$failure = reason;
        resolution.reject(reason);
      }
      
      // Short-circuit if parent has already failed
      if (isDefined(parent.$$failure)) {
        fail(parent.$$failure);
        return result;
      }
      
      // Merge parent values if the parent has already resolved, or merge
      // parent promises and wait if the parent resolve is still in progress.
      if (parent.$$values) {
        merged = merge(values, parent.$$values);
        done();
      } else {
        extend(promises, parent.$$promises);
        parent.then(done, fail);
      }
      
      // Process each invocable in the plan, but ignore any where a local of the same name exists.
      for (var i=0, ii=plan.length; i<ii; i+=3) {
        if (locals.hasOwnProperty(plan[i])) done();
        else invoke(plan[i], plan[i+1], plan[i+2]);
      }
      
      function invoke(key, invocable, params) {
        // Create a deferred for this invocation. Failures will propagate to the resolution as well.
        var invocation = $q.defer(), waitParams = 0;
        function onfailure(reason) {
          invocation.reject(reason);
          fail(reason);
        }
        // Wait for any parameter that we have a promise for (either from parent or from this
        // resolve; in that case study() will have made sure it's ordered before us in the plan).
        forEach(params, function (dep) {
          if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
            waitParams++;
            promises[dep].then(function (result) {
              values[dep] = result;
              if (!(--waitParams)) proceed();
            }, onfailure);
          }
        });
        if (!waitParams) proceed();
        function proceed() {
          if (isDefined(result.$$failure)) return;
          try {
            invocation.resolve($injector.invoke(invocable, self, values));
            invocation.promise.then(function (result) {
              values[key] = result;
              done();
            }, onfailure);
          } catch (e) {
            onfailure(e);
          }
        }
        // Publish promise synchronously; invocations further down in the plan may depend on it.
        promises[key] = invocation.promise;
      }
      
      return result;
    };
  };
  
  /**
   * @ngdoc function
   * @name ui.router.util.$resolve#resolve
   * @methodOf ui.router.util.$resolve
   *
   * @description
   * Resolves a set of invocables. An invocable is a function to be invoked via 
   * `$injector.invoke()`, and can have an arbitrary number of dependencies. 
   * An invocable can either return a value directly,
   * or a `$q` promise. If a promise is returned it will be resolved and the 
   * resulting value will be used instead. Dependencies of invocables are resolved 
   * (in this order of precedence)
   *
   * - from the specified `locals`
   * - from another invocable that is part of this `$resolve` call
   * - from an invocable that is inherited from a `parent` call to `$resolve` 
   *   (or recursively
   * - from any ancestor `$resolve` of that parent).
   *
   * The return value of `$resolve` is a promise for an object that contains 
   * (in this order of precedence)
   *
   * - any `locals` (if specified)
   * - the resolved return values of all injectables
   * - any values inherited from a `parent` call to `$resolve` (if specified)
   *
   * The promise will resolve after the `parent` promise (if any) and all promises 
   * returned by injectables have been resolved. If any invocable 
   * (or `$injector.invoke`) throws an exception, or if a promise returned by an 
   * invocable is rejected, the `$resolve` promise is immediately rejected with the 
   * same error. A rejection of a `parent` promise (if specified) will likewise be 
   * propagated immediately. Once the `$resolve` promise has been rejected, no 
   * further invocables will be called.
   * 
   * Cyclic dependencies between invocables are not permitted and will caues `$resolve`
   * to throw an error. As a special case, an injectable can depend on a parameter 
   * with the same name as the injectable, which will be fulfilled from the `parent` 
   * injectable of the same name. This allows inherited values to be decorated. 
   * Note that in this case any other injectable in the same `$resolve` with the same
   * dependency would see the decorated value, not the inherited value.
   *
   * Note that missing dependencies -- unlike cyclic dependencies -- will cause an 
   * (asynchronous) rejection of the `$resolve` promise rather than a (synchronous) 
   * exception.
   *
   * Invocables are invoked eagerly as soon as all dependencies are available. 
   * This is true even for dependencies inherited from a `parent` call to `$resolve`.
   *
   * As a special case, an invocable can be a string, in which case it is taken to 
   * be a service name to be passed to `$injector.get()`. This is supported primarily 
   * for backwards-compatibility with the `resolve` property of `$routeProvider` 
   * routes.
   *
   * @param {object} invocables functions to invoke or 
   * `$injector` services to fetch.
   * @param {object} locals  values to make available to the injectables
   * @param {object} parent  a promise returned by another call to `$resolve`.
   * @param {object} self  the `this` for the invoked methods
   * @return {object} Promise for an object that contains the resolved return value
   * of all invocables, as well as any inherited and local values.
   */
  this.resolve = function (invocables, locals, parent, self) {
    return this.study(invocables)(locals, parent, self);
  };
}

angular.module('ui.router.util').service('$resolve', $Resolve);


/**
 * @ngdoc object
 * @name ui.router.util.$templateFactory
 *
 * @requires $http
 * @requires $templateCache
 * @requires $injector
 *
 * @description
 * Service. Manages loading of templates.
 */
$TemplateFactory.$inject = ['$http', '$templateCache', '$injector'];
function $TemplateFactory(  $http,   $templateCache,   $injector) {

  /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromConfig
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template from a configuration object. 
   *
   * @param {object} config Configuration object for which to load a template. 
   * The following properties are search in the specified order, and the first one 
   * that is defined is used to create the template:
   *
   * @param {string|object} config.template html string template or function to 
   * load via {@link ui.router.util.$templateFactory#fromString fromString}.
   * @param {string|object} config.templateUrl url to load or a function returning 
   * the url to load via {@link ui.router.util.$templateFactory#fromUrl fromUrl}.
   * @param {Function} config.templateProvider function to invoke via 
   * {@link ui.router.util.$templateFactory#fromProvider fromProvider}.
   * @param {object} params  Parameters to pass to the template function.
   * @param {object} locals Locals to pass to `invoke` if the template is loaded 
   * via a `templateProvider`. Defaults to `{ params: params }`.
   *
   * @return {string|object}  The template html as a string, or a promise for 
   * that string,or `null` if no template is configured.
   */
  this.fromConfig = function (config, params, locals) {
    return (
      isDefined(config.template) ? this.fromString(config.template, params) :
      isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) :
      isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) :
      null
    );
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromString
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template from a string or a function returning a string.
   *
   * @param {string|object} template html template as a string or function that 
   * returns an html template as a string.
   * @param {object} params Parameters to pass to the template function.
   *
   * @return {string|object} The template html as a string, or a promise for that 
   * string.
   */
  this.fromString = function (template, params) {
    return isFunction(template) ? template(params) : template;
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromUrl
   * @methodOf ui.router.util.$templateFactory
   * 
   * @description
   * Loads a template from the a URL via `$http` and `$templateCache`.
   *
   * @param {string|Function} url url of the template to load, or a function 
   * that returns a url.
   * @param {Object} params Parameters to pass to the url function.
   * @return {string|Promise.<string>} The template html as a string, or a promise 
   * for that string.
   */
  this.fromUrl = function (url, params) {
    if (isFunction(url)) url = url(params);
    if (url == null) return null;
    else return $http
        .get(url, { cache: $templateCache })
        .then(function(response) { return response.data; });
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromUrl
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template by invoking an injectable provider function.
   *
   * @param {Function} provider Function to invoke via `$injector.invoke`
   * @param {Object} params Parameters for the template.
   * @param {Object} locals Locals to pass to `invoke`. Defaults to 
   * `{ params: params }`.
   * @return {string|Promise.<string>} The template html as a string, or a promise 
   * for that string.
   */
  this.fromProvider = function (provider, params, locals) {
    return $injector.invoke(provider, null, locals || { params: params });
  };
}

angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);

/**
 * @ngdoc object
 * @name ui.router.util.type:UrlMatcher
 *
 * @description
 * Matches URLs against patterns and extracts named parameters from the path or the search
 * part of the URL. A URL pattern consists of a path pattern, optionally followed by '?' and a list
 * of search parameters. Multiple search parameter names are separated by '&'. Search parameters
 * do not influence whether or not a URL is matched, but their values are passed through into
 * the matched parameters returned by {@link ui.router.util.type:UrlMatcher#methods_exec exec}.
 * 
 * Path parameter placeholders can be specified using simple colon/catch-all syntax or curly brace
 * syntax, which optionally allows a regular expression for the parameter to be specified:
 *
 * * `':'` name - colon placeholder
 * * `'*'` name - catch-all placeholder
 * * `'{' name '}'` - curly placeholder
 * * `'{' name ':' regexp '}'` - curly placeholder with regexp. Should the regexp itself contain
 *   curly braces, they must be in matched pairs or escaped with a backslash.
 *
 * Parameter names may contain only word characters (latin letters, digits, and underscore) and
 * must be unique within the pattern (across both path and search parameters). For colon 
 * placeholders or curly placeholders without an explicit regexp, a path parameter matches any
 * number of characters other than '/'. For catch-all placeholders the path parameter matches
 * any number of characters.
 * 
 * Examples:
 * 
 * * `'/hello/'` - Matches only if the path is exactly '/hello/'. There is no special treatment for
 *   trailing slashes, and patterns have to match the entire path, not just a prefix.
 * * `'/user/:id'` - Matches '/user/bob' or '/user/1234!!!' or even '/user/' but not '/user' or
 *   '/user/bob/details'. The second path segment will be captured as the parameter 'id'.
 * * `'/user/{id}'` - Same as the previous example, but using curly brace syntax.
 * * `'/user/{id:[^/]*}'` - Same as the previous example.
 * * `'/user/{id:[0-9a-fA-F]{1,8}}'` - Similar to the previous example, but only matches if the id
 *   parameter consists of 1 to 8 hex digits.
 * * `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
 *   path into the parameter 'path'.
 * * `'/files/*path'` - ditto.
 *
 * @param {string} pattern  the pattern to compile into a matcher.
 *
 * @property {string} prefix  A static prefix of this pattern. The matcher guarantees that any
 *   URL matching this matcher (i.e. any string for which {@link ui.router.util.type:UrlMatcher#methods_exec exec()} returns
 *   non-null) will start with this prefix.
 *
 * @property {string} source  The pattern that was passed into the contructor
 *
 * @property {string} sourcePath  The path portion of the source property
 *
 * @property {string} sourceSearch  The search portion of the source property
 *
 * @property {string} regex  The constructed regex that will be used to match against the url when 
 *   it is time to determine which url will match.
 *
 * @returns {Object}  New UrlMatcher object
 */
function UrlMatcher(pattern) {

  // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
  //   '*' name
  //   ':' name
  //   '{' name '}'
  //   '{' name ':' regexp '}'
  // The regular expression is somewhat complicated due to the need to allow curly braces
  // inside the regular expression. The placeholder regexp breaks down as follows:
  //    ([:*])(\w+)               classic placeholder ($1 / $2)
  //    \{(\w+)(?:\:( ... ))?\}   curly brace placeholder ($3) with optional regexp ... ($4)
  //    (?: ... | ... | ... )+    the regexp consists of any number of atoms, an atom being either
  //    [^{}\\]+                  - anything other than curly braces or backslash
  //    \\.                       - a backslash escape
  //    \{(?:[^{}\\]+|\\.)*\}     - a matched set of curly braces containing other atoms
  var placeholder = /([:*])(\w+)|\{(\w+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
      names = {}, compiled = '^', last = 0, m,
      segments = this.segments = [],
      params = this.params = [];

  function addParameter(id) {
    if (!/^\w+(-+\w+)*$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
    if (names[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
    names[id] = true;
    params.push(id);
  }

  function quoteRegExp(string) {
    return string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
  }

  this.source = pattern;

  // Split into static segments separated by path parameter placeholders.
  // The number of segments is always 1 more than the number of parameters.
  var id, regexp, segment;
  while ((m = placeholder.exec(pattern))) {
    id = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
    regexp = m[4] || (m[1] == '*' ? '.*' : '[^/]*');
    segment = pattern.substring(last, m.index);
    if (segment.indexOf('?') >= 0) break; // we're into the search part
    compiled += quoteRegExp(segment) + '(' + regexp + ')';
    addParameter(id);
    segments.push(segment);
    last = placeholder.lastIndex;
  }
  segment = pattern.substring(last);

  // Find any search parameter names and remove them from the last segment
  var i = segment.indexOf('?');
  if (i >= 0) {
    var search = this.sourceSearch = segment.substring(i);
    segment = segment.substring(0, i);
    this.sourcePath = pattern.substring(0, last+i);

    // Allow parameters to be separated by '?' as well as '&' to make concat() easier
    forEach(search.substring(1).split(/[&?]/), addParameter);
  } else {
    this.sourcePath = pattern;
    this.sourceSearch = '';
  }

  compiled += quoteRegExp(segment) + '$';
  segments.push(segment);
  this.regexp = new RegExp(compiled);
  this.prefix = segments[0];
}

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#concat
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns a new matcher for a pattern constructed by appending the path part and adding the
 * search parameters of the specified pattern to this pattern. The current pattern is not
 * modified. This can be understood as creating a pattern for URLs that are relative to (or
 * suffixes of) the current pattern.
 *
 * @example
 * The following two matchers are equivalent:
 * ```
 * new UrlMatcher('/user/{id}?q').concat('/details?date');
 * new UrlMatcher('/user/{id}/details?q&date');
 * ```
 *
 * @param {string} pattern  The pattern to append.
 * @returns {ui.router.util.type:UrlMatcher}  A matcher for the concatenated pattern.
 */
UrlMatcher.prototype.concat = function (pattern) {
  // Because order of search parameters is irrelevant, we can add our own search
  // parameters to the end of the new pattern. Parse the new pattern by itself
  // and then join the bits together, but it's much easier to do this on a string level.
  return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch);
};

UrlMatcher.prototype.toString = function () {
  return this.source;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#exec
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Tests the specified path against this matcher, and returns an object containing the captured
 * parameter values, or null if the path does not match. The returned object contains the values
 * of any search parameters that are mentioned in the pattern, but their value may be null if
 * they are not present in `searchParams`. This means that search parameters are always treated
 * as optional.
 *
 * @example
 * ```
 * new UrlMatcher('/user/{id}?q&r').exec('/user/bob', { x:'1', q:'hello' });
 * // returns { id:'bob', q:'hello', r:null }
 * ```
 *
 * @param {string} path  The URL path to match, e.g. `$location.path()`.
 * @param {Object} searchParams  URL search parameters, e.g. `$location.search()`.
 * @returns {Object}  The captured parameter values.
 */
UrlMatcher.prototype.exec = function (path, searchParams) {
  var m = this.regexp.exec(path);
  if (!m) return null;

  var params = this.params, nTotal = params.length,
    nPath = this.segments.length-1,
    values = {}, i;

  if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");

  for (i=0; i<nPath; i++) values[params[i]] = m[i+1];
  for (/**/; i<nTotal; i++) values[params[i]] = searchParams[params[i]];

  return values;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#parameters
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns the names of all path and search parameters of this pattern in an unspecified order.
 * 
 * @returns {Array.<string>}  An array of parameter names. Must be treated as read-only. If the
 *    pattern has no parameters, an empty array is returned.
 */
UrlMatcher.prototype.parameters = function () {
  return this.params;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#format
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Creates a URL that matches this pattern by substituting the specified values
 * for the path and search parameters. Null values for path parameters are
 * treated as empty strings.
 *
 * @example
 * ```
 * new UrlMatcher('/user/{id}?q').format({ id:'bob', q:'yes' });
 * // returns '/user/bob?q=yes'
 * ```
 *
 * @param {Object} values  the values to substitute for the parameters in this pattern.
 * @returns {string}  the formatted URL (path and optionally search part).
 */
UrlMatcher.prototype.format = function (values) {
  var segments = this.segments, params = this.params;
  if (!values) return segments.join('');

  var nPath = segments.length-1, nTotal = params.length,
    result = segments[0], i, search, value;

  for (i=0; i<nPath; i++) {
    value = values[params[i]];
    // TODO: Maybe we should throw on null here? It's not really good style to use '' and null interchangeabley
    if (value != null) result += encodeURIComponent(value);
    result += segments[i+1];
  }
  for (/**/; i<nTotal; i++) {
    value = values[params[i]];
    if (value != null) {
      result += (search ? '&' : '?') + params[i] + '=' + encodeURIComponent(value);
      search = true;
    }
  }

  return result;
};



/**
 * @ngdoc object
 * @name ui.router.util.$urlMatcherFactory
 *
 * @description
 * Factory for {@link ui.router.util.type:UrlMatcher} instances. The factory is also available to providers
 * under the name `$urlMatcherFactoryProvider`.
 */
function $UrlMatcherFactory() {

  /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#compile
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Creates a {@link ui.router.util.type:UrlMatcher} for the specified pattern.
   *   
   * @param {string} pattern  The URL pattern.
   * @returns {ui.router.util.type:UrlMatcher}  The UrlMatcher.
   */
  this.compile = function (pattern) {
    return new UrlMatcher(pattern);
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#isMatcher
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Returns true if the specified object is a UrlMatcher, or false otherwise.
   *
   * @param {Object} object  The object to perform the type check against.
   * @returns {Boolean}  Returns `true` if the object has the following functions: `exec`, `format`, and `concat`.
   */
  this.isMatcher = function (o) {
    return isObject(o) && isFunction(o.exec) && isFunction(o.format) && isFunction(o.concat);
  };
  
  /* No need to document $get, since it returns this */
  this.$get = function () {
    return this;
  };
}

// Register as a provider so it's available to other providers
angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);

/**
 * @ngdoc object
 * @name ui.router.router.$urlRouterProvider
 *
 * @requires ui.router.util.$urlMatcherFactoryProvider
 *
 * @description
 * `$urlRouterProvider` has the responsibility of watching `$location`. 
 * When `$location` changes it runs through a list of rules one by one until a 
 * match is found. `$urlRouterProvider` is used behind the scenes anytime you specify 
 * a url in a state configuration. All urls are compiled into a UrlMatcher object.
 *
 * There are several methods on `$urlRouterProvider` that make it useful to use directly
 * in your module config.
 */
$UrlRouterProvider.$inject = ['$urlMatcherFactoryProvider'];
function $UrlRouterProvider(  $urlMatcherFactory) {
  var rules = [], 
      otherwise = null;

  // Returns a string that is a prefix of all strings matching the RegExp
  function regExpPrefix(re) {
    var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
    return (prefix != null) ? prefix[1].replace(/\\(.)/g, "$1") : '';
  }

  // Interpolates matched values into a String.replace()-style pattern
  function interpolate(pattern, match) {
    return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
      return match[what === '$' ? 0 : Number(what)];
    });
  }

  /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#rule
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Defines rules that are used by `$urlRouterProvider to find matches for
   * specific URLs.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   // Here's an example of how you might allow case insensitive urls
   *   $urlRouterProvider.rule(function ($injector, $location) {
   *     var path = $location.path(),
   *         normalized = path.toLowerCase();
   *
   *     if (path !== normalized) {
   *       return normalized;
   *     }
   *   });
   * });
   * </pre>
   *
   * @param {object} rule Handler function that takes `$injector` and `$location`
   * services as arguments. You can use them to return a valid path as a string.
   *
   * @return {object} $urlRouterProvider - $urlRouterProvider instance
   */
  this.rule =
    function (rule) {
      if (!isFunction(rule)) throw new Error("'rule' must be a function");
      rules.push(rule);
      return this;
    };

  /**
   * @ngdoc object
   * @name ui.router.router.$urlRouterProvider#otherwise
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Defines a path that is used when an invalied route is requested.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   // if the path doesn't match any of the urls you configured
   *   // otherwise will take care of routing the user to the
   *   // specified url
   *   $urlRouterProvider.otherwise('/index');
   *
   *   // Example of using function rule as param
   *   $urlRouterProvider.otherwise(function ($injector, $location) {
   *     ...
   *   });
   * });
   * </pre>
   *
   * @param {string|object} rule The url path you want to redirect to or a function 
   * rule that returns the url path. The function version is passed two params: 
   * `$injector` and `$location` services.
   *
   * @return {object} $urlRouterProvider - $urlRouterProvider instance
   */
  this.otherwise =
    function (rule) {
      if (isString(rule)) {
        var redirect = rule;
        rule = function () { return redirect; };
      }
      else if (!isFunction(rule)) throw new Error("'rule' must be a function");
      otherwise = rule;
      return this;
    };


  function handleIfMatch($injector, handler, match) {
    if (!match) return false;
    var result = $injector.invoke(handler, handler, { $match: match });
    return isDefined(result) ? result : true;
  }

  /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#when
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Registers a handler for a given url matching. if handle is a string, it is
   * treated as a redirect, and is interpolated according to the syyntax of match
   * (i.e. like String.replace() for RegExp, or like a UrlMatcher pattern otherwise).
   *
   * If the handler is a function, it is injectable. It gets invoked if `$location`
   * matches. You have the option of inject the match object as `$match`.
   *
   * The handler can return
   *
   * - **falsy** to indicate that the rule didn't match after all, then `$urlRouter`
   *   will continue trying to find another one that matches.
   * - **string** which is treated as a redirect and passed to `$location.url()`
   * - **void** or any **truthy** value tells `$urlRouter` that the url was handled.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   $urlRouterProvider.when($state.url, function ($match, $stateParams) {
   *     if ($state.$current.navigable !== state ||
   *         !equalForKeys($match, $stateParams) {
   *      $state.transitionTo(state, $match, false);
   *     }
   *   });
   * });
   * </pre>
   *
   * @param {string|object} what The incoming path that you want to redirect.
   * @param {string|object} handler The path you want to redirect your user to.
   */
  this.when =
    function (what, handler) {
      var redirect, handlerIsString = isString(handler);
      if (isString(what)) what = $urlMatcherFactory.compile(what);

      if (!handlerIsString && !isFunction(handler) && !isArray(handler))
        throw new Error("invalid 'handler' in when()");

      var strategies = {
        matcher: function (what, handler) {
          if (handlerIsString) {
            redirect = $urlMatcherFactory.compile(handler);
            handler = ['$match', function ($match) { return redirect.format($match); }];
          }
          return extend(function ($injector, $location) {
            return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
          }, {
            prefix: isString(what.prefix) ? what.prefix : ''
          });
        },
        regex: function (what, handler) {
          if (what.global || what.sticky) throw new Error("when() RegExp must not be global or sticky");

          if (handlerIsString) {
            redirect = handler;
            handler = ['$match', function ($match) { return interpolate(redirect, $match); }];
          }
          return extend(function ($injector, $location) {
            return handleIfMatch($injector, handler, what.exec($location.path()));
          }, {
            prefix: regExpPrefix(what)
          });
        }
      };

      var check = { matcher: $urlMatcherFactory.isMatcher(what), regex: what instanceof RegExp };

      for (var n in check) {
        if (check[n]) {
          return this.rule(strategies[n](what, handler));
        }
      }

      throw new Error("invalid 'what' in when()");
    };

  /**
   * @ngdoc object
   * @name ui.router.router.$urlRouter
   *
   * @requires $location
   * @requires $rootScope
   * @requires $injector
   *
   * @description
   *
   */
  this.$get =
    [        '$location', '$rootScope', '$injector',
    function ($location,   $rootScope,   $injector) {
      // TODO: Optimize groups of rules with non-empty prefix into some sort of decision tree
      function update(evt) {
        if (evt && evt.defaultPrevented) return;
        function check(rule) {
          var handled = rule($injector, $location);
          if (handled) {
            if (isString(handled)) $location.replace().url(handled);
            return true;
          }
          return false;
        }
        var n=rules.length, i;
        for (i=0; i<n; i++) {
          if (check(rules[i])) return;
        }
        // always check otherwise last to allow dynamic updates to the set of rules
        if (otherwise) check(otherwise);
      }

      $rootScope.$on('$locationChangeSuccess', update);

      return {
        /**
         * @ngdoc function
         * @name ui.router.router.$urlRouter#sync
         * @methodOf ui.router.router.$urlRouter
         *
         * @description
         * Triggers an update; the same update that happens when the address bar url changes, aka `$locationChangeSuccess`.
         * This method is useful when you need to use `preventDefault()` on the `$locationChangeSuccess` event, 
         * perform some custom logic (route protection, auth, config, redirection, etc) and then finally proceed 
         * with the transition by calling `$urlRouter.sync()`.
         *
         * @example
         * <pre>
         * angular.module('app', ['ui.router']);
         *   .run(function($rootScope, $urlRouter) {
         *     $rootScope.$on('$locationChangeSuccess', function(evt) {
         *       // Halt state change from even starting
         *       evt.preventDefault();
         *       // Perform custom logic
         *       var meetsRequirement = ...
         *       // Continue with the update and state transition if logic allows
         *       if (meetsRequirement) $urlRouter.sync();
         *     });
         * });
         * </pre>
         */
        sync: function () {
          update();
        }
      };
    }];
}

angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);

/**
 * @ngdoc object
 * @name ui.router.state.$stateProvider
 *
 * @requires ui.router.router.$urlRouterProvider
 * @requires ui.router.util.$urlMatcherFactoryProvider
 * @requires $locationProvider
 *
 * @description
 * The new `$stateProvider` works similar to Angular's v1 router, but it focuses purely
 * on state.
 *
 * A state corresponds to a "place" in the application in terms of the overall UI and
 * navigation. A state describes (via the controller / template / view properties) what
 * the UI looks like and does at that place.
 *
 * States often have things in common, and the primary way of factoring out these
 * commonalities in this model is via the state hierarchy, i.e. parent/child states aka
 * nested states.
 *
 * The `$stateProvider` provides interfaces to declare these states for your app.
 */
$StateProvider.$inject = ['$urlRouterProvider', '$urlMatcherFactoryProvider', '$locationProvider'];
function $StateProvider(   $urlRouterProvider,   $urlMatcherFactory,           $locationProvider) {

  var root, states = {}, $state, queue = {}, abstractKey = 'abstract';

  // Builds state properties from definition passed to registerState()
  var stateBuilder = {

    // Derive parent state from a hierarchical name only if 'parent' is not explicitly defined.
    // state.children = [];
    // if (parent) parent.children.push(state);
    parent: function(state) {
      if (isDefined(state.parent) && state.parent) return findState(state.parent);
      // regex matches any valid composite state name
      // would match "contact.list" but not "contacts"
      var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
      return compositeName ? findState(compositeName[1]) : root;
    },

    // inherit 'data' from parent and override by own values (if any)
    data: function(state) {
      if (state.parent && state.parent.data) {
        state.data = state.self.data = extend({}, state.parent.data, state.data);
      }
      return state.data;
    },

    // Build a URLMatcher if necessary, either via a relative or absolute URL
    url: function(state) {
      var url = state.url;

      if (isString(url)) {
        if (url.charAt(0) == '^') {
          return $urlMatcherFactory.compile(url.substring(1));
        }
        return (state.parent.navigable || root).url.concat(url);
      }

      if ($urlMatcherFactory.isMatcher(url) || url == null) {
        return url;
      }
      throw new Error("Invalid url '" + url + "' in state '" + state + "'");
    },

    // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
    navigable: function(state) {
      return state.url ? state : (state.parent ? state.parent.navigable : null);
    },

    // Derive parameters for this state and ensure they're a super-set of parent's parameters
    params: function(state) {
      if (!state.params) {
        return state.url ? state.url.parameters() : state.parent.params;
      }
      if (!isArray(state.params)) throw new Error("Invalid params in state '" + state + "'");
      if (state.url) throw new Error("Both params and url specicified in state '" + state + "'");
      return state.params;
    },

    // If there is no explicit multi-view configuration, make one up so we don't have
    // to handle both cases in the view directive later. Note that having an explicit
    // 'views' property will mean the default unnamed view properties are ignored. This
    // is also a good time to resolve view names to absolute names, so everything is a
    // straight lookup at link time.
    views: function(state) {
      var views = {};

      forEach(isDefined(state.views) ? state.views : { '': state }, function (view, name) {
        if (name.indexOf('@') < 0) name += '@' + state.parent.name;
        views[name] = view;
      });
      return views;
    },

    ownParams: function(state) {
      if (!state.parent) {
        return state.params;
      }
      var paramNames = {}; forEach(state.params, function (p) { paramNames[p] = true; });

      forEach(state.parent.params, function (p) {
        if (!paramNames[p]) {
          throw new Error("Missing required parameter '" + p + "' in state '" + state.name + "'");
        }
        paramNames[p] = false;
      });
      var ownParams = [];

      forEach(paramNames, function (own, p) {
        if (own) ownParams.push(p);
      });
      return ownParams;
    },

    // Keep a full path from the root down to this state as this is needed for state activation.
    path: function(state) {
      return state.parent ? state.parent.path.concat(state) : []; // exclude root from path
    },

    // Speed up $state.contains() as it's used a lot
    includes: function(state) {
      var includes = state.parent ? extend({}, state.parent.includes) : {};
      includes[state.name] = true;
      return includes;
    },

    $delegates: {}
  };

  function isRelative(stateName) {
    return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
  }

  function findState(stateOrName, base) {
    var isStr = isString(stateOrName),
        name  = isStr ? stateOrName : stateOrName.name,
        path  = isRelative(name);

    if (path) {
      if (!base) throw new Error("No reference point given for path '"  + name + "'");
      var rel = name.split("."), i = 0, pathLength = rel.length, current = base;

      for (; i < pathLength; i++) {
        if (rel[i] === "" && i === 0) {
          current = base;
          continue;
        }
        if (rel[i] === "^") {
          if (!current.parent) throw new Error("Path '" + name + "' not valid for state '" + base.name + "'");
          current = current.parent;
          continue;
        }
        break;
      }
      rel = rel.slice(i).join(".");
      name = current.name + (current.name && rel ? "." : "") + rel;
    }
    var state = states[name];

    if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
      return state;
    }
    return undefined;
  }

  function queueState(parentName, state) {
    if (!queue[parentName]) {
      queue[parentName] = [];
    }
    queue[parentName].push(state);
  }

  function registerState(state) {
    // Wrap a new object around the state so we can store our private details easily.
    state = inherit(state, {
      self: state,
      resolve: state.resolve || {},
      toString: function() { return this.name; }
    });

    var name = state.name;
    if (!isString(name) || name.indexOf('@') >= 0) throw new Error("State must have a valid name");
    if (states.hasOwnProperty(name)) throw new Error("State '" + name + "'' is already defined");

    // Get parent name
    var parentName = (name.indexOf('.') !== -1) ? name.substring(0, name.lastIndexOf('.'))
        : (isString(state.parent)) ? state.parent
        : '';

    // If parent is not registered yet, add state to queue and register later
    if (parentName && !states[parentName]) {
      return queueState(parentName, state.self);
    }

    for (var key in stateBuilder) {
      if (isFunction(stateBuilder[key])) state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
    }
    states[name] = state;

    // Register the state in the global state list and with $urlRouter if necessary.
    if (!state[abstractKey] && state.url) {
      $urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams) {
        if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
          $state.transitionTo(state, $match, { location: false });
        }
      }]);
    }

    // Register any queued children
    if (queue[name]) {
      for (var i = 0; i < queue[name].length; i++) {
        registerState(queue[name][i]);
      }
    }

    return state;
  }

  // Checks text to see if it looks like a glob.
  function isGlob (text) {
    return text.indexOf('*') > -1;
  }

  // Returns true if glob matches current $state name.
  function doesStateMatchGlob (glob) {
    var globSegments = glob.split('.'),
        segments = $state.$current.name.split('.');

    //match greedy starts
    if (globSegments[0] === '**') {
       segments = segments.slice(segments.indexOf(globSegments[1]));
       segments.unshift('**');
    }
    //match greedy ends
    if (globSegments[globSegments.length - 1] === '**') {
       segments.splice(segments.indexOf(globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE);
       segments.push('**');
    }

    if (globSegments.length != segments.length) {
      return false;
    }

    //match single stars
    for (var i = 0, l = globSegments.length; i < l; i++) {
      if (globSegments[i] === '*') {
        segments[i] = '*';
      }
    }

    return segments.join('') === globSegments.join('');
  }


  // Implicit root state that is always active
  root = registerState({
    name: '',
    url: '^',
    views: null,
    'abstract': true
  });
  root.navigable = null;


  /**
   * @ngdoc function
   * @name ui.router.state.$stateProvider#decorator
   * @methodOf ui.router.state.$stateProvider
   *
   * @description
   * Allows you to extend (carefully) or override (at your own peril) the 
   * `stateBuilder` object used internally by `$stateProvider`. This can be used 
   * to add custom functionality to ui-router, for example inferring templateUrl 
   * based on the state name.
   *
   * When passing only a name, it returns the current (original or decorated) builder
   * function that matches `name`.
   *
   * The builder functions that can be decorated are listed below. Though not all
   * necessarily have a good use case for decoration, that is up to you to decide.
   *
   * In addition, users can attach custom decorators, which will generate new 
   * properties within the state's internal definition. There is currently no clear 
   * use-case for this beyond accessing internal states (i.e. $state.$current), 
   * however, expect this to become increasingly relevant as we introduce additional 
   * meta-programming features.
   *
   * **Warning**: Decorators should not be interdependent because the order of 
   * execution of the builder functions in non-deterministic. Builder functions 
   * should only be dependent on the state definition object and super function.
   *
   *
   * Existing builder functions and current return values:
   *
   * - **parent** `{object}` - returns the parent state object.
   * - **data** `{object}` - returns state data, including any inherited data that is not
   *   overridden by own values (if any).
   * - **url** `{object}` - returns a {link ui.router.util.type:UrlMatcher} or null.
   * - **navigable** `{object}` - returns closest ancestor state that has a URL (aka is 
   *   navigable).
   * - **params** `{object}` - returns an array of state params that are ensured to 
   *   be a super-set of parent's params.
   * - **views** `{object}` - returns a views object where each key is an absolute view 
   *   name (i.e. "viewName@stateName") and each value is the config object 
   *   (template, controller) for the view. Even when you don't use the views object 
   *   explicitly on a state config, one is still created for you internally.
   *   So by decorating this builder function you have access to decorating template 
   *   and controller properties.
   * - **ownParams** `{object}` - returns an array of params that belong to the state, 
   *   not including any params defined by ancestor states.
   * - **path** `{string}` - returns the full path from the root down to this state. 
   *   Needed for state activation.
   * - **includes** `{object}` - returns an object that includes every state that 
   *   would pass a '$state.includes()' test.
   *
   * @example
   * <pre>
   * // Override the internal 'views' builder with a function that takes the state
   * // definition, and a reference to the internal function being overridden:
   * $stateProvider.decorator('views', function ($state, parent) {
   *   var result = {},
   *       views = parent(state);
   *
   *   angular.forEach(view, function (config, name) {
   *     var autoName = (state.name + '.' + name).replace('.', '/');
   *     config.templateUrl = config.templateUrl || '/partials/' + autoName + '.html';
   *     result[name] = config;
   *   });
   *   return result;
   * });
   *
   * $stateProvider.state('home', {
   *   views: {
   *     'contact.list': { controller: 'ListController' },
   *     'contact.item': { controller: 'ItemController' }
   *   }
   * });
   *
   * // ...
   *
   * $state.go('home');
   * // Auto-populates list and item views with /partials/home/contact/list.html,
   * // and /partials/home/contact/item.html, respectively.
   * </pre>
   *
   * @param {string} name The name of the builder function to decorate. 
   * @param {object} func A function that is responsible for decorating the original 
   * builder function. The function receives two parameters:
   *
   *   - `{object}` - state - The state config object.
   *   - `{object}` - super - The original builder function.
   *
   * @return {object} $stateProvider - $stateProvider instance
   */
  this.decorator = decorator;
  function decorator(name, func) {
    /*jshint validthis: true */
    if (isString(name) && !isDefined(func)) {
      return stateBuilder[name];
    }
    if (!isFunction(func) || !isString(name)) {
      return this;
    }
    if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
      stateBuilder.$delegates[name] = stateBuilder[name];
    }
    stateBuilder[name] = func;
    return this;
  }

  /**
   * @ngdoc function
   * @name ui.router.state.$stateProvider#state
   * @methodOf ui.router.state.$stateProvider
   *
   * @description
   * Registers a state configuration under a given state name. The stateConfig object
   * has the following acceptable properties.
   *
   * <a id='template'></a>
   *
   * - **`template`** - {string|function=} - html template as a string or a function that returns
   *   an html template as a string which should be used by the uiView directives. This property 
   *   takes precedence over templateUrl.
   *   
   *   If `template` is a function, it will be called with the following parameters:
   *
   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by
   *     applying the current state
   *
   * <a id='templateUrl'></a>
   *
   * - **`templateUrl`** - {string|function=} - path or function that returns a path to an html 
   *   template that should be used by uiView.
   *   
   *   If `templateUrl` is a function, it will be called with the following parameters:
   *
   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by 
   *     applying the current state
   *
   * <a id='templateProvider'></a>
   *
   * - **`templateProvider`** - {function=} - Provider function that returns HTML content
   *   string.
   *
   * <a id='controller'></a>
   *
   * - **`controller`** - {string|function=} -  Controller fn that should be associated with newly 
   *   related scope or the name of a registered controller if passed as a string.
   *
   * <a id='controllerProvider'></a>
   *
   * - **`controllerProvider`** - {function=} - Injectable provider function that returns
   *   the actual controller or string.
   *
   * <a id='controllerAs'></a>
   * 
   * - **`controllerAs`** – {string=} – A controller alias name. If present the controller will be 
   *   published to scope under the controllerAs name.
   *
   * <a id='resolve'></a>
   *
   * - **`resolve`** - {object.&lt;string, function&gt;=} - An optional map of dependencies which 
   *   should be injected into the controller. If any of these dependencies are promises, 
   *   the router will wait for them all to be resolved or one to be rejected before the 
   *   controller is instantiated. If all the promises are resolved successfully, the values 
   *   of the resolved promises are injected and $stateChangeSuccess event is fired. If any 
   *   of the promises are rejected the $stateChangeError event is fired. The map object is:
   *   
   *   - key - {string}: name of dependency to be injected into controller
   *   - factory - {string|function}: If string then it is alias for service. Otherwise if function, 
   *     it is injected and return value it treated as dependency. If result is a promise, it is 
   *     resolved before its value is injected into controller.
   *
   * <a id='url'></a>
   *
   * - **`url`** - {string=} - A url with optional parameters. When a state is navigated or
   *   transitioned to, the `$stateParams` service will be populated with any 
   *   parameters that were passed.
   *
   * <a id='params'></a>
   *
   * - **`params`** - {object=} - An array of parameter names or regular expressions. Only 
   *   use this within a state if you are not using url. Otherwise you can specify your
   *   parameters within the url. When a state is navigated or transitioned to, the 
   *   $stateParams service will be populated with any parameters that were passed.
   *
   * <a id='views'></a>
   *
   * - **`views`** - {object=} - Use the views property to set up multiple views or to target views
   *   manually/explicitly.
   *
   * <a id='abstract'></a>
   *
   * - **`abstract`** - {boolean=} - An abstract state will never be directly activated, 
   *   but can provide inherited properties to its common children states.
   *
   * <a id='onEnter'></a>
   *
   * - **`onEnter`** - {object=} - Callback function for when a state is entered. Good way
   *   to trigger an action or dispatch an event, such as opening a dialog.
   *
   * <a id='onExit'></a>
   *
   * - **`onExit`** - {object=} - Callback function for when a state is exited. Good way to
   *   trigger an action or dispatch an event, such as opening a dialog.
   *
   * <a id='reloadOnSearch'></a>
   *
   * - **`reloadOnSearch = true`** - {boolean=} - If `false`, will not retrigger the same state 
   *   just because a search/query parameter has changed (via $location.search() or $location.hash()). 
   *   Useful for when you'd like to modify $location.search() without triggering a reload.
   *
   * <a id='data'></a>
   *
   * - **`data`** - {object=} - Arbitrary data object, useful for custom configuration.
   *
   * @example
   * <pre>
   * // Some state name examples
   *
   * // stateName can be a single top-level name (must be unique).
   * $stateProvider.state("home", {});
   *
   * // Or it can be a nested state name. This state is a child of the 
   * // above "home" state.
   * $stateProvider.state("home.newest", {});
   *
   * // Nest states as deeply as needed.
   * $stateProvider.state("home.newest.abc.xyz.inception", {});
   *
   * // state() returns $stateProvider, so you can chain state declarations.
   * $stateProvider
   *   .state("home", {})
   *   .state("about", {})
   *   .state("contacts", {});
   * </pre>
   *
   * @param {string} name A unique state name, e.g. "home", "about", "contacts". 
   * To create a parent/child state use a dot, e.g. "about.sales", "home.newest".
   * @param {object} definition State configuration object.
   */
  this.state = state;
  function state(name, definition) {
    /*jshint validthis: true */
    if (isObject(name)) definition = name;
    else definition.name = name;
    registerState(definition);
    return this;
  }

  /**
   * @ngdoc object
   * @name ui.router.state.$state
   *
   * @requires $rootScope
   * @requires $q
   * @requires ui.router.state.$view
   * @requires $injector
   * @requires ui.router.util.$resolve
   * @requires ui.router.state.$stateParams
   *
   * @property {object} params A param object, e.g. {sectionId: section.id)}, that 
   * you'd like to test against the current active state.
   * @property {object} current A reference to the state's config object. However 
   * you passed it in. Useful for accessing custom data.
   * @property {object} transition Currently pending transition. A promise that'll 
   * resolve or reject.
   *
   * @description
   * `$state` service is responsible for representing states as well as transitioning
   * between them. It also provides interfaces to ask for current state or even states
   * you're coming from.
   */
  // $urlRouter is injected just to ensure it gets instantiated
  this.$get = $get;
  $get.$inject = ['$rootScope', '$q', '$view', '$injector', '$resolve', '$stateParams', '$location', '$urlRouter', '$browser'];
  function $get(   $rootScope,   $q,   $view,   $injector,   $resolve,   $stateParams,   $location,   $urlRouter,   $browser) {

    var TransitionSuperseded = $q.reject(new Error('transition superseded'));
    var TransitionPrevented = $q.reject(new Error('transition prevented'));
    var TransitionAborted = $q.reject(new Error('transition aborted'));
    var TransitionFailed = $q.reject(new Error('transition failed'));
    var currentLocation = $location.url();
    var baseHref = $browser.baseHref();

    function syncUrl() {
      if ($location.url() !== currentLocation) {
        $location.url(currentLocation);
        $location.replace();
      }
    }

    root.locals = { resolve: null, globals: { $stateParams: {} } };
    $state = {
      params: {},
      current: root.self,
      $current: root,
      transition: null
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#reload
     * @methodOf ui.router.state.$state
     *
     * @description
     * A method that force reloads the current state. All resolves are re-resolved, events are not re-fired, 
     * and controllers reinstantiated (bug with controllers reinstantiating right now, fixing soon).
     *
     * @example
     * <pre>
     * var app angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.reload = function(){
     *     $state.reload();
     *   }
     * });
     * </pre>
     *
     * `reload()` is just an alias for:
     * <pre>
     * $state.transitionTo($state.current, $stateParams, { 
     *   reload: true, inherit: false, notify: false 
     * });
     * </pre>
     */
    $state.reload = function reload() {
      $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: false });
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#go
     * @methodOf ui.router.state.$state
     *
     * @description
     * Convenience method for transitioning to a new state. `$state.go` calls 
     * `$state.transitionTo` internally but automatically sets options to 
     * `{ location: true, inherit: true, relative: $state.$current, notify: true }`. 
     * This allows you to easily use an absolute or relative to path and specify 
     * only the parameters you'd like to update (while letting unspecified parameters 
     * inherit from the currently active ancestor states).
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.go('contact.detail');
     *   };
     * });
     * </pre>
     * <img src='../ngdoc_assets/StateGoExamples.png'/>
     *
     * @param {string} to Absolute state name or relative state path. Some examples:
     *
     * - `$state.go('contact.detail')` - will go to the `contact.detail` state
     * - `$state.go('^')` - will go to a parent state
     * - `$state.go('^.sibling')` - will go to a sibling state
     * - `$state.go('.child.grandchild')` - will go to grandchild state
     *
     * @param {object=} params A map of the parameters that will be sent to the state, 
     * will populate $stateParams. Any parameters that are not specified will be inherited from currently 
     * defined parameters. This allows, for example, going to a sibling state that shares parameters
     * specified in a parent state. Parameter inheritance only works between common ancestor states, I.e.
     * transitioning to a sibling will get you the parameters for all parents, transitioning to a child
     * will get you all current parameters, etc.
     * @param {object=} options Options object. The options are:
     *
     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
     * - **`reload`** (v0.2.5) - {boolean=false}, If `true` will force transition even if the state or params 
     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
     *    use this when you want to force a reload when *everything* is the same, including search params.
     *
     * @returns {promise} A promise representing the state of the new transition.
     *
     * Possible success values:
     *
     * - $state.current
     *
     * <br/>Possible rejection values:
     *
     * - 'transition superseded' - when a newer transition has been started after this one
     * - 'transition prevented' - when `event.preventDefault()` has been called in a `$stateChangeStart` listener
     * - 'transition aborted' - when `event.preventDefault()` has been called in a `$stateNotFound` listener or
     *   when a `$stateNotFound` `event.retry` promise errors.
     * - 'transition failed' - when a state has been unsuccessfully found after 2 tries.
     * - *resolve error* - when an error has occurred with a `resolve`
     *
     */
    $state.go = function go(to, params, options) {
      return this.transitionTo(to, params, extend({ inherit: true, relative: $state.$current }, options));
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#transitionTo
     * @methodOf ui.router.state.$state
     *
     * @description
     * Low-level method for transitioning to a new state. {@link ui.router.state.$state#methods_go $state.go}
     * uses `transitionTo` internally. `$state.go` is recommended in most situations.
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.transitionTo('contact.detail');
     *   };
     * });
     * </pre>
     *
     * @param {string} to State name.
     * @param {object=} toParams A map of the parameters that will be sent to the state,
     * will populate $stateParams.
     * @param {object=} options Options object. The options are:
     *
     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
     * - **`inherit`** - {boolean=false}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
     * - **`reload`** (v0.2.5) - {boolean=false}, If `true` will force transition even if the state or params 
     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
     *    use this when you want to force a reload when *everything* is the same, including search params.
     *
     * @returns {promise} A promise representing the state of the new transition. See
     * {@link ui.router.state.$state#methods_go $state.go}.
     */
    $state.transitionTo = function transitionTo(to, toParams, options) {
      toParams = toParams || {};
      options = extend({
        location: true, inherit: false, relative: null, notify: true, reload: false, $retry: false
      }, options || {});

      var from = $state.$current, fromParams = $state.params, fromPath = from.path;
      var evt, toState = findState(to, options.relative);

      if (!isDefined(toState)) {
        // Broadcast not found event and abort the transition if prevented
        var redirect = { to: to, toParams: toParams, options: options };

        /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateNotFound
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when a requested state **cannot be found** using the provided state name during transition.
         * The event is broadcast allowing any handlers a single chance to deal with the error (usually by
         * lazy-loading the unfound state). A special `unfoundState` object is passed to the listener handler,
         * you can see its three properties in the example. You can use `event.preventDefault()` to abort the
         * transition and the promise returned from `go` will be rejected with a `'transition aborted'` value.
         *
         * @param {Object} event Event object.
         * @param {Object} unfoundState Unfound State information. Contains: `to, toParams, options` properties.
         * @param {State} fromState Current state object.
         * @param {Object} fromParams Current state params.
         *
         * @example
         *
         * <pre>
         * // somewhere, assume lazy.state has not been defined
         * $state.go("lazy.state", {a:1, b:2}, {inherit:false});
         *
         * // somewhere else
         * $scope.$on('$stateNotFound',
         * function(event, unfoundState, fromState, fromParams){
         *     console.log(unfoundState.to); // "lazy.state"
         *     console.log(unfoundState.toParams); // {a:1, b:2}
         *     console.log(unfoundState.options); // {inherit:false} + default options
         * })
         * </pre>
         */
        evt = $rootScope.$broadcast('$stateNotFound', redirect, from.self, fromParams);
        if (evt.defaultPrevented) {
          syncUrl();
          return TransitionAborted;
        }

        // Allow the handler to return a promise to defer state lookup retry
        if (evt.retry) {
          if (options.$retry) {
            syncUrl();
            return TransitionFailed;
          }
          var retryTransition = $state.transition = $q.when(evt.retry);
          retryTransition.then(function() {
            if (retryTransition !== $state.transition) return TransitionSuperseded;
            redirect.options.$retry = true;
            return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
          }, function() {
            return TransitionAborted;
          });
          syncUrl();
          return retryTransition;
        }

        // Always retry once if the $stateNotFound was not prevented
        // (handles either redirect changed or state lazy-definition)
        to = redirect.to;
        toParams = redirect.toParams;
        options = redirect.options;
        toState = findState(to, options.relative);
        if (!isDefined(toState)) {
          if (options.relative) throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
          throw new Error("No such state '" + to + "'");
        }
      }
      if (toState[abstractKey]) throw new Error("Cannot transition to abstract state '" + to + "'");
      if (options.inherit) toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
      to = toState;

      var toPath = to.path;

      // Starting from the root of the path, keep all levels that haven't changed
      var keep, state, locals = root.locals, toLocals = [];
      for (keep = 0, state = toPath[keep];
           state && state === fromPath[keep] && equalForKeys(toParams, fromParams, state.ownParams) && !options.reload;
           keep++, state = toPath[keep]) {
        locals = toLocals[keep] = state.locals;
      }

      // If we're going to the same state and all locals are kept, we've got nothing to do.
      // But clear 'transition', as we still want to cancel any other pending transitions.
      // TODO: We may not want to bump 'transition' if we're called from a location change that we've initiated ourselves,
      // because we might accidentally abort a legitimate transition initiated from code?
      if (shouldTriggerReload(to, from, locals, options) ) {
        if ( to.self.reloadOnSearch !== false )
          syncUrl();
        $state.transition = null;
        return $q.when($state.current);
      }

      // Normalize/filter parameters before we pass them to event handlers etc.
      toParams = normalize(to.params, toParams || {});

      // Broadcast start event and cancel the transition if requested
      if (options.notify) {
        /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeStart
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when the state transition **begins**. You can use `event.preventDefault()`
         * to prevent the transition from happening and then the transition promise will be
         * rejected with a `'transition prevented'` value.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         *
         * @example
         *
         * <pre>
         * $rootScope.$on('$stateChangeStart',
         * function(event, toState, toParams, fromState, fromParams){
         *     event.preventDefault();
         *     // transitionTo() promise will be rejected with
         *     // a 'transition prevented' error
         * })
         * </pre>
         */
        evt = $rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams);
        if (evt.defaultPrevented) {
          syncUrl();
          return TransitionPrevented;
        }
      }

      // Resolve locals for the remaining states, but don't update any global state just
      // yet -- if anything fails to resolve the current state needs to remain untouched.
      // We also set up an inheritance chain for the locals here. This allows the view directive
      // to quickly look up the correct definition for each view in the current state. Even
      // though we create the locals object itself outside resolveState(), it is initially
      // empty and gets filled asynchronously. We need to keep track of the promise for the
      // (fully resolved) current locals, and pass this down the chain.
      var resolved = $q.when(locals);
      for (var l=keep; l<toPath.length; l++, state=toPath[l]) {
        locals = toLocals[l] = inherit(locals);
        resolved = resolveState(state, toParams, state===to, resolved, locals);
      }

      // Once everything is resolved, we are ready to perform the actual transition
      // and return a promise for the new state. We also keep track of what the
      // current promise is, so that we can detect overlapping transitions and
      // keep only the outcome of the last transition.
      var transition = $state.transition = resolved.then(function () {
        var l, entering, exiting;

        if ($state.transition !== transition) return TransitionSuperseded;

        // Exit 'from' states not kept
        for (l=fromPath.length-1; l>=keep; l--) {
          exiting = fromPath[l];
          if (exiting.self.onExit) {
            $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
          }
          exiting.locals = null;
        }

        // Enter 'to' states not kept
        for (l=keep; l<toPath.length; l++) {
          entering = toPath[l];
          entering.locals = toLocals[l];
          if (entering.self.onEnter) {
            $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
          }
        }

        // Run it again, to catch any transitions in callbacks
        if ($state.transition !== transition) return TransitionSuperseded;

        // Update globals in $state
        $state.$current = to;
        $state.current = to.self;
        $state.params = toParams;
        copy($state.params, $stateParams);
        $state.transition = null;

        // Update $location
        var toNav = to.navigable;
        if (options.location && toNav) {
          $location.url(toNav.url.format(toNav.locals.globals.$stateParams));

          if (options.location === 'replace') {
            $location.replace();
          }
        }

        if (options.notify) {
        /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeSuccess
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired once the state transition is **complete**.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         */
          $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
        }
        currentLocation = $location.url();

        return $state.current;
      }, function (error) {
        if ($state.transition !== transition) return TransitionSuperseded;

        $state.transition = null;
        /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeError
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when an **error occurs** during transition. It's important to note that if you
         * have any errors in your resolve functions (javascript errors, non-existent services, etc)
         * they will not throw traditionally. You must listen for this $stateChangeError event to
         * catch **ALL** errors.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         * @param {Error} error The resolve error object.
         */
        $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);
        syncUrl();

        return $q.reject(error);
      });

      return transition;
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#is
     * @methodOf ui.router.state.$state
     *
     * @description
     * Similar to {@link ui.router.state.$state#methods_includes $state.includes},
     * but only checks for the full state name. If params is supplied then it will be 
     * tested for strict equality against the current active params object, so all params 
     * must match with none missing and no extras.
     *
     * @example
     * <pre>
     * $state.is('contact.details.item'); // returns true
     * $state.is(contactDetailItemStateObject); // returns true
     *
     * // everything else would return false
     * </pre>
     *
     * @param {string|object} stateName The state name or state object you'd like to check.
     * @param {object=} params A param object, e.g. `{sectionId: section.id}`, that you'd like 
     * to test against the current active state.
     * @returns {boolean} Returns true if it is the state.
     */
    $state.is = function is(stateOrName, params) {
      var state = findState(stateOrName);

      if (!isDefined(state)) {
        return undefined;
      }

      if ($state.$current !== state) {
        return false;
      }

      return isDefined(params) && params !== null ? angular.equals($stateParams, params) : true;
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#includes
     * @methodOf ui.router.state.$state
     *
     * @description
     * A method to determine if the current active state is equal to or is the child of the 
     * state stateName. If any params are passed then they will be tested for a match as well.
     * Not all the parameters need to be passed, just the ones you'd like to test for equality.
     *
     * @example
     * <pre>
     * $state.$current.name = 'contacts.details.item';
     *
     * $state.includes("contacts"); // returns true
     * $state.includes("contacts.details"); // returns true
     * $state.includes("contacts.details.item"); // returns true
     * $state.includes("contacts.list"); // returns false
     * $state.includes("about"); // returns false
     * </pre>
     *
     * @description
     * Basic globing patterns will also work.
     *
     * @example
     * <pre>
     * $state.$current.name = 'contacts.details.item.url';
     *
     * $state.includes("*.details.*.*"); // returns true
     * $state.includes("*.details.**"); // returns true
     * $state.includes("**.item.**"); // returns true
     * $state.includes("*.details.item.url"); // returns true
     * $state.includes("*.details.*.url"); // returns true
     * $state.includes("*.details.*"); // returns false
     * $state.includes("item.**"); // returns false
     * </pre>
     *
     * @param {string} stateOrName A partial name to be searched for within the current state name.
     * @param {object} params A param object, e.g. `{sectionId: section.id}`, 
     * that you'd like to test against the current active state.
     * @returns {boolean} Returns true if it does include the state
     */

    $state.includes = function includes(stateOrName, params) {
      if (isString(stateOrName) && isGlob(stateOrName)) {
        if (doesStateMatchGlob(stateOrName)) {
          stateOrName = $state.$current.name;
        } else {
          return false;
        }
      }

      var state = findState(stateOrName);
      if (!isDefined(state)) {
        return undefined;
      }

      if (!isDefined($state.$current.includes[state.name])) {
        return false;
      }

      var validParams = true;
      angular.forEach(params, function(value, key) {
        if (!isDefined($stateParams[key]) || $stateParams[key] !== value) {
          validParams = false;
        }
      });
      return validParams;
    };


    /**
     * @ngdoc function
     * @name ui.router.state.$state#href
     * @methodOf ui.router.state.$state
     *
     * @description
     * A url generation method that returns the compiled url for the given state populated with the given params.
     *
     * @example
     * <pre>
     * expect($state.href("about.person", { person: "bob" })).toEqual("/about/bob");
     * </pre>
     *
     * @param {string|object} stateOrName The state name or state object you'd like to generate a url from.
     * @param {object=} params An object of parameter values to fill the state's required parameters.
     * @param {object=} options Options object. The options are:
     *
     * - **`lossy`** - {boolean=true} -  If true, and if there is no url associated with the state provided in the
     *    first parameter, then the constructed href url will be built from the first navigable ancestor (aka
     *    ancestor with a valid url).
     * - **`inherit`** - {boolean=false}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
     * 
     * @returns {string} compiled state url
     */
    $state.href = function href(stateOrName, params, options) {
      options = extend({ lossy: true, inherit: false, absolute: false, relative: $state.$current }, options || {});
      var state = findState(stateOrName, options.relative);
      if (!isDefined(state)) return null;

      params = inheritParams($stateParams, params || {}, $state.$current, state);
      var nav = (state && options.lossy) ? state.navigable : state;
      var url = (nav && nav.url) ? nav.url.format(normalize(state.params, params || {})) : null;
      if (!$locationProvider.html5Mode() && url) {
        url = "#" + $locationProvider.hashPrefix() + url;
      }

      if (baseHref !== '/') {
        if ($locationProvider.html5Mode()) {
          url = baseHref.slice(0, -1) + url;
        } else if (options.absolute){
          url = baseHref.slice(1) + url;
        }
      }

      if (options.absolute && url) {
        url = $location.protocol() + '://' + 
              $location.host() + 
              ($location.port() == 80 || $location.port() == 443 ? '' : ':' + $location.port()) + 
              (!$locationProvider.html5Mode() && url ? '/' : '') + 
              url;
      }
      return url;
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#get
     * @methodOf ui.router.state.$state
     *
     * @description
     * Returns the state configuration object for any specific state or all states.
     *
     * @param {string|object=} stateOrName If provided, will only get the config for
     * the requested state. If not provided, returns an array of ALL state configs.
     * @returns {object|array} State configuration object or array of all objects.
     */
    $state.get = function (stateOrName, context) {
      if (!isDefined(stateOrName)) {
        var list = [];
        forEach(states, function(state) { list.push(state.self); });
        return list;
      }
      var state = findState(stateOrName, context);
      return (state && state.self) ? state.self : null;
    };

    function resolveState(state, params, paramsAreFiltered, inherited, dst) {
      // Make a restricted $stateParams with only the parameters that apply to this state if
      // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
      // we also need $stateParams to be available for any $injector calls we make during the
      // dependency resolution process.
      var $stateParams = (paramsAreFiltered) ? params : filterByKeys(state.params, params);
      var locals = { $stateParams: $stateParams };

      // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
      // We're also including $stateParams in this; that way the parameters are restricted
      // to the set that should be visible to the state, and are independent of when we update
      // the global $state and $stateParams values.
      dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
      var promises = [ dst.resolve.then(function (globals) {
        dst.globals = globals;
      }) ];
      if (inherited) promises.push(inherited);

      // Resolve template and dependencies for all views.
      forEach(state.views, function (view, name) {
        var injectables = (view.resolve && view.resolve !== state.resolve ? view.resolve : {});
        injectables.$template = [ function () {
          return $view.load(name, { view: view, locals: locals, params: $stateParams, notify: false }) || '';
        }];

        promises.push($resolve.resolve(injectables, locals, dst.resolve, state).then(function (result) {
          // References to the controller (only instantiated at link time)
          if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
            var injectLocals = angular.extend({}, injectables, locals);
            result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
          } else {
            result.$$controller = view.controller;
          }
          // Provide access to the state itself for internal use
          result.$$state = state;
          result.$$controllerAs = view.controllerAs;
          dst[name] = result;
        }));
      });

      // Wait for all the promises and then return the activation object
      return $q.all(promises).then(function (values) {
        return dst;
      });
    }

    return $state;
  }

  function shouldTriggerReload(to, from, locals, options) {
    if ( to === from && ((locals === from.locals && !options.reload) || (to.self.reloadOnSearch === false)) ) {
      return true;
    }
  }
}

angular.module('ui.router.state')
  .value('$stateParams', {})
  .provider('$state', $StateProvider);


$ViewProvider.$inject = [];
function $ViewProvider() {

  this.$get = $get;
  /**
   * @ngdoc object
   * @name ui.router.state.$view
   *
   * @requires ui.router.util.$templateFactory
   * @requires $rootScope
   *
   * @description
   *
   */
  $get.$inject = ['$rootScope', '$templateFactory'];
  function $get(   $rootScope,   $templateFactory) {
    return {
      // $view.load('full.viewName', { template: ..., controller: ..., resolve: ..., async: false, params: ... })
      /**
       * @ngdoc function
       * @name ui.router.state.$view#load
       * @methodOf ui.router.state.$view
       *
       * @description
       *
       * @param {string} name name
       * @param {object} options option object.
       */
      load: function load(name, options) {
        var result, defaults = {
          template: null, controller: null, view: null, locals: null, notify: true, async: true, params: {}
        };
        options = extend(defaults, options);

        if (options.view) {
          result = $templateFactory.fromConfig(options.view, options.params, options.locals);
        }
        if (result && options.notify) {
        /**
         * @ngdoc event
         * @name ui.router.state.$state#$viewContentLoading
         * @eventOf ui.router.state.$view
         * @eventType broadcast on root scope
         * @description
         *
         * Fired once the view **begins loading**, *before* the DOM is rendered.
         *
         * @param {Object} event Event object.
         * @param {Object} viewConfig The view config properties (template, controller, etc).
         *
         * @example
         *
         * <pre>
         * $scope.$on('$viewContentLoading',
         * function(event, viewConfig){
         *     // Access to all the view config properties.
         *     // and one special property 'targetView'
         *     // viewConfig.targetView
         * });
         * </pre>
         */
          $rootScope.$broadcast('$viewContentLoading', options);
        }
        return result;
      }
    };
  }
}

angular.module('ui.router.state').provider('$view', $ViewProvider);

/**
 * @ngdoc object
 * @name ui.router.state.$uiViewScrollProvider
 *
 * @description
 * Provider that returns the {@link ui.router.state.$uiViewScroll} service function.
 */
function $ViewScrollProvider() {

  var useAnchorScroll = false;

  /**
   * @ngdoc function
   * @name ui.router.state.$uiViewScrollProvider#useAnchorScroll
   * @methodOf ui.router.state.$uiViewScrollProvider
   *
   * @description
   * Reverts back to using the core [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll) service for
   * scrolling based on the url anchor.
   */
  this.useAnchorScroll = function () {
    useAnchorScroll = true;
  };

  /**
   * @ngdoc object
   * @name ui.router.state.$uiViewScroll
   *
   * @requires $anchorScroll
   * @requires $timeout
   *
   * @description
   * When called with a jqLite element, it scrolls the element into view (after a
   * `$timeout` so the DOM has time to refresh).
   *
   * If you prefer to rely on `$anchorScroll` to scroll the view to the anchor,
   * this can be enabled by calling {@link ui.router.state.$uiViewScrollProvider#methods_useAnchorScroll `$uiViewScrollProvider.useAnchorScroll()`}.
   */
  this.$get = ['$anchorScroll', '$timeout', function ($anchorScroll, $timeout) {
    if (useAnchorScroll) {
      return $anchorScroll;
    }

    return function ($element) {
      $timeout(function () {
        $element[0].scrollIntoView();
      }, 0, false);
    };
  }];
}

angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-view
 *
 * @requires ui.router.state.$state
 * @requires $compile
 * @requires $controller
 * @requires $injector
 * @requires ui.router.state.$uiViewScroll
 * @requires $document
 *
 * @restrict ECA
 *
 * @description
 * The ui-view directive tells $state where to place your templates.
 *
 * @param {string=} ui-view A view name. The name should be unique amongst the other views in the
 * same state. You can have views of the same name that live in different states.
 *
 * @param {string=} autoscroll It allows you to set the scroll behavior of the browser window
 * when a view is populated. By default, $anchorScroll is overridden by ui-router's custom scroll
 * service, {@link ui.router.state.$uiViewScroll}. This custom service let's you
 * scroll ui-view elements into view when they are populated during a state activation.
 *
 * *Note: To revert back to old [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll)
 * functionality, call `$uiViewScrollProvider.useAnchorScroll()`.*
 *
 * @param {string=} onload Expression to evaluate whenever the view updates.
 * 
 * @example
 * A view can be unnamed or named. 
 * <pre>
 * <!-- Unnamed -->
 * <div ui-view></div> 
 * 
 * <!-- Named -->
 * <div ui-view="viewName"></div>
 * </pre>
 *
 * You can only have one unnamed view within any template (or root html). If you are only using a 
 * single view and it is unnamed then you can populate it like so:
 * <pre>
 * <div ui-view></div> 
 * $stateProvider.state("home", {
 *   template: "<h1>HELLO!</h1>"
 * })
 * </pre>
 * 
 * The above is a convenient shortcut equivalent to specifying your view explicitly with the {@link ui.router.state.$stateProvider#views `views`}
 * config property, by name, in this case an empty name:
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }    
 * })
 * </pre>
 * 
 * But typically you'll only use the views property if you name your view or have more than one view 
 * in the same template. There's not really a compelling reason to name a view if its the only one, 
 * but you could if you wanted, like so:
 * <pre>
 * <div ui-view="main"></div>
 * </pre> 
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "main": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }    
 * })
 * </pre>
 * 
 * Really though, you'll use views to set up multiple views:
 * <pre>
 * <div ui-view></div>
 * <div ui-view="chart"></div> 
 * <div ui-view="data"></div> 
 * </pre>
 * 
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     },
 *     "chart": {
 *       template: "<chart_thing/>"
 *     },
 *     "data": {
 *       template: "<data_thing/>"
 *     }
 *   }    
 * })
 * </pre>
 *
 * Examples for `autoscroll`:
 *
 * <pre>
 * <!-- If autoscroll present with no expression,
 *      then scroll ui-view into view -->
 * <ui-view autoscroll/>
 *
 * <!-- If autoscroll present with valid expression,
 *      then scroll ui-view into view if expression evaluates to true -->
 * <ui-view autoscroll='true'/>
 * <ui-view autoscroll='false'/>
 * <ui-view autoscroll='scopeVariable'/>
 * </pre>
 */
$ViewDirective.$inject = ['$state', '$injector', '$uiViewScroll'];
function $ViewDirective(   $state,   $injector,   $uiViewScroll) {

  function getService() {
    return ($injector.has) ? function(service) {
      return $injector.has(service) ? $injector.get(service) : null;
    } : function(service) {
      try {
        return $injector.get(service);
      } catch (e) {
        return null;
      }
    };
  }

  var service = getService(),
      $animator = service('$animator'),
      $animate = service('$animate');

  // Returns a set of DOM manipulation functions based on which Angular version
  // it should use
  function getRenderer(attrs, scope) {
    var statics = function() {
      return {
        enter: function (element, target, cb) { target.after(element); cb(); },
        leave: function (element, cb) { element.remove(); cb(); }
      };
    };

    if ($animate) {
      return {
        enter: function(element, target, cb) { $animate.enter(element, null, target, cb); },
        leave: function(element, cb) { $animate.leave(element, cb); }
      };
    }

    if ($animator) {
      var animate = $animator && $animator(scope, attrs);

      return {
        enter: function(element, target, cb) {animate.enter(element, null, target); cb(); },
        leave: function(element, cb) { animate.leave(element); cb(); }
      };
    }

    return statics();
  }

  var directive = {
    restrict: 'ECA',
    terminal: true,
    priority: 400,
    transclude: 'element',
    compile: function (tElement, tAttrs, $transclude) {
      return function (scope, $element, attrs) {
        var previousEl, currentEl, currentScope, latestLocals,
            onloadExp     = attrs.onload || '',
            autoScrollExp = attrs.autoscroll,
            renderer      = getRenderer(attrs, scope);

        scope.$on('$stateChangeSuccess', function() {
          updateView(false);
        });
        scope.$on('$viewContentLoading', function() {
          updateView(false);
        });

        updateView(true);

        function cleanupLastView() {
          if (previousEl) {
            previousEl.remove();
            previousEl = null;
          }

          if (currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }

          if (currentEl) {
            renderer.leave(currentEl, function() {
              previousEl = null;
            });

            previousEl = currentEl;
            currentEl = null;
          }
        }

        function updateView(firstTime) {
          var newScope        = scope.$new(),
              name            = currentEl && currentEl.data('$uiViewName'),
              previousLocals  = name && $state.$current && $state.$current.locals[name];

          if (!firstTime && previousLocals === latestLocals) return; // nothing to do

          var clone = $transclude(newScope, function(clone) {
            renderer.enter(clone, $element, function onUiViewEnter() {
              if (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                $uiViewScroll(clone);
              }
            });
            cleanupLastView();
          });

          latestLocals = $state.$current.locals[clone.data('$uiViewName')];

          currentEl = clone;
          currentScope = newScope;
          /**
           * @ngdoc event
           * @name ui.router.state.directive:ui-view#$viewContentLoaded
           * @eventOf ui.router.state.directive:ui-view
           * @eventType emits on ui-view directive scope
           * @description           *
           * Fired once the view is **loaded**, *after* the DOM is rendered.
           *
           * @param {Object} event Event object.
           */
          currentScope.$emit('$viewContentLoaded');
          currentScope.$eval(onloadExp);
        }
      };
    }
  };

  return directive;
}

$ViewDirectiveFill.$inject = ['$compile', '$controller', '$state'];
function $ViewDirectiveFill ($compile, $controller, $state) {
  return {
    restrict: 'ECA',
    priority: -400,
    compile: function (tElement) {
      var initial = tElement.html();
      return function (scope, $element, attrs) {
        var name      = attrs.uiView || attrs.name || '',
            inherited = $element.inheritedData('$uiView');

        if (name.indexOf('@') < 0) {
          name = name + '@' + (inherited ? inherited.state.name : '');
        }

        $element.data('$uiViewName', name);

        var current = $state.$current,
            locals  = current && current.locals[name];

        if (! locals) {
          return;
        }

        $element.data('$uiView', { name: name, state: locals.$$state });
        $element.html(locals.$template ? locals.$template : initial);

        var link = $compile($element.contents());

        if (locals.$$controller) {
          locals.$scope = scope;
          var controller = $controller(locals.$$controller, locals);
          if (locals.$$controllerAs) {
            scope[locals.$$controllerAs] = controller;
          }
          $element.data('$ngControllerController', controller);
          $element.children().data('$ngControllerController', controller);
        }

        link(scope);
      };
    }
  };
}

angular.module('ui.router.state').directive('uiView', $ViewDirective);
angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);

function parseStateRef(ref) {
  var parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
  if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
  return { state: parsed[1], paramExpr: parsed[3] || null };
}

function stateContext(el) {
  var stateData = el.parent().inheritedData('$uiView');

  if (stateData && stateData.state && stateData.state.name) {
    return stateData.state;
  }
}

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref
 *
 * @requires ui.router.state.$state
 * @requires $timeout
 *
 * @restrict A
 *
 * @description
 * A directive that binds a link (`<a>` tag) to a state. If the state has an associated 
 * URL, the directive will automatically generate & update the `href` attribute via 
 * the {@link ui.router.state.$state#methods_href $state.href()} method. Clicking 
 * the link will trigger a state transition with optional parameters. 
 *
 * Also middle-clicking, right-clicking, and ctrl-clicking on the link will be 
 * handled natively by the browser.
 *
 * You can also use relative state paths within ui-sref, just like the relative 
 * paths passed to `$state.go()`. You just need to be aware that the path is relative
 * to the state that the link lives in, in other words the state that loaded the 
 * template containing the link.
 *
 * You can specify options to pass to {@link ui.router.state.$state#go $state.go()}
 * using the `ui-sref-opts` attribute. Options are restricted to `location`, `inherit`,
 * and `reload`.
 *
 * @example
 * Here's an example of how you'd use ui-sref and how it would compile. If you have the 
 * following template:
 * <pre>
 * <a ui-sref="home">Home</a> | <a ui-sref="about">About</a>
 * 
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a ui-sref="contacts.detail({ id: contact.id })">{{ contact.name }}</a>
 *     </li>
 * </ul>
 * </pre>
 * 
 * Then the compiled html would be (assuming Html5Mode is off):
 * <pre>
 * <a href="#/home" ui-sref="home">Home</a> | <a href="#/about" ui-sref="about">About</a>
 * 
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/1" ui-sref="contacts.detail({ id: contact.id })">Joe</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/2" ui-sref="contacts.detail({ id: contact.id })">Alice</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/3" ui-sref="contacts.detail({ id: contact.id })">Bob</a>
 *     </li>
 * </ul>
 *
 * <a ui-sref="home" ui-sref-opts="{reload: true}">Home</a>
 * </pre>
 *
 * @param {string} ui-sref 'stateName' can be any valid absolute or relative state
 * @param {Object} ui-sref-opts options to pass to {@link ui.router.state.$state#go $state.go()}
 */
$StateRefDirective.$inject = ['$state', '$timeout'];
function $StateRefDirective($state, $timeout) {
  var allowedOptions = ['location', 'inherit', 'reload'];

  return {
    restrict: 'A',
    require: '?^uiSrefActive',
    link: function(scope, element, attrs, uiSrefActive) {
      var ref = parseStateRef(attrs.uiSref);
      var params = null, url = null, base = stateContext(element) || $state.$current;
      var isForm = element[0].nodeName === "FORM";
      var attr = isForm ? "action" : "href", nav = true;

      var options = {
        relative: base
      };
      var optionsOverride = scope.$eval(attrs.uiSrefOpts) || {};
      angular.forEach(allowedOptions, function(option) {
        if (option in optionsOverride) {
          options[option] = optionsOverride[option];
        }
      });

      var update = function(newVal) {
        if (newVal) params = newVal;
        if (!nav) return;

        var newHref = $state.href(ref.state, params, options);

        if (uiSrefActive) {
          uiSrefActive.$$setStateInfo(ref.state, params);
        }
        if (!newHref) {
          nav = false;
          return false;
        }
        element[0][attr] = newHref;
      };

      if (ref.paramExpr) {
        scope.$watch(ref.paramExpr, function(newVal, oldVal) {
          if (newVal !== params) update(newVal);
        }, true);
        params = scope.$eval(ref.paramExpr);
      }
      update();

      if (isForm) return;

      element.bind("click", function(e) {
        var button = e.which || e.button;
        if ( !(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr('target')) ) {
          // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
          $timeout(function() {
            $state.go(ref.state, params, options);
          });
          e.preventDefault();
        }
      });
    }
  };
}

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * A directive working alongside ui-sref to add classes to an element when the 
 * related ui-sref directive's state is active, and removing them when it is inactive.
 * The primary use-case is to simplify the special appearance of navigation menus 
 * relying on `ui-sref`, by having the "active" state's menu button appear different,
 * distinguishing it from the inactive menu items.
 *
 * @example
 * Given the following template:
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item">
 *     <a href ui-sref="app.user({user: 'bilbobaggins'})">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 * 
 * When the app state is "app.user", and contains the state parameter "user" with value "bilbobaggins", 
 * the resulting HTML will appear as (note the 'active' class):
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item active">
 *     <a ui-sref="app.user({user: 'bilbobaggins'})" href="/users/bilbobaggins">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 * 
 * The class name is interpolated **once** during the directives link time (any further changes to the 
 * interpolated value are ignored). 
 * 
 * Multiple classes may be specified in a space-separated format:
 * <pre>
 * <ul>
 *   <li ui-sref-active='class1 class2 class3'>
 *     <a ui-sref="app.user">link</a>
 *   </li>
 * </ul>
 * </pre>
 */
$StateActiveDirective.$inject = ['$state', '$stateParams', '$interpolate'];
function $StateActiveDirective($state, $stateParams, $interpolate) {
  return {
    restrict: "A",
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var state, params, activeClass;

      // There probably isn't much point in $observing this
      activeClass = $interpolate($attrs.uiSrefActive || '', false)($scope);

      // Allow uiSref to communicate with uiSrefActive
      this.$$setStateInfo = function(newState, newParams) {
        state = $state.get(newState, stateContext($element));
        params = newParams;
        update();
      };

      $scope.$on('$stateChangeSuccess', update);

      // Update route state
      function update() {
        if ($state.$current.self === state && matchesParams()) {
          $element.addClass(activeClass);
        } else {
          $element.removeClass(activeClass);
        }
      }

      function matchesParams() {
        return !params || equalForKeys(params, $stateParams);
      }
    }]
  };
}

angular.module('ui.router.state')
  .directive('uiSref', $StateRefDirective)
  .directive('uiSrefActive', $StateActiveDirective);

/**
 * @ngdoc filter
 * @name ui.router.state.filter:isState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_is $state.is("stateName")}.
 */
$IsStateFilter.$inject = ['$state'];
function $IsStateFilter($state) {
  return function(state) {
    return $state.is(state);
  };
}

/**
 * @ngdoc filter
 * @name ui.router.state.filter:includedByState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_includes $state.includes('fullOrPartialStateName')}.
 */
$IncludedByStateFilter.$inject = ['$state'];
function $IncludedByStateFilter($state) {
  return function(state) {
    return $state.includes(state);
  };
}

angular.module('ui.router.state')
  .filter('isState', $IsStateFilter)
  .filter('includedByState', $IncludedByStateFilter);

/*
 * @ngdoc object
 * @name ui.router.compat.$routeProvider
 *
 * @requires ui.router.state.$stateProvider
 * @requires ui.router.router.$urlRouterProvider
 *
 * @description
 * `$routeProvider` of the `ui.router.compat` module overwrites the existing
 * `routeProvider` from the core. This is done to provide compatibility between
 * the UI Router and the core router.
 *
 * It also provides a `when()` method to register routes that map to certain urls.
 * Behind the scenes it actually delegates either to 
 * {@link ui.router.router.$urlRouterProvider $urlRouterProvider} or to the 
 * {@link ui.router.state.$stateProvider $stateProvider} to postprocess the given 
 * router definition object.
 */
$RouteProvider.$inject = ['$stateProvider', '$urlRouterProvider'];
function $RouteProvider(  $stateProvider,    $urlRouterProvider) {

  var routes = [];

  onEnterRoute.$inject = ['$$state'];
  function onEnterRoute(   $$state) {
    /*jshint validthis: true */
    this.locals = $$state.locals.globals;
    this.params = this.locals.$stateParams;
  }

  function onExitRoute() {
    /*jshint validthis: true */
    this.locals = null;
    this.params = null;
  }

  this.when = when;
  /*
   * @ngdoc function
   * @name ui.router.compat.$routeProvider#when
   * @methodOf ui.router.compat.$routeProvider
   *
   * @description
   * Registers a route with a given route definition object. The route definition
   * object has the same interface the angular core route definition object has.
   * 
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.compat']);
   *
   * app.config(function ($routeProvider) {
   *   $routeProvider.when('home', {
   *     controller: function () { ... },
   *     templateUrl: 'path/to/template'
   *   });
   * });
   * </pre>
   *
   * @param {string} url URL as string
   * @param {object} route Route definition object
   *
   * @return {object} $routeProvider - $routeProvider instance
   */
  function when(url, route) {
    /*jshint validthis: true */
    if (route.redirectTo != null) {
      // Redirect, configure directly on $urlRouterProvider
      var redirect = route.redirectTo, handler;
      if (isString(redirect)) {
        handler = redirect; // leave $urlRouterProvider to handle
      } else if (isFunction(redirect)) {
        // Adapt to $urlRouterProvider API
        handler = function (params, $location) {
          return redirect(params, $location.path(), $location.search());
        };
      } else {
        throw new Error("Invalid 'redirectTo' in when()");
      }
      $urlRouterProvider.when(url, handler);
    } else {
      // Regular route, configure as state
      $stateProvider.state(inherit(route, {
        parent: null,
        name: 'route:' + encodeURIComponent(url),
        url: url,
        onEnter: onEnterRoute,
        onExit: onExitRoute
      }));
    }
    routes.push(route);
    return this;
  }

  /*
   * @ngdoc object
   * @name ui.router.compat.$route
   *
   * @requires ui.router.state.$state
   * @requires $rootScope
   * @requires $routeParams
   *
   * @property {object} routes - Array of registered routes.
   * @property {object} params - Current route params as object.
   * @property {string} current - Name of the current route.
   *
   * @description
   * The `$route` service provides interfaces to access defined routes. It also let's
   * you access route params through `$routeParams` service, so you have fully
   * control over all the stuff you would actually get from angular's core `$route`
   * service.
   */
  this.$get = $get;
  $get.$inject = ['$state', '$rootScope', '$routeParams'];
  function $get(   $state,   $rootScope,   $routeParams) {

    var $route = {
      routes: routes,
      params: $routeParams,
      current: undefined
    };

    function stateAsRoute(state) {
      return (state.name !== '') ? state : undefined;
    }

    $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {
      $rootScope.$broadcast('$routeChangeStart', stateAsRoute(to), stateAsRoute(from));
    });

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      $route.current = stateAsRoute(to);
      $rootScope.$broadcast('$routeChangeSuccess', stateAsRoute(to), stateAsRoute(from));
      copy(toParams, $route.params);
    });

    $rootScope.$on('$stateChangeError', function (ev, to, toParams, from, fromParams, error) {
      $rootScope.$broadcast('$routeChangeError', stateAsRoute(to), stateAsRoute(from), error);
    });

    return $route;
  }
}

angular.module('ui.router.compat')
  .provider('$route', $RouteProvider)
  .directive('ngView', $ViewDirective);
})(window, window.angular);
///#source 1 1 /Scripts/angular-ui/ui-bootstrap.min.js
angular.module("ui.bootstrap",["ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.bindHtml","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dateparser","ui.bootstrap.position","ui.bootstrap.datepicker","ui.bootstrap.dropdown","ui.bootstrap.modal","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);angular.module("ui.bootstrap.transition",[]).factory("$transition",["$q","$timeout","$rootScope",function(n,t,i){function u(n){for(var t in n)if(f.style[t]!==undefined)return n[t]}var r=function(u,f,e){e=e||{};var s=n.defer(),o=r[e.animation?"animationEndEventName":"transitionEndEventName"],h=function(){i.$apply(function(){u.unbind(o,h);s.resolve(u)})};return o&&u.bind(o,h),t(function(){angular.isString(f)?u.addClass(f):angular.isFunction(f)?f(u):angular.isObject(f)&&u.css(f);o||s.resolve(u)}),s.promise.cancel=function(){o&&u.unbind(o,h);s.reject("Transition cancelled")},s.promise},f=document.createElement("trans");return r.transitionEndEventName=u({WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",transition:"transitionend"}),r.animationEndEventName=u({WebkitTransition:"webkitAnimationEnd",MozTransition:"animationend",OTransition:"oAnimationEnd",transition:"animationend"}),r}]);angular.module("ui.bootstrap.collapse",["ui.bootstrap.transition"]).directive("collapse",["$transition",function(n){return{link:function(t,i,r){function e(t){function f(){u===r&&(u=undefined)}var r=n(i,t);return u&&u.cancel(),u=r,r.then(f,f),r}function h(){f?(f=!1,o()):(i.removeClass("collapse").addClass("collapsing"),e({height:i[0].scrollHeight+"px"}).then(o))}function o(){i.removeClass("collapsing");i.addClass("collapse in");i.css({height:"auto"})}function c(){if(f)f=!1,s(),i.css({height:0});else{i.css({height:i[0].scrollHeight+"px"});var n=i[0].offsetWidth;i.removeClass("collapse in").addClass("collapsing");e({height:0}).then(s)}}function s(){i.removeClass("collapsing");i.addClass("collapse")}var f=!0,u;t.$watch(r.collapse,function(n){n?c():h()})}}}]);angular.module("ui.bootstrap.accordion",["ui.bootstrap.collapse"]).constant("accordionConfig",{closeOthers:!0}).controller("AccordionController",["$scope","$attrs","accordionConfig",function(n,t,i){this.groups=[];this.closeOthers=function(r){var u=angular.isDefined(t.closeOthers)?n.$eval(t.closeOthers):i.closeOthers;u&&angular.forEach(this.groups,function(n){n!==r&&(n.isOpen=!1)})};this.addGroup=function(n){var t=this;this.groups.push(n);n.$on("$destroy",function(){t.removeGroup(n)})};this.removeGroup=function(n){var t=this.groups.indexOf(n);t!==-1&&this.groups.splice(t,1)}}]).directive("accordion",function(){return{restrict:"EA",controller:"AccordionController",transclude:!0,replace:!1,templateUrl:"template/accordion/accordion.html"}}).directive("accordionGroup",function(){return{require:"^accordion",restrict:"EA",transclude:!0,replace:!0,templateUrl:"template/accordion/accordion-group.html",scope:{heading:"@",isOpen:"=?",isDisabled:"=?"},controller:function(){this.setHeading=function(n){this.heading=n}},link:function(n,t,i,r){r.addGroup(n);n.$watch("isOpen",function(t){t&&r.closeOthers(n)});n.toggleOpen=function(){n.isDisabled||(n.isOpen=!n.isOpen)}}}}).directive("accordionHeading",function(){return{restrict:"EA",transclude:!0,template:"",replace:!0,require:"^accordionGroup",link:function(n,t,i,r,u){r.setHeading(u(n,function(){}))}}}).directive("accordionTransclude",function(){return{require:"^accordionGroup",link:function(n,t,i,r){n.$watch(function(){return r[i.accordionTransclude]},function(n){n&&(t.html(""),t.append(n))})}}});angular.module("ui.bootstrap.alert",[]).controller("AlertController",["$scope","$attrs",function(n,t){n.closeable="close"in t}]).directive("alert",function(){return{restrict:"EA",controller:"AlertController",templateUrl:"template/alert/alert.html",transclude:!0,replace:!0,scope:{type:"@",close:"&"}}});angular.module("ui.bootstrap.bindHtml",[]).directive("bindHtmlUnsafe",function(){return function(n,t,i){t.addClass("ng-binding").data("$binding",i.bindHtmlUnsafe);n.$watch(i.bindHtmlUnsafe,function(n){t.html(n||"")})}});angular.module("ui.bootstrap.buttons",[]).constant("buttonConfig",{activeClass:"active",toggleEvent:"click"}).controller("ButtonsController",["buttonConfig",function(n){this.activeClass=n.activeClass||"active";this.toggleEvent=n.toggleEvent||"click"}]).directive("btnRadio",function(){return{require:["btnRadio","ngModel"],controller:"ButtonsController",link:function(n,t,i,r){var f=r[0],u=r[1];u.$render=function(){t.toggleClass(f.activeClass,angular.equals(u.$modelValue,n.$eval(i.btnRadio)))};t.bind(f.toggleEvent,function(){var r=t.hasClass(f.activeClass);(!r||angular.isDefined(i.uncheckable))&&n.$apply(function(){u.$setViewValue(r?null:n.$eval(i.btnRadio));u.$render()})})}}}).directive("btnCheckbox",function(){return{require:["btnCheckbox","ngModel"],controller:"ButtonsController",link:function(n,t,i,r){function e(){return o(i.btnCheckboxTrue,!0)}function s(){return o(i.btnCheckboxFalse,!1)}function o(t,i){var r=n.$eval(t);return angular.isDefined(r)?r:i}var f=r[0],u=r[1];u.$render=function(){t.toggleClass(f.activeClass,angular.equals(u.$modelValue,e()))};t.bind(f.toggleEvent,function(){n.$apply(function(){u.$setViewValue(t.hasClass(f.activeClass)?s():e());u.$render()})})}}});angular.module("ui.bootstrap.carousel",["ui.bootstrap.transition"]).controller("CarouselController",["$scope","$timeout","$transition",function(n,t,i){function s(){c();var i=+n.interval;!isNaN(i)&&i>=0&&(e=t(l,i))}function c(){e&&(t.cancel(e),e=null)}function l(){o?(n.next(),s()):n.pause()}var r=this,u=r.slides=n.slides=[],f=-1,e,o,h;r.currentSlide=null;h=!1;r.select=n.select=function(e,o){function a(){if(!h){if(r.currentSlide&&angular.isString(o)&&!n.noTransition&&e.$element){e.$element.addClass(o);var t=e.$element[0].offsetWidth;angular.forEach(u,function(n){angular.extend(n,{direction:"",entering:!1,leaving:!1,active:!1})});angular.extend(e,{direction:o,active:!0,entering:!0});angular.extend(r.currentSlide||{},{direction:o,leaving:!0});n.$currentTransition=i(e.$element,{}),function(t,i){n.$currentTransition.then(function(){c(t,i)},function(){c(t,i)})}(e,r.currentSlide)}else c(e,r.currentSlide);r.currentSlide=e;f=l;s()}}function c(t,i){angular.extend(t,{direction:"",active:!0,leaving:!1,entering:!1});angular.extend(i||{},{direction:"",active:!1,leaving:!1,entering:!1});n.$currentTransition=null}var l=u.indexOf(e);o===undefined&&(o=l>f?"next":"prev");e&&e!==r.currentSlide&&(n.$currentTransition?(n.$currentTransition.cancel(),t(a)):a())};n.$on("$destroy",function(){h=!0});r.indexOfSlide=function(n){return u.indexOf(n)};n.next=function(){var t=(f+1)%u.length;if(!n.$currentTransition)return r.select(u[t],"next")};n.prev=function(){var t=f-1<0?u.length-1:f-1;if(!n.$currentTransition)return r.select(u[t],"prev")};n.isActive=function(n){return r.currentSlide===n};n.$watch("interval",s);n.$on("$destroy",c);n.play=function(){o||(o=!0,s())};n.pause=function(){n.noPause||(o=!1,c())};r.addSlide=function(t,i){t.$element=i;u.push(t);u.length===1||t.active?(r.select(u[u.length-1]),u.length==1&&n.play()):t.active=!1};r.removeSlide=function(n){var t=u.indexOf(n);u.splice(t,1);u.length>0&&n.active?t>=u.length?r.select(u[t-1]):r.select(u[t]):f>t&&f--}}]).directive("carousel",[function(){return{restrict:"EA",transclude:!0,replace:!0,controller:"CarouselController",require:"carousel",templateUrl:"template/carousel/carousel.html",scope:{interval:"=",noTransition:"=",noPause:"="}}}]).directive("slide",function(){return{require:"^carousel",restrict:"EA",transclude:!0,replace:!0,templateUrl:"template/carousel/slide.html",scope:{active:"=?"},link:function(n,t,i,r){r.addSlide(n,t);n.$on("$destroy",function(){r.removeSlide(n)});n.$watch("active",function(t){t&&r.select(n)})}}});angular.module("ui.bootstrap.dateparser",[]).service("dateParser",["$locale","orderByFilter",function(n,t){function r(n,t,i){return t===1&&i>28?i===29&&(n%4==0&&n%100!=0||n%400==0):t===3||t===5||t===8||t===10?i<31:!0}this.parsers={};var i={yyyy:{regex:"\\d{4}",apply:function(n){this.year=+n}},yy:{regex:"\\d{2}",apply:function(n){this.year=+n+2e3}},y:{regex:"\\d{1,4}",apply:function(n){this.year=+n}},MMMM:{regex:n.DATETIME_FORMATS.MONTH.join("|"),apply:function(t){this.month=n.DATETIME_FORMATS.MONTH.indexOf(t)}},MMM:{regex:n.DATETIME_FORMATS.SHORTMONTH.join("|"),apply:function(t){this.month=n.DATETIME_FORMATS.SHORTMONTH.indexOf(t)}},MM:{regex:"0[1-9]|1[0-2]",apply:function(n){this.month=n-1}},M:{regex:"[1-9]|1[0-2]",apply:function(n){this.month=n-1}},dd:{regex:"[0-2][0-9]{1}|3[0-1]{1}",apply:function(n){this.date=+n}},d:{regex:"[1-2]?[0-9]{1}|3[0-1]{1}",apply:function(n){this.date=+n}},EEEE:{regex:n.DATETIME_FORMATS.DAY.join("|")},EEE:{regex:n.DATETIME_FORMATS.SHORTDAY.join("|")}};this.createParser=function(n){var u=[],r=n.split("");return angular.forEach(i,function(t,i){var f=n.indexOf(i),e,o;if(f>-1){for(n=n.split(""),r[f]="("+t.regex+")",n[f]="$",e=f+1,o=f+i.length;e<o;e++)r[e]="",n[e]="$";n=n.join("");u.push({index:f,apply:t.apply})}}),{regex:new RegExp("^"+r.join("")+"$"),map:t(u,"index")}};this.parse=function(t,i){var u,h,f,c,o;if(!angular.isString(t))return t;i=n.DATETIME_FORMATS[i]||i;this.parsers[i]||(this.parsers[i]=this.createParser(i));var s=this.parsers[i],l=s.regex,a=s.map,e=t.match(l);if(e&&e.length){for(u={year:1900,month:0,date:1,hours:0},f=1,c=e.length;f<c;f++)o=a[f-1],o.apply&&o.apply.call(u,e[f]);return r(u.year,u.month,u.date)&&(h=new Date(u.year,u.month,u.date,u.hours)),h}}}]);angular.module("ui.bootstrap.position",[]).factory("$position",["$document","$window",function(n,t){function i(n,i){return n.currentStyle?n.currentStyle[i]:t.getComputedStyle?t.getComputedStyle(n)[i]:n.style[i]}function r(n){return(i(n,"position")||"static")==="static"}var u=function(t){for(var u=n[0],i=t.offsetParent||u;i&&i!==u&&r(i);)i=i.offsetParent;return i||u};return{position:function(t){var e=this.offset(t),r={top:0,left:0},i=u(t[0]),f;return i!=n[0]&&(r=this.offset(angular.element(i)),r.top+=i.clientTop-i.scrollTop,r.left+=i.clientLeft-i.scrollLeft),f=t[0].getBoundingClientRect(),{width:f.width||t.prop("offsetWidth"),height:f.height||t.prop("offsetHeight"),top:e.top-r.top,left:e.left-r.left}},offset:function(i){var r=i[0].getBoundingClientRect();return{width:r.width||i.prop("offsetWidth"),height:r.height||i.prop("offsetHeight"),top:r.top+(t.pageYOffset||n[0].documentElement.scrollTop),left:r.left+(t.pageXOffset||n[0].documentElement.scrollLeft)}},positionElements:function(n,t,i,r){var a=i.split("-"),h=a[0],e=a[1]||"center",u,c,l,f,o,s;u=r?this.offset(n):this.position(n);c=t.prop("offsetWidth");l=t.prop("offsetHeight");o={center:function(){return u.left+u.width/2-c/2},left:function(){return u.left},right:function(){return u.left+u.width}};s={center:function(){return u.top+u.height/2-l/2},top:function(){return u.top},bottom:function(){return u.top+u.height}};switch(h){case"right":f={top:s[e](),left:o[h]()};break;case"left":f={top:s[e](),left:u.left-c};break;case"bottom":f={top:s[h](),left:o[e]()};break;default:f={top:u.top-l,left:o[e]()}}return f}}}]);angular.module("ui.bootstrap.datepicker",["ui.bootstrap.dateparser","ui.bootstrap.position"]).constant("datepickerConfig",{formatDay:"dd",formatMonth:"MMMM",formatYear:"yyyy",formatDayHeader:"EEE",formatDayTitle:"MMMM yyyy",formatMonthTitle:"yyyy",datepickerMode:"day",minMode:"day",maxMode:"year",showWeeks:!0,startingDay:0,yearRange:20,minDate:null,maxDate:null}).controller("DatepickerController",["$scope","$attrs","$parse","$interpolate","$timeout","$log","dateFilter","datepickerConfig",function(n,t,i,r,u,f,e,o){var s=this,h={$setViewValue:angular.noop},c;this.modes=["day","month","year"];angular.forEach(["formatDay","formatMonth","formatYear","formatDayHeader","formatDayTitle","formatMonthTitle","minMode","maxMode","showWeeks","startingDay","yearRange"],function(i,u){s[i]=angular.isDefined(t[i])?u<8?r(t[i])(n.$parent):n.$parent.$eval(t[i]):o[i]});angular.forEach(["minDate","maxDate"],function(r){t[r]?n.$parent.$watch(i(t[r]),function(n){s[r]=n?new Date(n):null;s.refreshView()}):s[r]=o[r]?new Date(o[r]):null});n.datepickerMode=n.datepickerMode||o.datepickerMode;n.uniqueId="datepicker-"+n.$id+"-"+Math.floor(Math.random()*1e4);this.activeDate=angular.isDefined(t.initDate)?n.$parent.$eval(t.initDate):new Date;n.isActive=function(t){return s.compare(t.date,s.activeDate)===0?(n.activeDateId=t.uid,!0):!1};this.init=function(n){h=n;h.$render=function(){s.render()}};this.render=function(){if(h.$modelValue){var n=new Date(h.$modelValue),t=!isNaN(n);t?this.activeDate=n:f.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');h.$setValidity("date",t)}this.refreshView()};this.refreshView=function(){if(this.element){this._refreshView();var n=h.$modelValue?new Date(h.$modelValue):null;h.$setValidity("date-disabled",!n||this.element&&!this.isDisabled(n))}};this.createDateObject=function(n,t){var i=h.$modelValue?new Date(h.$modelValue):null;return{date:n,label:e(n,t),selected:i&&this.compare(n,i)===0,disabled:this.isDisabled(n),current:this.compare(n,new Date)===0}};this.isDisabled=function(i){return this.minDate&&this.compare(i,this.minDate)<0||this.maxDate&&this.compare(i,this.maxDate)>0||t.dateDisabled&&n.dateDisabled({date:i,mode:n.datepickerMode})};this.split=function(n,t){for(var i=[];n.length>0;)i.push(n.splice(0,t));return i};n.select=function(t){if(n.datepickerMode===s.minMode){var i=h.$modelValue?new Date(h.$modelValue):new Date(0,0,0,0,0,0,0);i.setFullYear(t.getFullYear(),t.getMonth(),t.getDate());h.$setViewValue(i);h.$render()}else s.activeDate=t,n.datepickerMode=s.modes[s.modes.indexOf(n.datepickerMode)-1]};n.move=function(n){var t=s.activeDate.getFullYear()+n*(s.step.years||0),i=s.activeDate.getMonth()+n*(s.step.months||0);s.activeDate.setFullYear(t,i,1);s.refreshView()};n.toggleMode=function(t){(t=t||1,(n.datepickerMode!==s.maxMode||t!==1)&&(n.datepickerMode!==s.minMode||t!==-1))&&(n.datepickerMode=s.modes[s.modes.indexOf(n.datepickerMode)+t])};n.keys={13:"enter",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down"};c=function(){u(function(){s.element[0].focus()},0,!1)};n.$on("datepicker.focus",c);n.keydown=function(t){var i=n.keys[t.which];if(i&&!t.shiftKey&&!t.altKey)if(t.preventDefault(),t.stopPropagation(),i==="enter"||i==="space"){if(s.isDisabled(s.activeDate))return;n.select(s.activeDate);c()}else t.ctrlKey&&(i==="up"||i==="down")?(n.toggleMode(i==="up"?1:-1),c()):(s.handleKeyDown(i,t),s.refreshView())}}]).directive("datepicker",function(){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/datepicker.html",scope:{datepickerMode:"=?",dateDisabled:"&"},require:["datepicker","?^ngModel"],controller:"DatepickerController",link:function(n,t,i,r){var f=r[0],u=r[1];u&&f.init(u)}}}).directive("daypicker",["dateFilter",function(n){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/day.html",require:"^datepicker",link:function(t,i,r,u){function f(n,t){return t===1&&n%4==0&&(n%100!=0||n%400==0)?29:e[t]}function o(n,t){var r=new Array(t),i=new Date(n),u=0;for(i.setHours(12);u<t;)r[u++]=new Date(i),i.setDate(i.getDate()+1);return r}function s(n){var t=new Date(n),i;return t.setDate(t.getDate()+4-(t.getDay()||7)),i=t.getTime(),t.setMonth(0),t.setDate(1),Math.floor(Math.round((i-t)/864e5)/7)+1}t.showWeeks=u.showWeeks;u.step={months:1};u.element=i;var e=[31,28,31,30,31,30,31,31,30,31,30,31];u._refreshView=function(){var p=u.activeDate.getFullYear(),h=u.activeDate.getMonth(),c=new Date(p,h,1),e=u.startingDay-c.getDay(),l=e>0?7-e:-e,a=new Date(c),i,r,f,v,y;for(l>0&&a.setDate(-l+1),i=o(a,42),r=0;r<42;r++)i[r]=angular.extend(u.createDateObject(i[r],u.formatDay),{secondary:i[r].getMonth()!==h,uid:t.uniqueId+"-"+r});for(t.labels=new Array(7),f=0;f<7;f++)t.labels[f]={abbr:n(i[f].date,u.formatDayHeader),full:n(i[f].date,"EEEE")};if(t.title=n(u.activeDate,u.formatDayTitle),t.rows=u.split(i,7),t.showWeeks)for(t.weekNumbers=[],v=s(t.rows[0][0].date),y=t.rows.length;t.weekNumbers.push(v++)<y;);};u.compare=function(n,t){return new Date(n.getFullYear(),n.getMonth(),n.getDate())-new Date(t.getFullYear(),t.getMonth(),t.getDate())};u.handleKeyDown=function(n){var t=u.activeDate.getDate(),i;n==="left"?t=t-1:n==="up"?t=t-7:n==="right"?t=t+1:n==="down"?t=t+7:n==="pageup"||n==="pagedown"?(i=u.activeDate.getMonth()+(n==="pageup"?-1:1),u.activeDate.setMonth(i,1),t=Math.min(f(u.activeDate.getFullYear(),u.activeDate.getMonth()),t)):n==="home"?t=1:n==="end"&&(t=f(u.activeDate.getFullYear(),u.activeDate.getMonth()));u.activeDate.setDate(t)};u.refreshView()}}}]).directive("monthpicker",["dateFilter",function(n){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/month.html",require:"^datepicker",link:function(t,i,r,u){u.step={years:1};u.element=i;u._refreshView=function(){for(var r=new Array(12),f=u.activeDate.getFullYear(),i=0;i<12;i++)r[i]=angular.extend(u.createDateObject(new Date(f,i,1),u.formatMonth),{uid:t.uniqueId+"-"+i});t.title=n(u.activeDate,u.formatMonthTitle);t.rows=u.split(r,3)};u.compare=function(n,t){return new Date(n.getFullYear(),n.getMonth())-new Date(t.getFullYear(),t.getMonth())};u.handleKeyDown=function(n){var t=u.activeDate.getMonth(),i;n==="left"?t=t-1:n==="up"?t=t-3:n==="right"?t=t+1:n==="down"?t=t+3:n==="pageup"||n==="pagedown"?(i=u.activeDate.getFullYear()+(n==="pageup"?-1:1),u.activeDate.setFullYear(i)):n==="home"?t=0:n==="end"&&(t=11);u.activeDate.setMonth(t)};u.refreshView()}}}]).directive("yearpicker",["dateFilter",function(){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/year.html",require:"^datepicker",link:function(n,t,i,r){function f(n){return parseInt((n-1)/u,10)*u+1}var u=r.yearRange;r.step={years:u};r.element=t;r._refreshView=function(){for(var i=new Array(u),t=0,e=f(r.activeDate.getFullYear());t<u;t++)i[t]=angular.extend(r.createDateObject(new Date(e+t,0,1),r.formatYear),{uid:n.uniqueId+"-"+t});n.title=[i[0].label,i[u-1].label].join(" - ");n.rows=r.split(i,5)};r.compare=function(n,t){return n.getFullYear()-t.getFullYear()};r.handleKeyDown=function(n){var t=r.activeDate.getFullYear();n==="left"?t=t-1:n==="up"?t=t-5:n==="right"?t=t+1:n==="down"?t=t+5:n==="pageup"||n==="pagedown"?t+=(n==="pageup"?-1:1)*r.step.years:n==="home"?t=f(r.activeDate.getFullYear()):n==="end"&&(t=f(r.activeDate.getFullYear())+u-1);r.activeDate.setFullYear(t)};r.refreshView()}}}]).constant("datepickerPopupConfig",{datepickerPopup:"yyyy-MM-dd",currentText:"Today",clearText:"Clear",closeText:"Done",closeOnDateSelection:!0,appendToBody:!1,showButtonBar:!0}).directive("datepickerPopup",["$compile","$parse","$document","$position","dateFilter","dateParser","datepickerPopupConfig",function(n,t,i,r,u,f,e){return{restrict:"EA",require:"ngModel",scope:{isOpen:"=?",currentText:"@",clearText:"@",closeText:"@",dateDisabled:"&"},link:function(o,s,h,c){function k(n){return n.replace(/([A-Z])/g,function(n){return"-"+n.toLowerCase()})}function d(n){if(n){if(angular.isDate(n)&&!isNaN(n))return c.$setValidity("date",!0),n;if(angular.isString(n)){var t=f.parse(n,p)||new Date(n);return isNaN(t)?(c.$setValidity("date",!1),undefined):(c.$setValidity("date",!0),t)}return c.$setValidity("date",!1),undefined}return c.$setValidity("date",!0),null}var p,g=angular.isDefined(h.closeOnDateSelection)?o.$parent.$eval(h.closeOnDateSelection):e.closeOnDateSelection,b=angular.isDefined(h.datepickerAppendToBody)?o.$parent.$eval(h.datepickerAppendToBody):e.appendToBody,l,a,v,w,y;o.showButtonBar=angular.isDefined(h.showButtonBar)?o.$parent.$eval(h.showButtonBar):e.showButtonBar;o.getText=function(n){return o[n+"Text"]||e[n+"Text"]};h.$observe("datepickerPopup",function(n){p=n||e.datepickerPopup;c.$render()});l=angular.element("<div datepicker-popup-wrap><div datepicker><\/div><\/div>");l.attr({"ng-model":"date","ng-change":"dateSelection()"});a=angular.element(l.children()[0]);h.datepickerOptions&&angular.forEach(o.$parent.$eval(h.datepickerOptions),function(n,t){a.attr(k(t),n)});angular.forEach(["minDate","maxDate"],function(n){h[n]&&(o.$parent.$watch(t(h[n]),function(t){o[n]=t}),a.attr(k(n),n))});h.dateDisabled&&a.attr("date-disabled","dateDisabled({ date: date, mode: mode })");c.$parsers.unshift(d);o.dateSelection=function(n){angular.isDefined(n)&&(o.date=n);c.$setViewValue(o.date);c.$render();g&&(o.isOpen=!1,s[0].focus())};s.bind("input change keyup",function(){o.$apply(function(){o.date=c.$modelValue})});c.$render=function(){var n=c.$viewValue?u(c.$viewValue,p):"";s.val(n);o.date=d(c.$modelValue)};v=function(n){o.isOpen&&n.target!==s[0]&&o.$apply(function(){o.isOpen=!1})};w=function(n){o.keydown(n)};s.bind("keydown",w);o.keydown=function(n){n.which===27?(n.preventDefault(),n.stopPropagation(),o.close()):n.which!==40||o.isOpen||(o.isOpen=!0)};o.$watch("isOpen",function(n){n?(o.$broadcast("datepicker.focus"),o.position=b?r.offset(s):r.position(s),o.position.top=o.position.top+s.prop("offsetHeight"),i.bind("click",v)):i.unbind("click",v)});o.select=function(n){if(n==="today"){var t=new Date;angular.isDate(c.$modelValue)?(n=new Date(c.$modelValue),n.setFullYear(t.getFullYear(),t.getMonth(),t.getDate())):n=new Date(t.setHours(0,0,0,0))}o.dateSelection(n)};o.close=function(){o.isOpen=!1;s[0].focus()};y=n(l)(o);b?i.find("body").append(y):s.after(y);o.$on("$destroy",function(){y.remove();s.unbind("keydown",w);i.unbind("click",v)})}}}]).directive("datepickerPopupWrap",function(){return{restrict:"EA",replace:!0,transclude:!0,templateUrl:"template/datepicker/popup.html",link:function(n,t){t.bind("click",function(n){n.preventDefault();n.stopPropagation()})}}});angular.module("ui.bootstrap.dropdown",[]).constant("dropdownConfig",{openClass:"open"}).service("dropdownService",["$document",function(n){var t=null,i,r;this.open=function(u){t||(n.bind("click",i),n.bind("keydown",r));t&&t!==u&&(t.isOpen=!1);t=u};this.close=function(u){t===u&&(t=null,n.unbind("click",i),n.unbind("keydown",r))};i=function(n){n&&n.isDefaultPrevented()||t.$apply(function(){t.isOpen=!1})};r=function(n){n.which===27&&(t.focusToggleElement(),i())}}]).controller("DropdownController",["$scope","$attrs","$parse","dropdownConfig","dropdownService","$animate",function(n,t,i,r,u,f){var o=this,e=n.$new(),c=r.openClass,s,h=angular.noop,l=t.onToggle?i(t.onToggle):angular.noop;this.init=function(r){o.$element=r;t.isOpen&&(s=i(t.isOpen),h=s.assign,n.$watch(s,function(n){e.isOpen=!!n}))};this.toggle=function(n){return e.isOpen=arguments.length?!!n:!e.isOpen};this.isOpen=function(){return e.isOpen};e.focusToggleElement=function(){o.toggleElement&&o.toggleElement[0].focus()};e.$watch("isOpen",function(t,i){f[t?"addClass":"removeClass"](o.$element,c);t?(e.focusToggleElement(),u.open(e)):u.close(e);h(n,t);angular.isDefined(t)&&t!==i&&l(n,{open:!!t})});n.$on("$locationChangeSuccess",function(){e.isOpen=!1});n.$on("$destroy",function(){e.$destroy()})}]).directive("dropdown",function(){return{restrict:"CA",controller:"DropdownController",link:function(n,t,i,r){r.init(t)}}}).directive("dropdownToggle",function(){return{restrict:"CA",require:"?^dropdown",link:function(n,t,i,r){if(r){r.toggleElement=t;var u=function(u){u.preventDefault();t.hasClass("disabled")||i.disabled||n.$apply(function(){r.toggle()})};t.bind("click",u);t.attr({"aria-haspopup":!0,"aria-expanded":!1});n.$watch(r.isOpen,function(n){t.attr("aria-expanded",!!n)});n.$on("$destroy",function(){t.unbind("click",u)})}}}});angular.module("ui.bootstrap.modal",["ui.bootstrap.transition"]).factory("$$stackedMap",function(){return{createNew:function(){var n=[];return{add:function(t,i){n.push({key:t,value:i})},get:function(t){for(var i=0;i<n.length;i++)if(t==n[i].key)return n[i]},keys:function(){for(var i=[],t=0;t<n.length;t++)i.push(n[t].key);return i},top:function(){return n[n.length-1]},remove:function(t){for(var r=-1,i=0;i<n.length;i++)if(t==n[i].key){r=i;break}return n.splice(r,1)[0]},removeTop:function(){return n.splice(n.length-1,1)[0]},length:function(){return n.length}}}}}).directive("modalBackdrop",["$timeout",function(n){return{restrict:"EA",replace:!0,templateUrl:"template/modal/backdrop.html",link:function(t){t.animate=!1;n(function(){t.animate=!0})}}}]).directive("modalWindow",["$modalStack","$timeout",function(n,t){return{restrict:"EA",scope:{index:"@",animate:"="},replace:!0,transclude:!0,templateUrl:function(n,t){return t.templateUrl||"template/modal/window.html"},link:function(i,r,u){r.addClass(u.windowClass||"");i.size=u.size;t(function(){i.animate=!0;r[0].focus()});i.close=function(t){var i=n.getTop();i&&i.value.backdrop&&i.value.backdrop!="static"&&t.target===t.currentTarget&&(t.preventDefault(),t.stopPropagation(),n.dismiss(i.key,"backdrop click"))}}}}]).factory("$modalStack",["$transition","$timeout","$document","$compile","$rootScope","$$stackedMap",function(n,t,i,r,u,f){function c(){for(var t=-1,i=e.keys(),n=0;n<i.length;n++)e.get(i[n]).value.backdrop&&(t=n);return t}function a(n){var r=i.find("body").eq(0),t=e.get(n).value;e.remove(n);v(t.modalDomEl,t.modalScope,300,function(){t.modalScope.$destroy();r.toggleClass(l,e.length()>0);y()})}function y(){if(h&&c()==-1){var n=o;v(h,o,150,function(){n.$destroy();n=null});h=undefined;o=undefined}}function v(i,r,u,f){function e(){e.done||(e.done=!0,i.remove(),f&&f())}var o,s;r.animate=!1;o=n.transitionEndEventName;o?(s=t(e,u),i.bind(o,function(){t.cancel(s);e();r.$apply()})):t(e,0)}var l="modal-open",h,o,e=f.createNew(),s={};return u.$watch(c,function(n){o&&(o.index=n)}),i.bind("keydown",function(n){var t;n.which===27&&(t=e.top(),t&&t.value.keyboard&&(n.preventDefault(),u.$apply(function(){s.dismiss(t.key,"escape key press")})))}),s.open=function(n,t){var f,s,a,v;e.add(n,{deferred:t.deferred,modalScope:t.scope,backdrop:t.backdrop,keyboard:t.keyboard});f=i.find("body").eq(0);s=c();s>=0&&!h&&(o=u.$new(!0),o.index=s,h=r("<div modal-backdrop><\/div>")(o),f.append(h));a=angular.element("<div modal-window><\/div>");a.attr({"template-url":t.windowTemplateUrl,"window-class":t.windowClass,size:t.size,index:e.length()-1,animate:"animate"}).html(t.content);v=r(a)(t.scope);e.top().value.modalDomEl=v;f.append(v);f.addClass(l)},s.close=function(n,t){var i=e.get(n).value;i&&(i.deferred.resolve(t),a(n))},s.dismiss=function(n,t){var i=e.get(n).value;i&&(i.deferred.reject(t),a(n))},s.dismissAll=function(n){for(var t=this.getTop();t;)this.dismiss(t.key,n),t=this.getTop()},s.getTop=function(){return e.top()},s}]).provider("$modal",function(){var n={options:{backdrop:!0,keyboard:!0},$get:["$injector","$rootScope","$q","$http","$templateCache","$controller","$modalStack",function(t,i,r,u,f,e,o){function h(n){return n.template?r.when(n.template):u.get(n.templateUrl,{cache:f}).then(function(n){return n.data})}function c(n){var i=[];return angular.forEach(n,function(n){(angular.isFunction(n)||angular.isArray(n))&&i.push(r.when(t.invoke(n)))}),i}var s={};return s.open=function(t){var f=r.defer(),s=r.defer(),u={result:f.promise,opened:s.promise,close:function(n){o.close(u,n)},dismiss:function(n){o.dismiss(u,n)}},l;if(t=angular.extend({},n.options,t),t.resolve=t.resolve||{},!t.template&&!t.templateUrl)throw new Error("One of template or templateUrl options is required.");return l=r.all([h(t)].concat(c(t.resolve))),l.then(function(n){var s=(t.scope||i).$new(),c,r,h;s.$close=u.close;s.$dismiss=u.dismiss;r={};h=1;t.controller&&(r.$scope=s,r.$modalInstance=u,angular.forEach(t.resolve,function(t,i){r[i]=n[h++]}),c=e(t.controller,r));o.open(u,{scope:s,deferred:f,content:n[0],backdrop:t.backdrop,keyboard:t.keyboard,windowClass:t.windowClass,windowTemplateUrl:t.windowTemplateUrl,size:t.size})},function(n){f.reject(n)}),l.then(function(){s.resolve(!0)},function(){s.reject(!1)}),u},s}]};return n});angular.module("ui.bootstrap.pagination",[]).controller("PaginationController",["$scope","$attrs","$parse",function(n,t,i){var u=this,r={$setViewValue:angular.noop},f=t.numPages?i(t.numPages).assign:angular.noop;this.init=function(f,e){r=f;this.config=e;r.$render=function(){u.render()};t.itemsPerPage?n.$parent.$watch(i(t.itemsPerPage),function(t){u.itemsPerPage=parseInt(t,10);n.totalPages=u.calculateTotalPages()}):this.itemsPerPage=e.itemsPerPage};this.calculateTotalPages=function(){var t=this.itemsPerPage<1?1:Math.ceil(n.totalItems/this.itemsPerPage);return Math.max(t||0,1)};this.render=function(){n.page=parseInt(r.$viewValue,10)||1};n.selectPage=function(t){n.page!==t&&t>0&&t<=n.totalPages&&(r.$setViewValue(t),r.$render())};n.getText=function(t){return n[t+"Text"]||u.config[t+"Text"]};n.noPrevious=function(){return n.page===1};n.noNext=function(){return n.page===n.totalPages};n.$watch("totalItems",function(){n.totalPages=u.calculateTotalPages()});n.$watch("totalPages",function(t){f(n.$parent,t);n.page>t?n.selectPage(t):r.$render()})}]).constant("paginationConfig",{itemsPerPage:10,boundaryLinks:!1,directionLinks:!0,firstText:"First",previousText:"Previous",nextText:"Next",lastText:"Last",rotate:!0}).directive("pagination",["$parse","paginationConfig",function(n,t){return{restrict:"EA",scope:{totalItems:"=",firstText:"@",previousText:"@",nextText:"@",lastText:"@"},require:["pagination","?ngModel"],controller:"PaginationController",templateUrl:"template/pagination/pagination.html",replace:!0,link:function(i,r,u,f){function h(n,t,i){return{number:n,text:t,active:i}}function a(n,t){var f=[],i=1,r=t,o=angular.isDefined(e)&&e<t,u,c,l,a;for(o&&(s?(i=Math.max(n-Math.floor(e/2),1),r=i+e-1,r>t&&(r=t,i=r-e+1)):(i=(Math.ceil(n/e)-1)*e+1,r=Math.min(i+e-1,t))),u=i;u<=r;u++)c=h(u,u,u===n),f.push(c);return o&&!s&&(i>1&&(l=h(i-1,"...",!1),f.unshift(l)),r<t&&(a=h(r+1,"...",!1),f.push(a))),f}var o=f[0],c=f[1],e,s,l;c&&(e=angular.isDefined(u.maxSize)?i.$parent.$eval(u.maxSize):t.maxSize,s=angular.isDefined(u.rotate)?i.$parent.$eval(u.rotate):t.rotate,i.boundaryLinks=angular.isDefined(u.boundaryLinks)?i.$parent.$eval(u.boundaryLinks):t.boundaryLinks,i.directionLinks=angular.isDefined(u.directionLinks)?i.$parent.$eval(u.directionLinks):t.directionLinks,o.init(c,t),u.maxSize&&i.$parent.$watch(n(u.maxSize),function(n){e=parseInt(n,10);o.render()}),l=o.render,o.render=function(){l();i.page>0&&i.page<=i.totalPages&&(i.pages=a(i.page,i.totalPages))})}}}]).constant("pagerConfig",{itemsPerPage:10,previousText:"« Previous",nextText:"Next »",align:!0}).directive("pager",["pagerConfig",function(n){return{restrict:"EA",scope:{totalItems:"=",previousText:"@",nextText:"@"},require:["pager","?ngModel"],controller:"PaginationController",templateUrl:"template/pagination/pager.html",replace:!0,link:function(t,i,r,u){var e=u[0],f=u[1];f&&(t.align=angular.isDefined(r.align)?t.$parent.$eval(r.align):n.align,e.init(f,n))}}}]);angular.module("ui.bootstrap.tooltip",["ui.bootstrap.position","ui.bootstrap.bindHtml"]).provider("$tooltip",function(){function r(n){var t="-";return n.replace(/[A-Z]/g,function(n,i){return(i?t:"")+n.toLowerCase()})}var i={placement:"top",animation:!0,popupDelay:0},n={mouseenter:"mouseleave",click:"click",focus:"blur"},t={};this.options=function(n){angular.extend(t,n)};this.setTriggers=function(t){angular.extend(n,t)};this.$get=["$window","$compile","$timeout","$parse","$document","$position","$interpolate",function(u,f,e,o,s,h,c){return function(u,l,a){function w(t){var i=t||v.trigger||a,r=n[i]||i;return{show:i,hide:r}}var v=angular.extend({},i,t),b=r(u),y=c.startSymbol(),p=c.endSymbol(),k="<div "+b+'-popup title="'+y+"tt_title"+p+'" content="'+y+"tt_content"+p+'" placement="'+y+"tt_placement"+p+'" animation="tt_animation" is-open="tt_isOpen"><\/div>';return{restrict:"EA",scope:!0,compile:function(){var n=f(k);return function(t,i,r){function ft(){t.tt_isOpen?d():k()}function k(){(!ut||t.$eval(r[l+"Enable"]))&&(t.tt_popupDelay?y||(y=e(rt,t.tt_popupDelay,!1),y.then(function(n){n()})):rt()())}function d(){t.$apply(function(){g()})}function rt(){return(y=null,a&&(e.cancel(a),a=null),!t.tt_content)?angular.noop:(et(),f.css({top:0,left:0,display:"block"}),p?s.find("body").append(f):i.after(f),it(),t.tt_isOpen=!0,t.$digest(),it)}function g(){t.tt_isOpen=!1;e.cancel(y);y=null;t.tt_animation?a||(a=e(b,500)):b()}function et(){f&&b();f=n(t,function(){});t.$digest()}function b(){a=null;f&&(f.remove(),f=null)}var f,a,y,p=angular.isDefined(v.appendToBody)?v.appendToBody:!1,c=w(undefined),ut=angular.isDefined(r[l+"Enable"]),it=function(){var n=h.positionElements(i,f,t.tt_placement,p);n.top+="px";n.left+="px";f.css(n)},nt,tt;t.tt_isOpen=!1;r.$observe(u,function(n){t.tt_content=n;!n&&t.tt_isOpen&&g()});r.$observe(l+"Title",function(n){t.tt_title=n});r.$observe(l+"Placement",function(n){t.tt_placement=angular.isDefined(n)?n:v.placement});r.$observe(l+"PopupDelay",function(n){var i=parseInt(n,10);t.tt_popupDelay=isNaN(i)?v.popupDelay:i});nt=function(){i.unbind(c.show,k);i.unbind(c.hide,d)};r.$observe(l+"Trigger",function(n){nt();c=w(n);c.show===c.hide?i.bind(c.show,ft):(i.bind(c.show,k),i.bind(c.hide,d))});tt=t.$eval(r[l+"Animation"]);t.tt_animation=angular.isDefined(tt)?!!tt:v.animation;r.$observe(l+"AppendToBody",function(n){p=angular.isDefined(n)?o(n)(t):p});p&&t.$on("$locationChangeSuccess",function(){t.tt_isOpen&&g()});t.$on("$destroy",function(){e.cancel(a);e.cancel(y);nt();b()})}}}}}]}).directive("tooltipPopup",function(){return{restrict:"EA",replace:!0,scope:{content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/tooltip/tooltip-popup.html"}}).directive("tooltip",["$tooltip",function(n){return n("tooltip","tooltip","mouseenter")}]).directive("tooltipHtmlUnsafePopup",function(){return{restrict:"EA",replace:!0,scope:{content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/tooltip/tooltip-html-unsafe-popup.html"}}).directive("tooltipHtmlUnsafe",["$tooltip",function(n){return n("tooltipHtmlUnsafe","tooltip","mouseenter")}]);angular.module("ui.bootstrap.popover",["ui.bootstrap.tooltip"]).directive("popoverPopup",function(){return{restrict:"EA",replace:!0,scope:{title:"@",content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/popover/popover.html"}}).directive("popover",["$tooltip",function(n){return n("popover","popover","click")}]);angular.module("ui.bootstrap.progressbar",[]).constant("progressConfig",{animate:!0,max:100}).controller("ProgressController",["$scope","$attrs","progressConfig",function(n,t,i){var r=this,u=angular.isDefined(t.animate)?n.$parent.$eval(t.animate):i.animate;this.bars=[];n.max=angular.isDefined(t.max)?n.$parent.$eval(t.max):i.max;this.addBar=function(t,i){u||i.css({transition:"none"});this.bars.push(t);t.$watch("value",function(i){t.percent=+(100*i/n.max).toFixed(2)});t.$on("$destroy",function(){i=null;r.removeBar(t)})};this.removeBar=function(n){this.bars.splice(this.bars.indexOf(n),1)}}]).directive("progress",function(){return{restrict:"EA",replace:!0,transclude:!0,controller:"ProgressController",require:"progress",scope:{},templateUrl:"template/progressbar/progress.html"}}).directive("bar",function(){return{restrict:"EA",replace:!0,transclude:!0,require:"^progress",scope:{value:"=",type:"@"},templateUrl:"template/progressbar/bar.html",link:function(n,t,i,r){r.addBar(n,t)}}}).directive("progressbar",function(){return{restrict:"EA",replace:!0,transclude:!0,controller:"ProgressController",scope:{value:"=",type:"@"},templateUrl:"template/progressbar/progressbar.html",link:function(n,t,i,r){r.addBar(n,angular.element(t.children()[0]))}}});angular.module("ui.bootstrap.rating",[]).constant("ratingConfig",{max:5,stateOn:null,stateOff:null}).controller("RatingController",["$scope","$attrs","ratingConfig",function(n,t,i){var r={$setViewValue:angular.noop};this.init=function(u){r=u;r.$render=this.render;this.stateOn=angular.isDefined(t.stateOn)?n.$parent.$eval(t.stateOn):i.stateOn;this.stateOff=angular.isDefined(t.stateOff)?n.$parent.$eval(t.stateOff):i.stateOff;var f=angular.isDefined(t.ratingStates)?n.$parent.$eval(t.ratingStates):new Array(angular.isDefined(t.max)?n.$parent.$eval(t.max):i.max);n.range=this.buildTemplateObjects(f)};this.buildTemplateObjects=function(n){for(var t=0,i=n.length;t<i;t++)n[t]=angular.extend({index:t},{stateOn:this.stateOn,stateOff:this.stateOff},n[t]);return n};n.rate=function(t){!n.readonly&&t>=0&&t<=n.range.length&&(r.$setViewValue(t),r.$render())};n.enter=function(t){n.readonly||(n.value=t);n.onHover({value:t})};n.reset=function(){n.value=r.$viewValue;n.onLeave()};n.onKeydown=function(t){/(37|38|39|40)/.test(t.which)&&(t.preventDefault(),t.stopPropagation(),n.rate(n.value+(t.which===38||t.which===39?1:-1)))};this.render=function(){n.value=r.$viewValue}}]).directive("rating",function(){return{restrict:"EA",require:["rating","ngModel"],scope:{readonly:"=?",onHover:"&",onLeave:"&"},controller:"RatingController",templateUrl:"template/rating/rating.html",replace:!0,link:function(n,t,i,r){var f=r[0],u=r[1];u&&f.init(u)}}});angular.module("ui.bootstrap.tabs",[]).controller("TabsetController",["$scope",function(n){var i=this,t=i.tabs=n.tabs=[];i.select=function(n){angular.forEach(t,function(t){t.active&&t!==n&&(t.active=!1,t.onDeselect())});n.active=!0;n.onSelect()};i.addTab=function(n){t.push(n);t.length===1?n.active=!0:n.active&&i.select(n)};i.removeTab=function(n){var r=t.indexOf(n),u;n.active&&t.length>1&&(u=r==t.length-1?r-1:r+1,i.select(t[u]));t.splice(r,1)}}]).directive("tabset",function(){return{restrict:"EA",transclude:!0,replace:!0,scope:{type:"@"},controller:"TabsetController",templateUrl:"template/tabs/tabset.html",link:function(n,t,i){n.vertical=angular.isDefined(i.vertical)?n.$parent.$eval(i.vertical):!1;n.justified=angular.isDefined(i.justified)?n.$parent.$eval(i.justified):!1}}}).directive("tab",["$parse",function(n){return{require:"^tabset",restrict:"EA",replace:!0,templateUrl:"template/tabs/tab.html",transclude:!0,scope:{active:"=?",heading:"@",onSelect:"&select",onDeselect:"&deselect"},controller:function(){},compile:function(t,i,r){return function(t,i,u,f){t.$watch("active",function(n){n&&f.select(t)});t.disabled=!1;u.disabled&&t.$parent.$watch(n(u.disabled),function(n){t.disabled=!!n});t.select=function(){t.disabled||(t.active=!0)};f.addTab(t);t.$on("$destroy",function(){f.removeTab(t)});t.$transcludeFn=r}}}}]).directive("tabHeadingTransclude",[function(){return{restrict:"A",require:"^tab",link:function(n,t){n.$watch("headingElement",function(n){n&&(t.html(""),t.append(n))})}}}]).directive("tabContentTransclude",function(){function n(n){return n.tagName&&(n.hasAttribute("tab-heading")||n.hasAttribute("data-tab-heading")||n.tagName.toLowerCase()==="tab-heading"||n.tagName.toLowerCase()==="data-tab-heading")}return{restrict:"A",require:"^tabset",link:function(t,i,r){var u=t.$eval(r.tabContentTransclude);u.$transcludeFn(u.$parent,function(t){angular.forEach(t,function(t){n(t)?u.headingElement=t:i.append(t)})})}}});angular.module("ui.bootstrap.timepicker",[]).constant("timepickerConfig",{hourStep:1,minuteStep:1,showMeridian:!0,meridians:null,readonlyInput:!1,mousewheel:!0}).controller("TimepickerController",["$scope","$attrs","$parse","$log","$locale","timepickerConfig",function(n,t,i,r,u,f){function p(){var t=parseInt(n.hours,10),i=n.showMeridian?t>0&&t<13:t>=0&&t<24;return i?(n.showMeridian&&(t===12&&(t=0),n.meridian===v[1]&&(t=t+12)),t):undefined}function w(){var t=parseInt(n.minutes,10);return t>=0&&t<60?t:undefined}function l(n){return angular.isDefined(n)&&n.toString().length<2?"0"+n:n}function a(n){b();o.$setViewValue(new Date(e));y(n)}function b(){o.$setValidity("time",!0);n.invalidHours=!1;n.invalidMinutes=!1}function y(t){var i=e.getHours(),r=e.getMinutes();n.showMeridian&&(i=i===0||i===12?12:i%12);n.hours=t==="h"?i:l(i);n.minutes=t==="m"?r:l(r);n.meridian=e.getHours()<12?v[0]:v[1]}function s(n){var t=new Date(e.getTime()+n*6e4);e.setHours(t.getHours(),t.getMinutes());a()}var e=new Date,o={$setViewValue:angular.noop},v=angular.isDefined(t.meridians)?n.$parent.$eval(t.meridians):f.meridians||u.DATETIME_FORMATS.AMPMS,h,c;this.init=function(i,r){o=i;o.$render=this.render;var u=r.eq(0),e=r.eq(1),s=angular.isDefined(t.mousewheel)?n.$parent.$eval(t.mousewheel):f.mousewheel;s&&this.setupMousewheelEvents(u,e);n.readonlyInput=angular.isDefined(t.readonlyInput)?n.$parent.$eval(t.readonlyInput):f.readonlyInput;this.setupInputEvents(u,e)};h=f.hourStep;t.hourStep&&n.$parent.$watch(i(t.hourStep),function(n){h=parseInt(n,10)});c=f.minuteStep;t.minuteStep&&n.$parent.$watch(i(t.minuteStep),function(n){c=parseInt(n,10)});n.showMeridian=f.showMeridian;t.showMeridian&&n.$parent.$watch(i(t.showMeridian),function(t){if(n.showMeridian=!!t,o.$error.time){var i=p(),r=w();angular.isDefined(i)&&angular.isDefined(r)&&(e.setHours(i),a())}else y()});this.setupMousewheelEvents=function(t,i){var r=function(n){n.originalEvent&&(n=n.originalEvent);var t=n.wheelDelta?n.wheelDelta:-n.deltaY;return n.detail||t>0};t.bind("mousewheel wheel",function(t){n.$apply(r(t)?n.incrementHours():n.decrementHours());t.preventDefault()});i.bind("mousewheel wheel",function(t){n.$apply(r(t)?n.incrementMinutes():n.decrementMinutes());t.preventDefault()})};this.setupInputEvents=function(t,i){if(n.readonlyInput){n.updateHours=angular.noop;n.updateMinutes=angular.noop;return}var r=function(t,i){o.$setViewValue(null);o.$setValidity("time",!1);angular.isDefined(t)&&(n.invalidHours=t);angular.isDefined(i)&&(n.invalidMinutes=i)};n.updateHours=function(){var n=p();angular.isDefined(n)?(e.setHours(n),a("h")):r(!0)};t.bind("blur",function(){!n.invalidHours&&n.hours<10&&n.$apply(function(){n.hours=l(n.hours)})});n.updateMinutes=function(){var n=w();angular.isDefined(n)?(e.setMinutes(n),a("m")):r(undefined,!0)};i.bind("blur",function(){!n.invalidMinutes&&n.minutes<10&&n.$apply(function(){n.minutes=l(n.minutes)})})};this.render=function(){var n=o.$modelValue?new Date(o.$modelValue):null;isNaN(n)?(o.$setValidity("time",!1),r.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')):(n&&(e=n),b(),y())};n.incrementHours=function(){s(h*60)};n.decrementHours=function(){s(-h*60)};n.incrementMinutes=function(){s(c)};n.decrementMinutes=function(){s(-c)};n.toggleMeridian=function(){s(720*(e.getHours()<12?1:-1))}}]).directive("timepicker",function(){return{restrict:"EA",require:["timepicker","?^ngModel"],controller:"TimepickerController",replace:!0,scope:{},templateUrl:"template/timepicker/timepicker.html",link:function(n,t,i,r){var f=r[0],u=r[1];u&&f.init(u,t.find("input"))}}});angular.module("ui.bootstrap.typeahead",["ui.bootstrap.position","ui.bootstrap.bindHtml"]).factory("typeaheadParser",["$parse",function(n){var t=/^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;return{parse:function(i){var r=i.match(t);if(!r)throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "'+i+'".');return{itemName:r[3],source:n(r[4]),viewMapper:n(r[2]||r[1]),modelMapper:n(r[1])}}}}]).directive("typeahead",["$compile","$parse","$q","$timeout","$document","$position","typeaheadParser",function(n,t,i,r,u,f,e){var o=[9,13,27,38,40];return{require:"ngModel",link:function(s,h,c,l){var et=s.$eval(c.typeaheadMinLength)||1,rt=s.$eval(c.typeaheadWaitMs)||0,ot=s.$eval(c.typeaheadEditable)!==!1,p=t(c.typeaheadLoading).assign||angular.noop,st=t(c.typeaheadOnSelect),ut=c.typeaheadInputFormatter?t(c.typeaheadInputFormatter):undefined,ft=c.typeaheadAppendToBody?s.$eval(c.typeaheadAppendToBody):!1,ht=t(c.ngModel).assign,v=e.parse(c.typeahead),k,a=s.$new(),w,b,y,d,g,nt,tt,it;s.$on("$destroy",function(){a.$destroy()});w="typeahead-"+a.$id+"-"+Math.floor(Math.random()*1e4);h.attr({"aria-autocomplete":"list","aria-expanded":!1,"aria-owns":w});b=angular.element("<div typeahead-popup><\/div>");b.attr({id:w,matches:"matches",active:"activeIdx",select:"select(activeIdx)",query:"query",position:"position"});angular.isDefined(c.typeaheadTemplateUrl)&&b.attr("template-url",c.typeaheadTemplateUrl);y=function(){a.matches=[];a.activeIdx=-1;h.attr("aria-expanded",!1)};d=function(n){return w+"-option-"+n};a.$watch("activeIdx",function(n){n<0?h.removeAttr("aria-activedescendant"):h.attr("aria-activedescendant",d(n))});g=function(n){var t={$viewValue:n};p(s,!0);i.when(v.source(s,t)).then(function(i){var u=n===l.$viewValue,r;if(u&&k)if(i.length>0){for(a.activeIdx=0,a.matches.length=0,r=0;r<i.length;r++)t[v.itemName]=i[r],a.matches.push({id:d(r),label:v.viewMapper(a,t),model:i[r]});a.query=n;a.position=ft?f.offset(h):f.position(h);a.position.top=a.position.top+h.prop("offsetHeight");h.attr("aria-expanded",!0)}else y();u&&p(s,!1)},function(){y();p(s,!1)})};y();a.query=undefined;l.$parsers.unshift(function(n){return k=!0,n&&n.length>=et?rt>0?(nt&&r.cancel(nt),nt=r(function(){g(n)},rt)):g(n):(p(s,!1),y()),ot?n:n?(l.$setValidity("editable",!1),undefined):(l.$setValidity("editable",!0),n)});l.$formatters.push(function(n){var i,r,t={};return ut?(t.$model=n,ut(s,t)):(t[v.itemName]=n,i=v.viewMapper(s,t),t[v.itemName]=undefined,r=v.viewMapper(s,t),i!==r?i:n)});a.select=function(n){var t={},i,u;t[v.itemName]=u=a.matches[n].model;i=v.modelMapper(s,t);ht(s,i);l.$setValidity("editable",!0);st(s,{$item:u,$model:i,$label:v.viewMapper(s,t)});y();r(function(){h[0].focus()},0,!1)};h.bind("keydown",function(n){a.matches.length!==0&&o.indexOf(n.which)!==-1&&(n.preventDefault(),n.which===40?(a.activeIdx=(a.activeIdx+1)%a.matches.length,a.$digest()):n.which===38?(a.activeIdx=(a.activeIdx?a.activeIdx:a.matches.length)-1,a.$digest()):n.which===13||n.which===9?a.$apply(function(){a.select(a.activeIdx)}):n.which===27&&(n.stopPropagation(),y(),a.$digest()))});h.bind("blur",function(){k=!1});tt=function(n){h[0]!==n.target&&(y(),a.$digest())};u.bind("click",tt);s.$on("$destroy",function(){u.unbind("click",tt)});it=n(b)(a);ft?u.find("body").append(it):h.after(it)}}}]).directive("typeaheadPopup",function(){return{restrict:"EA",scope:{matches:"=",query:"=",active:"=",position:"=",select:"&"},replace:!0,templateUrl:"template/typeahead/typeahead-popup.html",link:function(n,t,i){n.templateUrl=i.templateUrl;n.isOpen=function(){return n.matches.length>0};n.isActive=function(t){return n.active==t};n.selectActive=function(t){n.active=t};n.selectMatch=function(t){n.select({activeIdx:t})}}}}).directive("typeaheadMatch",["$http","$templateCache","$compile","$parse",function(n,t,i,r){return{restrict:"EA",scope:{index:"=",match:"=",query:"="},link:function(u,f,e){var o=r(e.templateUrl)(u.$parent)||"template/typeahead/typeahead-match.html";n.get(o,{cache:t}).success(function(n){f.replaceWith(i(n.trim())(u))})}}}]).filter("typeaheadHighlight",function(){function n(n){return n.replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")}return function(t,i){return i?(""+t).replace(new RegExp(n(i),"gi"),"<strong>$&<\/strong>"):t}});
/*
//# sourceMappingURL=ui-bootstrap.min.js.map
*/
///#source 1 1 /Scripts/angular-ui/ui-bootstrap-tpls.min.js
angular.module("ui.bootstrap",["ui.bootstrap.tpls","ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.bindHtml","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dateparser","ui.bootstrap.position","ui.bootstrap.datepicker","ui.bootstrap.dropdown","ui.bootstrap.modal","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);angular.module("ui.bootstrap.tpls",["template/accordion/accordion-group.html","template/accordion/accordion.html","template/alert/alert.html","template/carousel/carousel.html","template/carousel/slide.html","template/datepicker/datepicker.html","template/datepicker/day.html","template/datepicker/month.html","template/datepicker/popup.html","template/datepicker/year.html","template/modal/backdrop.html","template/modal/window.html","template/pagination/pager.html","template/pagination/pagination.html","template/tooltip/tooltip-html-unsafe-popup.html","template/tooltip/tooltip-popup.html","template/popover/popover.html","template/progressbar/bar.html","template/progressbar/progress.html","template/progressbar/progressbar.html","template/rating/rating.html","template/tabs/tab.html","template/tabs/tabset.html","template/timepicker/timepicker.html","template/typeahead/typeahead-match.html","template/typeahead/typeahead-popup.html"]);angular.module("ui.bootstrap.transition",[]).factory("$transition",["$q","$timeout","$rootScope",function(n,t,i){function u(n){for(var t in n)if(f.style[t]!==undefined)return n[t]}var r=function(u,f,e){e=e||{};var s=n.defer(),o=r[e.animation?"animationEndEventName":"transitionEndEventName"],h=function(){i.$apply(function(){u.unbind(o,h);s.resolve(u)})};return o&&u.bind(o,h),t(function(){angular.isString(f)?u.addClass(f):angular.isFunction(f)?f(u):angular.isObject(f)&&u.css(f);o||s.resolve(u)}),s.promise.cancel=function(){o&&u.unbind(o,h);s.reject("Transition cancelled")},s.promise},f=document.createElement("trans");return r.transitionEndEventName=u({WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",transition:"transitionend"}),r.animationEndEventName=u({WebkitTransition:"webkitAnimationEnd",MozTransition:"animationend",OTransition:"oAnimationEnd",transition:"animationend"}),r}]);angular.module("ui.bootstrap.collapse",["ui.bootstrap.transition"]).directive("collapse",["$transition",function(n){return{link:function(t,i,r){function e(t){function f(){u===r&&(u=undefined)}var r=n(i,t);return u&&u.cancel(),u=r,r.then(f,f),r}function h(){f?(f=!1,o()):(i.removeClass("collapse").addClass("collapsing"),e({height:i[0].scrollHeight+"px"}).then(o))}function o(){i.removeClass("collapsing");i.addClass("collapse in");i.css({height:"auto"})}function c(){if(f)f=!1,s(),i.css({height:0});else{i.css({height:i[0].scrollHeight+"px"});var n=i[0].offsetWidth;i.removeClass("collapse in").addClass("collapsing");e({height:0}).then(s)}}function s(){i.removeClass("collapsing");i.addClass("collapse")}var f=!0,u;t.$watch(r.collapse,function(n){n?c():h()})}}}]);angular.module("ui.bootstrap.accordion",["ui.bootstrap.collapse"]).constant("accordionConfig",{closeOthers:!0}).controller("AccordionController",["$scope","$attrs","accordionConfig",function(n,t,i){this.groups=[];this.closeOthers=function(r){var u=angular.isDefined(t.closeOthers)?n.$eval(t.closeOthers):i.closeOthers;u&&angular.forEach(this.groups,function(n){n!==r&&(n.isOpen=!1)})};this.addGroup=function(n){var t=this;this.groups.push(n);n.$on("$destroy",function(){t.removeGroup(n)})};this.removeGroup=function(n){var t=this.groups.indexOf(n);t!==-1&&this.groups.splice(t,1)}}]).directive("accordion",function(){return{restrict:"EA",controller:"AccordionController",transclude:!0,replace:!1,templateUrl:"template/accordion/accordion.html"}}).directive("accordionGroup",function(){return{require:"^accordion",restrict:"EA",transclude:!0,replace:!0,templateUrl:"template/accordion/accordion-group.html",scope:{heading:"@",isOpen:"=?",isDisabled:"=?"},controller:function(){this.setHeading=function(n){this.heading=n}},link:function(n,t,i,r){r.addGroup(n);n.$watch("isOpen",function(t){t&&r.closeOthers(n)});n.toggleOpen=function(){n.isDisabled||(n.isOpen=!n.isOpen)}}}}).directive("accordionHeading",function(){return{restrict:"EA",transclude:!0,template:"",replace:!0,require:"^accordionGroup",link:function(n,t,i,r,u){r.setHeading(u(n,function(){}))}}}).directive("accordionTransclude",function(){return{require:"^accordionGroup",link:function(n,t,i,r){n.$watch(function(){return r[i.accordionTransclude]},function(n){n&&(t.html(""),t.append(n))})}}});angular.module("ui.bootstrap.alert",[]).controller("AlertController",["$scope","$attrs",function(n,t){n.closeable="close"in t}]).directive("alert",function(){return{restrict:"EA",controller:"AlertController",templateUrl:"template/alert/alert.html",transclude:!0,replace:!0,scope:{type:"@",close:"&"}}});angular.module("ui.bootstrap.bindHtml",[]).directive("bindHtmlUnsafe",function(){return function(n,t,i){t.addClass("ng-binding").data("$binding",i.bindHtmlUnsafe);n.$watch(i.bindHtmlUnsafe,function(n){t.html(n||"")})}});angular.module("ui.bootstrap.buttons",[]).constant("buttonConfig",{activeClass:"active",toggleEvent:"click"}).controller("ButtonsController",["buttonConfig",function(n){this.activeClass=n.activeClass||"active";this.toggleEvent=n.toggleEvent||"click"}]).directive("btnRadio",function(){return{require:["btnRadio","ngModel"],controller:"ButtonsController",link:function(n,t,i,r){var f=r[0],u=r[1];u.$render=function(){t.toggleClass(f.activeClass,angular.equals(u.$modelValue,n.$eval(i.btnRadio)))};t.bind(f.toggleEvent,function(){var r=t.hasClass(f.activeClass);(!r||angular.isDefined(i.uncheckable))&&n.$apply(function(){u.$setViewValue(r?null:n.$eval(i.btnRadio));u.$render()})})}}}).directive("btnCheckbox",function(){return{require:["btnCheckbox","ngModel"],controller:"ButtonsController",link:function(n,t,i,r){function e(){return o(i.btnCheckboxTrue,!0)}function s(){return o(i.btnCheckboxFalse,!1)}function o(t,i){var r=n.$eval(t);return angular.isDefined(r)?r:i}var f=r[0],u=r[1];u.$render=function(){t.toggleClass(f.activeClass,angular.equals(u.$modelValue,e()))};t.bind(f.toggleEvent,function(){n.$apply(function(){u.$setViewValue(t.hasClass(f.activeClass)?s():e());u.$render()})})}}});angular.module("ui.bootstrap.carousel",["ui.bootstrap.transition"]).controller("CarouselController",["$scope","$timeout","$transition",function(n,t,i){function s(){c();var i=+n.interval;!isNaN(i)&&i>=0&&(e=t(l,i))}function c(){e&&(t.cancel(e),e=null)}function l(){o?(n.next(),s()):n.pause()}var r=this,u=r.slides=n.slides=[],f=-1,e,o,h;r.currentSlide=null;h=!1;r.select=n.select=function(e,o){function a(){if(!h){if(r.currentSlide&&angular.isString(o)&&!n.noTransition&&e.$element){e.$element.addClass(o);var t=e.$element[0].offsetWidth;angular.forEach(u,function(n){angular.extend(n,{direction:"",entering:!1,leaving:!1,active:!1})});angular.extend(e,{direction:o,active:!0,entering:!0});angular.extend(r.currentSlide||{},{direction:o,leaving:!0});n.$currentTransition=i(e.$element,{}),function(t,i){n.$currentTransition.then(function(){c(t,i)},function(){c(t,i)})}(e,r.currentSlide)}else c(e,r.currentSlide);r.currentSlide=e;f=l;s()}}function c(t,i){angular.extend(t,{direction:"",active:!0,leaving:!1,entering:!1});angular.extend(i||{},{direction:"",active:!1,leaving:!1,entering:!1});n.$currentTransition=null}var l=u.indexOf(e);o===undefined&&(o=l>f?"next":"prev");e&&e!==r.currentSlide&&(n.$currentTransition?(n.$currentTransition.cancel(),t(a)):a())};n.$on("$destroy",function(){h=!0});r.indexOfSlide=function(n){return u.indexOf(n)};n.next=function(){var t=(f+1)%u.length;if(!n.$currentTransition)return r.select(u[t],"next")};n.prev=function(){var t=f-1<0?u.length-1:f-1;if(!n.$currentTransition)return r.select(u[t],"prev")};n.isActive=function(n){return r.currentSlide===n};n.$watch("interval",s);n.$on("$destroy",c);n.play=function(){o||(o=!0,s())};n.pause=function(){n.noPause||(o=!1,c())};r.addSlide=function(t,i){t.$element=i;u.push(t);u.length===1||t.active?(r.select(u[u.length-1]),u.length==1&&n.play()):t.active=!1};r.removeSlide=function(n){var t=u.indexOf(n);u.splice(t,1);u.length>0&&n.active?t>=u.length?r.select(u[t-1]):r.select(u[t]):f>t&&f--}}]).directive("carousel",[function(){return{restrict:"EA",transclude:!0,replace:!0,controller:"CarouselController",require:"carousel",templateUrl:"template/carousel/carousel.html",scope:{interval:"=",noTransition:"=",noPause:"="}}}]).directive("slide",function(){return{require:"^carousel",restrict:"EA",transclude:!0,replace:!0,templateUrl:"template/carousel/slide.html",scope:{active:"=?"},link:function(n,t,i,r){r.addSlide(n,t);n.$on("$destroy",function(){r.removeSlide(n)});n.$watch("active",function(t){t&&r.select(n)})}}});angular.module("ui.bootstrap.dateparser",[]).service("dateParser",["$locale","orderByFilter",function(n,t){function r(n,t,i){return t===1&&i>28?i===29&&(n%4==0&&n%100!=0||n%400==0):t===3||t===5||t===8||t===10?i<31:!0}this.parsers={};var i={yyyy:{regex:"\\d{4}",apply:function(n){this.year=+n}},yy:{regex:"\\d{2}",apply:function(n){this.year=+n+2e3}},y:{regex:"\\d{1,4}",apply:function(n){this.year=+n}},MMMM:{regex:n.DATETIME_FORMATS.MONTH.join("|"),apply:function(t){this.month=n.DATETIME_FORMATS.MONTH.indexOf(t)}},MMM:{regex:n.DATETIME_FORMATS.SHORTMONTH.join("|"),apply:function(t){this.month=n.DATETIME_FORMATS.SHORTMONTH.indexOf(t)}},MM:{regex:"0[1-9]|1[0-2]",apply:function(n){this.month=n-1}},M:{regex:"[1-9]|1[0-2]",apply:function(n){this.month=n-1}},dd:{regex:"[0-2][0-9]{1}|3[0-1]{1}",apply:function(n){this.date=+n}},d:{regex:"[1-2]?[0-9]{1}|3[0-1]{1}",apply:function(n){this.date=+n}},EEEE:{regex:n.DATETIME_FORMATS.DAY.join("|")},EEE:{regex:n.DATETIME_FORMATS.SHORTDAY.join("|")}};this.createParser=function(n){var u=[],r=n.split("");return angular.forEach(i,function(t,i){var f=n.indexOf(i),e,o;if(f>-1){for(n=n.split(""),r[f]="("+t.regex+")",n[f]="$",e=f+1,o=f+i.length;e<o;e++)r[e]="",n[e]="$";n=n.join("");u.push({index:f,apply:t.apply})}}),{regex:new RegExp("^"+r.join("")+"$"),map:t(u,"index")}};this.parse=function(t,i){var u,h,f,c,o;if(!angular.isString(t))return t;i=n.DATETIME_FORMATS[i]||i;this.parsers[i]||(this.parsers[i]=this.createParser(i));var s=this.parsers[i],l=s.regex,a=s.map,e=t.match(l);if(e&&e.length){for(u={year:1900,month:0,date:1,hours:0},f=1,c=e.length;f<c;f++)o=a[f-1],o.apply&&o.apply.call(u,e[f]);return r(u.year,u.month,u.date)&&(h=new Date(u.year,u.month,u.date,u.hours)),h}}}]);angular.module("ui.bootstrap.position",[]).factory("$position",["$document","$window",function(n,t){function i(n,i){return n.currentStyle?n.currentStyle[i]:t.getComputedStyle?t.getComputedStyle(n)[i]:n.style[i]}function r(n){return(i(n,"position")||"static")==="static"}var u=function(t){for(var u=n[0],i=t.offsetParent||u;i&&i!==u&&r(i);)i=i.offsetParent;return i||u};return{position:function(t){var e=this.offset(t),r={top:0,left:0},i=u(t[0]),f;return i!=n[0]&&(r=this.offset(angular.element(i)),r.top+=i.clientTop-i.scrollTop,r.left+=i.clientLeft-i.scrollLeft),f=t[0].getBoundingClientRect(),{width:f.width||t.prop("offsetWidth"),height:f.height||t.prop("offsetHeight"),top:e.top-r.top,left:e.left-r.left}},offset:function(i){var r=i[0].getBoundingClientRect();return{width:r.width||i.prop("offsetWidth"),height:r.height||i.prop("offsetHeight"),top:r.top+(t.pageYOffset||n[0].documentElement.scrollTop),left:r.left+(t.pageXOffset||n[0].documentElement.scrollLeft)}},positionElements:function(n,t,i,r){var a=i.split("-"),h=a[0],e=a[1]||"center",u,c,l,f,o,s;u=r?this.offset(n):this.position(n);c=t.prop("offsetWidth");l=t.prop("offsetHeight");o={center:function(){return u.left+u.width/2-c/2},left:function(){return u.left},right:function(){return u.left+u.width}};s={center:function(){return u.top+u.height/2-l/2},top:function(){return u.top},bottom:function(){return u.top+u.height}};switch(h){case"right":f={top:s[e](),left:o[h]()};break;case"left":f={top:s[e](),left:u.left-c};break;case"bottom":f={top:s[h](),left:o[e]()};break;default:f={top:u.top-l,left:o[e]()}}return f}}}]);angular.module("ui.bootstrap.datepicker",["ui.bootstrap.dateparser","ui.bootstrap.position"]).constant("datepickerConfig",{formatDay:"dd",formatMonth:"MMMM",formatYear:"yyyy",formatDayHeader:"EEE",formatDayTitle:"MMMM yyyy",formatMonthTitle:"yyyy",datepickerMode:"day",minMode:"day",maxMode:"year",showWeeks:!0,startingDay:0,yearRange:20,minDate:null,maxDate:null}).controller("DatepickerController",["$scope","$attrs","$parse","$interpolate","$timeout","$log","dateFilter","datepickerConfig",function(n,t,i,r,u,f,e,o){var s=this,h={$setViewValue:angular.noop},c;this.modes=["day","month","year"];angular.forEach(["formatDay","formatMonth","formatYear","formatDayHeader","formatDayTitle","formatMonthTitle","minMode","maxMode","showWeeks","startingDay","yearRange"],function(i,u){s[i]=angular.isDefined(t[i])?u<8?r(t[i])(n.$parent):n.$parent.$eval(t[i]):o[i]});angular.forEach(["minDate","maxDate"],function(r){t[r]?n.$parent.$watch(i(t[r]),function(n){s[r]=n?new Date(n):null;s.refreshView()}):s[r]=o[r]?new Date(o[r]):null});n.datepickerMode=n.datepickerMode||o.datepickerMode;n.uniqueId="datepicker-"+n.$id+"-"+Math.floor(Math.random()*1e4);this.activeDate=angular.isDefined(t.initDate)?n.$parent.$eval(t.initDate):new Date;n.isActive=function(t){return s.compare(t.date,s.activeDate)===0?(n.activeDateId=t.uid,!0):!1};this.init=function(n){h=n;h.$render=function(){s.render()}};this.render=function(){if(h.$modelValue){var n=new Date(h.$modelValue),t=!isNaN(n);t?this.activeDate=n:f.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');h.$setValidity("date",t)}this.refreshView()};this.refreshView=function(){if(this.element){this._refreshView();var n=h.$modelValue?new Date(h.$modelValue):null;h.$setValidity("date-disabled",!n||this.element&&!this.isDisabled(n))}};this.createDateObject=function(n,t){var i=h.$modelValue?new Date(h.$modelValue):null;return{date:n,label:e(n,t),selected:i&&this.compare(n,i)===0,disabled:this.isDisabled(n),current:this.compare(n,new Date)===0}};this.isDisabled=function(i){return this.minDate&&this.compare(i,this.minDate)<0||this.maxDate&&this.compare(i,this.maxDate)>0||t.dateDisabled&&n.dateDisabled({date:i,mode:n.datepickerMode})};this.split=function(n,t){for(var i=[];n.length>0;)i.push(n.splice(0,t));return i};n.select=function(t){if(n.datepickerMode===s.minMode){var i=h.$modelValue?new Date(h.$modelValue):new Date(0,0,0,0,0,0,0);i.setFullYear(t.getFullYear(),t.getMonth(),t.getDate());h.$setViewValue(i);h.$render()}else s.activeDate=t,n.datepickerMode=s.modes[s.modes.indexOf(n.datepickerMode)-1]};n.move=function(n){var t=s.activeDate.getFullYear()+n*(s.step.years||0),i=s.activeDate.getMonth()+n*(s.step.months||0);s.activeDate.setFullYear(t,i,1);s.refreshView()};n.toggleMode=function(t){(t=t||1,(n.datepickerMode!==s.maxMode||t!==1)&&(n.datepickerMode!==s.minMode||t!==-1))&&(n.datepickerMode=s.modes[s.modes.indexOf(n.datepickerMode)+t])};n.keys={13:"enter",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down"};c=function(){u(function(){s.element[0].focus()},0,!1)};n.$on("datepicker.focus",c);n.keydown=function(t){var i=n.keys[t.which];if(i&&!t.shiftKey&&!t.altKey)if(t.preventDefault(),t.stopPropagation(),i==="enter"||i==="space"){if(s.isDisabled(s.activeDate))return;n.select(s.activeDate);c()}else t.ctrlKey&&(i==="up"||i==="down")?(n.toggleMode(i==="up"?1:-1),c()):(s.handleKeyDown(i,t),s.refreshView())}}]).directive("datepicker",function(){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/datepicker.html",scope:{datepickerMode:"=?",dateDisabled:"&"},require:["datepicker","?^ngModel"],controller:"DatepickerController",link:function(n,t,i,r){var f=r[0],u=r[1];u&&f.init(u)}}}).directive("daypicker",["dateFilter",function(n){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/day.html",require:"^datepicker",link:function(t,i,r,u){function f(n,t){return t===1&&n%4==0&&(n%100!=0||n%400==0)?29:e[t]}function o(n,t){var r=new Array(t),i=new Date(n),u=0;for(i.setHours(12);u<t;)r[u++]=new Date(i),i.setDate(i.getDate()+1);return r}function s(n){var t=new Date(n),i;return t.setDate(t.getDate()+4-(t.getDay()||7)),i=t.getTime(),t.setMonth(0),t.setDate(1),Math.floor(Math.round((i-t)/864e5)/7)+1}t.showWeeks=u.showWeeks;u.step={months:1};u.element=i;var e=[31,28,31,30,31,30,31,31,30,31,30,31];u._refreshView=function(){var p=u.activeDate.getFullYear(),h=u.activeDate.getMonth(),c=new Date(p,h,1),e=u.startingDay-c.getDay(),l=e>0?7-e:-e,a=new Date(c),i,r,f,v,y;for(l>0&&a.setDate(-l+1),i=o(a,42),r=0;r<42;r++)i[r]=angular.extend(u.createDateObject(i[r],u.formatDay),{secondary:i[r].getMonth()!==h,uid:t.uniqueId+"-"+r});for(t.labels=new Array(7),f=0;f<7;f++)t.labels[f]={abbr:n(i[f].date,u.formatDayHeader),full:n(i[f].date,"EEEE")};if(t.title=n(u.activeDate,u.formatDayTitle),t.rows=u.split(i,7),t.showWeeks)for(t.weekNumbers=[],v=s(t.rows[0][0].date),y=t.rows.length;t.weekNumbers.push(v++)<y;);};u.compare=function(n,t){return new Date(n.getFullYear(),n.getMonth(),n.getDate())-new Date(t.getFullYear(),t.getMonth(),t.getDate())};u.handleKeyDown=function(n){var t=u.activeDate.getDate(),i;n==="left"?t=t-1:n==="up"?t=t-7:n==="right"?t=t+1:n==="down"?t=t+7:n==="pageup"||n==="pagedown"?(i=u.activeDate.getMonth()+(n==="pageup"?-1:1),u.activeDate.setMonth(i,1),t=Math.min(f(u.activeDate.getFullYear(),u.activeDate.getMonth()),t)):n==="home"?t=1:n==="end"&&(t=f(u.activeDate.getFullYear(),u.activeDate.getMonth()));u.activeDate.setDate(t)};u.refreshView()}}}]).directive("monthpicker",["dateFilter",function(n){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/month.html",require:"^datepicker",link:function(t,i,r,u){u.step={years:1};u.element=i;u._refreshView=function(){for(var r=new Array(12),f=u.activeDate.getFullYear(),i=0;i<12;i++)r[i]=angular.extend(u.createDateObject(new Date(f,i,1),u.formatMonth),{uid:t.uniqueId+"-"+i});t.title=n(u.activeDate,u.formatMonthTitle);t.rows=u.split(r,3)};u.compare=function(n,t){return new Date(n.getFullYear(),n.getMonth())-new Date(t.getFullYear(),t.getMonth())};u.handleKeyDown=function(n){var t=u.activeDate.getMonth(),i;n==="left"?t=t-1:n==="up"?t=t-3:n==="right"?t=t+1:n==="down"?t=t+3:n==="pageup"||n==="pagedown"?(i=u.activeDate.getFullYear()+(n==="pageup"?-1:1),u.activeDate.setFullYear(i)):n==="home"?t=0:n==="end"&&(t=11);u.activeDate.setMonth(t)};u.refreshView()}}}]).directive("yearpicker",["dateFilter",function(){return{restrict:"EA",replace:!0,templateUrl:"template/datepicker/year.html",require:"^datepicker",link:function(n,t,i,r){function f(n){return parseInt((n-1)/u,10)*u+1}var u=r.yearRange;r.step={years:u};r.element=t;r._refreshView=function(){for(var i=new Array(u),t=0,e=f(r.activeDate.getFullYear());t<u;t++)i[t]=angular.extend(r.createDateObject(new Date(e+t,0,1),r.formatYear),{uid:n.uniqueId+"-"+t});n.title=[i[0].label,i[u-1].label].join(" - ");n.rows=r.split(i,5)};r.compare=function(n,t){return n.getFullYear()-t.getFullYear()};r.handleKeyDown=function(n){var t=r.activeDate.getFullYear();n==="left"?t=t-1:n==="up"?t=t-5:n==="right"?t=t+1:n==="down"?t=t+5:n==="pageup"||n==="pagedown"?t+=(n==="pageup"?-1:1)*r.step.years:n==="home"?t=f(r.activeDate.getFullYear()):n==="end"&&(t=f(r.activeDate.getFullYear())+u-1);r.activeDate.setFullYear(t)};r.refreshView()}}}]).constant("datepickerPopupConfig",{datepickerPopup:"yyyy-MM-dd",currentText:"Today",clearText:"Clear",closeText:"Done",closeOnDateSelection:!0,appendToBody:!1,showButtonBar:!0}).directive("datepickerPopup",["$compile","$parse","$document","$position","dateFilter","dateParser","datepickerPopupConfig",function(n,t,i,r,u,f,e){return{restrict:"EA",require:"ngModel",scope:{isOpen:"=?",currentText:"@",clearText:"@",closeText:"@",dateDisabled:"&"},link:function(o,s,h,c){function k(n){return n.replace(/([A-Z])/g,function(n){return"-"+n.toLowerCase()})}function d(n){if(n){if(angular.isDate(n)&&!isNaN(n))return c.$setValidity("date",!0),n;if(angular.isString(n)){var t=f.parse(n,p)||new Date(n);return isNaN(t)?(c.$setValidity("date",!1),undefined):(c.$setValidity("date",!0),t)}return c.$setValidity("date",!1),undefined}return c.$setValidity("date",!0),null}var p,g=angular.isDefined(h.closeOnDateSelection)?o.$parent.$eval(h.closeOnDateSelection):e.closeOnDateSelection,b=angular.isDefined(h.datepickerAppendToBody)?o.$parent.$eval(h.datepickerAppendToBody):e.appendToBody,l,a,v,w,y;o.showButtonBar=angular.isDefined(h.showButtonBar)?o.$parent.$eval(h.showButtonBar):e.showButtonBar;o.getText=function(n){return o[n+"Text"]||e[n+"Text"]};h.$observe("datepickerPopup",function(n){p=n||e.datepickerPopup;c.$render()});l=angular.element("<div datepicker-popup-wrap><div datepicker><\/div><\/div>");l.attr({"ng-model":"date","ng-change":"dateSelection()"});a=angular.element(l.children()[0]);h.datepickerOptions&&angular.forEach(o.$parent.$eval(h.datepickerOptions),function(n,t){a.attr(k(t),n)});angular.forEach(["minDate","maxDate"],function(n){h[n]&&(o.$parent.$watch(t(h[n]),function(t){o[n]=t}),a.attr(k(n),n))});h.dateDisabled&&a.attr("date-disabled","dateDisabled({ date: date, mode: mode })");c.$parsers.unshift(d);o.dateSelection=function(n){angular.isDefined(n)&&(o.date=n);c.$setViewValue(o.date);c.$render();g&&(o.isOpen=!1,s[0].focus())};s.bind("input change keyup",function(){o.$apply(function(){o.date=c.$modelValue})});c.$render=function(){var n=c.$viewValue?u(c.$viewValue,p):"";s.val(n);o.date=d(c.$modelValue)};v=function(n){o.isOpen&&n.target!==s[0]&&o.$apply(function(){o.isOpen=!1})};w=function(n){o.keydown(n)};s.bind("keydown",w);o.keydown=function(n){n.which===27?(n.preventDefault(),n.stopPropagation(),o.close()):n.which!==40||o.isOpen||(o.isOpen=!0)};o.$watch("isOpen",function(n){n?(o.$broadcast("datepicker.focus"),o.position=b?r.offset(s):r.position(s),o.position.top=o.position.top+s.prop("offsetHeight"),i.bind("click",v)):i.unbind("click",v)});o.select=function(n){if(n==="today"){var t=new Date;angular.isDate(c.$modelValue)?(n=new Date(c.$modelValue),n.setFullYear(t.getFullYear(),t.getMonth(),t.getDate())):n=new Date(t.setHours(0,0,0,0))}o.dateSelection(n)};o.close=function(){o.isOpen=!1;s[0].focus()};y=n(l)(o);b?i.find("body").append(y):s.after(y);o.$on("$destroy",function(){y.remove();s.unbind("keydown",w);i.unbind("click",v)})}}}]).directive("datepickerPopupWrap",function(){return{restrict:"EA",replace:!0,transclude:!0,templateUrl:"template/datepicker/popup.html",link:function(n,t){t.bind("click",function(n){n.preventDefault();n.stopPropagation()})}}});angular.module("ui.bootstrap.dropdown",[]).constant("dropdownConfig",{openClass:"open"}).service("dropdownService",["$document",function(n){var t=null,i,r;this.open=function(u){t||(n.bind("click",i),n.bind("keydown",r));t&&t!==u&&(t.isOpen=!1);t=u};this.close=function(u){t===u&&(t=null,n.unbind("click",i),n.unbind("keydown",r))};i=function(n){n&&n.isDefaultPrevented()||t.$apply(function(){t.isOpen=!1})};r=function(n){n.which===27&&(t.focusToggleElement(),i())}}]).controller("DropdownController",["$scope","$attrs","$parse","dropdownConfig","dropdownService","$animate",function(n,t,i,r,u,f){var o=this,e=n.$new(),c=r.openClass,s,h=angular.noop,l=t.onToggle?i(t.onToggle):angular.noop;this.init=function(r){o.$element=r;t.isOpen&&(s=i(t.isOpen),h=s.assign,n.$watch(s,function(n){e.isOpen=!!n}))};this.toggle=function(n){return e.isOpen=arguments.length?!!n:!e.isOpen};this.isOpen=function(){return e.isOpen};e.focusToggleElement=function(){o.toggleElement&&o.toggleElement[0].focus()};e.$watch("isOpen",function(t,i){f[t?"addClass":"removeClass"](o.$element,c);t?(e.focusToggleElement(),u.open(e)):u.close(e);h(n,t);angular.isDefined(t)&&t!==i&&l(n,{open:!!t})});n.$on("$locationChangeSuccess",function(){e.isOpen=!1});n.$on("$destroy",function(){e.$destroy()})}]).directive("dropdown",function(){return{restrict:"CA",controller:"DropdownController",link:function(n,t,i,r){r.init(t)}}}).directive("dropdownToggle",function(){return{restrict:"CA",require:"?^dropdown",link:function(n,t,i,r){if(r){r.toggleElement=t;var u=function(u){u.preventDefault();t.hasClass("disabled")||i.disabled||n.$apply(function(){r.toggle()})};t.bind("click",u);t.attr({"aria-haspopup":!0,"aria-expanded":!1});n.$watch(r.isOpen,function(n){t.attr("aria-expanded",!!n)});n.$on("$destroy",function(){t.unbind("click",u)})}}}});angular.module("ui.bootstrap.modal",["ui.bootstrap.transition"]).factory("$$stackedMap",function(){return{createNew:function(){var n=[];return{add:function(t,i){n.push({key:t,value:i})},get:function(t){for(var i=0;i<n.length;i++)if(t==n[i].key)return n[i]},keys:function(){for(var i=[],t=0;t<n.length;t++)i.push(n[t].key);return i},top:function(){return n[n.length-1]},remove:function(t){for(var r=-1,i=0;i<n.length;i++)if(t==n[i].key){r=i;break}return n.splice(r,1)[0]},removeTop:function(){return n.splice(n.length-1,1)[0]},length:function(){return n.length}}}}}).directive("modalBackdrop",["$timeout",function(n){return{restrict:"EA",replace:!0,templateUrl:"template/modal/backdrop.html",link:function(t){t.animate=!1;n(function(){t.animate=!0})}}}]).directive("modalWindow",["$modalStack","$timeout",function(n,t){return{restrict:"EA",scope:{index:"@",animate:"="},replace:!0,transclude:!0,templateUrl:function(n,t){return t.templateUrl||"template/modal/window.html"},link:function(i,r,u){r.addClass(u.windowClass||"");i.size=u.size;t(function(){i.animate=!0;r[0].focus()});i.close=function(t){var i=n.getTop();i&&i.value.backdrop&&i.value.backdrop!="static"&&t.target===t.currentTarget&&(t.preventDefault(),t.stopPropagation(),n.dismiss(i.key,"backdrop click"))}}}}]).factory("$modalStack",["$transition","$timeout","$document","$compile","$rootScope","$$stackedMap",function(n,t,i,r,u,f){function c(){for(var t=-1,i=e.keys(),n=0;n<i.length;n++)e.get(i[n]).value.backdrop&&(t=n);return t}function a(n){var r=i.find("body").eq(0),t=e.get(n).value;e.remove(n);v(t.modalDomEl,t.modalScope,300,function(){t.modalScope.$destroy();r.toggleClass(l,e.length()>0);y()})}function y(){if(h&&c()==-1){var n=o;v(h,o,150,function(){n.$destroy();n=null});h=undefined;o=undefined}}function v(i,r,u,f){function e(){e.done||(e.done=!0,i.remove(),f&&f())}var o,s;r.animate=!1;o=n.transitionEndEventName;o?(s=t(e,u),i.bind(o,function(){t.cancel(s);e();r.$apply()})):t(e,0)}var l="modal-open",h,o,e=f.createNew(),s={};return u.$watch(c,function(n){o&&(o.index=n)}),i.bind("keydown",function(n){var t;n.which===27&&(t=e.top(),t&&t.value.keyboard&&(n.preventDefault(),u.$apply(function(){s.dismiss(t.key,"escape key press")})))}),s.open=function(n,t){var f,s,a,v;e.add(n,{deferred:t.deferred,modalScope:t.scope,backdrop:t.backdrop,keyboard:t.keyboard});f=i.find("body").eq(0);s=c();s>=0&&!h&&(o=u.$new(!0),o.index=s,h=r("<div modal-backdrop><\/div>")(o),f.append(h));a=angular.element("<div modal-window><\/div>");a.attr({"template-url":t.windowTemplateUrl,"window-class":t.windowClass,size:t.size,index:e.length()-1,animate:"animate"}).html(t.content);v=r(a)(t.scope);e.top().value.modalDomEl=v;f.append(v);f.addClass(l)},s.close=function(n,t){var i=e.get(n).value;i&&(i.deferred.resolve(t),a(n))},s.dismiss=function(n,t){var i=e.get(n).value;i&&(i.deferred.reject(t),a(n))},s.dismissAll=function(n){for(var t=this.getTop();t;)this.dismiss(t.key,n),t=this.getTop()},s.getTop=function(){return e.top()},s}]).provider("$modal",function(){var n={options:{backdrop:!0,keyboard:!0},$get:["$injector","$rootScope","$q","$http","$templateCache","$controller","$modalStack",function(t,i,r,u,f,e,o){function h(n){return n.template?r.when(n.template):u.get(n.templateUrl,{cache:f}).then(function(n){return n.data})}function c(n){var i=[];return angular.forEach(n,function(n){(angular.isFunction(n)||angular.isArray(n))&&i.push(r.when(t.invoke(n)))}),i}var s={};return s.open=function(t){var f=r.defer(),s=r.defer(),u={result:f.promise,opened:s.promise,close:function(n){o.close(u,n)},dismiss:function(n){o.dismiss(u,n)}},l;if(t=angular.extend({},n.options,t),t.resolve=t.resolve||{},!t.template&&!t.templateUrl)throw new Error("One of template or templateUrl options is required.");return l=r.all([h(t)].concat(c(t.resolve))),l.then(function(n){var s=(t.scope||i).$new(),c,r,h;s.$close=u.close;s.$dismiss=u.dismiss;r={};h=1;t.controller&&(r.$scope=s,r.$modalInstance=u,angular.forEach(t.resolve,function(t,i){r[i]=n[h++]}),c=e(t.controller,r));o.open(u,{scope:s,deferred:f,content:n[0],backdrop:t.backdrop,keyboard:t.keyboard,windowClass:t.windowClass,windowTemplateUrl:t.windowTemplateUrl,size:t.size})},function(n){f.reject(n)}),l.then(function(){s.resolve(!0)},function(){s.reject(!1)}),u},s}]};return n});angular.module("ui.bootstrap.pagination",[]).controller("PaginationController",["$scope","$attrs","$parse",function(n,t,i){var u=this,r={$setViewValue:angular.noop},f=t.numPages?i(t.numPages).assign:angular.noop;this.init=function(f,e){r=f;this.config=e;r.$render=function(){u.render()};t.itemsPerPage?n.$parent.$watch(i(t.itemsPerPage),function(t){u.itemsPerPage=parseInt(t,10);n.totalPages=u.calculateTotalPages()}):this.itemsPerPage=e.itemsPerPage};this.calculateTotalPages=function(){var t=this.itemsPerPage<1?1:Math.ceil(n.totalItems/this.itemsPerPage);return Math.max(t||0,1)};this.render=function(){n.page=parseInt(r.$viewValue,10)||1};n.selectPage=function(t){n.page!==t&&t>0&&t<=n.totalPages&&(r.$setViewValue(t),r.$render())};n.getText=function(t){return n[t+"Text"]||u.config[t+"Text"]};n.noPrevious=function(){return n.page===1};n.noNext=function(){return n.page===n.totalPages};n.$watch("totalItems",function(){n.totalPages=u.calculateTotalPages()});n.$watch("totalPages",function(t){f(n.$parent,t);n.page>t?n.selectPage(t):r.$render()})}]).constant("paginationConfig",{itemsPerPage:10,boundaryLinks:!1,directionLinks:!0,firstText:"First",previousText:"Previous",nextText:"Next",lastText:"Last",rotate:!0}).directive("pagination",["$parse","paginationConfig",function(n,t){return{restrict:"EA",scope:{totalItems:"=",firstText:"@",previousText:"@",nextText:"@",lastText:"@"},require:["pagination","?ngModel"],controller:"PaginationController",templateUrl:"template/pagination/pagination.html",replace:!0,link:function(i,r,u,f){function h(n,t,i){return{number:n,text:t,active:i}}function a(n,t){var f=[],i=1,r=t,o=angular.isDefined(e)&&e<t,u,c,l,a;for(o&&(s?(i=Math.max(n-Math.floor(e/2),1),r=i+e-1,r>t&&(r=t,i=r-e+1)):(i=(Math.ceil(n/e)-1)*e+1,r=Math.min(i+e-1,t))),u=i;u<=r;u++)c=h(u,u,u===n),f.push(c);return o&&!s&&(i>1&&(l=h(i-1,"...",!1),f.unshift(l)),r<t&&(a=h(r+1,"...",!1),f.push(a))),f}var o=f[0],c=f[1],e,s,l;c&&(e=angular.isDefined(u.maxSize)?i.$parent.$eval(u.maxSize):t.maxSize,s=angular.isDefined(u.rotate)?i.$parent.$eval(u.rotate):t.rotate,i.boundaryLinks=angular.isDefined(u.boundaryLinks)?i.$parent.$eval(u.boundaryLinks):t.boundaryLinks,i.directionLinks=angular.isDefined(u.directionLinks)?i.$parent.$eval(u.directionLinks):t.directionLinks,o.init(c,t),u.maxSize&&i.$parent.$watch(n(u.maxSize),function(n){e=parseInt(n,10);o.render()}),l=o.render,o.render=function(){l();i.page>0&&i.page<=i.totalPages&&(i.pages=a(i.page,i.totalPages))})}}}]).constant("pagerConfig",{itemsPerPage:10,previousText:"« Previous",nextText:"Next »",align:!0}).directive("pager",["pagerConfig",function(n){return{restrict:"EA",scope:{totalItems:"=",previousText:"@",nextText:"@"},require:["pager","?ngModel"],controller:"PaginationController",templateUrl:"template/pagination/pager.html",replace:!0,link:function(t,i,r,u){var e=u[0],f=u[1];f&&(t.align=angular.isDefined(r.align)?t.$parent.$eval(r.align):n.align,e.init(f,n))}}}]);angular.module("ui.bootstrap.tooltip",["ui.bootstrap.position","ui.bootstrap.bindHtml"]).provider("$tooltip",function(){function r(n){var t="-";return n.replace(/[A-Z]/g,function(n,i){return(i?t:"")+n.toLowerCase()})}var i={placement:"top",animation:!0,popupDelay:0},n={mouseenter:"mouseleave",click:"click",focus:"blur"},t={};this.options=function(n){angular.extend(t,n)};this.setTriggers=function(t){angular.extend(n,t)};this.$get=["$window","$compile","$timeout","$parse","$document","$position","$interpolate",function(u,f,e,o,s,h,c){return function(u,l,a){function w(t){var i=t||v.trigger||a,r=n[i]||i;return{show:i,hide:r}}var v=angular.extend({},i,t),b=r(u),y=c.startSymbol(),p=c.endSymbol(),k="<div "+b+'-popup title="'+y+"tt_title"+p+'" content="'+y+"tt_content"+p+'" placement="'+y+"tt_placement"+p+'" animation="tt_animation" is-open="tt_isOpen"><\/div>';return{restrict:"EA",scope:!0,compile:function(){var n=f(k);return function(t,i,r){function ft(){t.tt_isOpen?d():k()}function k(){(!ut||t.$eval(r[l+"Enable"]))&&(t.tt_popupDelay?y||(y=e(rt,t.tt_popupDelay,!1),y.then(function(n){n()})):rt()())}function d(){t.$apply(function(){g()})}function rt(){return(y=null,a&&(e.cancel(a),a=null),!t.tt_content)?angular.noop:(et(),f.css({top:0,left:0,display:"block"}),p?s.find("body").append(f):i.after(f),it(),t.tt_isOpen=!0,t.$digest(),it)}function g(){t.tt_isOpen=!1;e.cancel(y);y=null;t.tt_animation?a||(a=e(b,500)):b()}function et(){f&&b();f=n(t,function(){});t.$digest()}function b(){a=null;f&&(f.remove(),f=null)}var f,a,y,p=angular.isDefined(v.appendToBody)?v.appendToBody:!1,c=w(undefined),ut=angular.isDefined(r[l+"Enable"]),it=function(){var n=h.positionElements(i,f,t.tt_placement,p);n.top+="px";n.left+="px";f.css(n)},nt,tt;t.tt_isOpen=!1;r.$observe(u,function(n){t.tt_content=n;!n&&t.tt_isOpen&&g()});r.$observe(l+"Title",function(n){t.tt_title=n});r.$observe(l+"Placement",function(n){t.tt_placement=angular.isDefined(n)?n:v.placement});r.$observe(l+"PopupDelay",function(n){var i=parseInt(n,10);t.tt_popupDelay=isNaN(i)?v.popupDelay:i});nt=function(){i.unbind(c.show,k);i.unbind(c.hide,d)};r.$observe(l+"Trigger",function(n){nt();c=w(n);c.show===c.hide?i.bind(c.show,ft):(i.bind(c.show,k),i.bind(c.hide,d))});tt=t.$eval(r[l+"Animation"]);t.tt_animation=angular.isDefined(tt)?!!tt:v.animation;r.$observe(l+"AppendToBody",function(n){p=angular.isDefined(n)?o(n)(t):p});p&&t.$on("$locationChangeSuccess",function(){t.tt_isOpen&&g()});t.$on("$destroy",function(){e.cancel(a);e.cancel(y);nt();b()})}}}}}]}).directive("tooltipPopup",function(){return{restrict:"EA",replace:!0,scope:{content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/tooltip/tooltip-popup.html"}}).directive("tooltip",["$tooltip",function(n){return n("tooltip","tooltip","mouseenter")}]).directive("tooltipHtmlUnsafePopup",function(){return{restrict:"EA",replace:!0,scope:{content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/tooltip/tooltip-html-unsafe-popup.html"}}).directive("tooltipHtmlUnsafe",["$tooltip",function(n){return n("tooltipHtmlUnsafe","tooltip","mouseenter")}]);angular.module("ui.bootstrap.popover",["ui.bootstrap.tooltip"]).directive("popoverPopup",function(){return{restrict:"EA",replace:!0,scope:{title:"@",content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/popover/popover.html"}}).directive("popover",["$tooltip",function(n){return n("popover","popover","click")}]);angular.module("ui.bootstrap.progressbar",[]).constant("progressConfig",{animate:!0,max:100}).controller("ProgressController",["$scope","$attrs","progressConfig",function(n,t,i){var r=this,u=angular.isDefined(t.animate)?n.$parent.$eval(t.animate):i.animate;this.bars=[];n.max=angular.isDefined(t.max)?n.$parent.$eval(t.max):i.max;this.addBar=function(t,i){u||i.css({transition:"none"});this.bars.push(t);t.$watch("value",function(i){t.percent=+(100*i/n.max).toFixed(2)});t.$on("$destroy",function(){i=null;r.removeBar(t)})};this.removeBar=function(n){this.bars.splice(this.bars.indexOf(n),1)}}]).directive("progress",function(){return{restrict:"EA",replace:!0,transclude:!0,controller:"ProgressController",require:"progress",scope:{},templateUrl:"template/progressbar/progress.html"}}).directive("bar",function(){return{restrict:"EA",replace:!0,transclude:!0,require:"^progress",scope:{value:"=",type:"@"},templateUrl:"template/progressbar/bar.html",link:function(n,t,i,r){r.addBar(n,t)}}}).directive("progressbar",function(){return{restrict:"EA",replace:!0,transclude:!0,controller:"ProgressController",scope:{value:"=",type:"@"},templateUrl:"template/progressbar/progressbar.html",link:function(n,t,i,r){r.addBar(n,angular.element(t.children()[0]))}}});angular.module("ui.bootstrap.rating",[]).constant("ratingConfig",{max:5,stateOn:null,stateOff:null}).controller("RatingController",["$scope","$attrs","ratingConfig",function(n,t,i){var r={$setViewValue:angular.noop};this.init=function(u){r=u;r.$render=this.render;this.stateOn=angular.isDefined(t.stateOn)?n.$parent.$eval(t.stateOn):i.stateOn;this.stateOff=angular.isDefined(t.stateOff)?n.$parent.$eval(t.stateOff):i.stateOff;var f=angular.isDefined(t.ratingStates)?n.$parent.$eval(t.ratingStates):new Array(angular.isDefined(t.max)?n.$parent.$eval(t.max):i.max);n.range=this.buildTemplateObjects(f)};this.buildTemplateObjects=function(n){for(var t=0,i=n.length;t<i;t++)n[t]=angular.extend({index:t},{stateOn:this.stateOn,stateOff:this.stateOff},n[t]);return n};n.rate=function(t){!n.readonly&&t>=0&&t<=n.range.length&&(r.$setViewValue(t),r.$render())};n.enter=function(t){n.readonly||(n.value=t);n.onHover({value:t})};n.reset=function(){n.value=r.$viewValue;n.onLeave()};n.onKeydown=function(t){/(37|38|39|40)/.test(t.which)&&(t.preventDefault(),t.stopPropagation(),n.rate(n.value+(t.which===38||t.which===39?1:-1)))};this.render=function(){n.value=r.$viewValue}}]).directive("rating",function(){return{restrict:"EA",require:["rating","ngModel"],scope:{readonly:"=?",onHover:"&",onLeave:"&"},controller:"RatingController",templateUrl:"template/rating/rating.html",replace:!0,link:function(n,t,i,r){var f=r[0],u=r[1];u&&f.init(u)}}});angular.module("ui.bootstrap.tabs",[]).controller("TabsetController",["$scope",function(n){var i=this,t=i.tabs=n.tabs=[];i.select=function(n){angular.forEach(t,function(t){t.active&&t!==n&&(t.active=!1,t.onDeselect())});n.active=!0;n.onSelect()};i.addTab=function(n){t.push(n);t.length===1?n.active=!0:n.active&&i.select(n)};i.removeTab=function(n){var r=t.indexOf(n),u;n.active&&t.length>1&&(u=r==t.length-1?r-1:r+1,i.select(t[u]));t.splice(r,1)}}]).directive("tabset",function(){return{restrict:"EA",transclude:!0,replace:!0,scope:{type:"@"},controller:"TabsetController",templateUrl:"template/tabs/tabset.html",link:function(n,t,i){n.vertical=angular.isDefined(i.vertical)?n.$parent.$eval(i.vertical):!1;n.justified=angular.isDefined(i.justified)?n.$parent.$eval(i.justified):!1}}}).directive("tab",["$parse",function(n){return{require:"^tabset",restrict:"EA",replace:!0,templateUrl:"template/tabs/tab.html",transclude:!0,scope:{active:"=?",heading:"@",onSelect:"&select",onDeselect:"&deselect"},controller:function(){},compile:function(t,i,r){return function(t,i,u,f){t.$watch("active",function(n){n&&f.select(t)});t.disabled=!1;u.disabled&&t.$parent.$watch(n(u.disabled),function(n){t.disabled=!!n});t.select=function(){t.disabled||(t.active=!0)};f.addTab(t);t.$on("$destroy",function(){f.removeTab(t)});t.$transcludeFn=r}}}}]).directive("tabHeadingTransclude",[function(){return{restrict:"A",require:"^tab",link:function(n,t){n.$watch("headingElement",function(n){n&&(t.html(""),t.append(n))})}}}]).directive("tabContentTransclude",function(){function n(n){return n.tagName&&(n.hasAttribute("tab-heading")||n.hasAttribute("data-tab-heading")||n.tagName.toLowerCase()==="tab-heading"||n.tagName.toLowerCase()==="data-tab-heading")}return{restrict:"A",require:"^tabset",link:function(t,i,r){var u=t.$eval(r.tabContentTransclude);u.$transcludeFn(u.$parent,function(t){angular.forEach(t,function(t){n(t)?u.headingElement=t:i.append(t)})})}}});angular.module("ui.bootstrap.timepicker",[]).constant("timepickerConfig",{hourStep:1,minuteStep:1,showMeridian:!0,meridians:null,readonlyInput:!1,mousewheel:!0}).controller("TimepickerController",["$scope","$attrs","$parse","$log","$locale","timepickerConfig",function(n,t,i,r,u,f){function p(){var t=parseInt(n.hours,10),i=n.showMeridian?t>0&&t<13:t>=0&&t<24;return i?(n.showMeridian&&(t===12&&(t=0),n.meridian===v[1]&&(t=t+12)),t):undefined}function w(){var t=parseInt(n.minutes,10);return t>=0&&t<60?t:undefined}function l(n){return angular.isDefined(n)&&n.toString().length<2?"0"+n:n}function a(n){b();o.$setViewValue(new Date(e));y(n)}function b(){o.$setValidity("time",!0);n.invalidHours=!1;n.invalidMinutes=!1}function y(t){var i=e.getHours(),r=e.getMinutes();n.showMeridian&&(i=i===0||i===12?12:i%12);n.hours=t==="h"?i:l(i);n.minutes=t==="m"?r:l(r);n.meridian=e.getHours()<12?v[0]:v[1]}function s(n){var t=new Date(e.getTime()+n*6e4);e.setHours(t.getHours(),t.getMinutes());a()}var e=new Date,o={$setViewValue:angular.noop},v=angular.isDefined(t.meridians)?n.$parent.$eval(t.meridians):f.meridians||u.DATETIME_FORMATS.AMPMS,h,c;this.init=function(i,r){o=i;o.$render=this.render;var u=r.eq(0),e=r.eq(1),s=angular.isDefined(t.mousewheel)?n.$parent.$eval(t.mousewheel):f.mousewheel;s&&this.setupMousewheelEvents(u,e);n.readonlyInput=angular.isDefined(t.readonlyInput)?n.$parent.$eval(t.readonlyInput):f.readonlyInput;this.setupInputEvents(u,e)};h=f.hourStep;t.hourStep&&n.$parent.$watch(i(t.hourStep),function(n){h=parseInt(n,10)});c=f.minuteStep;t.minuteStep&&n.$parent.$watch(i(t.minuteStep),function(n){c=parseInt(n,10)});n.showMeridian=f.showMeridian;t.showMeridian&&n.$parent.$watch(i(t.showMeridian),function(t){if(n.showMeridian=!!t,o.$error.time){var i=p(),r=w();angular.isDefined(i)&&angular.isDefined(r)&&(e.setHours(i),a())}else y()});this.setupMousewheelEvents=function(t,i){var r=function(n){n.originalEvent&&(n=n.originalEvent);var t=n.wheelDelta?n.wheelDelta:-n.deltaY;return n.detail||t>0};t.bind("mousewheel wheel",function(t){n.$apply(r(t)?n.incrementHours():n.decrementHours());t.preventDefault()});i.bind("mousewheel wheel",function(t){n.$apply(r(t)?n.incrementMinutes():n.decrementMinutes());t.preventDefault()})};this.setupInputEvents=function(t,i){if(n.readonlyInput){n.updateHours=angular.noop;n.updateMinutes=angular.noop;return}var r=function(t,i){o.$setViewValue(null);o.$setValidity("time",!1);angular.isDefined(t)&&(n.invalidHours=t);angular.isDefined(i)&&(n.invalidMinutes=i)};n.updateHours=function(){var n=p();angular.isDefined(n)?(e.setHours(n),a("h")):r(!0)};t.bind("blur",function(){!n.invalidHours&&n.hours<10&&n.$apply(function(){n.hours=l(n.hours)})});n.updateMinutes=function(){var n=w();angular.isDefined(n)?(e.setMinutes(n),a("m")):r(undefined,!0)};i.bind("blur",function(){!n.invalidMinutes&&n.minutes<10&&n.$apply(function(){n.minutes=l(n.minutes)})})};this.render=function(){var n=o.$modelValue?new Date(o.$modelValue):null;isNaN(n)?(o.$setValidity("time",!1),r.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')):(n&&(e=n),b(),y())};n.incrementHours=function(){s(h*60)};n.decrementHours=function(){s(-h*60)};n.incrementMinutes=function(){s(c)};n.decrementMinutes=function(){s(-c)};n.toggleMeridian=function(){s(720*(e.getHours()<12?1:-1))}}]).directive("timepicker",function(){return{restrict:"EA",require:["timepicker","?^ngModel"],controller:"TimepickerController",replace:!0,scope:{},templateUrl:"template/timepicker/timepicker.html",link:function(n,t,i,r){var f=r[0],u=r[1];u&&f.init(u,t.find("input"))}}});angular.module("ui.bootstrap.typeahead",["ui.bootstrap.position","ui.bootstrap.bindHtml"]).factory("typeaheadParser",["$parse",function(n){var t=/^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;return{parse:function(i){var r=i.match(t);if(!r)throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "'+i+'".');return{itemName:r[3],source:n(r[4]),viewMapper:n(r[2]||r[1]),modelMapper:n(r[1])}}}}]).directive("typeahead",["$compile","$parse","$q","$timeout","$document","$position","typeaheadParser",function(n,t,i,r,u,f,e){var o=[9,13,27,38,40];return{require:"ngModel",link:function(s,h,c,l){var et=s.$eval(c.typeaheadMinLength)||1,rt=s.$eval(c.typeaheadWaitMs)||0,ot=s.$eval(c.typeaheadEditable)!==!1,p=t(c.typeaheadLoading).assign||angular.noop,st=t(c.typeaheadOnSelect),ut=c.typeaheadInputFormatter?t(c.typeaheadInputFormatter):undefined,ft=c.typeaheadAppendToBody?s.$eval(c.typeaheadAppendToBody):!1,ht=t(c.ngModel).assign,v=e.parse(c.typeahead),k,a=s.$new(),w,b,y,d,g,nt,tt,it;s.$on("$destroy",function(){a.$destroy()});w="typeahead-"+a.$id+"-"+Math.floor(Math.random()*1e4);h.attr({"aria-autocomplete":"list","aria-expanded":!1,"aria-owns":w});b=angular.element("<div typeahead-popup><\/div>");b.attr({id:w,matches:"matches",active:"activeIdx",select:"select(activeIdx)",query:"query",position:"position"});angular.isDefined(c.typeaheadTemplateUrl)&&b.attr("template-url",c.typeaheadTemplateUrl);y=function(){a.matches=[];a.activeIdx=-1;h.attr("aria-expanded",!1)};d=function(n){return w+"-option-"+n};a.$watch("activeIdx",function(n){n<0?h.removeAttr("aria-activedescendant"):h.attr("aria-activedescendant",d(n))});g=function(n){var t={$viewValue:n};p(s,!0);i.when(v.source(s,t)).then(function(i){var u=n===l.$viewValue,r;if(u&&k)if(i.length>0){for(a.activeIdx=0,a.matches.length=0,r=0;r<i.length;r++)t[v.itemName]=i[r],a.matches.push({id:d(r),label:v.viewMapper(a,t),model:i[r]});a.query=n;a.position=ft?f.offset(h):f.position(h);a.position.top=a.position.top+h.prop("offsetHeight");h.attr("aria-expanded",!0)}else y();u&&p(s,!1)},function(){y();p(s,!1)})};y();a.query=undefined;l.$parsers.unshift(function(n){return k=!0,n&&n.length>=et?rt>0?(nt&&r.cancel(nt),nt=r(function(){g(n)},rt)):g(n):(p(s,!1),y()),ot?n:n?(l.$setValidity("editable",!1),undefined):(l.$setValidity("editable",!0),n)});l.$formatters.push(function(n){var i,r,t={};return ut?(t.$model=n,ut(s,t)):(t[v.itemName]=n,i=v.viewMapper(s,t),t[v.itemName]=undefined,r=v.viewMapper(s,t),i!==r?i:n)});a.select=function(n){var t={},i,u;t[v.itemName]=u=a.matches[n].model;i=v.modelMapper(s,t);ht(s,i);l.$setValidity("editable",!0);st(s,{$item:u,$model:i,$label:v.viewMapper(s,t)});y();r(function(){h[0].focus()},0,!1)};h.bind("keydown",function(n){a.matches.length!==0&&o.indexOf(n.which)!==-1&&(n.preventDefault(),n.which===40?(a.activeIdx=(a.activeIdx+1)%a.matches.length,a.$digest()):n.which===38?(a.activeIdx=(a.activeIdx?a.activeIdx:a.matches.length)-1,a.$digest()):n.which===13||n.which===9?a.$apply(function(){a.select(a.activeIdx)}):n.which===27&&(n.stopPropagation(),y(),a.$digest()))});h.bind("blur",function(){k=!1});tt=function(n){h[0]!==n.target&&(y(),a.$digest())};u.bind("click",tt);s.$on("$destroy",function(){u.unbind("click",tt)});it=n(b)(a);ft?u.find("body").append(it):h.after(it)}}}]).directive("typeaheadPopup",function(){return{restrict:"EA",scope:{matches:"=",query:"=",active:"=",position:"=",select:"&"},replace:!0,templateUrl:"template/typeahead/typeahead-popup.html",link:function(n,t,i){n.templateUrl=i.templateUrl;n.isOpen=function(){return n.matches.length>0};n.isActive=function(t){return n.active==t};n.selectActive=function(t){n.active=t};n.selectMatch=function(t){n.select({activeIdx:t})}}}}).directive("typeaheadMatch",["$http","$templateCache","$compile","$parse",function(n,t,i,r){return{restrict:"EA",scope:{index:"=",match:"=",query:"="},link:function(u,f,e){var o=r(e.templateUrl)(u.$parent)||"template/typeahead/typeahead-match.html";n.get(o,{cache:t}).success(function(n){f.replaceWith(i(n.trim())(u))})}}}]).filter("typeaheadHighlight",function(){function n(n){return n.replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")}return function(t,i){return i?(""+t).replace(new RegExp(n(i),"gi"),"<strong>$&<\/strong>"):t}});angular.module("template/accordion/accordion-group.html",[]).run(["$templateCache",function(n){n.put("template/accordion/accordion-group.html",'<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a class="accordion-toggle" ng-click="toggleOpen()" accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}<\/span><\/a>\n    <\/h4>\n  <\/div>\n  <div class="panel-collapse" collapse="!isOpen">\n\t  <div class="panel-body" ng-transclude><\/div>\n  <\/div>\n<\/div>')}]);angular.module("template/accordion/accordion.html",[]).run(["$templateCache",function(n){n.put("template/accordion/accordion.html",'<div class="panel-group" ng-transclude><\/div>')}]);angular.module("template/alert/alert.html",[]).run(["$templateCache",function(n){n.put("template/alert/alert.html",'<div class="alert" ng-class="{\'alert-{{type || \'warning\'}}\': true, \'alert-dismissable\': closeable}" role="alert">\n    <button ng-show="closeable" type="button" class="close" ng-click="close()">\n        <span aria-hidden="true">&times;<\/span>\n        <span class="sr-only">Close<\/span>\n    <\/button>\n    <div ng-transclude><\/div>\n<\/div>\n')}]);angular.module("template/carousel/carousel.html",[]).run(["$templateCache",function(n){n.put("template/carousel/carousel.html",'<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel" ng-swipe-right="prev()" ng-swipe-left="next()">\n    <ol class="carousel-indicators" ng-show="slides.length > 1">\n        <li ng-repeat="slide in slides track by $index" ng-class="{active: isActive(slide)}" ng-click="select(slide)"><\/li>\n    <\/ol>\n    <div class="carousel-inner" ng-transclude><\/div>\n    <a class="left carousel-control" ng-click="prev()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-left"><\/span><\/a>\n    <a class="right carousel-control" ng-click="next()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-right"><\/span><\/a>\n<\/div>\n')}]);angular.module("template/carousel/slide.html",[]).run(["$templateCache",function(n){n.put("template/carousel/slide.html","<div ng-class=\"{\n    'active': leaving || (active && !entering),\n    'prev': (next || active) && direction=='prev',\n    'next': (next || active) && direction=='next',\n    'right': direction=='prev',\n    'left': direction=='next'\n  }\" class=\"item text-center\" ng-transclude><\/div>\n")}]);angular.module("template/datepicker/datepicker.html",[]).run(["$templateCache",function(n){n.put("template/datepicker/datepicker.html",'<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">\n  <daypicker ng-switch-when="day" tabindex="0"><\/daypicker>\n  <monthpicker ng-switch-when="month" tabindex="0"><\/monthpicker>\n  <yearpicker ng-switch-when="year" tabindex="0"><\/yearpicker>\n<\/div>')}]);angular.module("template/datepicker/day.html",[]).run(["$templateCache",function(n){n.put("template/datepicker/day.html",'<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"><\/i><\/button><\/th>\n      <th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}<\/strong><\/button><\/th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"><\/i><\/button><\/th>\n    <\/tr>\n    <tr>\n      <th ng-show="showWeeks" class="text-center"><\/th>\n      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}<\/small><\/th>\n    <\/tr>\n  <\/thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}<\/em><\/td>\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}<\/span><\/button>\n      <\/td>\n    <\/tr>\n  <\/tbody>\n<\/table>\n')}]);angular.module("template/datepicker/month.html",[]).run(["$templateCache",function(n){n.put("template/datepicker/month.html",'<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"><\/i><\/button><\/th>\n      <th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}<\/strong><\/button><\/th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"><\/i><\/button><\/th>\n    <\/tr>\n  <\/thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}<\/span><\/button>\n      <\/td>\n    <\/tr>\n  <\/tbody>\n<\/table>\n')}]);angular.module("template/datepicker/popup.html",[]).run(["$templateCache",function(n){n.put("template/datepicker/popup.html",'<ul class="dropdown-menu" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">\n\t<li ng-transclude><\/li>\n\t<li ng-if="showButtonBar" style="padding:10px 9px 2px">\n\t\t<span class="btn-group">\n\t\t\t<button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}<\/button>\n\t\t\t<button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}<\/button>\n\t\t<\/span>\n\t\t<button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}<\/button>\n\t<\/li>\n<\/ul>\n')}]);angular.module("template/datepicker/year.html",[]).run(["$templateCache",function(n){n.put("template/datepicker/year.html",'<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"><\/i><\/button><\/th>\n      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}<\/strong><\/button><\/th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"><\/i><\/button><\/th>\n    <\/tr>\n  <\/thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}<\/span><\/button>\n      <\/td>\n    <\/tr>\n  <\/tbody>\n<\/table>\n')}]);angular.module("template/modal/backdrop.html",[]).run(["$templateCache",function(n){n.put("template/modal/backdrop.html",'<div class="modal-backdrop fade"\n     ng-class="{in: animate}"\n     ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n><\/div>\n')}]);angular.module("template/modal/window.html",[]).run(["$templateCache",function(n){n.put("template/modal/window.html",'<div tabindex="-1" role="dialog" class="modal fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">\n    <div class="modal-dialog" ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\'}"><div class="modal-content" ng-transclude><\/div><\/div>\n<\/div>')}]);angular.module("template/pagination/pager.html",[]).run(["$templateCache",function(n){n.put("template/pagination/pager.html",'<ul class="pager">\n  <li ng-class="{disabled: noPrevious(), previous: align}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}<\/a><\/li>\n  <li ng-class="{disabled: noNext(), next: align}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}<\/a><\/li>\n<\/ul>')}]);angular.module("template/pagination/pagination.html",[]).run(["$templateCache",function(n){n.put("template/pagination/pagination.html",'<ul class="pagination">\n  <li ng-if="boundaryLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(1)">{{getText(\'first\')}}<\/a><\/li>\n  <li ng-if="directionLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}<\/a><\/li>\n  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active}"><a href ng-click="selectPage(page.number)">{{page.text}}<\/a><\/li>\n  <li ng-if="directionLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}<\/a><\/li>\n  <li ng-if="boundaryLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(totalPages)">{{getText(\'last\')}}<\/a><\/li>\n<\/ul>')}]);angular.module("template/tooltip/tooltip-html-unsafe-popup.html",[]).run(["$templateCache",function(n){n.put("template/tooltip/tooltip-html-unsafe-popup.html",'<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"><\/div>\n  <div class="tooltip-inner" bind-html-unsafe="content"><\/div>\n<\/div>\n')}]);angular.module("template/tooltip/tooltip-popup.html",[]).run(["$templateCache",function(n){n.put("template/tooltip/tooltip-popup.html",'<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"><\/div>\n  <div class="tooltip-inner" ng-bind="content"><\/div>\n<\/div>\n')}]);angular.module("template/popover/popover.html",[]).run(["$templateCache",function(n){n.put("template/popover/popover.html",'<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"><\/div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"><\/h3>\n      <div class="popover-content" ng-bind="content"><\/div>\n  <\/div>\n<\/div>\n')}]);angular.module("template/progressbar/bar.html",[]).run(["$templateCache",function(n){n.put("template/progressbar/bar.html",'<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude><\/div>')}]);angular.module("template/progressbar/progress.html",[]).run(["$templateCache",function(n){n.put("template/progressbar/progress.html",'<div class="progress" ng-transclude><\/div>')}]);angular.module("template/progressbar/progressbar.html",[]).run(["$templateCache",function(n){n.put("template/progressbar/progressbar.html",'<div class="progress">\n  <div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude><\/div>\n<\/div>')}]);angular.module("template/rating/rating.html",[]).run(["$templateCache",function(n){n.put("template/rating/rating.html",'<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}">\n    <i ng-repeat="r in range track by $index" ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < value && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')">\n        <span class="sr-only">({{ $index < value ? \'*\' : \' \' }})<\/span>\n    <\/i>\n<\/span>')}]);angular.module("template/tabs/tab.html",[]).run(["$templateCache",function(n){n.put("template/tabs/tab.html",'<li ng-class="{active: active, disabled: disabled}">\n  <a ng-click="select()" tab-heading-transclude>{{heading}}<\/a>\n<\/li>\n')}]);angular.module("template/tabs/tabset-titles.html",[]).run(["$templateCache",function(n){n.put("template/tabs/tabset-titles.html","<ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical}\">\n<\/ul>\n")}]);angular.module("template/tabs/tabset.html",[]).run(["$templateCache",function(n){n.put("template/tabs/tabset.html",'\n<div>\n  <ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude><\/ul>\n  <div class="tab-content">\n    <div class="tab-pane" \n         ng-repeat="tab in tabs" \n         ng-class="{active: tab.active}"\n         tab-content-transclude="tab">\n    <\/div>\n  <\/div>\n<\/div>\n')}]);angular.module("template/timepicker/timepicker.html",[]).run(["$templateCache",function(n){n.put("template/timepicker/timepicker.html",'<table>\n\t<tbody>\n\t\t<tr class="text-center">\n\t\t\t<td><a ng-click="incrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"><\/span><\/a><\/td>\n\t\t\t<td>&nbsp;<\/td>\n\t\t\t<td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"><\/span><\/a><\/td>\n\t\t\t<td ng-show="showMeridian"><\/td>\n\t\t<\/tr>\n\t\t<tr>\n\t\t\t<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n\t\t\t\t<input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n\t\t\t<\/td>\n\t\t\t<td>:<\/td>\n\t\t\t<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n\t\t\t\t<input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">\n\t\t\t<\/td>\n\t\t\t<td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}<\/button><\/td>\n\t\t<\/tr>\n\t\t<tr class="text-center">\n\t\t\t<td><a ng-click="decrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"><\/span><\/a><\/td>\n\t\t\t<td>&nbsp;<\/td>\n\t\t\t<td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"><\/span><\/a><\/td>\n\t\t\t<td ng-show="showMeridian"><\/td>\n\t\t<\/tr>\n\t<\/tbody>\n<\/table>\n')}]);angular.module("template/typeahead/typeahead-match.html",[]).run(["$templateCache",function(n){n.put("template/typeahead/typeahead-match.html",'<a tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"><\/a>')}]);angular.module("template/typeahead/typeahead-popup.html",[]).run(["$templateCache",function(n){n.put("template/typeahead/typeahead-popup.html",'<ul class="dropdown-menu" ng-if="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option" id="{{match.id}}">\n        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"><\/div>\n    <\/li>\n<\/ul>')}]);
/*
//# sourceMappingURL=ui-bootstrap-tpls.min.js.map
*/
///#source 1 1 /Scripts/angular-ui/ui-utils-ieshiv.min.js
/**
 * angular-ui-utils - Swiss-Army-Knife of AngularJS tools (with no external dependencies!)
 * @version v0.1.1 - 2014-02-05
 * @link http://angular-ui.github.com
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(n,t){"use strict";var i=["ngInclude","ngPluralize","ngView","ngSwitch","uiCurrency","uiCodemirror","uiDate","uiEvent","uiKeypress","uiKeyup","uiKeydown","uiMask","uiMapInfoWindow","uiMapMarker","uiMapPolyline","uiMapPolygon","uiMapRectangle","uiMapCircle","uiMapGroundOverlay","uiModal","uiReset","uiScrollfix","uiSelect2","uiShow","uiHide","uiToggle","uiSortable","uiTinymce"],e,r,o,f,u,s,h;for(n.myCustomTags=n.myCustomTags||[],i.push.apply(i,n.myCustomTags),e=function(n){var t=[],e=n.replace(/([A-Z])/g,function(n){return" "+n.toLowerCase()}),u=e.split(" "),f,i,r;return u.length===1?(f=u[0],t.push(f),t.push("x-"+f),t.push("data-"+f)):(i=u[0],r=u.slice(1).join("-"),t.push(i+":"+r),t.push(i+"-"+r),t.push("x-"+i+"-"+r),t.push("data-"+i+"-"+r)),t},r=0,o=i.length;r<o;r++)for(f=e(i[r]),u=0,s=f.length;u<s;u++)h=f[u],t.createElement(h)})(window,document);
/*
//# sourceMappingURL=ui-utils-ieshiv.min.js.map
*/
///#source 1 1 /Scripts/angulartics.min.js
/**
 * @license Angulartics v0.15.20
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(n){"use strict";var t=window.angulartics||(window.angulartics={});t.waitForVendorApi=function(n,i,r,u){u||(u=r,r=undefined);Object.prototype.hasOwnProperty.call(window,n)&&(r===undefined||window[n][r]!==undefined)?u(window[n]):setTimeout(function(){t.waitForVendorApi(n,i,r,u)},i)};n.module("angulartics",[]).provider("$analytics",function(){var r={pageTracking:{autoTrackFirstPage:!0,autoTrackVirtualPages:!0,trackRelativePath:!1,autoBasePath:!1,basePath:"",bufferFlushDelay:1e3},eventTracking:{bufferFlushDelay:1e3}},i={pageviews:[],events:[],setUsername:[],setUserProperties:[],setUserPropertiesOnce:[]},u=function(n){i.pageviews.push(n)},f=function(n,t){i.events.push({name:n,properties:t})},e=function(n){i.setUsername.push(n)},o=function(n){i.setUserProperties.push(n)},s=function(n){i.setUserPropertiesOnce.push(n)},t={settings:r,pageTrack:u,eventTrack:f,setUsername:e,setUserProperties:o,setUserPropertiesOnce:s},h=function(u){t.pageTrack=u;n.forEach(i.pageviews,function(n,i){setTimeout(function(){t.pageTrack(n)},i*r.pageTracking.bufferFlushDelay)})},c=function(u){t.eventTrack=u;n.forEach(i.events,function(n,i){setTimeout(function(){t.eventTrack(n.name,n.properties)},i*r.eventTracking.bufferFlushDelay)})},l=function(u){t.setUsername=u;n.forEach(i.setUsername,function(n,i){setTimeout(function(){t.setUsername(n)},i*r.pageTracking.bufferFlushDelay)})},a=function(u){t.setUserProperties=u;n.forEach(i.setUserProperties,function(n,i){setTimeout(function(){t.setUserProperties(n)},i*r.pageTracking.bufferFlushDelay)})},v=function(u){t.setUserPropertiesOnce=u;n.forEach(i.setUserPropertiesOnce,function(n,i){setTimeout(function(){t.setUserPropertiesOnce(n)},i*r.pageTracking.bufferFlushDelay)})};return{$get:function(){return t},settings:r,virtualPageviews:function(n){this.settings.pageTracking.autoTrackVirtualPages=n},firstPageview:function(n){this.settings.pageTracking.autoTrackFirstPage=n},withBase:function(t){this.settings.pageTracking.basePath=t?n.element("base").attr("href").slice(0,-1):""},withAutoBase:function(n){this.settings.pageTracking.autoBasePath=n},registerPageTrack:h,registerEventTrack:c,registerSetUsername:l,registerSetUserProperties:a,registerSetUserPropertiesOnce:v}}).run(["$rootScope","$location","$window","$analytics","$injector",function(n,t,i,r,u){var f,e,h,o,c,s;if(r.settings.pageTracking.autoTrackFirstPage){if(f=!0,u.has("$route")){e=u.get("$route");for(h in e.routes){f=!1;break}}else if(u.has("$state")){o=u.get("$state");for(c in o.states){f=!1;break}}else f=!1;f&&(r.settings.pageTracking.autoBasePath&&(r.settings.pageTracking.basePath=i.location.pathname),r.settings.trackRelativePath?(s=r.settings.pageTracking.basePath+t.url(),r.pageTrack(s)):r.pageTrack(t.absUrl()))}r.settings.pageTracking.autoTrackVirtualPages&&(r.settings.pageTracking.autoBasePath&&(r.settings.pageTracking.basePath=i.location.pathname+"#"),u.has("$route")&&n.$on("$routeChangeSuccess",function(n,i){if(!i||!(i.$$route||i).redirectTo){var u=r.settings.pageTracking.basePath+t.url();r.pageTrack(u)}}),u.has("$state")&&n.$on("$stateChangeSuccess",function(){var n=r.settings.pageTracking.basePath+t.url();r.pageTrack(n)}))}]).directive("analyticsOn",["$analytics",function(t){function i(n){return["a:","button:","button:button","button:submit","input:button","input:submit"].indexOf(n.tagName.toLowerCase()+":"+(n.type||""))>=0}function r(n){return i(n),"click"}function u(n){return i(n)?n.innerText||n.value:n.id||n.name||n.tagName}function f(n){return n.substr(0,9)==="analytics"&&["On","Event"].indexOf(n.substr(9))===-1}return{restrict:"A",scope:!1,link:function(i,e,o){var s=o.analyticsOn||r(e[0]);n.element(e[0]).bind(s,function(){var r=o.analyticsEvent||u(e[0]),i={};n.forEach(o.$attr,function(n,t){f(t)&&(i[t.slice(9).toLowerCase()]=o[t])});t.eventTrack(r,i)})}}}])})(angular);
/*
//# sourceMappingURL=angulartics.min.js.map
*/
///#source 1 1 /Scripts/angulartics-ga.min.js
/**
 * @license Angulartics v0.15.20
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/willmcclellan
 * License: MIT
 */
(function(n){"use strict";n.module("angulartics.google.analytics",["angulartics"]).config(["$analyticsProvider",function(n){n.settings.trackRelativePath=!0;n.registerPageTrack(function(n){window._gaq&&_gaq.push(["_trackPageview",n]);window.ga&&ga("send","pageview",n)});n.registerEventTrack(function(n,t){if(t.value){var i=parseInt(t.value,10);t.value=isNaN(i)?0:i}window._gaq?_gaq.push(["_trackEvent",t.category,n,t.label,t.value,t.noninteraction]):window.ga&&(t.noninteraction?ga("send","event",t.category,n,t.label,t.value,{nonInteraction:1}):ga("send","event",t.category,n,t.label,t.value))})}])})(angular);
/*
//# sourceMappingURL=angulartics-ga.min.js.map
*/
