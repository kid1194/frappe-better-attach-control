/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    'acc adp aif aifc aiff amr au caf dra dts dtshd flac kar lvp '
    + 'm2a m3a m3u m4a mid midi mka mp2 mp2a mp3 m4a mpga '
    + 'opus pya ra ram rip rmi rmp s3m sil snd uva uvva '
    + 'wav wax weba wma xm'
).split(' ');

export default function is_audio(ext) {
    return EXTS.indexOf(ext) >= 0;
}