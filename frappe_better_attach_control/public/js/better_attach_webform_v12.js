(() => {
  // utils/index.js
  function objectType(v) {
    if (v == null)
      return v === void 0 ? "Undefined" : "Null";
    let t = Object.prototype.toString.call(v).slice(8, -1);
    return t === "Number" && isNaN(v) ? "NaN" : t;
  }
  function ofType(v, t) {
    return objectType(v) === t;
  }
  function ofAny(v, t) {
    return t.split(" ").indexOf(objectType(v)) >= 0;
  }
  function propertyOf(v, k) {
    return Object.prototype.hasOwnProperty.call(v, k);
  }
  function isString(v) {
    return v != null && ofType(v, "String");
  }
  function isObjectLike(v) {
    return v != null && typeof v === "object";
  }
  function isNumber(v) {
    return v != null && ofType(v, "Number") && !isNaN(v);
  }
  function isLength(v) {
    return isNumber(v) && v >= 0 && v % 1 == 0 && v <= 9007199254740991;
  }
  function isInteger(v) {
    return isNumber(v) && v === Number(parseInt(v));
  }
  function isArrayLike(v) {
    return v != null && !$.isFunction(v) && isObjectLike(v) && !$.isWindow(v) && !isInteger(v.nodeType) && isLength(v.length);
  }
  function isFunction(v) {
    return v != null && $.isFunction(v);
  }
  function isArray(v) {
    return v != null && $.isArray(v);
  }
  function isObject(v) {
    return isObjectLike(v) && isObjectLike(Object.getPrototypeOf(Object(v)) || {}) && !ofAny(v, "String Number Boolean Array RegExp Date URL");
  }
  function isPlainObject(v) {
    return v != null && $.isPlainObject(v);
  }
  function isIteratable(v) {
    return isArray(v) || isObject(v);
  }
  function isEmpty(v) {
    if (v == null)
      return true;
    if (isString(v) || isArray(v))
      return !v.length;
    if (isObject(v))
      return $.isEmptyObject(v);
    return !v;
  }
  function isJson(v) {
    return isString(v) && parseJson(v) !== v;
  }
  function isRegExp(v) {
    return v != null && ofType(v, "RegExp");
  }
  function parseJson(v) {
    try {
      return JSON.parse(v);
    } catch (e) {
      return v;
    }
  }
  function toJson(v) {
    try {
      return JSON.stringify(v);
    } catch (e) {
      return "";
    }
  }
  function ifNull(v, d) {
    return v != null ? v : d;
  }
  function deepClone(v) {
    return isIteratable(v) ? parseJson(toJson(v)) : v;
  }
  function each(data, fn, bind) {
    bind = bind || null;
    if (isArrayLike(data)) {
      for (var i = 0, l = data.length; i < l; i++) {
        if (fn.apply(bind, [data[i], i]) === false)
          return;
      }
    } else if (isObject(data)) {
      for (var k in data) {
        if (fn.apply(bind, [data[k], k]) === false)
          return;
      }
    }
  }
  function clear(d) {
    if (isArray(d))
      d.splice(0, d.length);
    else if (isObject(d)) {
      for (let k in d) {
        if (propertyOf(d, k))
          delete d[k];
      }
    }
    return d;
  }
  function toBool(v) {
    return [true, "true", 1, "1"].indexOf(v) >= 0;
  }
  function toArray(v, def) {
    if (isArray(v))
      return v;
    if (def === void 0)
      def = [];
    if (isEmpty(v))
      return def;
    if (isObject(v))
      return Object.values(v);
    if (isJson(v)) {
      v = parseJson(v);
      return isArray(v) ? v : def;
    }
    return [v];
  }
  function fnCall(f, a, b) {
    if (isFunction(f))
      return f.apply(b, toArray(a));
  }
  var FILE_SIZES = ["B", "KB", "MB", "TB", "PB", "EB", "ZB", "YB"];
  function formatSize(v) {
    v = parseFloat(v);
    if (!v)
      return "0 " + FILE_SIZES[0];
    var k = 1024, i = Math.floor(Math.log(v) / Math.log(k)), t = v / Math.pow(k, i);
    if (k - t < 1) {
      i++;
      t = v / Math.pow(k, i);
    }
    return flt(t, 2, "#,###.##") + " " + FILE_SIZES[i];
  }
  function log() {
    var pre = "[Better Attach]: ";
    each(arguments, function(v) {
      if (isString(v))
        console.log(pre + v);
      else
        console.log(pre, v);
    });
  }
  function elog() {
    var pre = "[Better Attach]: ";
    each(arguments, function(v) {
      if (isString(v))
        console.error(pre + v);
      else
        console.error(pre, v);
    });
  }
  function error(text, args, _throw) {
    if (_throw == null && args === true) {
      _throw = args;
      args = null;
    }
    text = "[Better Attach]: " + text;
    if (_throw) {
      frappe.throw(__(text, args));
      return;
    }
    frappe.msgprint({
      title: __("Error"),
      indicator: "Red",
      message: __(text, args)
    });
  }
  function request(method, args, success, failed, always) {
    if (args && isFunction(args)) {
      if (isFunction(failed))
        always = failed;
      if (isFunction(success))
        failed = success;
      success = args;
      args = null;
    }
    let data = { type: args != null ? "POST" : "GET" };
    if (args != null) {
      if (!isPlainObject(args))
        data.args = { "data": args };
      else {
        data.args = args;
        if (args.type && args.args) {
          data.type = args.type;
          data.args = args.args;
        }
      }
    }
    if (isString(method)) {
      data.method = "frappe_better_attach_control.api." + method;
    } else if (isArray(method)) {
      data.doc = method[0];
      data.method = method[1];
    } else {
      elog("The method passed is invalid", arguments);
      return;
    }
    data.error = function(e) {
      fnCall(failed);
      elog("Call error.", e);
      error("Unable to make the call to {0}", [data.method]);
    };
    if (isFunction(success)) {
      data.callback = function(ret) {
        if (ret && isPlainObject(ret))
          ret = ret.message || ret;
        try {
          fnCall(success, ret);
        } catch (e) {
          error(e);
        }
      };
    }
    if (isFunction(always))
      data.always = always;
    try {
      return frappe.call(data);
    } catch (e) {
      error(e);
    }
  }

  // filetypes/audio.js
  var EXTS = "acc adp aif aifc aiff amr au caf dra dts dtshd flac kar lvp m2a m3a m3u m4a mid midi mka mp2 mp2a mp3 m4a mpga opus pya ra ram rip rmi rmp s3m sil snd uva uvva wav wax weba wma xm".split(" ");
  function is_audio(ext) {
    return EXTS.indexOf(ext) >= 0;
  }

  // filetypes/compressed.js
  var EXTS2 = "zip rar gz tar 7z ace cab cfs dgc gca lha lzh boz bz bz2".split(" ");
  function is_compressed(ext) {
    return EXTS2.indexOf(ext) >= 0;
  }

  // filetypes/image.js
  var EXTS3 = "3ds apng avif azv b16 bmp cgm cmx dds djv djvu drle dwg dxf emf exr fbs fh fh4 fh5 fh7 fhc fits fpx fst g3 gif heic heics heif heifs hej2 hsj2 ico ief jhc jls jng jp2 jpe jpeg jpf jpg jpg2 jph jpm jpx jxr jxra jxrs jxs jxsc jxsi jxss ktx ktx2 mdi mmr npx oga ogg pbm pct pcx pgm pic png pnm ppm psd ras rgb rlc sgi sid spx sub svg svgz tga tif tiff uvg uvi uvvg uvvi wbmp wdp webp xbm xif xpm xwd".split(" ");
  function is_image(ext) {
    return EXTS3.indexOf(ext) >= 0;
  }

  // filetypes/pdf.js
  function is_pdf(ext) {
    return ext === "pdf";
  }

  // filetypes/presentation.js
  var EXTS4 = "gslides odp otp pot potm potx ppam pps ppsm ppsx ppt pptm pptx sldm sldx".split(" ");
  function is_presentation(ext) {
    return EXTS4.indexOf(ext) >= 0;
  }

  // filetypes/spreadsheet.js
  var EXTS5 = "csv gsheet ods ots xla xlam xlc xlm xls xlsb xlsm xlsx xlt xltm xltx xlw xml".split(" ");
  function is_spreadsheet(ext) {
    return EXTS5.indexOf(ext) >= 0;
  }

  // filetypes/text.js
  var EXTS6 = "conf def in ini list log text txt".split(" ");
  function is_text(ext) {
    return EXTS6.indexOf(ext) >= 0;
  }

  // filetypes/video.js
  var EXTS7 = "3g2 3gp 3gpp asf asx avi dvb f4v fli flv fvt h261 h263 h264 jpgm jpgv m1v m2v m4u m4v mj2 mjp2 mk3d mks mkv mng mov movie mp4 mp4v mpe mpeg mpg mpg4 mxu ogv pyv qt smv uvh uvm uvp uvs uvu uvv uvvh uvvm uvvp uvvm uvvu uvvv viv vob webm wm wmv wmx wvx".split(" ");
  function is_video(ext) {
    return EXTS7.indexOf(ext) >= 0;
  }

  // filetypes/word.js
  var EXTS8 = "abw clkw doc docm docx dot dotm dotx gdoc kwd kwt lwp odt ott wpd".split(" ");
  function is_word(ext) {
    return EXTS8.indexOf(ext) >= 0;
  }

  // filetypes/types.js
  var EXTS9 = {
    "123": "application/vnd.lotus-1-2-3",
    "1km": "application/vnd.1000minds.decision-model+xml",
    "3dml": "text/vnd.in3d.3dml",
    "3ds": "image/x-3ds",
    "3g2": "video/3gpp2",
    "3gp": "video/3gpp",
    "3gpp": "video/3gpp",
    "3mf": "model/3mf",
    "7z": "application/x-7z-compressed",
    "aab": "application/x-authorware-bin",
    "aac": "audio/x-aac",
    "aam": "application/x-authorware-map",
    "aas": "application/x-authorware-seg",
    "abw": "application/x-abiword",
    "ac": "application/pkix-attr-cert",
    "acc": "application/vnd.americandynamics.acc",
    "ace": "application/x-ace-compressed",
    "acu": "application/vnd.acucobol",
    "acutc": "application/vnd.acucorp",
    "adp": "audio/adpcm",
    "aep": "application/vnd.audiograph",
    "afm": "application/x-font-type1",
    "afp": "application/vnd.ibm.modcap",
    "ahead": "application/vnd.ahead.space",
    "ai": "application/postscript",
    "aif": "audio/x-aiff",
    "aifc": "audio/x-aiff",
    "aiff": "audio/x-aiff",
    "air": "application/vnd.adobe.air-application-installer-package+zip",
    "ait": "application/vnd.dvb.ait",
    "ami": "application/vnd.amiga.ami",
    "amr": "audio/amr",
    "apk": "application/vnd.android.package-archive",
    "apng": "image/apng",
    "appcache": "text/cache-manifest",
    "application": "application/x-ms-application",
    "apr": "application/vnd.lotus-approach",
    "arc": "application/x-freearc",
    "arj": "application/x-arj",
    "asc": "application/pgp-signature",
    "asf": "video/x-ms-asf",
    "asm": "text/x-asm",
    "aso": "application/vnd.accpac.simply.aso",
    "asx": "video/x-ms-asf",
    "atc": "application/vnd.acucorp",
    "atom": "application/atom+xml",
    "atomcat": "application/atomcat+xml",
    "atomdeleted": "application/atomdeleted+xml",
    "atomsvc": "application/atomsvc+xml",
    "atx": "application/vnd.antix.game-component",
    "au": "audio/basic",
    "avi": "video/x-msvideo",
    "avif": "image/avif",
    "aw": "application/applixware",
    "azf": "application/vnd.airzip.filesecure.azf",
    "azs": "application/vnd.airzip.filesecure.azs",
    "azv": "image/vnd.airzip.accelerator.azv",
    "azw": "application/vnd.amazon.ebook",
    "b16": "image/vnd.pco.b16",
    "bat": "application/x-msdownload",
    "bcpio": "application/x-bcpio",
    "bdf": "application/x-font-bdf",
    "bdm": "application/vnd.syncml.dm+wbxml",
    "bdoc": "application/bdoc",
    "bed": "application/vnd.realvnc.bed",
    "bh2": "application/vnd.fujitsu.oasysprs",
    "bin": "application/octet-stream",
    "blb": "application/x-blorb",
    "blorb": "application/x-blorb",
    "bmi": "application/vnd.bmi",
    "bmml": "application/vnd.balsamiq.bmml+xml",
    "bmp": "image/bmp",
    "book": "application/vnd.framemaker",
    "box": "application/vnd.previewsystems.box",
    "boz": "application/x-bzip2",
    "bpk": "application/octet-stream",
    "bsp": "model/vnd.valve.source.compiled-map",
    "btif": "image/prs.btif",
    "buffer": "application/octet-stream",
    "bz": "application/x-bzip",
    "bz2": "application/x-bzip2",
    "c": "text/x-c",
    "c11amc": "application/vnd.cluetrust.cartomobile-config",
    "c11amz": "application/vnd.cluetrust.cartomobile-config-pkg",
    "c4d": "application/vnd.clonk.c4group",
    "c4f": "application/vnd.clonk.c4group",
    "c4g": "application/vnd.clonk.c4group",
    "c4p": "application/vnd.clonk.c4group",
    "c4u": "application/vnd.clonk.c4group",
    "cab": "application/vnd.ms-cab-compressed",
    "caf": "audio/x-caf",
    "cap": "application/vnd.tcpdump.pcap",
    "car": "application/vnd.curl.car",
    "cat": "application/vnd.ms-pki.seccat",
    "cb7": "application/x-cbr",
    "cba": "application/x-cbr",
    "cbr": "application/x-cbr",
    "cbt": "application/x-cbr",
    "cbz": "application/x-cbr",
    "cc": "text/x-c",
    "cco": "application/x-cocoa",
    "cct": "application/x-director",
    "ccxml": "application/ccxml+xml",
    "cdbcmsg": "application/vnd.contact.cmsg",
    "cdf": "application/x-netcdf",
    "cdfx": "application/cdfx+xml",
    "cdkey": "application/vnd.mediastation.cdkey",
    "cdmia": "application/cdmi-capability",
    "cdmic": "application/cdmi-container",
    "cdmid": "application/cdmi-domain",
    "cdmio": "application/cdmi-object",
    "cdmiq": "application/cdmi-queue",
    "cdx": "chemical/x-cdx",
    "cdxml": "application/vnd.chemdraw+xml",
    "cdy": "application/vnd.cinderella",
    "cer": "application/pkix-cert",
    "cfs": "application/x-cfs-compressed",
    "cgm": "image/cgm",
    "chat": "application/x-chat",
    "chm": "application/vnd.ms-htmlhelp",
    "chrt": "application/vnd.kde.kchart",
    "cif": "chemical/x-cif",
    "cii": "application/vnd.anser-web-certificate-issue-initiation",
    "cil": "application/vnd.ms-artgalry",
    "cjs": "application/node",
    "cla": "application/vnd.claymore",
    "class": "application/java-vm",
    "clkk": "application/vnd.crick.clicker.keyboard",
    "clkp": "application/vnd.crick.clicker.palette",
    "clkt": "application/vnd.crick.clicker.template",
    "clkw": "application/vnd.crick.clicker.wordbank",
    "clkx": "application/vnd.crick.clicker",
    "clp": "application/x-msclip",
    "cmc": "application/vnd.cosmocaller",
    "cmdf": "chemical/x-cmdf",
    "cml": "chemical/x-cml",
    "cmp": "application/vnd.yellowriver-custom-menu",
    "cmx": "image/x-cmx",
    "cod": "application/vnd.rim.cod",
    "coffee": "text/coffeescript",
    "com": "application/x-msdownload",
    "conf": "text/plain",
    "cpio": "application/x-cpio",
    "cpp": "text/x-c",
    "cpt": "application/mac-compactpro",
    "crd": "application/x-mscardfile",
    "crl": "application/pkix-crl",
    "crt": "application/x-x509-ca-cert",
    "crx": "application/x-chrome-extension",
    "cryptonote": "application/vnd.rig.cryptonote",
    "csh": "application/x-csh",
    "csl": "application/vnd.citationstyles.style+xml",
    "csml": "chemical/x-csml",
    "csp": "application/vnd.commonspace",
    "css": "text/css",
    "cst": "application/x-director",
    "csv": "text/csv",
    "cu": "application/cu-seeme",
    "curl": "text/vnd.curl",
    "cww": "application/prs.cww",
    "cxt": "application/x-director",
    "cxx": "text/x-c",
    "dae": "model/vnd.collada+xml",
    "daf": "application/vnd.mobius.daf",
    "dart": "application/vnd.dart",
    "dataless": "application/vnd.fdsn.seed",
    "davmount": "application/davmount+xml",
    "dbf": "application/vnd.dbf",
    "dbk": "application/docbook+xml",
    "dcr": "application/x-director",
    "dcurl": "text/vnd.curl.dcurl",
    "dd2": "application/vnd.oma.dd2+xml",
    "ddd": "application/vnd.fujixerox.ddd",
    "ddf": "application/vnd.syncml.dmddf+xml",
    "dds": "image/vnd.ms-dds",
    "deb": "application/x-debian-package",
    "def": "text/plain",
    "deploy": "application/octet-stream",
    "der": "application/x-x509-ca-cert",
    "dfac": "application/vnd.dreamfactory",
    "dgc": "application/x-dgc-compressed",
    "dic": "text/x-c",
    "dir": "application/x-director",
    "dis": "application/vnd.mobius.dis",
    "dist": "application/octet-stream",
    "distz": "application/octet-stream",
    "djv": "image/vnd.djvu",
    "djvu": "image/vnd.djvu",
    "dll": "application/x-msdownload",
    "dmg": "application/x-apple-diskimage",
    "dmp": "application/vnd.tcpdump.pcap",
    "dms": "application/octet-stream",
    "dna": "application/vnd.dna",
    "doc": "application/msword",
    "docm": "application/vnd.ms-word.document.macroenabled.12",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "dot": "application/msword",
    "dotm": "application/vnd.ms-word.template.macroenabled.12",
    "dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "dp": "application/vnd.osgi.dp",
    "dpg": "application/vnd.dpgraph",
    "dra": "audio/vnd.dra",
    "drle": "image/dicom-rle",
    "dsc": "text/prs.lines.tag",
    "dssc": "application/dssc+der",
    "dtb": "application/x-dtbook+xml",
    "dtd": "application/xml-dtd",
    "dts": "audio/vnd.dts",
    "dtshd": "audio/vnd.dts.hd",
    "dump": "application/octet-stream",
    "dvb": "video/vnd.dvb.file",
    "dvi": "application/x-dvi",
    "dwd": "application/atsc-dwd+xml",
    "dwf": "model/vnd.dwf",
    "dwg": "image/vnd.dwg",
    "dxf": "image/vnd.dxf",
    "dxp": "application/vnd.spotfire.dxp",
    "dxr": "application/x-director",
    "ear": "application/java-archive",
    "ecelp4800": "audio/vnd.nuera.ecelp4800",
    "ecelp7470": "audio/vnd.nuera.ecelp7470",
    "ecelp9600": "audio/vnd.nuera.ecelp9600",
    "ecma": "application/ecmascript",
    "edm": "application/vnd.novadigm.edm",
    "edx": "application/vnd.novadigm.edx",
    "efif": "application/vnd.picsel",
    "ei6": "application/vnd.pg.osasli",
    "elc": "application/octet-stream",
    "emf": "image/emf",
    "eml": "message/rfc822",
    "emma": "application/emma+xml",
    "emotionml": "application/emotionml+xml",
    "emz": "application/x-msmetafile",
    "eol": "audio/vnd.digital-winds",
    "eot": "application/vnd.ms-fontobject",
    "eps": "application/postscript",
    "epub": "application/epub+zip",
    "es": "application/ecmascript",
    "es3": "application/vnd.eszigno3+xml",
    "esa": "application/vnd.osgi.subsystem",
    "esf": "application/vnd.epson.esf",
    "et3": "application/vnd.eszigno3+xml",
    "etx": "text/x-setext",
    "eva": "application/x-eva",
    "evy": "application/x-envoy",
    "exe": "application/x-msdownload",
    "exi": "application/exi",
    "exr": "image/aces",
    "ext": "application/vnd.novadigm.ext",
    "ez": "application/andrew-inset",
    "ez2": "application/vnd.ezpix-album",
    "ez3": "application/vnd.ezpix-package",
    "f": "text/x-fortran",
    "f4v": "video/x-f4v",
    "f77": "text/x-fortran",
    "f90": "text/x-fortran",
    "fbs": "image/vnd.fastbidsheet",
    "fcdt": "application/vnd.adobe.formscentral.fcdt",
    "fcs": "application/vnd.isac.fcs",
    "fdf": "application/vnd.fdf",
    "fe_launch": "application/vnd.denovo.fcselayout-link",
    "fg5": "application/vnd.fujitsu.oasysgp",
    "fgd": "application/x-director",
    "fh": "image/x-freehand",
    "fh4": "image/x-freehand",
    "fh5": "image/x-freehand",
    "fh7": "image/x-freehand",
    "fhc": "image/x-freehand",
    "fig": "application/x-xfig",
    "fits": "image/fits",
    "flac": "audio/x-flac",
    "fli": "video/x-fli",
    "flo": "application/vnd.micrografx.flo",
    "flv": "video/x-flv",
    "flw": "application/vnd.kde.kivio",
    "flx": "text/vnd.fmi.flexstor",
    "fly": "text/vnd.fly",
    "fm": "application/vnd.framemaker",
    "fnc": "application/vnd.frogans.fnc",
    "fo": "application/vnd.software602.filler.form+xml",
    "for": "text/x-fortran",
    "fpx": "image/vnd.fpx",
    "frame": "application/vnd.framemaker",
    "fsc": "application/vnd.fsc.weblaunch",
    "fst": "image/vnd.fst",
    "ftc": "application/vnd.fluxtime.clip",
    "fti": "application/vnd.anser-web-funds-transfer-initiation",
    "fvt": "video/vnd.fvt",
    "fxp": "application/vnd.adobe.fxp",
    "fxpl": "application/vnd.adobe.fxp",
    "fzs": "application/vnd.fuzzysheet",
    "g2w": "application/vnd.geoplan",
    "g3": "image/g3fax",
    "g3w": "application/vnd.geospace",
    "gac": "application/vnd.groove-account",
    "gam": "application/x-tads",
    "gbr": "application/rpki-ghostbusters",
    "gca": "application/x-gca-compressed",
    "gdl": "model/vnd.gdl",
    "gdoc": "application/vnd.google-apps.document",
    "geo": "application/vnd.dynageo",
    "geojson": "application/geo+json",
    "gex": "application/vnd.geometry-explorer",
    "ggb": "application/vnd.geogebra.file",
    "ggt": "application/vnd.geogebra.tool",
    "ghf": "application/vnd.groove-help",
    "gif": "image/gif",
    "gim": "application/vnd.groove-identity-message",
    "glb": "model/gltf-binary",
    "gltf": "model/gltf+json",
    "gml": "application/gml+xml",
    "gmx": "application/vnd.gmx",
    "gnumeric": "application/x-gnumeric",
    "gph": "application/vnd.flographit",
    "gpx": "application/gpx+xml",
    "gqf": "application/vnd.grafeq",
    "gqs": "application/vnd.grafeq",
    "gram": "application/srgs",
    "gramps": "application/x-gramps-xml",
    "gre": "application/vnd.geometry-explorer",
    "grv": "application/vnd.groove-injector",
    "grxml": "application/srgs+xml",
    "gsf": "application/x-font-ghostscript",
    "gsheet": "application/vnd.google-apps.spreadsheet",
    "gslides": "application/vnd.google-apps.presentation",
    "gtar": "application/x-gtar",
    "gtm": "application/vnd.groove-tool-message",
    "gtw": "model/vnd.gtw",
    "gv": "text/vnd.graphviz",
    "gxf": "application/gxf",
    "gxt": "application/vnd.geonext",
    "gz": "application/gzip",
    "h": "text/x-c",
    "h261": "video/h261",
    "h263": "video/h263",
    "h264": "video/h264",
    "hal": "application/vnd.hal+xml",
    "hbci": "application/vnd.hbci",
    "hbs": "text/x-handlebars-template",
    "hdd": "application/x-virtualbox-hdd",
    "hdf": "application/x-hdf",
    "heic": "image/heic",
    "heics": "image/heic-sequence",
    "heif": "image/heif",
    "heifs": "image/heif-sequence",
    "hej2": "image/hej2k",
    "held": "application/atsc-held+xml",
    "hh": "text/x-c",
    "hjson": "application/hjson",
    "hlp": "application/winhlp",
    "hpgl": "application/vnd.hp-hpgl",
    "hpid": "application/vnd.hp-hpid",
    "hps": "application/vnd.hp-hps",
    "hqx": "application/mac-binhex40",
    "hsj2": "image/hsj2",
    "htc": "text/x-component",
    "htke": "application/vnd.kenameaapp",
    "htm": "text/html",
    "html": "text/html",
    "hvd": "application/vnd.yamaha.hv-dic",
    "hvp": "application/vnd.yamaha.hv-voice",
    "hvs": "application/vnd.yamaha.hv-script",
    "i2g": "application/vnd.intergeo",
    "icc": "application/vnd.iccprofile",
    "ice": "x-conference/x-cooltalk",
    "icm": "application/vnd.iccprofile",
    "ico": "image/x-icon",
    "ics": "text/calendar",
    "ief": "image/ief",
    "ifb": "text/calendar",
    "ifm": "application/vnd.shana.informed.formdata",
    "iges": "model/iges",
    "igl": "application/vnd.igloader",
    "igm": "application/vnd.insors.igm",
    "igs": "model/iges",
    "igx": "application/vnd.micrografx.igx",
    "iif": "application/vnd.shana.informed.interchange",
    "img": "application/octet-stream",
    "imp": "application/vnd.accpac.simply.imp",
    "ims": "application/vnd.ms-ims",
    "in": "text/plain",
    "ini": "text/plain",
    "ink": "application/inkml+xml",
    "inkml": "application/inkml+xml",
    "install": "application/x-install-instructions",
    "iota": "application/vnd.astraea-software.iota",
    "ipfix": "application/ipfix",
    "ipk": "application/vnd.shana.informed.package",
    "irm": "application/vnd.ibm.rights-management",
    "irp": "application/vnd.irepository.package+xml",
    "iso": "application/x-iso9660-image",
    "itp": "application/vnd.shana.informed.formtemplate",
    "its": "application/its+xml",
    "ivp": "application/vnd.immervision-ivp",
    "ivu": "application/vnd.immervision-ivu",
    "jad": "text/vnd.sun.j2me.app-descriptor",
    "jade": "text/jade",
    "jam": "application/vnd.jam",
    "jar": "application/java-archive",
    "jardiff": "application/x-java-archive-diff",
    "java": "text/x-java-source",
    "jhc": "image/jphc",
    "jisp": "application/vnd.jisp",
    "jls": "image/jls",
    "jlt": "application/vnd.hp-jlyt",
    "jng": "image/x-jng",
    "jnlp": "application/x-java-jnlp-file",
    "joda": "application/vnd.joost.joda-archive",
    "jp2": "image/jp2",
    "jpe": "image/jpeg",
    "jpeg": "image/jpeg",
    "jpf": "image/jpx",
    "jpg": "image/jpeg",
    "jpg2": "image/jp2",
    "jpgm": "video/jpm",
    "jpgv": "video/jpeg",
    "jph": "image/jph",
    "jpm": "image/jpm",
    "jpx": "image/jpx",
    "js": "application/javascript",
    "json": "application/json",
    "json5": "application/json5",
    "jsonld": "application/ld+json",
    "jsonml": "application/jsonml+json",
    "jsx": "text/jsx",
    "jxr": "image/jxr",
    "jxra": "image/jxra",
    "jxrs": "image/jxrs",
    "jxs": "image/jxs",
    "jxsc": "image/jxsc",
    "jxsi": "image/jxsi",
    "jxss": "image/jxss",
    "kar": "audio/midi",
    "karbon": "application/vnd.kde.karbon",
    "kdbx": "application/x-keepass2",
    "key": "application/vnd.apple.keynote",
    "kfo": "application/vnd.kde.kformula",
    "kia": "application/vnd.kidspiration",
    "kml": "application/vnd.google-earth.kml+xml",
    "kmz": "application/vnd.google-earth.kmz",
    "kne": "application/vnd.kinar",
    "knp": "application/vnd.kinar",
    "kon": "application/vnd.kde.kontour",
    "kpr": "application/vnd.kde.kpresenter",
    "kpt": "application/vnd.kde.kpresenter",
    "kpxx": "application/vnd.ds-keypoint",
    "ksp": "application/vnd.kde.kspread",
    "ktr": "application/vnd.kahootz",
    "ktx": "image/ktx",
    "ktx2": "image/ktx2",
    "ktz": "application/vnd.kahootz",
    "kwd": "application/vnd.kde.kword",
    "kwt": "application/vnd.kde.kword",
    "lasxml": "application/vnd.las.las+xml",
    "latex": "application/x-latex",
    "lbd": "application/vnd.llamagraphics.life-balance.desktop",
    "lbe": "application/vnd.llamagraphics.life-balance.exchange+xml",
    "les": "application/vnd.hhe.lesson-player",
    "lha": "application/x-lzh-compressed",
    "link66": "application/vnd.route66.link66+xml",
    "list": "text/plain",
    "list3820": "application/vnd.ibm.modcap",
    "listafp": "application/vnd.ibm.modcap",
    "lnk": "application/x-ms-shortcut",
    "log": "text/plain",
    "lostxml": "application/lost+xml",
    "lrf": "application/octet-stream",
    "lrm": "application/vnd.ms-lrm",
    "ltf": "application/vnd.frogans.ltf",
    "lvp": "audio/vnd.lucent.voice",
    "lwp": "application/vnd.lotus-wordpro",
    "lzh": "application/x-lzh-compressed",
    "m13": "application/x-msmediaview",
    "m14": "application/x-msmediaview",
    "m1v": "video/mpeg",
    "m21": "application/mp21",
    "m2a": "audio/mpeg",
    "m2v": "video/mpeg",
    "m3a": "audio/mpeg",
    "m3u": "audio/x-mpegurl",
    "m3u8": "application/vnd.apple.mpegurl",
    "m4a": "audio/mp4",
    "m4u": "video/vnd.mpegurl",
    "m4v": "video/x-m4v",
    "ma": "application/mathematica",
    "mads": "application/mads+xml",
    "mag": "application/vnd.ecowin.chart",
    "maker": "application/vnd.framemaker",
    "man": "text/troff",
    "map": "application/json",
    "mar": "application/octet-stream",
    "mathml": "application/mathml+xml",
    "mb": "application/mathematica",
    "mbk": "application/vnd.mobius.mbk",
    "mbox": "application/mbox",
    "mc1": "application/vnd.medcalcdata",
    "mcd": "application/vnd.mcd",
    "mcurl": "text/vnd.curl.mcurl",
    "mdb": "application/x-msaccess",
    "mdi": "image/vnd.ms-modi",
    "me": "text/troff",
    "mesh": "model/mesh",
    "meta4": "application/metalink4+xml",
    "metalink": "application/metalink+xml",
    "mets": "application/mets+xml",
    "mfm": "application/vnd.mfmp",
    "mft": "application/rpki-manifest",
    "mgp": "application/vnd.osgeo.mapguide.package",
    "mgz": "application/vnd.proteus.magazine",
    "mid": "audio/midi",
    "midi": "audio/midi",
    "mie": "application/x-mie",
    "mif": "application/vnd.mif",
    "mime": "message/rfc822",
    "mj2": "video/mj2",
    "mjp2": "video/mj2",
    "mk3d": "video/x-matroska",
    "mka": "audio/x-matroska",
    "mks": "video/x-matroska",
    "mkv": "video/x-matroska",
    "mlp": "application/vnd.dolby.mlp",
    "mmd": "application/vnd.chipnuts.karaoke-mmd",
    "mmf": "application/vnd.smaf",
    "mmr": "image/vnd.fujixerox.edmics-mmr",
    "mng": "video/x-mng",
    "mny": "application/x-msmoney",
    "mobi": "application/x-mobipocket-ebook",
    "mods": "application/mods+xml",
    "mov": "video/quicktime",
    "movie": "video/x-sgi-movie",
    "mp2": "audio/mpeg",
    "mp21": "application/mp21",
    "mp2a": "audio/mpeg",
    "mp3": "audio/mpeg",
    "mp4": "video/mp4",
    "mp4a": "audio/mp4",
    "mp4s": "application/mp4",
    "mp4v": "video/mp4",
    "mpc": "application/vnd.mophun.certificate",
    "mpe": "video/mpeg",
    "mpeg": "video/mpeg",
    "mpg": "video/mpeg",
    "mpg4": "video/mp4",
    "mpga": "audio/mpeg",
    "mpkg": "application/vnd.apple.installer+xml",
    "mpm": "application/vnd.blueice.multipass",
    "mpn": "application/vnd.mophun.application",
    "mpp": "application/vnd.ms-project",
    "mpt": "application/vnd.ms-project",
    "mpy": "application/vnd.ibm.minipay",
    "mqy": "application/vnd.mobius.mqy",
    "mrc": "application/marc",
    "mrcx": "application/marcxml+xml",
    "ms": "text/troff",
    "mscml": "application/mediaservercontrol+xml",
    "mseed": "application/vnd.fdsn.mseed",
    "mseq": "application/vnd.mseq",
    "msf": "application/vnd.epson.msf",
    "msh": "model/mesh",
    "msi": "application/x-msdownload",
    "msl": "application/vnd.mobius.msl",
    "msty": "application/vnd.muvee.style",
    "mts": "model/vnd.mts",
    "mus": "application/vnd.musician",
    "musicxml": "application/vnd.recordare.musicxml+xml",
    "mvb": "application/x-msmediaview",
    "mwf": "application/vnd.mfer",
    "mxf": "application/mxf",
    "mxl": "application/vnd.recordare.musicxml",
    "mxml": "application/xv+xml",
    "mxs": "application/vnd.triscape.mxs",
    "mxu": "video/vnd.mpegurl",
    "n-gage": "application/vnd.nokia.n-gage.symbian.install",
    "n3": "text/n3",
    "nb": "application/mathematica",
    "nbp": "application/vnd.wolfram.player",
    "nc": "application/x-netcdf",
    "ncx": "application/x-dtbncx+xml",
    "nfo": "text/x-nfo",
    "ngdat": "application/vnd.nokia.n-gage.data",
    "nitf": "application/vnd.nitf",
    "nlu": "application/vnd.neurolanguage.nlu",
    "nml": "application/vnd.enliven",
    "nnd": "application/vnd.noblenet-directory",
    "nns": "application/vnd.noblenet-sealer",
    "nnw": "application/vnd.noblenet-web",
    "npx": "image/vnd.net-fpx",
    "nsc": "application/x-conference",
    "nsf": "application/vnd.lotus-notes",
    "ntf": "application/vnd.nitf",
    "nzb": "application/x-nzb",
    "oa2": "application/vnd.fujitsu.oasys2",
    "oa3": "application/vnd.fujitsu.oasys3",
    "oas": "application/vnd.fujitsu.oasys",
    "obd": "application/x-msbinder",
    "obj": "application/x-tgif",
    "oda": "application/oda",
    "odb": "application/vnd.oasis.opendocument.database",
    "odc": "application/vnd.oasis.opendocument.chart",
    "odf": "application/vnd.oasis.opendocument.formula",
    "odft": "application/vnd.oasis.opendocument.formula-template",
    "odg": "application/vnd.oasis.opendocument.graphics",
    "odi": "application/vnd.oasis.opendocument.image",
    "odm": "application/vnd.oasis.opendocument.text-master",
    "odp": "application/vnd.oasis.opendocument.presentation",
    "ods": "application/vnd.oasis.opendocument.spreadsheet",
    "odt": "application/vnd.oasis.opendocument.text",
    "oga": "image/vnd.dece.graphic",
    "ogg": "image/vnd.dece.graphic",
    "ogv": "video/ogg",
    "ogx": "application/ogg",
    "omdoc": "application/omdoc+xml",
    "onepkg": "application/onenote",
    "onetmp": "application/onenote",
    "onetoc": "application/onenote",
    "onetoc2": "application/onenote",
    "opf": "application/oebps-package+xml",
    "opml": "text/x-opml",
    "oprc": "application/vnd.palm",
    "opus": "audio/ogg",
    "org": "application/vnd.lotus-organizer",
    "osf": "application/vnd.yamaha.openscoreformat",
    "osfpvg": "application/vnd.yamaha.openscoreformat.osfpvg+xml",
    "otc": "application/vnd.oasis.opendocument.chart-template",
    "otf": "font/otf",
    "otg": "application/vnd.oasis.opendocument.graphics-template",
    "oth": "application/vnd.oasis.opendocument.text-web",
    "oti": "application/vnd.oasis.opendocument.image-template",
    "otp": "application/vnd.oasis.opendocument.presentation-template",
    "ots": "application/vnd.oasis.opendocument.spreadsheet-template",
    "ott": "application/vnd.oasis.opendocument.text-template",
    "oxps": "application/oxps",
    "oxt": "application/vnd.openofficeorg.extension",
    "p": "text/x-pascal",
    "p10": "application/pkcs10",
    "p12": "application/x-pkcs12",
    "p7b": "application/x-pkcs7-certificates",
    "p7c": "application/pkcs7-mime",
    "p7m": "application/pkcs7-mime",
    "p7r": "application/x-pkcs7-certreqresp",
    "p7s": "application/pkcs7-signature",
    "p8": "application/pkcs8",
    "pas": "text/x-pascal",
    "paw": "application/vnd.pawaafile",
    "pbd": "application/vnd.powerbuilder6",
    "pbm": "image/x-portable-bitmap",
    "pcap": "application/vnd.tcpdump.pcap",
    "pcf": "application/x-font-pcf",
    "pcl": "application/vnd.hp-pcl",
    "pclxl": "application/vnd.hp-pclxl",
    "pct": "image/x-pict",
    "pcurl": "application/vnd.curl.pcurl",
    "pcx": "image/x-pcx",
    "pdb": "application/vnd.palm",
    "pdf": "application/pdf",
    "pfa": "application/x-font-type1",
    "pfb": "application/x-font-type1",
    "pfm": "application/x-font-type1",
    "pfr": "application/font-tdpfr",
    "pfx": "application/x-pkcs12",
    "pgm": "image/x-portable-graymap",
    "pgn": "application/x-chess-pgn",
    "pgp": "application/pgp-encrypted",
    "pic": "image/x-pict",
    "pkg": "application/octet-stream",
    "pki": "application/pkixcmp",
    "pkipath": "application/pkix-pkipath",
    "plb": "application/vnd.3gpp.pic-bw-large",
    "plc": "application/vnd.mobius.plc",
    "plf": "application/vnd.pocketlearn",
    "pls": "application/pls+xml",
    "pml": "application/vnd.ctc-posml",
    "png": "image/png",
    "pnm": "image/x-portable-anymap",
    "portpkg": "application/vnd.macports.portpkg",
    "pot": "application/vnd.ms-powerpoint",
    "potm": "application/vnd.ms-powerpoint.template.macroenabled.12",
    "potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
    "ppam": "application/vnd.ms-powerpoint.addin.macroenabled.12",
    "ppd": "application/vnd.cups-ppd",
    "ppm": "image/x-portable-pixmap",
    "pps": "application/vnd.ms-powerpoint",
    "ppsm": "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
    "ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "ppt": "application/vnd.ms-powerpoint",
    "pptm": "application/vnd.ms-powerpoint.presentation.macroenabled.12",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "pqa": "application/vnd.palm",
    "prc": "application/x-mobipocket-ebook",
    "pre": "application/vnd.lotus-freelance",
    "prf": "application/pics-rules",
    "ps": "application/postscript",
    "psb": "application/vnd.3gpp.pic-bw-small",
    "psd": "image/vnd.adobe.photoshop",
    "psf": "application/x-font-linux-psf",
    "pskcxml": "application/pskc+xml",
    "ptid": "application/vnd.pvi.ptid1",
    "pub": "application/x-mspublisher",
    "pvb": "application/vnd.3gpp.pic-bw-var",
    "pwn": "application/vnd.3m.post-it-notes",
    "pya": "audio/vnd.ms-playready.media.pya",
    "pyv": "video/vnd.ms-playready.media.pyv",
    "qam": "application/vnd.epson.quickanime",
    "qbo": "application/vnd.intu.qbo",
    "qfx": "application/vnd.intu.qfx",
    "qps": "application/vnd.publishare-delta-tree",
    "qt": "video/quicktime",
    "qwd": "application/vnd.quark.quarkxpress",
    "qwt": "application/vnd.quark.quarkxpress",
    "qxb": "application/vnd.quark.quarkxpress",
    "qxd": "application/vnd.quark.quarkxpress",
    "qxl": "application/vnd.quark.quarkxpress",
    "qxt": "application/vnd.quark.quarkxpress",
    "ra": "audio/x-pn-realaudio",
    "ram": "audio/x-pn-realaudio",
    "rar": "application/x-rar-compressed",
    "ras": "image/x-cmu-raster",
    "rcprofile": "application/vnd.ipunplugged.rcprofile",
    "rdf": "application/rdf+xml",
    "rdz": "application/vnd.data-vision.rdz",
    "rep": "application/vnd.businessobjects",
    "res": "application/x-dtbresource+xml",
    "rgb": "image/x-rgb",
    "rif": "application/reginfo+xml",
    "rip": "audio/vnd.rip",
    "ris": "application/x-research-info-systems",
    "rl": "application/resource-lists+xml",
    "rlc": "image/vnd.fujixerox.edmics-rlc",
    "rld": "application/resource-lists-diff+xml",
    "rm": "application/vnd.rn-realmedia",
    "rmi": "audio/midi",
    "rmp": "audio/x-pn-realaudio-plugin",
    "rms": "application/vnd.jcp.javame.midlet-rms",
    "rmvb": "application/vnd.rn-realmedia-vbr",
    "rnc": "application/relax-ng-compact-syntax",
    "roa": "application/rpki-roa",
    "roff": "text/troff",
    "rp9": "application/vnd.cloanto.rp9",
    "rpss": "application/vnd.nokia.radio-presets",
    "rpst": "application/vnd.nokia.radio-preset",
    "rq": "application/sparql-query",
    "rs": "application/rls-services+xml",
    "rsd": "application/rsd+xml",
    "rss": "application/rss+xml",
    "rtf": "application/rtf",
    "rtx": "text/richtext",
    "s": "text/x-asm",
    "s3m": "audio/s3m",
    "saf": "application/vnd.yamaha.smaf-audio",
    "sbml": "application/sbml+xml",
    "sc": "application/vnd.ibm.secure-container",
    "scd": "application/x-msschedule",
    "scm": "application/vnd.lotus-screencam",
    "scq": "application/scvp-cv-request",
    "scs": "application/scvp-cv-response",
    "scurl": "text/vnd.curl.scurl",
    "sda": "application/vnd.stardivision.draw",
    "sdc": "application/vnd.stardivision.calc",
    "sdd": "application/vnd.stardivision.impress",
    "sdkd": "application/vnd.solent.sdkm+xml",
    "sdkm": "application/vnd.solent.sdkm+xml",
    "sdp": "application/sdp",
    "sdw": "application/vnd.stardivision.writer",
    "see": "application/vnd.seemail",
    "seed": "application/vnd.fdsn.seed",
    "sema": "application/vnd.sema",
    "semd": "application/vnd.semd",
    "semf": "application/vnd.semf",
    "ser": "application/java-serialized-object",
    "setpay": "application/set-payment-initiation",
    "setreg": "application/set-registration-initiation",
    "sfd-hdstx": "application/vnd.hydrostatix.sof-data",
    "sfs": "application/vnd.spotfire.sfs",
    "sfv": "text/x-sfv",
    "sgi": "image/sgi",
    "sgl": "application/vnd.stardivision.writer-global",
    "sgm": "text/sgml",
    "sgml": "text/sgml",
    "sh": "application/x-sh",
    "shar": "application/x-shar",
    "shf": "application/shf+xml",
    "sid": "image/x-mrsid-image",
    "sig": "application/pgp-signature",
    "sil": "audio/silk",
    "silo": "model/mesh",
    "sis": "application/vnd.symbian.install",
    "sisx": "application/vnd.symbian.install",
    "sit": "application/x-stuffit",
    "sitx": "application/x-stuffitx",
    "skd": "application/vnd.koan",
    "skm": "application/vnd.koan",
    "skp": "application/vnd.koan",
    "skt": "application/vnd.koan",
    "sldm": "application/vnd.ms-powerpoint.slide.macroenabled.12",
    "sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
    "slt": "application/vnd.epson.salt",
    "sm": "application/vnd.stepmania.stepchart",
    "smf": "application/vnd.stardivision.math",
    "smi": "application/smil+xml",
    "smil": "application/smil+xml",
    "smv": "video/x-smv",
    "smzip": "application/vnd.stepmania.package",
    "snd": "audio/basic",
    "snf": "application/x-font-snf",
    "so": "application/octet-stream",
    "spc": "application/x-pkcs7-certificates",
    "spf": "application/vnd.yamaha.smaf-phrase",
    "spl": "application/x-futuresplash",
    "spot": "text/vnd.in3d.spot",
    "spp": "application/scvp-vp-response",
    "spq": "application/scvp-vp-request",
    "spx": "image/vnd.dece.graphic",
    "sql": "application/x-sql",
    "src": "application/x-wais-source",
    "srt": "application/x-subrip",
    "sru": "application/sru+xml",
    "srx": "application/sparql-results+xml",
    "ssdl": "application/ssdl+xml",
    "sse": "application/vnd.kodak-descriptor",
    "ssf": "application/vnd.epson.ssf",
    "ssml": "application/ssml+xml",
    "st": "application/vnd.sailingtracker.track",
    "stc": "application/vnd.sun.xml.calc.template",
    "std": "application/vnd.sun.xml.draw.template",
    "stf": "application/vnd.wt.stf",
    "sti": "application/vnd.sun.xml.impress.template",
    "stk": "application/hyperstudio",
    "stl": "application/vnd.ms-pki.stl",
    "str": "application/vnd.pg.format",
    "stw": "application/vnd.sun.xml.writer.template",
    "sub": "text/vnd.dvb.subtitle",
    "sus": "application/vnd.sus-calendar",
    "susp": "application/vnd.sus-calendar",
    "sv4cpio": "application/x-sv4cpio",
    "sv4crc": "application/x-sv4crc",
    "svc": "application/vnd.dvb.service",
    "svd": "application/vnd.svd",
    "svg": "image/svg+xml",
    "svgz": "image/svg+xml",
    "swa": "application/x-director",
    "swf": "application/x-shockwave-flash",
    "swi": "application/vnd.aristanetworks.swi",
    "sxc": "application/vnd.sun.xml.calc",
    "sxd": "application/vnd.sun.xml.draw",
    "sxg": "application/vnd.sun.xml.writer.global",
    "sxi": "application/vnd.sun.xml.impress",
    "sxm": "application/vnd.sun.xml.math",
    "sxw": "application/vnd.sun.xml.writer",
    "t": "text/troff",
    "t3": "application/x-t3vm-image",
    "taglet": "application/vnd.mynfc",
    "tao": "application/vnd.tao.intent-module-archive",
    "tar": "application/x-tar",
    "tcap": "application/vnd.3gpp2.tcap",
    "tcl": "application/x-tcl",
    "teacher": "application/vnd.smart.teacher",
    "tei": "application/tei+xml",
    "teicorpus": "application/tei+xml",
    "tex": "application/x-tex",
    "texi": "application/x-texinfo",
    "texinfo": "application/x-texinfo",
    "text": "text/plain",
    "tfi": "application/thraud+xml",
    "tfm": "application/x-tex-tfm",
    "tga": "image/x-tga",
    "thmx": "application/vnd.ms-officetheme",
    "tif": "image/tiff",
    "tiff": "image/tiff",
    "tmo": "application/vnd.tmobile-livetv",
    "torrent": "application/x-bittorrent",
    "tpl": "application/vnd.groove-tool-template",
    "tpt": "application/vnd.trid.tpt",
    "tr": "text/troff",
    "tra": "application/vnd.trueapp",
    "trm": "application/x-msterminal",
    "tsd": "application/timestamped-data",
    "tsv": "text/tab-separated-values",
    "ttc": "font/collection",
    "ttf": "font/ttf",
    "ttl": "text/turtle",
    "twd": "application/vnd.simtech-mindmapper",
    "twds": "application/vnd.simtech-mindmapper",
    "txd": "application/vnd.genomatix.tuxedo",
    "txf": "application/vnd.mobius.txf",
    "txt": "text/plain",
    "u32": "application/x-authorware-bin",
    "udeb": "application/x-debian-package",
    "ufd": "application/vnd.ufdl",
    "ufdl": "application/vnd.ufdl",
    "ulx": "application/x-glulx",
    "umj": "application/vnd.umajin",
    "unityweb": "application/vnd.unity",
    "uoml": "application/vnd.uoml+xml",
    "uri": "text/uri-list",
    "uris": "text/uri-list",
    "urls": "text/uri-list",
    "ustar": "application/x-ustar",
    "utz": "application/vnd.uiq.theme",
    "uu": "text/x-uuencode",
    "uva": "audio/vnd.dece.audio",
    "uvd": "application/vnd.dece.data",
    "uvf": "application/vnd.dece.data",
    "uvg": "image/vnd.dece.graphic",
    "uvh": "video/vnd.dece.hd",
    "uvi": "image/vnd.dece.graphic",
    "uvm": "video/vnd.dece.mobile",
    "uvp": "video/vnd.dece.pd",
    "uvs": "video/vnd.dece.sd",
    "uvt": "application/vnd.dece.ttml+xml",
    "uvu": "video/vnd.uvvu.mp4",
    "uvv": "video/vnd.dece.video",
    "uvva": "audio/vnd.dece.audio",
    "uvvd": "application/vnd.dece.data",
    "uvvf": "application/vnd.dece.data",
    "uvvg": "image/vnd.dece.graphic",
    "uvvh": "video/vnd.dece.hd",
    "uvvi": "image/vnd.dece.graphic",
    "uvvm": "video/vnd.dece.mobile",
    "uvvp": "video/vnd.dece.pd",
    "uvvs": "video/vnd.dece.sd",
    "uvvt": "application/vnd.dece.ttml+xml",
    "uvvu": "video/vnd.uvvu.mp4",
    "uvvv": "video/vnd.dece.video",
    "uvvx": "application/vnd.dece.unspecified",
    "uvvz": "application/vnd.dece.zip",
    "uvx": "application/vnd.dece.unspecified",
    "uvz": "application/vnd.dece.zip",
    "vcard": "text/vcard",
    "vcd": "application/x-cdlink",
    "vcf": "text/x-vcard",
    "vcg": "application/vnd.groove-vcard",
    "vcs": "text/x-vcalendar",
    "vcx": "application/vnd.vcx",
    "vis": "application/vnd.visionary",
    "viv": "video/vnd.vivo",
    "vob": "video/x-ms-vob",
    "vor": "application/vnd.stardivision.writer",
    "vox": "application/x-authorware-bin",
    "vrml": "model/vrml",
    "vsd": "application/vnd.visio",
    "vsf": "application/vnd.vsf",
    "vss": "application/vnd.visio",
    "vst": "application/vnd.visio",
    "vsw": "application/vnd.visio",
    "vtu": "model/vnd.vtu",
    "vxml": "application/voicexml+xml",
    "w3d": "application/x-director",
    "wad": "application/x-doom",
    "wav": "audio/x-wav",
    "wax": "audio/x-ms-wax",
    "wbmp": "image/vnd.wap.wbmp",
    "wbs": "application/vnd.criticaltools.wbs+xml",
    "wbxml": "application/vnd.wap.wbxml",
    "wcm": "application/vnd.ms-works",
    "wdb": "application/vnd.ms-works",
    "wdp": "image/vnd.ms-photo",
    "weba": "audio/webm",
    "webm": "video/webm",
    "webp": "image/webp",
    "wg": "application/vnd.pmi.widget",
    "wgt": "application/widget",
    "wks": "application/vnd.ms-works",
    "wm": "video/x-ms-wm",
    "wma": "audio/x-ms-wma",
    "wmd": "application/x-ms-wmd",
    "wmf": "application/x-msmetafile",
    "wml": "text/vnd.wap.wml",
    "wmlc": "application/vnd.wap.wmlc",
    "wmls": "text/vnd.wap.wmlscript",
    "wmlsc": "application/vnd.wap.wmlscriptc",
    "wmv": "video/x-ms-wmv",
    "wmx": "video/x-ms-wmx",
    "wmz": "application/x-msmetafile",
    "woff": "font/woff",
    "woff2": "font/woff2",
    "wpd": "application/vnd.wordperfect",
    "wpl": "application/vnd.ms-wpl",
    "wps": "application/vnd.ms-works",
    "wqd": "application/vnd.wqd",
    "wri": "application/x-mswrite",
    "wrl": "model/vrml",
    "wsdl": "application/wsdl+xml",
    "wspolicy": "application/wspolicy+xml",
    "wtb": "application/vnd.webturbo",
    "wvx": "video/x-ms-wvx",
    "x32": "application/x-authorware-bin",
    "x3d": "model/x3d+xml",
    "x3db": "model/x3d+binary",
    "x3dbz": "model/x3d+binary",
    "x3dv": "model/x3d+vrml",
    "x3dvz": "model/x3d+vrml",
    "x3dz": "model/x3d+xml",
    "xaml": "application/xaml+xml",
    "xap": "application/x-silverlight-app",
    "xar": "application/vnd.xara",
    "xbap": "application/x-ms-xbap",
    "xbd": "application/vnd.fujixerox.docuworks.binder",
    "xbm": "image/x-xbitmap",
    "xdf": "application/xcap-diff+xml",
    "xdm": "application/vnd.syncml.dm+xml",
    "xdp": "application/vnd.adobe.xdp+xml",
    "xdssc": "application/dssc+xml",
    "xdw": "application/vnd.fujixerox.docuworks",
    "xenc": "application/xenc+xml",
    "xer": "application/patch-ops-error+xml",
    "xfdf": "application/vnd.adobe.xfdf",
    "xfdl": "application/vnd.xfdl",
    "xht": "application/xhtml+xml",
    "xhtml": "application/xhtml+xml",
    "xhvml": "application/xv+xml",
    "xif": "image/vnd.xiff",
    "xla": "application/vnd.ms-excel",
    "xlam": "application/vnd.ms-excel.addin.macroenabled.12",
    "xlc": "application/vnd.ms-excel",
    "xlf": "application/x-xliff+xml",
    "xlm": "application/vnd.ms-excel",
    "xls": "application/vnd.ms-excel",
    "xlsb": "application/vnd.ms-excel.sheet.binary.macroenabled.12",
    "xlsm": "application/vnd.ms-excel.sheet.macroenabled.12",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xlt": "application/vnd.ms-excel",
    "xltm": "application/vnd.ms-excel.template.macroenabled.12",
    "xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    "xlw": "application/vnd.ms-excel",
    "xm": "audio/xm",
    "xml": "application/xml",
    "xo": "application/vnd.olpc-sugar",
    "xop": "application/xop+xml",
    "xpi": "application/x-xpinstall",
    "xpl": "application/xproc+xml",
    "xpm": "image/x-xpixmap",
    "xpr": "application/vnd.is-xpr",
    "xps": "application/vnd.ms-xpsdocument",
    "xpw": "application/vnd.intercon.formnet",
    "xpx": "application/vnd.intercon.formnet",
    "xsl": "application/xml",
    "xslt": "application/xslt+xml",
    "xsm": "application/vnd.syncml+xml",
    "xspf": "application/xspf+xml",
    "xul": "application/vnd.mozilla.xul+xml",
    "xvm": "application/xv+xml",
    "xvml": "application/xv+xml",
    "xwd": "image/x-xwindowdump",
    "xyz": "chemical/x-xyz",
    "xz": "application/x-xz",
    "yang": "application/yang",
    "yin": "application/yin+xml",
    "z1": "application/x-zmachine",
    "z2": "application/x-zmachine",
    "z3": "application/x-zmachine",
    "z4": "application/x-zmachine",
    "z5": "application/x-zmachine",
    "z6": "application/x-zmachine",
    "z7": "application/x-zmachine",
    "z8": "application/x-zmachine",
    "zaz": "application/vnd.zzazz.deck+xml",
    "zip": "application/zip",
    "zir": "application/vnd.zul",
    "zirz": "application/vnd.zul",
    "zmm": "application/vnd.handheld-entertainment+xml"
  };
  function get_type(ext) {
    return EXTS9[ext];
  }

  // filetypes/index.js
  function get_filename(path) {
    return path.split("#")[0].split("?")[0].split("/").pop();
  }
  function get_file_ext(path) {
    return get_filename(path).split(".").pop();
  }
  var _CLASSES = [
    "audio",
    "compressed",
    "image",
    "pdf",
    "presentation",
    "spreadsheet",
    "video",
    "word",
    "text",
    "other"
  ];
  function get_icon_class(ext) {
    if (is_audio(ext))
      return _CLASSES[0];
    if (is_compressed(ext))
      return _CLASSES[1];
    if (is_image(ext))
      return _CLASSES[2];
    if (is_pdf(ext))
      return _CLASSES[3];
    if (is_presentation(ext))
      return _CLASSES[4];
    if (is_spreadsheet(ext))
      return _CLASSES[5];
    if (is_video(ext))
      return _CLASSES[6];
    if (is_word(ext))
      return _CLASSES[7];
    if (is_text(ext))
      return _CLASSES[8];
    return _CLASSES[9];
  }
  function set_file_info(obj) {
    obj.class = get_icon_class(obj.extension);
    obj.can_preview = [0, 2, 6].indexOf(_CLASSES.indexOf(obj.class));
    return obj;
  }
  function to_images_list(v) {
    var ret = [];
    v.forEach(function(d) {
      d = d.toLowerCase();
      if (d[0] === ".")
        d = d.substring(1, d.length);
      if (is_image(d) && ret.indexOf(d) < 0)
        ret.push(d);
    });
    return ret;
  }
  function get_file_type(ext) {
    return get_type(ext);
  }

  // uploader/v12/index.js
  frappe.ui.FileUploader = class FileUploader extends frappe.ui.FileUploader {
    constructor(opts) {
      opts = isPlainObject(opts) ? opts : {};
      var extra2 = opts.extra || {};
      delete opts.extra;
      super(opts);
      if (this.uploader)
        this._override_uploader(opts, extra2);
    }
    _override_uploader(opts) {
      var up = this.uploader, me = this;
      up._extra_restrictions = extra;
      up.$watch("show_file_browser", function(show_file_browser) {
        if (!show_file_browser || !up.$refs.file_browser)
          return;
        me._override_file_browser(
          up.$refs.file_browser,
          !isEmpty(opts.restrictions) ? opts.restrictions : {
            max_file_size: null,
            max_number_of_files: null,
            allowed_file_types: []
          },
          extra
        );
      });
      if (!isEmpty(opts.restrictions))
        up.restrictions.as_public = !!opts.restrictions.as_public;
      up.dropfiles = function(e) {
        up.is_dragging = false;
        if (isObject(e) && isObject(e.dataTransfer))
          up.add_files(e.dataTransfer.files);
      };
      up.check_restrictions = function(file) {
        var max_file_size = up.restrictions.max_file_size, { allowed_file_types = [], allowed_filename } = up._extra_restrictions, is_correct_type = true, valid_file_size = true, valid_filename = true;
        if (!isEmpty(allowed_file_types)) {
          is_correct_type = allowed_file_types.some(function(type) {
            if (isRegExp(type))
              return file.type && type.test(file.type);
            if (type.includes("/"))
              return file.type && file.type === type;
            if (type[0] === ".")
              return (file.name || file.file_name).endsWith(type);
            return false;
          });
        }
        if (max_file_size && file.size != null && file.size) {
          valid_file_size = file.size < max_file_size;
        }
        if (allowed_filename) {
          if (isRegExp(allowed_filename)) {
            valid_filename = file.name.match(allowed_filename);
          } else if (!isEmpty(allowed_filename)) {
            valid_filename = allowed_filename === file.name;
          }
        }
        if (!is_correct_type) {
          console.warn("File skipped because of invalid file type", file);
          frappe.show_alert({
            message: __('File "{0}" was skipped because of invalid file type', [file.name]),
            indicator: "orange"
          });
        }
        if (!valid_file_size) {
          console.warn("File skipped because of invalid file size", file.size, file);
          frappe.show_alert({
            message: __('File "{0}" was skipped because size exceeds {1} MB', [file.name, max_file_size / (1024 * 1024)]),
            indicator: "orange"
          });
        }
        if (!valid_filename) {
          console.warn("File skipped because of invalid filename", file, allowed_filename);
          frappe.show_alert({
            message: __('File "{0}" was skipped because of invalid filename', [file.name]),
            indicator: "orange"
          });
        }
        return is_correct_type && valid_file_size && valid_filename;
      };
      up.show_max_files_number_warning = function(file, max_number_of_files) {
        console.warn(
          "File skipped because it exceeds the allowed specified limit of " + max_number_of_files + " uploads",
          file
        );
        if (up.doctype) {
          MSG = __(
            'File "{0}" was skipped because only {1} uploads are allowed for DocType "{2}"',
            [file.name, max_number_of_files, up.doctype]
          );
        } else {
          MSG = __(
            'File "{0}" was skipped because only {1} uploads are allowed',
            [file.name, max_number_of_files]
          );
        }
        frappe.show_alert({
          message: MSG,
          indicator: "orange"
        });
      };
      up.prepare_files = function(file_array) {
        var is_single = isPlainObject(file_array), files = is_single ? [file_array] : Array.from(file_array);
        files = files.map(function(f) {
          if (f.name == null)
            f.name = f.file_name || get_filename(f.file_url);
          if (f.type == null)
            f.type = get_file_type(get_file_ext(f.file_url)) || "";
          if (f.size == null)
            f.size = 0;
          return f;
        });
        files = files.filter(up.check_restrictions);
        if (isEmpty(files))
          return !is_single ? [] : null;
        files = files.map(function(file) {
          var is_image2 = file.type.startsWith("image");
          return {
            file_obj: file,
            is_image: is_image2,
            name: file.name,
            doc: null,
            progress: 0,
            total: 0,
            failed: false,
            uploading: false,
            private: !up.restrictions.as_public || !is_image2
          };
        });
        return !is_single ? files : files[0];
      };
      up.add_files = function(file_array) {
        var files = up.prepare_files(file_array), max_number_of_files = up.restrictions.max_number_of_files;
        if (max_number_of_files) {
          var uploaded = (up.files || []).length, total = uploaded + files.length;
          if (total > max_number_of_files) {
            var slice_index = max_number_of_files - uploaded - 1;
            files.slice(slice_index).forEach(function(file) {
              up.show_max_files_number_warning(file, max_number_of_files);
            });
            files = files.slice(0, max_number_of_files);
          }
        }
        up.files = up.files.concat(files);
      };
      up.upload_via_web_link = function() {
        var file_url = up.$refs.web_link.url;
        if (!file_url) {
          error("Invalid URL");
          return Promise.reject();
        }
        file_url = decodeURI(file_url);
        var file = up.prepare_files({ file_url });
        return file ? up.upload_file(file) : Promise.reject();
      };
    }
    _override_file_browser(fb, opts, extra2) {
      fb._restrictions = opts;
      fb._extra_restrictions = extra2;
      fb.check_restrictions = function(file) {
        if (file.is_folder)
          return true;
        var max_file_size = fb._restrictions.max_file_size, { allowed_file_types = [], allowed_filename } = fb._extra_restrictions, is_correct_type = true, valid_file_size = true, valid_filename = true;
        if (!isEmpty(allowed_file_types)) {
          is_correct_type = allowed_file_types.some(function(type) {
            if (isRegExp(type))
              return file.type && type.test(file.type);
            if (type.includes("/"))
              return file.type && file.type === type;
            if (type[0] === ".")
              return (file.name || file.file_name).endsWith(type);
            return false;
          });
        }
        if (max_file_size && file.size != null && file.size) {
          valid_file_size = file.size < max_file_size;
        }
        if (allowed_filename) {
          if (isRegExp(allowed_filename)) {
            valid_filename = file.name.match(allowed_filename);
          } else if (!isEmpty(allowed_filename)) {
            valid_filename = allowed_filename === file.name;
          }
        }
        if (!is_correct_type) {
          console.warn("File skipped because of invalid file type", file);
          frappe.show_alert({
            message: __('File "{0}" was skipped because of invalid file type', [file.name]),
            indicator: "orange"
          });
        }
        if (!valid_file_size) {
          console.warn("File skipped because of invalid file size", file.size, file);
          frappe.show_alert({
            message: __('File "{0}" was skipped because size exceeds {1} MB', [file.name, max_file_size / (1024 * 1024)]),
            indicator: "orange"
          });
        }
        if (!valid_filename) {
          console.warn("File skipped because of invalid filename", file, allowed_filename);
          frappe.show_alert({
            message: __('File "{0}" was skipped because of invalid filename', [file.name]),
            indicator: "orange"
          });
        }
        return is_correct_type && valid_file_size && valid_filename;
      };
      fb.get_files_in_folder = function(folder) {
        return frappe.call(
          "frappe_better_attach_control.api.get_files_in_folder",
          { folder }
        ).then(function(r) {
          var files = r.message || [];
          if (!isEmpty(files)) {
            files = files.map(function(f) {
              if (f.name == null)
                f.name = f.file_name || get_filename(f.file_url);
              if (f.type == null)
                f.type = get_file_type(get_file_ext(f.file_url)) || "";
              if (f.size == null)
                f.size = 0;
              return f;
            });
            files = files.filter(fb.check_restrictions);
            files.sort(function(a, b) {
              if (a.is_folder && b.is_folder) {
                return a.modified < b.modified ? -1 : 1;
              }
              if (a.is_folder)
                return -1;
              if (b.is_folder)
                return 1;
              return 0;
            });
            files = files.map(function(file) {
              var filename = file.file_name || file.name;
              return {
                label: frappe.utils.file_name_ellipsis(filename, 40),
                filename,
                file_url: file.file_url,
                value: file.name,
                is_leaf: !file.is_folder,
                fetched: !file.is_folder,
                children: [],
                open: false,
                fetching: false,
                filtered: true
              };
            });
          }
          return files;
        });
      };
    }
  };

  // controls/v12/attach.js
  frappe.ui.form.ControlAttach = frappe.ui.form.ControlAttach.extend({
    make: function() {
      this._super();
      this._setup_control();
      this._update_options();
    },
    make_input: function() {
      this._setup_control();
      this._update_options();
      this._super();
      this._toggle_remove_button();
      this._setup_display();
    },
    clear_attachment: function() {
      if (!this._allow_remove)
        return;
      var me = this;
      if (!this.frm) {
        if (this._value.length) {
          this._remove_files(this._value, function(ret) {
            if (!cint(ret))
              error("Unable to clear the uploaded attachments.");
            else
              me._reset_input();
          });
        } else
          this._reset_input();
        return;
      }
      this._prevent_input = true;
      this._remove_files(this._value, function(ret) {
        if (!cint(ret)) {
          error("Unable to clear the uploaded attachments.");
          return;
        }
        each(me._value, function(v) {
          var fid = me.frm.attachments.get_file_id_from_file_url(v);
          if (fid)
            me.frm.attachments.remove_fileid(fid);
        });
        me.frm.sidebar.reload_docinfo();
        me.parse_validate_and_set_in_model(null);
        me._prevent_input = false;
        me._reset_value();
        me.refresh();
        me.frm.doc.docstatus == 1 ? me.frm.save("Update") : me.frm.save();
      }, function() {
        me._prevent_input = false;
      });
    },
    on_attach_click: function() {
      this.set_upload_options();
      this.file_uploader = new frappe.ui.FileUploader(this.upload_options);
    },
    set_upload_options: function() {
      if (this.upload_options)
        return;
      this._update_options();
      if (this._options)
        this.df.options = this._options;
      this._super();
      if (this._options)
        this.df.options = this._df_options;
      if (this._images_only) {
        this.upload_options = function(options) {
          var opts = deepClone(options);
          if (isEmpty(opts.restrictions.allowed_file_types)) {
            opts.restrictions.allowed_file_types = ["image/*"];
          } else {
            opts.restrictions.allowed_file_types = to_images_list(toArray(opts.restrictions.allowed_file_types));
          }
          return opts;
        }(this.upload_options);
        this._parse_allowed_file_types(this.upload_options);
      }
    },
    set_value: function(value, force_set_value = false) {
      if (this._prevent_input)
        return Promise.resolve();
      value = this._set_value(value);
      if (!this.frm)
        this._updating_input = true;
      return this._super(value, force_set_value);
    },
    set_input: function(value, dataurl) {
      if (this._prevent_input)
        return;
      if (this._updating_input) {
        this._updating_input = false;
        if (this._value.length)
          this._update_input();
        return;
      }
      var me = this;
      if (value === null) {
        if (this._value.length) {
          this._remove_files(this._value, function(ret) {
            if (!cint(ret))
              error("Unable to delete the uploaded attachments.");
            else
              me._reset_value();
          });
        } else
          this._reset_value();
        return;
      }
      if (isEmpty(value))
        return;
      var val = toArray(value, null);
      if (isArray(val)) {
        if (!val.length)
          return;
        var update = 0;
        if (!this._allow_multiple) {
          value = val[0];
          if (!isEmpty(value) && isString(value) && this._value.indexOf(value) < 0) {
            this._set_value(value);
            update = 1;
          }
        } else {
          each(val, function(v) {
            if (!isEmpty(v) && isString(v) && me._value.indexOf(value) < 0) {
              me._set_value(v);
              update = 1;
            }
          });
        }
        if (update)
          this._update_input();
        return;
      }
      if (!isString(value))
        return;
      this.value = this._set_value(value);
      this._update_input(value, dataurl);
    },
    on_upload_complete: function(attachment) {
      if (this.frm) {
        this.parse_validate_and_set_in_model(attachment.file_url);
        this.frm.attachments.update_attachment(attachment);
        if (this._allow_multiple) {
          var up = this.file_uploader && this.file_uploader.uploader;
          if (up && up.files && up.files.every(function(file) {
            return !file.failed;
          })) {
            this.frm.doc.docstatus == 1 ? this.frm.save("Update") : this.frm.save();
          }
        } else {
          this.frm.doc.docstatus == 1 ? this.frm.save("Update") : this.frm.save();
        }
      }
      this.set_input(attachment.file_url);
    },
    refresh: function() {
      this._super();
      if (this._df_options !== this.df.options)
        this._df_options = this.df.options;
      this._update_options();
      this.set_input(toArray(this.value));
    },
    // Custom Methods
    enable_remove: function() {
      this._allow_remove = true;
      this._toggle_remove_button();
    },
    disable_remove: function() {
      this._allow_remove = false;
      this._toggle_remove_button();
    },
    show_files: function() {
      this._dialog && this._dialog_fn && this._dialog_fn.show();
    },
    set_options: function(opts) {
      if (isPlainObject(opts)) {
        this.df.better_attach_options = opts;
        this._update_options();
      }
    },
    // Private Methods
    _setup_control: function() {
      if (this._is_better)
        return;
      this._is_better = 1;
      this._df_options = this.df.options;
      this._options = null;
      this._latest_options = null;
      this._value = [];
      this._files = [];
      this._allow_multiple = false;
      this._max_attachments = {};
      this._allow_remove = true;
      this._display_ready = false;
      this._prevent_input = false;
      this._updating_input = false;
    },
    _update_options: function() {
      if (this._options === null && isEmpty(this.df.better_attach_options) || this._options !== null && this._latest_options === this.df.better_attach_options)
        return;
      this._latest_options = this.df.better_attach_options;
      var opts = !isEmpty(this._latest_options) && parseJson(this._latest_options);
      opts = !isEmpty(opts) && isPlainObject(opts) ? this._parse_options(opts) : {};
      this._options = opts.options || null;
      this._reload_control(opts);
    },
    _parse_options: function(opts) {
      var tmp = { options: { restrictions: {}, extra: {} } };
      tmp.allow_remove = toBool(ifNull(opts.allow_remove, true));
      function parseVal(v, t) {
        if (isEmpty(v))
          v = null;
        if (t === "s" && v) {
          v = cstr(v);
          v = v.length ? v : null;
        } else if (t === "b")
          v = toBool(ifNull(v, false));
        else if (t === "i" && v) {
          v = cint(v);
          if (isNaN(v) || v < 1)
            v = null;
        } else if (t === "a")
          v = toArray(v);
        else if (t === "r" && v && !isRegExp(v)) {
          v = cstr(v);
          if (v.length)
            v = v[0] === "/" ? new RegExp(v) : v;
          else
            v = null;
        }
        return v;
      }
      each(
        [
          ["upload_notes", "s"],
          ["allow_multiple", "b"],
          ["disable_file_browser", "b"]
        ],
        function(k) {
          tmp.options[k[0]] = parseVal(opts[k[0]], k[1]);
        }
      );
      each(
        [
          ["max_file_size", "i"],
          ["allowed_file_types", "a"],
          ["max_number_of_files", "i"],
          ["as_public", "b"]
        ],
        function(k) {
          tmp.options.restrictions[k[0]] = parseVal(opts[k[0]], k[1]);
        }
      );
      each(
        [
          ["allowed_filename", "r"]
        ],
        function(k) {
          tmp.options.extra[k[0]] = parseVal(opts[k[0]], k[1]);
        }
      );
      this._parse_allowed_file_types(tmp.options);
      return tmp;
    },
    _parse_allowed_file_types: function(opts) {
      var types = [];
      if (!isEmpty(opts.restrictions.allowed_file_types)) {
        each(opts.restrictions.allowed_file_types, function(t, i) {
          if (isRegExp(t)) {
            opts.restrictions.allowed_file_types.splice(i, 1);
          } else if (isString(t) && (t[0] === "$" || t.includes("/*"))) {
            if (t[0] === "$")
              t = t.substring(1);
            t = t.replace("/*", "/(.*?)");
            t = new RegExp(t);
          }
          types.push(t);
        });
      }
      opts.extra.allowed_file_types = types;
    },
    _reload_control: function(opts) {
      if (this.upload_options)
        this.upload_options = null;
      if (this._display_ready) {
        if (ifNull(opts.allow_remove, true) !== this._allow_remove) {
          if (!this._allow_remove)
            this.enable_remove();
          else
            this.disable_remove();
        }
      }
      var allow_multiple = ifNull((this._options || {}).allow_multiple, false);
      if (allow_multiple === this._allow_multiple)
        return;
      this._allow_multiple = allow_multiple;
      this._set_max_attachments();
      if (!this._display_ready)
        return;
      this._setup_display();
      if (!this._value.length)
        return;
      var value = this._value.pop();
      if (this._allow_multiple) {
        this._reset_value();
        this.set_input(value);
      } else {
        if (this._value.length) {
          var failed = 0;
          this._remove_files(this._value, function(ret) {
            if (!cint(ret))
              failed++;
          });
          if (failed)
            error("Unable to delete the uploaded attachments.");
        }
        this._reset_value();
        this.set_input(value);
      }
    },
    _set_value: function(value) {
      if (this._value.indexOf(value) >= 0)
        return value;
      this._value.push(value);
      if (this._allow_multiple) {
        this.value = toJson(this._value);
        this._add_file(value, this._value.length - 1);
        value = this.value;
      }
      return value;
    },
    _set_max_attachments: function() {
      if (!this.frm)
        return;
      var meta = frappe.get_meta(this.frm.doctype);
      if (!this._allow_multiple || !isPlainObject(this._options) || isEmpty(this._options.restrictions.max_number_of_files)) {
        if (meta && this._max_attachments.meta != null)
          meta.max_attachments = this._max_attachments.meta;
        if (this.frm.meta && this._max_attachments.fmeta != null)
          this.frm.meta.max_attachments = this._max_attachments.fmeta;
        return;
      }
      var val = this._options.restrictions.max_number_of_files;
      if (meta && val > cint(meta.max_attachments)) {
        if (this._max_attachments.meta == null)
          this._max_attachments.meta = meta.max_attachments;
        meta.max_attachments = val;
      }
      if (this.frm.meta && val > cint(this.frm.meta.max_attachments)) {
        if (this._max_attachments.fmeta == null)
          this._max_attachments.fmeta = this.frm.meta.max_attachments;
        this.frm.meta.max_attachments = val;
      }
    },
    _setup_display: function() {
      if (this.layout && this.layout.grid_row) {
        log("Field is in a grid row");
      }
      this._display_ready = true;
      if (this._allow_multiple) {
        this._setup_dialog();
        return;
      }
      if (this._images_only)
        this._setup_popover();
      else
        this._setup_preview();
    },
    _setup_popover: function() {
      var url = this.value;
      $(this.$value.find("a.attached-file-link").get(0)).popover({
        trigger: "hover",
        placement: "top",
        content: function() {
          return `<div>
                    <img src="${url}" style="width:150px!important;height:auto;object-fit:contain"/>
                </div>`;
        },
        html: true
      });
    },
    _add_file: function(value, idx) {
      if (!this._dialog)
        return;
      var val = {
        name: null,
        file_name: get_filename(value),
        file_url: value,
        extension: null,
        type: null,
        size: 0,
        size_str: "",
        "class": "other"
      };
      this._files[idx] = val;
      if (this.file_uploader && this.file_uploader.uploader) {
        each(this.file_uploader.uploader.files || [], function(f) {
          if (f.doc && f.doc.file_url === val.file_url) {
            val.name = f.doc.name;
            if (f.file_obj) {
              if (!isEmpty(f.file_obj.file_name)) {
                val.file_name = f.file_obj.file_name;
                val.extension = get_file_ext(val.file_name);
                if (isEmpty(f.file_obj.type)) {
                  val.type = get_file_type(val.extension);
                }
                val = set_file_info(val);
              }
              if (!isEmpty(f.file_obj.type)) {
                val.type = f.file_obj.type.toLowerCase().split(";")[0];
              }
              if (!isEmpty(f.file_obj.size)) {
                val.size = f.file_obj.size;
                val.size_str = formatSize(val.size);
              }
            }
            return false;
          }
        });
      }
      if (isEmpty(val.extension)) {
        val.extension = get_file_ext(val.file_name);
        val = set_file_info(val);
      }
      if (isEmpty(val.type)) {
        val.type = get_file_type(val.extension);
      }
      if (isEmpty(val.name) && this.frm) {
        var me = this;
        frappe.db.get_value("File", { file_url: val.file_url }, "name", function(ret) {
          if (isPlainObject(ret) && ret.name) {
            val.name = ret.name;
            me.frm.attachments.update_attachment(val);
          }
          me._add_file_to_dialog(val, idx);
        });
      } else
        this._add_file_to_dialog(val, idx);
    },
    _add_file_to_dialog: function(file, idx) {
      if (!this._dialog)
        return;
      var meta = [];
      if (file.size && file.size_str)
        meta.push(__("Size") + ": " + file.size_str);
      if (file.type)
        meta.push(__("Type") + ": " + file.type);
      if (meta.length) {
        meta = meta.join("  -  ");
        meta = `<div class="d-block ba-meta mt-1">${meta}</div>`;
      } else {
        meta = "";
      }
      var dom = $(`
            <div class="col-12 p-1 ba-attachment" data-file-idx="${idx}">
                <div class="card">
                    <div class="card-body p-1">
                        <div class="row d-flex align-items-center">
                            <div class="col">
                                <div class="row">
                                    <div class="col-auto d-flex align-items-center">
                                        <div class="ba-file ba-${file.class}"></div>
                                    </div>
                                    <div class="col p-0 d-flex flex-column justify-content-center">
                                        <div class="d-block">
                                            <a href="${file.file_url}" class="ba-link ba-filename" target="__blank">
                                                <span class="fa fa-link ba-file-link"></span>
                                                ${file.file_name}
                                            </a>
                                        </div>
                                        ${meta}
                                    </div>
                                </div>
                            </div>
                            <div class="col-auto px-4">
                                <button type="button" class="ba-preview btn btn-info btn-xs mx-0 px-2">
                                    <span class="fa fa-search text-white"></span>
                                </button>
                                <button type="button" class="ba-remove btn btn-danger btn-xs mx-0">
                                    <span class="fa fa-times text-white"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).appendTo(this._files_row).data("idx", idx);
      if (!file.can_preview) {
        dom.find("div.ba-preview").addClass("disabled").data("disabled", 1);
      }
      if (!this._allow_remove) {
        dom.find("div.ba-remove").addClass("disabled").data("disabled", 1);
      }
    },
    _remove_files: function(data, callback, error2) {
      request("remove_files", { files: data }, callback, error2);
    },
    _remove_file_by_idx: function(idx) {
      var len = this._value.length;
      if (!this._allow_multiple || len - 1 < idx)
        return;
      var url = this._value[idx];
      this._value.splice(idx, 1);
      this._files.splice(idx, 1);
      len--;
      this.value = len ? toJson(this._value) : null;
      this._files_row && this._files_row.find('div[data-file-idx="' + idx + '"]').remove();
      this._remove_file_by_url(url);
    },
    _remove_file_by_url: function(url) {
      if (!this.frm) {
        this._remove_files([url], function(ret) {
          if (!cint(ret))
            error("Unable to remove the uploaded attachment ({0}).", [url]);
        });
        return;
      }
      var me = this;
      this.frm.attachments.remove_attachment_by_filename(
        url,
        function() {
          me.parse_validate_and_set_in_model(me.value);
          me.refresh();
          me.frm.doc.docstatus == 1 ? me.frm.save("Update") : me.frm.save();
        }
      );
    },
    _toggle_remove_button: function() {
      var show = this._allow_remove;
      this.$value && this.$value.find('[data-action="clear_attachment"]').toggle(show);
      this._files_row && this._files_row.find("div.ba-remove").toggleClass("disabled", !show).data("disabled", show ? 0 : 1);
    },
    _setup_dialog: function() {
      if (this._dialog) {
        if (!this._is_preview_dialog)
          return;
        this._is_preview_dialog = false;
        this._dialog_fn._reset_preview();
        this._files_row.children().remove();
        each(this._files, function(f, i) {
          this._add_file_to_dialog(f, i);
        }, this);
        return;
      }
      this._dialog_fn = {};
      this._dialog = frappe.get_modal(__(this.df.label), "");
      var wrapper = this._dialog.find(".modal-dialog").get(0), body = wrapper.find(".modal-body"), container = $('<div class="container-fluid p-1"></div>').appendTo(body);
      this._dialog_title = wrapper.find(".modal-title").get(0);
      this._dialog_title.parent().addClass("align-items-center");
      this._dialog_back = $('<span class="fa fa-chevron-left fa-fw ba-dialog-back ba-hidden"></span>');
      this._dialog_back.prependTo(this._dialog_title.parent());
      this._files_row = $('<div class="row"></div>').appendTo(container);
      this._preview_row = $('<div class="row ba-hidden"></div>').appendTo(container);
      this._preview_holder = $('<div class="col img_preview d-flex align-items-center justify-content-center"></div>').appendTo(this._preview_row);
      this._file_preview = null;
      var me = this;
      this._dialog_fn.show = function() {
        me._dialog.addClass("fade").modal("show");
      };
      this._dialog_fn._setup_preview = function(file) {
        if (file.class === "image") {
          me._file_preview = $(`<img>`).addClass("img-responsive").attr("src", file.file_url).attr("alt", file.file_name).appendTo(me._preview_holder);
        } else if (file.class === "video") {
          me._file_preview = $(`<video width="480" height="320" controls>
                        <source src="${file.file_url}" type="${file.type}"/>
                        ${__("Your browser does not support the video element.")}
                    </video>`).appendTo(me._preview_holder);
        } else if (file.class === "audio") {
          me._file_preview = $(`<audio width="480" height="60" controls>
                        <source src="${file.file_url}" type="${file.type}"/>
                        ${__("Your browser does not support the audio element.")}
                    </audio>`).appendTo(me._preview_holder);
        }
        if (me._file_preview) {
          me._dialog_title.html(file.file_name);
          if (!me._is_preview_dialog) {
            me._dialog_fn._preview_toggle(true);
          } else
            me._dialog_fn.show();
        } else {
          window.open(file.file_url, "_blank");
        }
      };
      this._dialog_fn._preview_toggle = function(show) {
        me._files_row.toggleClass("ba-hidden", show);
        me._dialog_back.toggleClass("ba-hidden", !show);
        me._preview_row.toggleClass("ba-hidden", !show);
      };
      this._dialog_fn._reset_preview = function(show) {
        me._dialog_fn._preview_toggle(false);
        me._dialog_title.html(__(me.df.label));
        me._file_preview && me._file_preview.remove();
        me._file_preview = null;
      };
      this._dialog_back.click(function() {
        if (!me._is_preview_dialog)
          me._dialog_fn._reset_preview();
      });
      this._files_row.on("click", "button.ba-preview", function() {
        var $el = $(this);
        if ($el.hasClass("ba-preview") && !$el.data("disabled") && !me._is_preview_dialog) {
          var parent = $($el.closest("div.ba-attachment").get(0)), idx = parent.data("idx");
          if (idx == null)
            idx = parent.attr("data-file-idx");
          if (idx != null) {
            idx = cint(idx);
            var file = me._files.length > idx ? me._files[idx] : null;
            if (file)
              me._dialog_fn._setup_preview(file);
          }
        }
      });
      this._files_row.on("click", "button.ba-remove", function() {
        var $el = $(this);
        if ($el.hasClass("ba-remove") && !$el.data("disabled") && !me._is_preview_dialog) {
          var parent = $($el.closest("div.ba-attachment").get(0)), idx = parent.data("idx");
          if (idx == null)
            idx = parent.attr("data-file-idx");
          if (idx != null && me._allow_remove) {
            me._remove_file_by_idx(cint(idx));
            parent.remove();
          }
        }
      });
      this.$value.find("a.attached-file-link").get(0).on("click", function(e) {
        log("Attach field value clicked");
        var status;
        try {
          if (me._is_preview_dialog) {
            me._dialog_fn._setup_preview(me._files[0]);
          } else
            me._dialog_fn.show();
          status = 1;
        } catch (e2) {
          status = 0;
          log("Attach field value click error: " + e2.message);
        }
        if (status && isObject(e))
          e.preventDefault();
      });
    },
    _setup_preview: function() {
      if (this._is_preview_dialog)
        return;
      this._is_preview_dialog = true;
      this._setup_dialog();
      this._files_row.addClass("ba-hidden");
      this._preview_row.removeClass("ba-hidden");
    },
    _update_input: function(value, dataurl) {
      value = value || this._value[this._value.length - 1];
      this.$input.toggle(false);
      var filename = null;
      if (value.indexOf(",") !== -1) {
        var parts = value.split(",");
        filename = parts[0];
        dataurl = parts[1];
      }
      if (!filename)
        filename = dataurl ? value : value.split("/").pop();
      var $link = this.$value.toggle(true).find(".attached-file-link");
      if (this._allow_multiple) {
        $link.html(
          this._value.length > 1 ? this._value.length + " " + __("files uploaded") : filename
        ).attr("href", "#");
      } else {
        $link.html(filename).attr("href", dataurl || value);
      }
    },
    _reset_input: function(ref) {
      this.dataurl = null;
      this.fileobj = null;
      this.set_input(null);
      this.refresh();
    },
    _reset_value: function() {
      this.value = null;
      this.$input.toggle(true);
      this.$value.toggle(false);
      clear(this._value);
      if (this._dialog) {
        clear(this._files);
        if (this._is_preview_dialog) {
          this._is_preview_dialog = false;
          this._dialog_fn._reset_preview();
        }
        this._files_row.children().remove();
      }
    }
  });

  // controls/v12/attach_image.js
  frappe.ui.form.ControlAttachImage = frappe.ui.form.ControlAttach.extend({
    _setup_control: function() {
      this._images_only = true;
      this._super();
    }
  });
})();
